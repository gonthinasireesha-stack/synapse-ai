// src/validators/chatValidators.js
import { z } from 'zod';

export const askQuestionSchema = z.object({
  question: z.string().trim().min(1, 'Question cannot be empty').max(1000, 'Question is too long'),
});