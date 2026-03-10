#!/usr/bin/env node
/**
 * Builds benchmarks.json from pricing.json using embedded benchmark lookup.
 * Architecture: Benchmark sources → update-benchmarks.js → benchmarks.json.
 * UI loads pricing.json + benchmarks.json and merges by model name and provider.
 *
 * This script reads pricing.json (from repo or last workflow run), assigns
 * benchmark scores per model via an embedded lookup (aligned with app fallback),
 * and writes benchmarks.json. When a real benchmark API is available, replace
 * the lookup with a fetch and normalize the response to this schema.
 *
 * Run: node scripts/update-benchmarks.js
 * GitHub Action: .github/workflows/update-benchmarks.yml (weekly).
 */

const OUT_FILE = 'benchmarks.json';
const SCHEMA_PATH = 'schemas/benchmarks.schema.json';
const PRICING_FILE = 'pricing.json';

/** Embedded benchmark lookup by provider + model name (same logic as app fallback). */
function getScoresForModel(name, providerKey) {
  const n = (name || '').toLowerCase();
  if (providerKey === 'gemini') {
    if (/3\.1\s*pro/i.test(n)) return { mmlu: 87, code: 90, reasoning: 91, arena: 92 };
    if (/3\.1\s*flash-lite|3\s*flash/i.test(n)) return { mmlu: 84, code: 86, reasoning: 87, arena: 88 };
    if (/2\.5\s*pro/i.test(n)) return { mmlu: 86, code: 89, reasoning: 90, arena: 91 };
    if (/2\.5\s*flash/i.test(n)) return { mmlu: 82, code: 85, reasoning: 86, arena: 87 };
    if (/2\.0\s*flash/i.test(n)) return { mmlu: 80, code: 83, reasoning: 84, arena: 85 };
    if (/1\.5\s*pro/i.test(n)) return { mmlu: 86, code: 88, reasoning: 89, arena: 90 };
    if (/1\.5\s*flash/i.test(n)) return { mmlu: 80, code: 82, reasoning: 83, arena: 84 };
    return { mmlu: 80, code: 82, reasoning: 83, arena: 84 };
  }
  if (providerKey === 'openai') {
    if (/^text-embedding/i.test(n)) return null;
    if (/gpt-5\.2-pro|gpt-5-pro/i.test(n)) return { mmlu: 90, code: 93, reasoning: 96, arena: 97 };
    if (/gpt-5\.2|gpt-5\.1|^gpt-5$/i.test(n)) return { mmlu: 89, code: 92, reasoning: 95, arena: 96 };
    if (/gpt-5-mini/i.test(n)) return { mmlu: 85, code: 88, reasoning: 90, arena: 91 };
    if (/gpt-5-nano/i.test(n)) return { mmlu: 82, code: 85, reasoning: 87, arena: 88 };
    if (/o1|o3|o4/i.test(n)) return { mmlu: 89, code: 91, reasoning: 96, arena: 97 };
    if (/gpt-4\.1|gpt-4o/i.test(n)) return { mmlu: 88, code: 90, reasoning: 92, arena: 93 };
    if (/gpt-4\.1-mini|gpt-4o-mini/i.test(n)) return { mmlu: 84, code: 86, reasoning: 88, arena: 89 };
    return { mmlu: 85, code: 87, reasoning: 88, arena: 89 };
  }
  if (providerKey === 'anthropic') {
    if (/opus|claude-4-opus|claude-opus-4/i.test(n)) return { mmlu: 89, code: 91, reasoning: 93, arena: 95 };
    if (/sonnet|claude-4-sonnet|claude-sonnet-4/i.test(n)) return { mmlu: 87, code: 89, reasoning: 90, arena: 92 };
    if (/haiku|claude-3\.5-haiku|claude-haiku/i.test(n)) return { mmlu: 84, code: 86, reasoning: 87, arena: 88 };
    return { mmlu: 85, code: 87, reasoning: 88, arena: 89 };
  }
  if (providerKey === 'mistral') {
    if (/mistral-large|magistral|pixtral-large/i.test(n)) return { mmlu: 86, code: 88, reasoning: 89, arena: 90 };
    if (/mistral-medium|devstral|codestral/i.test(n)) return { mmlu: 83, code: 86, reasoning: 85, arena: 87 };
    return { mmlu: 80, code: 82, reasoning: 83, arena: 84 };
  }
  return { mmlu: 75, code: 78, reasoning: 80, arena: 82 };
}

function buildBenchmarksFromPricing(pricing) {
  const entries = [];
  const providers = [
    { key: 'gemini', list: pricing.gemini },
    { key: 'openai', list: pricing.openai },
    { key: 'anthropic', list: pricing.anthropic || [] },
    { key: 'mistral', list: pricing.mistral || [] },
  ];
  for (const { key, list } of providers) {
    if (!Array.isArray(list)) continue;
    for (const m of list) {
      const name = m && m.name ? String(m.name).trim() : '';
      if (!name) continue;
      const scores = getScoresForModel(name, key);
      if (!scores) continue;
      entries.push({
        model: name,
        provider: key,
        mmlu: scores.mmlu,
        code: scores.code,
        reasoning: scores.reasoning,
        arena: scores.arena,
      });
    }
  }
  return entries;
}

async function main() {
  const fs = await import('fs');
  const path = await import('path');
  const outPath = path.join(process.cwd(), OUT_FILE);
  const pricingPath = path.join(process.cwd(), PRICING_FILE);

  let pricing;
  try {
    const raw = fs.readFileSync(pricingPath, 'utf8');
    pricing = JSON.parse(raw);
  } catch (e) {
    console.error('Benchmarks update failed: Could not read or parse', PRICING_FILE, e.message);
    process.exit(1);
  }

  if (!pricing || typeof pricing !== 'object') {
    console.error('Benchmarks update failed: Invalid pricing payload');
    process.exit(1);
  }

  const benchmarks = buildBenchmarksFromPricing(pricing);
  const updated = new Date().toISOString().slice(0, 10);
  const payload = { updated, benchmarks };

  const schemaPath = path.join(process.cwd(), SCHEMA_PATH);
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  } catch (e) {
    console.error('Benchmarks update failed: Could not load schema', SCHEMA_PATH, e.message);
    process.exit(1);
  }
  const { default: Ajv } = await import('ajv');
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  if (!validate(payload)) {
    const errs = (validate.errors || []).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
    console.error('Benchmarks update failed: Schema validation failed:', errs);
    process.exit(1);
  }

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log('Wrote', OUT_FILE, `(${benchmarks.length} models)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
