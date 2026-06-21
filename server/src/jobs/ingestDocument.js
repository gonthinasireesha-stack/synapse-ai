// src/jobs/ingestDocument.js
//
// WHY THIS FILE EXISTS:
// Orchestrates the full RAG ingestion pipeline for ONE document:
// extract text -> chunk -> embed -> store -> mark ready.
// This is the piece that runs ASYNCHRONOUSLY after the upload response
// has already been sent to the user (see documentController.js for
// where this gets triggered, and the explanation of why).

import { extractTextFromPdf } from '../utils/pdfExtractor.js';
import { chunkText } from '../utils/chunker.js';
import { generateEmbeddingsForChunks } from '../utils/embeddings.js';
import { insertChunks, deleteChunksByDocumentId } from '../repositories/chunkRepository.js';
import { updateDocumentStatus } from '../repositories/documentRepository.js';

export async function ingestDocument(documentId, filePath) {
  console.log(`[ingest] Starting ingestion for document ${documentId}`);

  try {
    // 1. EXTRACTION
    const { text, pageCount } = await extractTextFromPdf(filePath);

    if (!text || text.trim().length === 0) {
      // A real, expected failure mode — e.g. a scanned PDF with no
      // selectable text layer (see the honest limitation we flagged
      // back in pdfExtractor.js). This is NOT a bug; it's a legitimate
      // outcome we need to handle gracefully, not crash on.
      throw new Error('No extractable text found in PDF (it may be a scanned/image-only document)');
    }

    console.log(`[ingest] Extracted ${text.length} characters across ${pageCount} pages`);

    // 2. CHUNKING
    const chunks = chunkText(text);
    console.log(`[ingest] Split into ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error('Document produced zero chunks after processing');
    }

    // 3. EMBEDDING
    const embeddedChunks = await generateEmbeddingsForChunks(chunks);
    console.log(`[ingest] Generated ${embeddedChunks.length} embeddings`);

    // 4. STORAGE
    // Defensive cleanup: if this document was somehow ingested before
    // (e.g. a manual retry), clear any old chunks first so we never
    // end up with duplicates from a previous attempt.
    await deleteChunksByDocumentId(documentId);
    await insertChunks(documentId, embeddedChunks);

    // 5. MARK READY
    await updateDocumentStatus(documentId, 'ready', pageCount);
    console.log(`[ingest] Document ${documentId} is now ready`);
  } catch (err) {
    console.error(`[ingest] FAILED for document ${documentId}:`, err.message);
    // Mark the document as failed so the user sees an honest status,
    // rather than it being stuck on "processing" forever with no
    // indication anything went wrong.
    await updateDocumentStatus(documentId, 'failed');
  }
}