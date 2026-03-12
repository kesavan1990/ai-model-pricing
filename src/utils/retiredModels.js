/**
 * Retired/deprecated model detection for all providers.
 * Used to filter out retired models from the app (app.js) and from model lists (calculator.js).
 *
 * Official sources (cross-check here when updating):
 * - OpenAI: https://developers.openai.com/api/docs/deprecations
 * - Google Gemini: https://ai.google.dev/gemini-api/docs/changelog , https://cloud.google.com/vertex-ai/generative-ai/docs/deprecations
 * - Anthropic: https://docs.anthropic.com/en/docs/resources/model-deprecations
 * - Mistral: https://docs.mistral.ai/getting-started/changelog (per-model deprecation via API/changelog)
 */

// --- OpenAI (source: developers.openai.com/api/docs/deprecations) ---
const OPENAI_RETIRED_IDS = new Set([
  'babbage-002',
  'davinci-002',
  'text-embedding-ada-002',
  'gpt-4-0314',
  'gpt-4-1106-preview',
  'gpt-4-0125-preview',
  'gpt-4-turbo-preview',
  'gpt-4-turbo-preview-completions',
  'gpt-4-32k',
  'gpt-4-32k-0314',
  'gpt-4-32k-0613',
  'gpt-3.5-turbo-instruct',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-0301',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k-0613',
  'gpt-4.5-preview',
  'o1-preview',
  'o1-mini',
  'chatgpt-4o-latest',
  'codex-mini-latest',
  'dall-e-2',
  'dall-e-3',
  'gpt-4o-realtime-preview',
  'gpt-4o-realtime-preview-2024-10-01',
  'gpt-4o-realtime-preview-2024-12-17',
  'gpt-4o-realtime-preview-2025-06-03',
  'gpt-4o-mini-realtime-preview',
  'gpt-4o-mini-realtime-preview-2024-12-17',
  'gpt-4o-audio-preview',
  'gpt-4o-audio-preview-2024-10-01',
  'gpt-4o-audio-preview-2024-12-17',
  'gpt-4o-audio-preview-2025-06-03',
  'gpt-4o-mini-audio-preview',
  'gpt-4o-mini-audio-preview-2024-12-17',
]);

export function isRetiredOpenAIModel(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.toLowerCase().trim();
  if (OPENAI_RETIRED_IDS.has(n)) return true;
  // Pattern fallbacks for variants (e.g. with date suffixes)
  if (/^gpt-4-32k(-|$)/.test(n)) return true;
  if (/^gpt-4-turbo-preview/.test(n)) return true;
  if (/^gpt-3\.5-turbo-(0301|0613|1106|16k-0613|instruct)/.test(n)) return true;
  if (/^gpt-4o-(realtime|audio)-preview/.test(n)) return true;
  if (/^gpt-4o-mini-(realtime|audio)-preview/.test(n)) return true;
  return false;
}

// --- Google Gemini (source: ai.google.dev/gemini-api/docs/changelog, Vertex deprecations) ---
// Gemini 1.0 and gemini-pro are retired. Scheduled shutdowns (e.g. 2.0-flash June 2026) can be added when they take effect.
export function isRetiredGeminiModel(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.toLowerCase();
  return n.includes('1.0') || /^gemini-1\.0-/.test(n) || n === 'gemini-pro';
}

// --- Anthropic (source: docs.anthropic.com/en/docs/resources/model-deprecations) ---
// Retired: Claude 3 Opus, Claude 3.5 Haiku (20241022), Claude 3.7 Sonnet (20250219). Deprecated: Claude 3 Haiku (20240307).
const ANTHROPIC_RETIRED_PATTERNS = [
  /^claude-3-opus($|-)/i,
  /^claude-3-haiku($|-)/i,
  /^claude-3-5-haiku($|-)/i,
  /^claude-3-7-sonnet($|-)/i,
  /^claude-3\.5-sonnet$/i,
  /^claude-3\.7-sonnet$/i,
];

export function isRetiredAnthropicModel(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.trim();
  return ANTHROPIC_RETIRED_PATTERNS.some((re) => re.test(n));
}

// --- Mistral (source: docs.mistral.ai changelog; deprecation often per-model via API) ---
// Conservative list from public deprecation reports; check changelog for latest.
const MISTRAL_RETIRED_IDS = new Set([
  'mistral-large',
  'mistral-small',
  'mistral-medium-2312',
]);
const MISTRAL_RETIRED_PREFIX = /^open-mistral-nemo(-|$)/;

export function isRetiredMistralModel(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.toLowerCase().trim();
  if (MISTRAL_RETIRED_IDS.has(n)) return true;
  if (MISTRAL_RETIRED_PREFIX.test(n)) return true;
  return false;
}

/** True if the model is retired for the given providerKey. */
export function isRetired(providerKey, name) {
  if (!providerKey || !name) return false;
  switch (providerKey) {
    case 'gemini': return isRetiredGeminiModel(name);
    case 'openai': return isRetiredOpenAIModel(name);
    case 'anthropic': return isRetiredAnthropicModel(name);
    case 'mistral': return isRetiredMistralModel(name);
    default: return false;
  }
}
