# UI overview

## Cost calculator

In **Calculators → 💰 Pricing**, the cost calculator estimates API cost for a chosen model (and optionally compares two models).

| | Description |
|---|-------------|
| **Input** | **Prompt tokens** — number of input/prompt tokens. |
| **Input** | **Output tokens** — number of output/completion tokens. |
| **Input** | **Model** — select one model (Gemini, OpenAI, Anthropic, Mistral). Optional: **Compare with** a second model. |
| **Output** | **Estimated cost** — cost in $ for the given prompt + output tokens for the selected model(s). |

OpenAI models can also use **Cached input tokens** (tokens served from cache at a lower rate); use 0 for non-OpenAI. The result shows the estimated cost per request; with "Compare with" you see both models side by side.

---

## Model comparison table

On the **Compare** tab (📋 Compare in the main nav, next to Home, Calculators, Benchmarks, Recommend), a single **Model comparison** table lists all models for quick scanning and comparison.

| Column    | Description |
|-----------|-------------|
| **Model** | Model name (e.g. Gemini 2.5 Flash, GPT-4o). |
| **Provider** | Provider name: Google Gemini, OpenAI, Anthropic, Mistral. |
| **Input** | Input price per 1M tokens (e.g. $0.10 or Free). |
| **Output** | Output price per 1M tokens (e.g. $0.40 or Free). |
| **Context** | Context window size (e.g. 1M, 128k, 200k). From provider/model metadata; "—" if not set. |

Example table shape:

| Model   | Provider      | Input | Output | Context |
|---------|---------------|-------|--------|---------|
| …       | Google Gemini | $0.10 | $0.40  | 1M      |
| …       | OpenAI        | $2.50 | $10.00 | 128k    |
| …       | Anthropic     | …     | …      | 200k    |
| …       | Mistral       | …     | …      | 32k     |

The table is filled by `renderModelComparisonTable(data)` in `src/render.js`, using `getAllModels(data)` from `src/calculator.js` (which includes context from `getContextWindow(providerKey, modelName)`).
