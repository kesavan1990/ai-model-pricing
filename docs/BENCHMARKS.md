# Benchmark pipeline

The app uses a **second dataset** alongside pricing, following the same architecture pattern.

## Flow

```
Pricing API (Vizra)          Benchmark sources
        ↓                            ↓
update-pricing.js            update-benchmarks.js
        ↓                            ↓
  pricing.json                 benchmarks.json
        ↓                            ↓
        └──────────┬─────────────────┘
                   ↓
            Frontend loads both
                   ↓
        Merge by model name + provider
```

- **Pricing:** Fetched from Vizra → `scripts/update-pricing.js` → `pricing.json` (daily).
- **Benchmarks:** Built from `pricing.json` (and optionally future benchmark APIs) → `scripts/update-benchmarks.js` → `benchmarks.json` (weekly).

The UI fetches both files (with cache-busting) and merges benchmark scores into the model list by **model name** and **provider**. If a model has an entry in `benchmarks.json`, those scores (MMLU, Code, Reasoning, Arena) are used; otherwise the app uses the embedded fallback in `getBenchmarkForModel()` in `src/calculator.js`.

## benchmarks.json shape

```json
{
  "updated": "2026-03-10",
  "benchmarks": [
    {
      "model": "gpt-4o",
      "provider": "openai",
      "mmlu": 88.7,
      "code": 90,
      "reasoning": 87,
      "arena": 1320
    },
    {
      "model": "gemini-1.5-pro",
      "provider": "gemini",
      "mmlu": 86,
      "code": 88,
      "reasoning": 85,
      "arena": 1290
    }
  ]
}
```

- **model** — Model name (must match pricing model names for merge).
- **provider** — One of `gemini`, `openai`, `anthropic`, `mistral`.
- **mmlu, code, reasoning, arena** — Numeric scores (optional in schema; omitted values treated as 0 in the UI).

Validated by `schemas/benchmarks.schema.json` before write.

## Update frequency

| Metric            | Update frequency | How |
|-------------------|------------------|-----|
| Pricing           | Daily            | `.github/workflows/update-pricing.yml` at 06:00 UTC |
| Benchmarks        | Weekly           | `.github/workflows/update-benchmarks.yml` Sunday 00:00 UTC |
| Arena rankings    | Weekly (in benchmarks) | Same as benchmarks |

Benchmarks and arena-style scores change less often than prices, so weekly updates are used.

## Script: update-benchmarks.js

- **Location:** `scripts/update-benchmarks.js`
- **Run:** `npm run update-benchmarks` or `node scripts/update-benchmarks.js`
- **Input:** Reads `pricing.json` from the repo (current directory).
- **Logic:** For each model in `pricing.json` (gemini, openai, anthropic, mistral), assigns benchmark scores via an embedded lookup (aligned with the app’s `getBenchmarkForModel`). Skips embedding-only models (e.g. text-embedding-*).
- **Output:** Writes `benchmarks.json` with `updated` (YYYY-MM-DD) and `benchmarks` array. Validates against `schemas/benchmarks.schema.json`; on validation failure, exits with code 1 and does not write.
- **Future:** When a real benchmark API is available, replace the embedded lookup with a fetch and normalize the API response into the same `benchmarks` array shape.

## GitHub Action

- **Workflow:** `.github/workflows/update-benchmarks.yml`
- **Schedule:** `cron: '0 0 * * 0'` (Sunday 00:00 UTC)
- **Manual:** `workflow_dispatch`
- **Steps:** Checkout → npm ci → `npm run update-benchmarks` → commit and push `benchmarks.json` only if the file content changed.

The workflow depends on `pricing.json` being present (from the last run of the pricing workflow or from the repo). For a full refresh, run the pricing workflow first, then the benchmarks workflow, or rely on the weekly run after the daily pricing update.

## Frontend

- **API:** `api.getBenchmarks()` fetches `benchmarks.json?t=<timestamp>` (cache-busting). Returns `{ updated, benchmarks }` or `null`.
- **State:** App stores `benchmarksData` (the `benchmarks` array or `null`) and passes it to `render.renderTables(data, benchmarks)`.
- **Merge:** `getBenchmarkForModelMerged(name, providerKey, fileBenchmarks)` in `src/calculator.js` finds an entry in `fileBenchmarks` where `provider` and normalized `model` match; otherwise falls back to `getBenchmarkForModel(name, providerKey)`.
