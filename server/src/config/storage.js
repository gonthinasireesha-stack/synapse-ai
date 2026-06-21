// src/config/storage.js
//
// WHY THIS FILE EXISTS:
// Configures multer's disk storage engine — WHERE uploaded files get
// written, and WHAT they get named. Keeping this as its own config file
// (not inlined in the route) means swapping to S3 later is a change in
// ONE place, not scattered through route handlers.

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from './env.js';

// Ensure the upload directory actually exists before multer tries to
// write into it — a fresh clone of this repo won't have ./uploads yet,
// and multer fails ungracefully if the directory is missing.
if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate our OWN filename — never trust the user-supplied original
    // filename for the actual path on disk (path traversal risk, and
    // collision risk between different users' files).
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Restrict uploads to PDFs only, and reject anything else BEFORE it's
// even written to disk.
function fileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'), false);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024, // convert MB to bytes
  },
});