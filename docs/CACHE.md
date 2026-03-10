# Cache manager

Pricing cache logic is centralized in **`src/utils/cacheManager.js`** so that:

- **API calls are reduced** — Fresh cached pricing is reused until the TTL expires.
- **Cache behavior is in one place** — Key, TTL, and read/write logic are defined once and used everywhere.

## API

| Function | Purpose |
|----------|---------|
| **`getCachedPricing()`** | Returns the cached pricing payload if present and not expired; otherwise `null`. |
| **`setCachedPricing(data)`** | Stores the given payload with the current timestamp. |

**Constants:** `CACHE_KEY` (`'ai_pricing_cache'`), `CACHE_TTL` (12 hours in ms).

## Storage format

- **Current:** `{ timestamp: number, data: object }`. Only entries with `timestamp` within the last 12 hours are considered valid by `getCachedPricing()`.
- **Legacy:** If the stored value is the old shape (payload with `gemini`, `openai`, and optional `cachedAt`), it is still read and TTL is applied using `cachedAt` or ignored if missing.

## Usage

```js
import { getCachedPricing, setCachedPricing } from './utils/cacheManager.js';

// Read: use cache if fresh
const cached = getCachedPricing();
if (cached) {
  renderTables(cached);
}

// Write: after loading or refreshing pricing
setCachedPricing({ gemini, openai, anthropic, mistral, updated });
```

The pricing module’s **`getCachedPricingPayload()`** delegates to `getCachedPricing()`, so code that already uses `pricing.getCachedPricingPayload()` gets the same behavior without change. All cache **writes** go through **`setCachedPricing()`** (e.g. from `app.js` after refresh or daily capture).

## Where it’s used

- **Initial load** — `loadPricingFromApi` / `loadPricing` in `pricingService.js` use the cache as fallback when the API/file fails.
- **Fill missing providers** — Uses cached data if present to fill anthropic/mistral without an extra request.
- **Daily capture** — Reads cache for the snapshot and then writes the updated payload.
- **Refresh from web** — Reads cache for “previous” state (price-change diff), then writes the new payload after a successful refresh.

Changing the TTL or key only requires edits in `src/utils/cacheManager.js`.
