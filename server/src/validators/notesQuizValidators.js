// src/validators/notesQuizValidators.js
import { z } from 'zod';

export const generateQuizSchema = z.object({
  questionCount: z.number().int().min(3).max(10).default(5),
});

export const submitAttemptSchema = z.object({
  // answers is a map of question_id (UUID string) -> chosen option (A/B/C/D)
  answers: z.record(
    z.string().uuid(),
    z.enum(['A', 'B', 'C', 'D'])
  ),
});