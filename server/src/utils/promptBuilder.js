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