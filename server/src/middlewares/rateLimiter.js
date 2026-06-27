// src/middlewares/rateLimiter.js
//
// WHY RATE LIMITING ON AUTH ROUTES:
// Without it, an attacker can try millions of password combinations
// against /auth/login automatically (brute-force attack). Rate limiting
// caps how many attempts are allowed per IP in a time window, making
// brute-force computationally infeasible.

import rateLimit from 'express-rate-limit';

// Strict limit for auth endpoints — 10 attempts per 15 minutes per IP.
// A real user who misremembers their password won't hit this;
// an automated brute-force will be blocked almost immediately.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per window per IP
  standardHeaders: true,     // return RateLimit headers in response
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts. Please try again in 15 minutes.',
    },
  },
});

// More lenient limit for general API routes — 100 requests per minute.
// Prevents API abuse while not affecting normal usage patterns.
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
});