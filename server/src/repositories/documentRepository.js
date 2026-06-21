// src/repositories/documentRepository.js
//
// The ONLY place allowed to write SQL against the `documents` table.

import { pool } from '../config/db.js';

export async function createDocument({ userId, title, filePath, status = 'processing' }) {
  const result = await pool.query(
    `INSERT INTO documents (user_id, title, file_path, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, title, status, page_count, uploaded_at`,
    [userId, title, filePath, status]
  );
  return result.rows[0];
}

// Lists documents belonging to a SPECIFIC user only — this WHERE clause
// is the actual enforcement of "users can only see their own documents."
export async function findDocumentsByUserId(userId) {
  const result = await pool.query(
    `SELECT id, title, status, page_count, uploaded_at
     FROM documents
     WHERE user_id = $1
     ORDER BY uploaded_at DESC`,
    [userId]
  );
  return result.rows;
}

// Fetches ONE document, but deliberately requires userId too — see the
// authorization explanation below for why this is critical, not optional.
export async function findDocumentById(documentId, userId) {
  const result = await pool.query(
    `SELECT id, user_id, title, file_path, status, page_count, uploaded_at
     FROM documents
     WHERE id = $1 AND user_id = $2`,
    [documentId, userId]
  );
  return result.rows[0] || null;
}

export async function deleteDocument(documentId, userId) {
  // Same pattern: the WHERE clause checks ownership, not just existence.
  // RETURNING lets us know whether a row was actually deleted (and thus
  // whether the document existed AND belonged to this user) vs nothing
  // happened at all.
  const result = await pool.query(
    `DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id, file_path`,
    [documentId, userId]
  );
  return result.rows[0] || null;
}

export async function updateDocumentStatus(documentId, status, pageCount = null) {
  await pool.query(
    `UPDATE documents SET status = $1, page_count = COALESCE($2, page_count) WHERE id = $3`,
    [status, pageCount, documentId]
  );
}