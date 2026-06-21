// src/controllers/documentController.js

import * as documentService from '../services/documentService.js';

export async function upload(req, res, next) {
  try {
    // req.user comes from requireAuth (runs before this controller).
    // req.file comes from multer (also runs before this controller).
    // req.body.title comes from the validate() middleware, already
    // parsed/normalized by our Zod schema.
    const document = await documentService.uploadDocument({
      userId: req.user.id,
      file: req.file,
      customTitle: req.body.title,
    });

    res.status(201).json({
      success: true,
      data: { document },
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