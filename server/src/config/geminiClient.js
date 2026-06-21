// src/config/geminiClient.js
//
// Single shared Gemini client instance, configured once with our API
// key from env. Other files import THIS, never instantiate their own
// client — same "one shared resource" principle as the Postgres pool.

import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

export const genAI = new GoogleGenAI({ apiKey: env.geminiApiKey });