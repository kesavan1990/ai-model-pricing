/**
 * Cache manager: centralizes pricing cache in localStorage with a fixed TTL.
 * Reduces API calls and keeps cache logic in one place.
 */

const CACHE_KEY = 'ai_pricing_cache';
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Get cached pricing data if present and not expired.
 * @returns {object|null} Cached payload (e.g. { gemini, openai, anthropic, mistral, updated }) or null.
 */
export function getCachedPricing() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  try {
    const parsed = JSON.parse(cached);
    if (!parsed || typeof parsed !== 'object') return null;
    // New format: { timestamp, data }
    if (parsed.timestamp != null && parsed.data != null) {
      const now = Date.now();
      if (now - parsed.timestamp > CACHE_TTL) return null;
      return parsed.data;
    }
    // Legacy format: payload with cachedAt (no wrapper)
    if (Array.isArray(parsed.gemini) && Array.isArray(parsed.openai)) {
      const cachedAt = parsed.cachedAt != null ? Number(parsed.cachedAt) : 0;
      if (Date.now() - cachedAt > CACHE_TTL) return null;
      return parsed;
    }
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Store pricing data in cache with current timestamp.
 * @param {object} data - Payload to cache (e.g. { gemini, openai, anthropic, mistral, updated }).
 */
export function setCachedPricing(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch (_) {}
}

export { CACHE_KEY, CACHE_TTL };
