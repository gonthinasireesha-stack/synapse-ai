// src/utils/chunker.js
//
// WHY THIS FILE EXISTS:
// Splits extracted document text into overlapping, fixed-size chunks
// suitable for embedding. Isolated from extraction and embedding logic
// so the chunking STRATEGY can be tuned/swapped independently — e.g.
// if we later move to token-based or semantic chunking, only this
// file changes.

const CHUNK_SIZE = 1500;   // characters per chunk
const CHUNK_OVERLAP = 200; // characters of overlap between consecutive chunks

// Splits raw text into overlapping chunks.
// Returns an array of { text, index } objects, where `index` preserves
// the chunk's original order in the document (needed later for
// chunk_index in the DB, and for citing "this answer came from chunk 7").
export function chunkText(text) {
  // Collapse excessive whitespace/newlines first — raw PDF extraction
  // often contains irregular spacing (multiple blank lines, stray
  // spaces from column layouts) that would otherwise waste characters
  // in our fixed-size budget without adding real content.
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  if (cleanedText.length === 0) {
    return [];
  }

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanedText.length) {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, cleanedText.length);
    const chunkContent = cleanedText.slice(startIndex, endIndex);

    chunks.push({
      text: chunkContent,
      index: chunkIndex,
    });

    chunkIndex += 1;

    // Move the window forward by (CHUNK_SIZE - CHUNK_OVERLAP), not by
    // CHUNK_SIZE — this is what creates the overlap. If we advanced by
    // the full CHUNK_SIZE each time, there'd be zero overlap.
    startIndex += CHUNK_SIZE - CHUNK_OVERLAP;

    // Safety net: if we've reached the end of the text, stop — without
    // this, a small trailing remainder could theoretically cause an
    // extra near-empty final chunk in some edge cases.
    if (endIndex === cleanedText.length) {
      break;
    }
  }

  return chunks;
}