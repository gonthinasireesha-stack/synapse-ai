// src/utils/embeddings.js
//
// Wraps Gemini's embedContent calls. Isolated here so the rest of the
// app (ingestion pipeline, later the chat retrieval logic) never talks
// to the Gemini SDK directly — they call generateEmbedding(s) and get
// back plain arrays of numbers, no SDK-specific types leaking out.

import { genAI } from '../config/geminiClient.js';

const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;

// Embeds a single piece of text. taskType differs by USE CASE:
// - 'RETRIEVAL_DOCUMENT' for chunks we're storing (this file, ingestion)
// - 'RETRIEVAL_QUERY' for a user's question at search time (Phase 4)
// Using the right task type measurably improves retrieval quality,
// since the model optimizes the embedding differently for each role.
export async function generateEmbedding(text, taskType = 'RETRIEVAL_DOCUMENT') {
  const response = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  return response.embeddings[0].values;
}

// Embeds many chunks. We process SEQUENTIALLY, not in parallel — see
// explanation below for why this is a deliberate choice, not a missed
// optimization.
export async function generateEmbeddingsForChunks(chunks) {
  const embeddedChunks = [];

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text, 'RETRIEVAL_DOCUMENT');
    embeddedChunks.push({
      ...chunk,
      embedding,
    });
  }

  return embeddedChunks;
}