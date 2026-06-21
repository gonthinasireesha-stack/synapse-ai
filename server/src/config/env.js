// src/config/env.js
//
// WHY THIS FILE EXISTS:
// Instead of scattering `process.env.SOMETHING` calls across the codebase
// (where a typo or missing var silently becomes `undefined` and fails
// somewhere deep, confusingly, at runtime), we validate ALL required
// environment variables ONCE, at startup, in one place.
//
// If anything required is missing or malformed, the app refuses to start
// and tells you exactly what's wrong. This is called "failing fast."

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid connection string' }),

  JWT_ACCESS_SECRET: z.string().min(20, 'JWT_ACCESS_SECRET must be at least 20 characters'),
  JWT_REFRESH_SECRET: z.string().min(20, 'JWT_REFRESH_SECRET must be at least 20 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.string().default('20'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid environment configuration. Server will not start.\n');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('\nCheck your .env file against .env.example\n');
  process.exit(1);
}

export const env = {
  port: Number(parsed.data.PORT),
  nodeEnv: parsed.data.NODE_ENV,
  isProduction: parsed.data.NODE_ENV === 'production',

  databaseUrl: parsed.data.DATABASE_URL,

  jwt: {
    accessSecret: parsed.data.JWT_ACCESS_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    accessExpiry: parsed.data.JWT_ACCESS_EXPIRY,
    refreshExpiry: parsed.data.JWT_REFRESH_EXPIRY,
  },

  geminiApiKey: parsed.data.GEMINI_API_KEY,

  uploadDir: parsed.data.UPLOAD_DIR,
  maxFileSizeMb: Number(parsed.data.MAX_FILE_SIZE_MB),
};