// src/utils/parseJson.js
//
// Safely parses LLM-generated JSON, handling the common artifacts
// that LLMs add even when explicitly told not to.

export function parseLlmJson(rawText) {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present (```json...``` or ```...```)
  // — the most common artifact even with explicit "no markdown" instructions
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  // Strip any leading non-JSON text up to the first '[' or '{'
  // — handles preambles like "Here are your questions:\n[..."
  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');

  if (arrayStart === -1 && objectStart === -1) {
    throw new Error('No JSON structure found in LLM response');
  }

  // Use whichever valid JSON start comes first
  const jsonStart = arrayStart === -1 ? objectStart
    : objectStart === -1 ? arrayStart
    : Math.min(arrayStart, objectStart);

  cleaned = cleaned.slice(jsonStart);

  // Similarly strip any trailing non-JSON text after the last ']' or '}'
  const arrayEnd = cleaned.lastIndexOf(']');
  const objectEnd = cleaned.lastIndexOf('}');
  const jsonEnd = Math.max(arrayEnd, objectEnd);

  if (jsonEnd === -1) {
    throw new Error('No JSON closing bracket found in LLM response');
  }

  cleaned = cleaned.slice(0, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse LLM JSON output: ${err.message}`);
  }
}