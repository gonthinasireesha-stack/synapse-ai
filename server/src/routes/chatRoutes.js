// src/routes/chatRoutes.js

import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { askQuestionSchema } from '../validators/chatValidators.js';

const router = Router();

router.use(requireAuth);

// Nested under /documents/:documentId, matching our Phase 0 API design
router.post('/documents/:documentId/chat-sessions', chatController.createSession);
router.get('/documents/:documentId/chat-sessions', chatController.listSessions);

// Addressable directly by session ID once created — matching the
// "don't over-nest" REST reasoning from Phase 0's API design
router.get('/chat-sessions/:sessionId/messages', chatController.getMessages);
router.post('/chat-sessions/:sessionId/messages', validate(askQuestionSchema), chatController.postMessage);

export default router;