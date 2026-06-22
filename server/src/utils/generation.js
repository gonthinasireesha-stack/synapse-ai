// src/utils/generation.js
//
// Wraps Gemini's generateContent call for chat answers. Isolated here
// for the same reason embeddings.js is separate from everything else —
// the rest of the app calls generateAnswer() and gets back a plain
// string, never touching the Gemini SDK directly.

import { genAI } from '../config/geminiClient.js';

const GENERATION_MODEL = 'gemini-2.5-flash';

export async function generateAnswer(prompt) {
  const response = await genAI.models.generateContent({
    model: GENERATION_MODEL,
    contents: prompt,
  });

  return response.text;
}