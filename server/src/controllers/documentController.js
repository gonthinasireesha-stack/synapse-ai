// src/controllers/documentController.js

import * as documentService from '../services/documentService.js';
import { ingestDocument } from '../jobs/ingestDocument.js';


export async function upload(req, res, next) {
  try {
    const document = await documentService.uploadDocument({
      userId: req.user.id,
      file: req.file,
      customTitle: req.body.title,
    });

    // Send the response IMMEDIATELY — the user gets confirmation their
    // upload succeeded right away, without waiting for ingestion.
    res.status(201).json({
      success: true,
      data: { document },
    });

    // Trigger ingestion AFTER the response is already sent. Deliberately
    // NOT awaited here — see the detailed explanation of what this means
    // and its real limitations below.
    ingestDocument(document.id, req.file.path).catch((err) => {
      // ingestDocument already catches its own errors internally and
      // marks the document 'failed' — this catch is a final safety net
      // in case something TRULY unexpected escapes that (a bug in our
      // own error handling, for instance). Logging here ensures we'd
      // still see it, rather than a silent unhandled rejection.
      console.error('[ingest] Unexpected error escaped ingestDocument:', err);
    });
  } catch (err) {
    next(err);
  }
}
export async function list(req, res, next) {
  try {
    const documents = await documentService.listUserDocuments(req.user.id);
    res.status(200).json({
      success: true,
      data: { documents },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const document = await documentService.getDocument(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: { document },
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await documentService.removeDocument(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}