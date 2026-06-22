// src/routes/notesQuizRoutes.js

import { Router } from 'express';
import * as notesQuizController from '../controllers/notesQuizController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { generateQuizSchema, submitAttemptSchema } from '../validators/notesQuizValidators.js';

const router = Router();
router.use(requireAuth);

// Notes
router.post('/documents/:documentId/notes', notesQuizController.generateNotes);
router.get('/documents/:documentId/notes', notesQuizController.listNotes);

// Quizzes
router.post('/documents/:documentId/quizzes', validate(generateQuizSchema), notesQuizController.generateQuiz);
router.get('/documents/:documentId/quizzes', notesQuizController.listQuizzes);
router.get('/quizzes/:quizId', notesQuizController.getQuiz);
router.post('/quizzes/:quizId/attempts', validate(submitAttemptSchema), notesQuizController.submitAttempt);

export default router;