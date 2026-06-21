// src/utils/pdfExtractor.js
//
// WHY THIS FILE EXISTS:
// Isolates "how do we get raw text out of a PDF" from everything else.
// If we ever swap PDF libraries (e.g. need OCR support for scanned
// PDFs later), this is the only file that changes.

import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';

// Extracts plain text + page count from a PDF file on disk.
// Returns { text, pageCount }.
export async function extractTextFromPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const info = await parser.getInfo();

    return {
      text: result.text,
      pageCount: info.total,
    };
  } finally {
    // Release the parser's internal resources regardless of success/failure —
    // same "always clean up" principle as releasing a DB connection back
    // to the pool in Phase 0.
    await parser.destroy();
  }
}