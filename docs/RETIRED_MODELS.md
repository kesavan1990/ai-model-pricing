# Retired and deprecated models (excluded)

Retired/deprecated models are **excluded from the app**: they do not appear in any section. The lists in `src/utils/retiredModels.js` are **cross-checked with each provider’s official deprecation pages** (see below).

## Where they are excluded

| Section | How |
|--------|-----|
| **Overview** | Current pricing grid uses `getData()`, which is filtered in `setData()` via `filterRetiredModels()`. |
| **Models** | Comparison table uses `getAllModels(data)`; `getAllModels()` skips any model where `isRetired(providerKey, name)` is true. |
| **Value Analysis** | Cost vs performance chart uses `getAllModels(data)` inside `mergeModels()`; retired models are skipped. |
| **Calculators** | Model dropdown uses `getUnifiedCalcModels(data)` (skips retired); cost and compare use the same filtered state. |
| **Benchmarks** | Benchmark table and export use `getAllModels(data)`; retired models are skipped. |
| **Recommend** | Recommendations use `getRecommendations(data)` → `getAllModels(data)`; retired models are skipped. |

## Implementation

1. **`src/utils/retiredModels.js`**  
   Defines:
   - `isRetiredGeminiModel(name)`
   - `isRetiredOpenAIModel(name)`
   - `isRetiredAnthropicModel(name)`
   - `isRetiredMistralModel(name)`
   - `isRetired(providerKey, name)` (single entry point)

2. **`src/app.js`**  
   - `filterRetiredModels(data)` filters each provider array using the helpers above.  
   - `setData(data)` always calls `filterRetiredModels(data)` before assigning to in-memory state, so `getData()` never returns retired models.

3. **`src/calculator.js`**  
   - `getAllModels(data)` skips a model when `isRetired(providerKey, m.name)` is true for that provider.  
   - `getUnifiedCalcModels(data)` only pushes a model when `!isRetired(providerKey, m.name)`.

4. **`src/render.js`**  
   Re-exports the `isRetired*` functions from `utils/retiredModels.js` for backward compatibility.

## Official sources (cross-check when updating)

| Provider | Official deprecation / lifecycle page |
|----------|--------------------------------------|
| **OpenAI** | [Deprecations \| OpenAI API](https://developers.openai.com/api/docs/deprecations) |
| **Google Gemini** | [Release notes \| Gemini API](https://ai.google.dev/gemini-api/docs/changelog), [Vertex AI deprecations](https://cloud.google.com/vertex-ai/generative-ai/docs/deprecations) |
| **Anthropic** | [Model deprecations \| Claude API](https://docs.anthropic.com/en/docs/resources/model-deprecations) |
| **Mistral** | [Changelog \| Mistral Docs](https://docs.mistral.ai/getting-started/changelog) (per-model deprecation via API/changelog) |

## Examples of excluded models

- **Gemini:** Models with `1.0` in the name, `gemini-pro` (per Gemini API changelog / Vertex deprecations).  
- **OpenAI:** Per [developers.openai.com deprecations](https://developers.openai.com/api/docs/deprecations): e.g. `babbage-002`, `davinci-002`, `text-embedding-ada-002`, `gpt-4-0314`, `gpt-4-1106-preview`, `gpt-4-0125-preview`, `gpt-4-turbo-preview`, `gpt-3.5-turbo-*` snapshots, `gpt-4-32k*`, `gpt-4.5-preview`, `o1-preview`, `o1-mini`, `chatgpt-4o-latest`, `codex-mini-latest`, DALL·E 2/3, and deprecated realtime/audio previews.  
- **Anthropic:** Per [model deprecations](https://docs.anthropic.com/en/docs/resources/model-deprecations): Claude 3 Opus, Claude 3 Haiku (e.g. `claude-3-haiku-20240307`), Claude 3.5 Haiku (e.g. `claude-3-5-haiku-20241022`), Claude 3.7 Sonnet (e.g. `claude-3-7-sonnet-20250219`).  
- **Mistral:** Conservative list from public deprecation reports; check [Mistral changelog](https://docs.mistral.ai/getting-started/changelog): e.g. `mistral-large`, `mistral-small`, `mistral-medium-2312`, `open-mistral-nemo` (and variants).

To change which models are treated as retired, edit the logic in **`src/utils/retiredModels.js`** and re-check the official source for that provider.
