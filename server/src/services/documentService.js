// src/services/documentService.js
//
// Business logic for document upload, listing, fetching, and deletion.
// Orchestrates the repository + filesystem utilities; controllers never
// touch either directly.

import {
  createDocument,
  findDocumentsByUserId,
  findDocumentById,
  deleteDocument,
} from '../repositories/documentRepository.js';
import { deleteFileFromDisk } from '../utils/fileSystem.js';

export class DocumentError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Called right after multer has already written the file to disk.
// `file` is multer's file object: { path, originalname, size, ... }
export async function uploadDocument({ userId, file, customTitle }) {
  if (!file) {
    throw new DocumentError('No file was uploaded', 'NO_FILE', 400);
  }

  // Fall back to the original filename (minus extension, for a cleaner
  // display title) if the user didn't provide a custom one.
  const title = customTitle || file.originalname.replace(/\.pdf$/i, '');

  const document = await createDocument({
    userId,
    title,
    filePath: file.path,
    status: 'processing', // Phase 3 will flip this to 'ready' once ingestion completes
  });

  return document;
}

export async function listUserDocuments(userId) {
  return findDocumentsByUserId(userId);
}

export async function getDocument(documentId, userId) {
  const document = await findDocumentById(documentId, userId);

  // Deliberately generic "not found" — see explanation below for why we
  // don't distinguish "doesn't exist" from "exists but isn't yours."
  if (!document) {
    throw new DocumentError('Document not found', 'DOCUMENT_NOT_FOUND', 404);
  }

  return document;
}

export async function removeDocument(documentId, userId) {
  const deleted = await deleteDocument(documentId, userId);

  if (!deleted) {
    throw new DocumentError('Document not found', 'DOCUMENT_NOT_FOUND', 404);
  }

  // Database row is already gone at this point (the SQL DELETE already
  // committed). Now clean up the physical file. If THIS fails, we have
  // an orphaned file on disk but a consistent database — an acceptable
  // tradeoff discussed below, versus the reverse (orphaned DB row
  // pointing at a deleted file, which would break the app for the user).
  await deleteFileFromDisk(deleted.file_path);

  return { id: deleted.id };
}