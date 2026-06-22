// src/services/chatService.js
//
// Orchestrates the full RAG chat flow: embed question -> retrieve
// relevant chunks -> build prompt -> generate answer -> persist both
// messages. This is the payoff of everything built in Phase 3.

import { generateEmbedding } from '../utils/embeddings.js';
import { generateAnswer } from '../utils/generation.js';
import { buildRagPrompt } from '../utils/promptBuilder.js';
import { findSimilarChunks } from '../repositories/chunkRepository.js';
import {
  createChatSession,
  findChatSessionById,
  findSessionsByDocumentId,
  createMessage,
  findMessagesBySessionId,
} from '../repositories/chatRepository.js';
import { findDocumentById } from '../repositories/documentRepository.js';

export class ChatError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const TOP_K = 5;

export async function startChatSession({ documentId, userId }) {
  // Verify the document exists AND belongs to this user BEFORE creating
  // a session for it — same generic-404 pattern as Phase 2's
  // getDocument, so we don't leak whether a document ID exists.
  const document = await findDocumentById(documentId, userId);
  if (!document) {
    throw new ChatError('Document not found', 'DOCUMENT_NOT_FOUND', 404);
  }

  if (document.status !== 'ready') {
    throw new ChatError(
      'This document is still being processed and is not ready for chat yet',
      'DOCUMENT_NOT_READY',
      409
    );
  }

  return createChatSession({ documentId, userId, title: document.title });
}

export async function listDocumentSessions(documentId, userId) {
  return findSessionsByDocumentId(documentId, userId);
}

export async function getSessionMessages(sessionId, userId) {
  const session = await findChatSessionById(sessionId, userId);
  if (!session) {
    throw new ChatError('Chat session not found', 'SESSION_NOT_FOUND', 404);
  }
  return findMessagesBySessionId(sessionId);
}

// THE CORE RAG FLOW.
export async function askQuestion({ sessionId, userId, question }) {
  const session = await findChatSessionById(sessionId, userId);
  if (!session) {
    throw new ChatError('Chat session not found', 'SESSION_NOT_FOUND', 404);
  }

  // 1. Persist the user's message FIRST, before any AI calls. If
  // generation fails downstream, we still have an honest record that
  // the question was asked — better than losing it silently.
  await createMessage({ sessionId, role: 'user', content: question });

  // 2. Embed the question (RETRIEVAL_QUERY, not RETRIEVAL_DOCUMENT —
  // see embeddings.js / promptBuilder.js explanation).
  const queryEmbedding = await generateEmbedding(question, 'RETRIEVAL_QUERY');

  // 3. Retrieve the most relevant chunks from THIS document, scoped to
  // this user (authorization enforced inside findSimilarChunks).
  const relevantChunks = await findSimilarChunks(session.document_id, userId, queryEmbedding, TOP_K);

  if (relevantChunks.length === 0) {
    // Genuinely possible edge case: e.g. ingestion technically succeeded
    // but produced zero usable chunks. Handle gracefully rather than
    // crash or send an empty prompt to Gemini.
    const fallbackAnswer = "I don't have any content from this document to search yet.";
    const savedMessage = await createMessage({ sessionId, role: 'assistant', content: fallbackAnswer });
    return savedMessage;
  }

  // 4. Build the grounded prompt and generate the answer.
  const prompt = buildRagPrompt(relevantChunks, question);
  const answer = await generateAnswer(prompt);

  // 5. Persist the assistant's answer, INCLUDING which chunk IDs were
  // used — this is what makes the system explainable/debuggable later.
  const chunkIds = relevantChunks.map((chunk) => chunk.id);
  const savedMessage = await createMessage({
    sessionId,
    role: 'assistant',
    content: answer,
    retrievedChunkIds: chunkIds,
  });

  return savedMessage;
}