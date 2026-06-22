// src/repositories/notesQuizRepository.js

import { pool } from '../config/db.js';

// ===================== NOTES =====================
export async function createNote({ documentId, content }) {
  const result = await pool.query(
    `INSERT INTO notes (document_id, content)
     VALUES ($1, $2)
     RETURNING id, document_id, content, created_at`,
    [documentId, content]
  );
  return result.rows[0];
}

export async function findNotesByDocumentId(documentId, userId) {
  const result = await pool.query(
    `SELECT n.id, n.content, n.created_at
     FROM notes n
     JOIN documents d ON d.id = n.document_id
     WHERE n.document_id = $1 AND d.user_id = $2
     ORDER BY n.created_at DESC`,
    [documentId, userId]
  );
  return result.rows;
}

// ===================== QUIZZES =====================
export async function createQuiz({ documentId, title }) {
  const result = await pool.query(
    `INSERT INTO quizzes (document_id, title)
     VALUES ($1, $2)
     RETURNING id, document_id, title, created_at`,
    [documentId, title]
  );
  return result.rows[0];
}

export async function createQuizQuestions(quizId, questions) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const savedQuestions = [];
    for (const q of questions) {
      const result = await client.query(
        `INSERT INTO quiz_questions (quiz_id, question_text, options, correct_option)
         VALUES ($1, $2, $3, $4)
         RETURNING id, question_text, options, correct_option`,
        [quizId, q.question_text, JSON.stringify(q.options), q.correct_option]
      );
      savedQuestions.push(result.rows[0]);
    }
    await client.query('COMMIT');
    return savedQuestions;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findQuizzesByDocumentId(documentId, userId) {
  const result = await pool.query(
    `SELECT q.id, q.title, q.created_at, COUNT(qq.id) AS question_count
     FROM quizzes q
     JOIN documents d ON d.id = q.document_id
     LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
     WHERE q.document_id = $1 AND d.user_id = $2
     GROUP BY q.id, q.title, q.created_at
     ORDER BY q.created_at DESC`,
    [documentId, userId]
  );
  return result.rows;
}

export async function findQuizWithQuestions(quizId, userId) {
  const quizResult = await pool.query(
    `SELECT q.id, q.title, q.created_at
     FROM quizzes q
     JOIN documents d ON d.id = q.document_id
     WHERE q.id = $1 AND d.user_id = $2`,
    [quizId, userId]
  );
  const quiz = quizResult.rows[0];
  if (!quiz) return null;

  const questionsResult = await pool.query(
    `SELECT id, question_text, options, correct_option
     FROM quiz_questions WHERE quiz_id = $1 ORDER BY id`,
    [quizId]
  );
  return { ...quiz, questions: questionsResult.rows };
}

// ===================== QUIZ ATTEMPTS =====================
export async function createQuizAttempt({ quizId, userId, answers }) {
  // Calculate score by comparing submitted answers against stored
  // correct_option values — done here rather than in the service layer
  // because it requires the questions data, which we're already fetching.
  const questionsResult = await pool.query(
    'SELECT id, correct_option FROM quiz_questions WHERE quiz_id = $1',
    [quizId]
  );
  const questions = questionsResult.rows;

  const score = questions.reduce((count, q) => {
    return answers[q.id] === q.correct_option ? count + 1 : count;
  }, 0);

  const result = await pool.query(
    `INSERT INTO quiz_attempts (quiz_id, user_id, score, answers)
     VALUES ($1, $2, $3, $4)
     RETURNING id, score, attempted_at`,
    [quizId, userId, score, JSON.stringify(answers)]
  );

  return { ...result.rows[0], totalQuestions: questions.length };
}