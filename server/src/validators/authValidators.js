// src/validators/authValidators.js
//
// WHY ZOD HERE (same library we used for env validation):
// Defines the exact shape we require for signup/login requests.
// If a request doesn't match, we reject it BEFORE it reaches any
// business logic — the controller will use this to short-circuit
// invalid requests with a clean 400 response.

import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),

  email: z.string()
    .trim()
    .toLowerCase()
    .email('Must be a valid email address'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be under 72 characters'), // bcrypt's hard limit is 72 bytes
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});