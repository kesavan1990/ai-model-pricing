/**
 * Allowlist: only models listed as "available" on each provider's official page are shown.
 * Used so the app displays only models from the official docs (Models, Value Analysis, Calculators, Benchmarks, Recommend, Overview).
 *
 * Official sources (cross-check when updating):
 * - Gemini: https://ai.google.dev/gemini-api/docs/models , https://ai.google.dev/api/models
 * - OpenAI: https://developers.openai.com/api/docs/models/all (allowed = not in deprecations list)
 * - Anthropic: https://docs.anthropic.com/en/docs/about-claude/models/overview
 * - Mistral: https://docs.mistral.ai/models/
 */

import { isRetiredOpenAIModel } from '../utils/retiredModels.js';

// --- Gemini: official list is 2.5 series, 3.x series, embedding-2, live, and some 2.0 (until deprecated) ---
const GEMINI_ALLOWED_PATTERNS = [
  /^gemini-2\.5-/,           // 2.5 Pro, 2.5 Flash, 2.5 Flash-Lite, Live, TTS, etc.
  /^gemini-3\./,              // 3.1 Pro, 3 Flash, 3.1 Flash-Lite, 3.1 Flash Image, etc.
  /^gemini-embedding-2/,       // gemini-embedding-2-preview
  /^gemini-live-2\.5/,         // Live 2.5
  /^gemini-2\.0-/,            // 2.0 Flash/Lite (until official removal)
  /^gemini-gemma-2-/,          // Gemma 2 (if still on official page)
  /^gemini-exp-/,              // Experimental (if listed)
];

function isAllowedGeminiModel(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.toLowerCase().trim();
  return GEMINI_ALLOWED_PATTERNS.some((re) => re.test(n));
}

// --- OpenAI: allow = not deprecated (deprecations page is source of "not available") ---
function isAllowedOpenAIModel(name) {
  if (!name || typeof name !== 'string') return false;
  return !isRetiredOpenAIModel(name);
}

// --- Anthropic: official list is Claude 4.x (Opus 4, Sonnet 4, Haiku 4) ---
const ANTHROPIC_ALLOWED_PATTERNS = [
  /^claude-opus-4-/,   // Opus 4.6, 4.5, 4.1, etc.
  /^claude-sonnet-4-/, // Sonnet 4.6, 4.5, etc.
  /^claude-haiku-4-/,  // Haiku 4.5, etc.
  /^claude-4-opus/,    // claude-4-opus, claude-4-opus-20250514
  /^claude-4-sonnet/,  // claude-4-sonnet, etc.
  /^claude-4-haiku/,   // if present
];

function isAllowedAnthropicModel(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.trim();
  return ANTHROPIC_ALLOWED_PATTERNS.some((re) => re.test(n));
}

// --- Mistral: official list uses current naming (Large 3, Medium 3.x, Small 3.x, Ministral, Magistral, etc.) ---
const MISTRAL_ALLOWED_PATTERNS = [
  /^mistral-large-3/,     // Mistral Large 3
  /^mistral-large-2512/,  // v25.12
  /^mistral-medium-3/,    // Mistral Medium 3.1 (e.g. mistral-medium-3-1-2508)
  /^mistral-small-3/,      // Mistral Small 3.2 (e.g. mistral-small-3-2-2506)
  /^mistral-3\./,          // mistral-3.1-small, etc.
  /^ministral-3/,         // Ministral 3
  /^magistral-/,          // Magistral Medium/Small
  /^codestral-/,          // Codestral
  /^pixtral-/,            // Pixtral
  /^devstral-/,            // Devstral
  /^open-mistral-7b/,     // Open Mistral 7B
  /^mistral-7b/,          // Mistral 7B
  /^mistral-tiny/,        // Mistral Tiny (if on official page)
  /^mixtral-8x22b/,       // Mixtral 8x22B (if still listed)
];

function isAllowedMistralModel(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.toLowerCase().trim();
  return MISTRAL_ALLOWED_PATTERNS.some((re) => re.test(n));
}

/**
 * True if the model is listed as available on the provider's official page.
 * Used to filter displayed models to official-only in Overview, Models, Value Analysis, Calculators, Benchmarks, Recommend.
 */
export function isAllowedModel(providerKey, modelName) {
  if (!providerKey || !modelName) return false;
  switch (providerKey) {
    case 'gemini': return isAllowedGeminiModel(modelName);
    case 'openai': return isAllowedOpenAIModel(modelName);
    case 'anthropic': return isAllowedAnthropicModel(modelName);
    case 'mistral': return isAllowedMistralModel(modelName);
    default: return false;
  }
}
