// src/services/notesQuizService.js

import { generateEmbedding } from '../utils/embeddings.js';
import { generateAnswer } from '../utils/generation.js';
import { buildNotesPrompt, buildQuizPrompt } from '../utils/promptBuilder.js';
import { parseLlmJson } from '../utils/parseJson.js';
import { findSimilarChunks } from '../repositories/chunkRepository.js';
import {
  createNote,
  findNotesByDocumentId,
  createQuiz,
  createQuizQuestions,
  findQuizzesByDocumentId,
  findQuizWithQuestions,
  createQuizAttempt,
} from '../repositories/notesQuizRepository.js';
import { findDocumentById } from '../repositories/documentRepository.js';

export class NotesQuizError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Helper: verify document exists, belongs to user, and is ready.
// Used by both notes and quiz generation — extracted to avoid repeating
// this identical check in two places.
async function verifyDocumentReady(documentId, userId) {
  const document = await findDocumentById(documentId, userId);
  if (!document) {
    throw new NotesQuizError('Document not found', 'DOCUMENT_NOT_FOUND', 404);
  }
  if (document.status !== 'ready') {
    throw new NotesQuizError(
      'Document is not ready yet',
      'DOCUMENT_NOT_READY',
      409
    );
  }
  return document;
}

// Helper: retrieve a broad set of chunks to cover the whole document
// for notes/quiz generation — unlike chat (which retrieves chunks most
// relevant to a SPECIFIC question), notes and quizzes want broad
// coverage of the document's overall content.
async function retrieveBroadChunks(documentId, userId, topK = 10) {
  // We embed a generic "summary" query rather than something specific,
  // to pull a representative spread of chunks across the document.
  const queryEmbedding = await generateEmbedding(
    'key concepts main ideas important topics summary overview',
    'RETRIEVAL_QUERY'
  );
  return findSimilarChunks(documentId, userId, queryEmbedding, topK);
}

// ===================== NOTES =====================
export async function generateNotes(documentId, userId) {
  await verifyDocumentReady(documentId, userId);

  const chunks = await retrieveBroadChunks(documentId, userId);
  if (chunks.length === 0) {
    throw new NotesQuizError(
      'No content found to generate notes from',
      'NO_CONTENT',
      422
    );
  }

  const prompt = buildNotesPrompt(chunks);
  const content = await generateAnswer(prompt);

  return createNote({ documentId, content });
}

export async function listNotes(documentId, userId) {
  return findNotesByDocumentId(documentId, userId);
}

// ===================== QUIZ =====================
export async function generateQuiz(documentId, userId, questionCount = 5) {
  const document = await verifyDocumentReady(documentId, userId);
  const chunks = await retrieveBroadChunks(documentId, userId);

  if (chunks.length === 0) {
    throw new NotesQuizError(
      'No content found to generate a quiz from',
      'NO_CONTENT',
      422
    );
  }

  const prompt = buildQuizPrompt(chunks, questionCount);
  const rawResponse = await generateAnswer(prompt);

  // Parse and validate the LLM's JSON response — this is where our
  // robust parser earns its keep. Even with explicit instructions,
  // LLMs occasionally wrap output in markdown or add preambles.
  let questions;
  try {
    questions = parseLlmJson(rawResponse);
  } catch (err) {
    throw new NotesQuizError(
      'Failed to parse quiz from AI response — please try again',
      'QUIZ_PARSE_ERROR',
      500
    );
  }

  // Validate the parsed structure before storing — we can't trust that
  // the model returned exactly the shape we asked for, even if it
  // returned valid JSON.
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new NotesQuizError(
      'AI returned an unexpected quiz format — please try again',
      'QUIZ_PARSE_ERROR',
      500
    );
  }

  const validQuestions = questions.filter((q) =>
    q.question_text &&
    q.options &&
    ['A', 'B', 'C', 'D'].every((opt) => q.options[opt]) &&
    ['A', 'B', 'C', 'D'].includes(q.correct_option)
  );

  if (validQuestions.length === 0) {
    throw new NotesQuizError(
      'AI returned questions in an unexpected format — please try again',
      'QUIZ_PARSE_ERROR',
      500
    );
  }

  const quiz = await createQuiz({
    documentId,
    title: `Quiz: ${document.title}`,
  });

  const savedQuestions = await createQuizQuestions(quiz.id, validQuestions);
  return { ...quiz, questions: savedQuestions };
}

export async function listQuizzes(documentId, userId) {
  return findQuizzesByDocumentId(documentId, userId);
}

export async function getQuiz(quizId, userId) {
  const quiz = await findQuizWithQuestions(quizId, userId);
  if (!quiz) {
    throw new NotesQuizError('Quiz not found', 'QUIZ_NOT_FOUND', 404);
  }
  return quiz;
}

export async function submitQuizAttempt(quizId, userId, answers) {
  // Verify the quiz exists and belongs to this user's document
  const quiz = await findQuizWithQuestions(quizId, userId);
  if (!quiz) {
    throw new NotesQuizError('Quiz not found', 'QUIZ_NOT_FOUND', 404);
  }

  return createQuizAttempt({ quizId, userId, answers });
}