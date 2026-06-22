// src/repositories/chunkRepository.js
//
// The ONLY place allowed to write SQL against `document_chunks`.

import { pool } from '../config/db.js';

// Inserts many chunks in a SINGLE transaction. Either ALL chunks for
// a document get stored, or NONE do — see explanation below for why
// this matters.
export async function insertChunks(documentId, embeddedChunks) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const chunk of embeddedChunks) {
      // pgvector expects the embedding as a string like '[0.1,0.2,...]'
      // when passed through a parameterized query — the driver doesn't
      // automatically serialize a raw JS array into pgvector's format.
      const vectorLiteral = `[${chunk.embedding.join(',')}]`;

      await client.query(
        `INSERT INTO document_chunks (document_id, chunk_text, chunk_index, embedding)
         VALUES ($1, $2, $3, $4)`,
        [documentId, chunk.text, chunk.index, vectorLiteral]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteChunksByDocumentId(documentId) {
  await pool.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
}

export async function countChunksByDocumentId(documentId) {
  const result = await pool.query(
    'SELECT COUNT(*) FROM document_chunks WHERE document_id = $1',
    [documentId]
  );
  return Number(result.rows[0].count);
}

// Add this function to the existing chunkRepository.js

// Finds the K chunks most semantically similar to a query embedding,
// scoped to ONE document and verified to belong to the requesting user
// (via a JOIN against documents — same ownership-check principle as
// documentRepository's WHERE user_id clause from Phase 2).
export async function findSimilarChunks(documentId, userId, queryEmbedding, topK = 5) {
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  const result = await pool.query(
    `SELECT dc.id, dc.chunk_text, dc.chunk_index, dc.page_number,
            dc.embedding <=> $1 AS distance
     FROM document_chunks dc
     JOIN documents d ON d.id = dc.document_id
     WHERE dc.document_id = $2 AND d.user_id = $3
     ORDER BY dc.embedding <=> $1
     LIMIT $4`,
    [vectorLiteral, documentId, userId, topK]
  );

  return result.rows;
}