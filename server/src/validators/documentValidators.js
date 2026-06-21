// src/validators/documentValidators.js
import { z } from 'zod';

// Validates the optional "title" text field that may accompany an upload.
// The actual FILE is validated separately by multer's fileFilter — Zod
// only governs the non-file form fields here.
export const uploadDocumentSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
});