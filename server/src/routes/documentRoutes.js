// src/routes/documentRoutes.js

import { Router } from 'express';
import * as documentController from '../controllers/documentController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { upload as uploadMiddleware } from '../config/storage.js';
import { uploadDocumentSchema } from '../validators/documentValidators.js';

const router = Router();

// EVERY route here requires authentication — applied once, to the
// whole router, rather than repeating requireAuth on each individual
// route. Express lets middleware be applied at the router level like
// this when ALL routes in the router share the same requirement.
router.use(requireAuth);

// Middleware order matters here, left to right:
//   1. uploadMiddleware.single('file')  -> multer parses the multipart
//      request, writes the file to disk, populates req.file AND req.body
//   2. validate(uploadDocumentSchema)   -> validates the now-populated
//      req.body (multer must run FIRST, or req.body wouldn't exist yet
//      for a multipart request)
//   3. documentController.upload        -> actual handler
router.post('/', uploadMiddleware.single('file'), validate(uploadDocumentSchema), documentController.upload);

router.get('/', documentController.list);
router.get('/:id', documentController.getOne);
router.delete('/:id', documentController.remove);

export default router;