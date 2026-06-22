// src/repositories/chatRepository.js
//
// The ONLY place allowed to write SQL against `chat_sessions` and `messages`.

import { pool } from '../config/db.js';

export async function createChatSession({ documentId, userId, title }) {
  const result = await pool.query(
    `INSERT INTO chat_sessions (document_id, user_id, title)
     VALUES ($1, $2, $3)
     RETURNING id, document_id, title, created_at`,
    [documentId, userId, title]
  );
  return result.rows[0];
}

// Ownership check baked into the WHERE clause — same IDOR-prevention
// pattern used everywhere else in this project.
export async function findChatSessionById(sessionId, userId) {
  const result = await pool.query(
    `SELECT id, document_id, user_id, title, created_at
     FROM chat_sessions
     WHERE id = $1 AND user_id = $2`,
    [sessionId, userId]
  );
  return result.rows[0] || null;
}

export async function findSessionsByDocumentId(documentId, userId) {
  const result = await pool.query(
    `SELECT id, title, created_at
     FROM chat_sessions
     WHERE document_id = $1 AND user_id = $2
     ORDER BY created_at DESC`,
    [documentId, userId]
  );
  return result.rows;
}

export async function createMessage({ sessionId, role, content, retrievedChunkIds = null }) {
  const result = await pool.query(
    `INSERT INTO messages (session_id, role, content, retrieved_chunk_ids)
     VALUES ($1, $2, $3, $4)
     RETURNING id, role, content, created_at`,
    [sessionId, role, content, retrievedChunkIds]
  );
  return result.rows[0];
}

export async function findMessagesBySessionId(sessionId) {
  const result = await pool.query(
    `SELECT id, role, content, created_at
     FROM messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );
  return result.rows;
}