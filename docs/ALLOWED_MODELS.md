# Official-only model display (allowlist)

The app **displays only models that are listed as available** on each provider’s official documentation. This applies to **Overview**, **Models**, **Value Analysis**, **Calculators**, **Benchmarks**, and **Recommend**.

## How it works

1. **Allowlist** — `src/data/allowedModels.js` defines `isAllowedModel(providerKey, modelName)`:
   - **Gemini:** Only models matching official “available” patterns (e.g. `gemini-2.5-*`, `gemini-3.*`, `gemini-embedding-2*`, `gemini-live-2.5*`, `gemini-2.0-*`). 1.0, 1.5, and `gemini-pro` are not in the allowlist.
   - **OpenAI:** Any model **not** in the [deprecations list](https://developers.openai.com/api/docs/deprecations) is considered allowed.
   - **Anthropic:** Only Claude 4.x (e.g. `claude-opus-4-*`, `claude-sonnet-4-*`, `claude-haiku-4-*`, `claude-4-opus*`, `claude-4-sonnet*`).
   - **Mistral:** Only models matching current official naming (e.g. `mistral-large-3`, `mistral-medium-3*`, `mistral-small-3*`, `mistral-3.*`, `ministral-3`, `magistral-*`, `codestral-*`, etc.).

2. **Filtering** — In `src/app.js`, `setData(data)` first runs `filterToAllowedModels(data)`, then `filterRetiredModels(...)`. Only allowed (and non-retired) models are stored, so `getData()` returns official-only data for all sections.

3. **Lists** — In `src/calculator.js`, `getAllModels(data)` and `getUnifiedCalcModels(data)` only include models for which `isAllowedModel(providerKey, m.name)` is true (and not retired), so **Models**, **Value Analysis**, **Calculators**, **Benchmarks**, and **Recommend** only show official-available models even if given unfiltered data.

## Official sources (for allowlist updates)

| Provider   | Official “available” / models page |
|-----------|------------------------------------|
| **Gemini**   | [Models \| Gemini API](https://ai.google.dev/gemini-api/docs/models), [api/models](https://ai.google.dev/api/models) |
| **OpenAI**   | [All models \| OpenAI API](https://developers.openai.com/api/docs/models/all); allowed = not in [Deprecations](https://developers.openai.com/api/docs/deprecations) |
| **Anthropic**| [Models overview \| Claude](https://docs.anthropic.com/en/docs/about-claude/models/overview) |
| **Mistral**  | [Models \| Mistral Docs](https://docs.mistral.ai/models/) |

To change which models are shown, edit the patterns or logic in **`src/data/allowedModels.js`** and re-check the provider’s official page.
