// src/utils/promptBuilder.js
//
// WHY THIS FILE EXISTS:
// Centralizes prompt construction. Prompt engineering is iterative —
// having ONE place to refine the instructions, rather than a prompt
// string buried inline in a service function, makes it much easier to
// tune behavior (and to explain/defend the exact wording in an
// interview) without hunting through business logic.

export function buildRagPrompt(retrievedChunks, question) {
  const context = retrievedChunks
    .map((chunk, i) => `[Excerpt ${i + 1}]\n${chunk.chunk_text}`)
    .join('\n\n');

  return `You are a study assistant answering questions based STRICTLY on the provided document excerpts.

RULES:
- Answer using ONLY the information in the excerpts below.
- If the excerpts do not contain enough information to answer the question, say "I don't have enough information in this document to answer that" — do NOT guess or use outside knowledge.
- Do not mention "excerpts" or "context" in your answer — respond naturally, as if you simply know the material.
- Be concise and direct.

DOCUMENT EXCERPTS:
${context}

QUESTION:
${question}

ANSWER:`;
}

// Add to existing promptBuilder.js

export function buildNotesPrompt(retrievedChunks) {
  const context = retrievedChunks
    .map((chunk, i) => `[Excerpt ${i + 1}]\n${chunk.chunk_text}`)
    .join('\n\n');

  return `You are a study assistant helping students learn from their documents.
Based on the following document excerpts, create clear, concise study notes.

FORMAT YOUR RESPONSE AS:
- Use markdown formatting
- Start with a "## Key Concepts" section
- Follow with "## Important Details"
- End with "## Summary"
- Use bullet points for clarity
- Be concise but comprehensive
- Only include information from the provided excerpts

DOCUMENT EXCERPTS:
${context}

Generate the study notes now:`;
}

export function buildQuizPrompt(retrievedChunks, questionCount = 5) {
  const context = retrievedChunks
    .map((chunk, i) => `[Excerpt ${i + 1}]\n${chunk.chunk_text}`)
    .join('\n\n');

  return `You are a quiz generator. Based on the document excerpts below, generate exactly ${questionCount} multiple choice questions.

CRITICAL RULES:
- Return ONLY a valid JSON array. No explanation, no markdown, no backticks, no preamble.
- Each question must have exactly 4 options labeled A, B, C, D
- Only one option should be correct
- Base questions ONLY on the provided excerpts
- Make questions test genuine understanding, not trivial recall

REQUIRED JSON FORMAT (return exactly this structure):
[
  {
    "question_text": "What is...?",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "correct_option": "A"
  }
]

DOCUMENT EXCERPTS:
${context}

JSON ARRAY:`;
}