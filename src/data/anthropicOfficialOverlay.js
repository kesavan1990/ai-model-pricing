/**
 * Anthropic Claude models and prices from the official pricing page so they always appear
 * even when the API or pricing.json omits them.
 * Source: https://docs.anthropic.com/en/docs/about-claude/pricing (Base input/output per MTok).
 * Deprecations: https://docs.anthropic.com/en/docs/resources/model-deprecations
 * Update when the official page changes.
 */

/** Official Anthropic models (name, input, output per 1M tokens). Missing models are merged into loaded payload. */
export const ANTHROPIC_OFFICIAL_MODELS = [
  { name: 'claude-opus-4-6', input: 5, output: 25 },
  { name: 'claude-opus-4-6-20260205', input: 5, output: 25 },
  { name: 'claude-opus-4-5', input: 5, output: 25 },
  { name: 'claude-opus-4-5-20251101', input: 5, output: 25 },
  { name: 'claude-opus-4-1', input: 15, output: 75 },
  { name: 'claude-opus-4-1-20250805', input: 15, output: 75 },
  { name: 'claude-opus-4-20250514', input: 15, output: 75 },
  { name: 'claude-sonnet-4-6', input: 3, output: 15 },
  { name: 'claude-sonnet-4-5', input: 3, output: 15 },
  { name: 'claude-sonnet-4-5-20250929', input: 3, output: 15 },
  { name: 'claude-sonnet-4-20250514', input: 3, output: 15 },
  { name: 'claude-4-opus', input: 15, output: 75 },
  { name: 'claude-4-opus-20250514', input: 15, output: 75 },
  { name: 'claude-4-sonnet', input: 3, output: 15 },
  { name: 'claude-4-sonnet-20250514', input: 3, output: 15 },
  { name: 'claude-haiku-4-5', input: 1, output: 5 },
  { name: 'claude-haiku-4-5-20251001', input: 1, output: 5 },
];

/**
 * Merge official Anthropic models into payload: add any overlay model not already in anthropic array (by name, case-insensitive).
 * @param {{ gemini?: array, openai?: array, anthropic?: array, mistral?: array }} payload
 * @returns {object} New payload with merged anthropic array.
 */
export function mergeAnthropicOfficialIntoPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const anthropic = Array.isArray(payload.anthropic) ? payload.anthropic.slice() : [];
  const names = new Set(anthropic.map((m) => (m && m.name ? String(m.name).toLowerCase().trim() : '')));
  for (const entry of ANTHROPIC_OFFICIAL_MODELS) {
    const key = (entry.name || '').toLowerCase().trim();
    if (!key || names.has(key)) continue;
    names.add(key);
    anthropic.push({
      name: entry.name,
      input: entry.input,
      output: entry.output,
      cachedInput: null,
    });
  }
  return { ...payload, anthropic };
}
