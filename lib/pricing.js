// token-gobbler · pricing.js
// Per-1M-token rate cards + cost math. Pure ESM, no deps.
//
// Bucket naming matches DSH's session projection:
//   uncachedInputTokens -> "input"   (fresh, non-cached prompt tokens)
//   outputTokens        -> "output"  (assistant tokens; reasoning is a subdivision, not extra)
//   cacheReadTokens     -> "cacheRead"
//   cacheWriteTokens    -> "cacheWrite"
//
// cost(USD) = (uncachedInput*input + output*output + cacheRead*cacheRead + cacheWrite*cacheWrite) / 1e6
//
// Anthropic rates are authoritative (https://platform.claude.com/docs/en/about-claude/pricing).
// Non-Anthropic entries (Grok, Sonnet 5) are ESTIMATES and flagged with estimated:true.

const P = (input, output, cacheRead, cacheWrite, estimated = false, label = "") => ({
  input, output, cacheRead, cacheWrite, estimated, label,
});

/** Rate card keyed by normalized model id. */
export const PRICING = {
  // ── Anthropic (authoritative) ──────────────────────────────────────────
  "claude-opus-4.6":    P(5,    25,  0.50, 6.25,  false, "Claude Opus 4.6"),
  "claude-opus-4.5":    P(5,    25,  0.50, 6.25,  false, "Claude Opus 4.5"),
  "claude-opus-4.1":    P(15,   75,  1.50, 18.75, false, "Claude Opus 4.1"),
  "claude-opus-4":      P(15,   75,  1.50, 18.75, false, "Claude Opus 4"),
  "claude-sonnet-4.6":  P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 4.6"),
  "claude-sonnet-4.5":  P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 4.5"),
  "claude-sonnet-4":    P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 4"),
  "claude-sonnet-3.7":  P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 3.7"),
  "claude-sonnet-5":    P(3,    15,  0.30, 3.75,  true,  "Claude Sonnet 5"),
  "claude-haiku-4.5":   P(1,    5,   0.10, 1.25,  false, "Claude Haiku 4.5"),
  "claude-haiku-3.5":   P(0.8,  4,   0.08, 1.00,  false, "Claude Haiku 3.5"),
  "claude-haiku-3":     P(0.25, 1.25, 0.03, 0.30,  false, "Claude Haiku 3"),
  // ── xAI (estimated, Grok 4 tier) ───────────────────────────────────────
  "grok-4.6":           P(3,    15,  0.30, 3.75,  true,  "Grok 4.6"),
  "grok-4":             P(3,    15,  0.30, 3.75,  true,  "Grok 4"),
  // ── Local ──────────────────────────────────────────────────────────────
  // Qwen 3.8 27B — metered local gateway (qweno). cacheWrite assumed 1.25× input.
  "qwen3.8-local":      { ...P(0.25, 2.5, 0.05, 0.3125, false, "Qwen 3.8 27B (local)"), local: true },
  "local-free":         { ...P(0,    0,   0,    0,     false, "Local (unpriced)"), local: true },
};

/**
 * Effective rate cards (id -> card). Seeded from the built-in table above;
 * replaced by the user's saved pricing file via setRuntimeTable() on every
 * request (see report.loadPricing). The user can edit, add and remove
 * entries from the Pricing tab of the dashboard.
 */
let runtimeTable = (() => { const t = {}; for (const [id, c] of Object.entries(PRICING)) t[id] = c; return t; })();
let runtimeReference = null;

/** Built-in table as a plain array (the seed for the user's editable file). */
export function builtinEntries() {
  return Object.entries(PRICING).map(([id, c]) => ({
    id,
    label: c.label || id,
    input: c.input, output: c.output, cacheRead: c.cacheRead, cacheWrite: c.cacheWrite,
    estimated: !!c.estimated,
    local: !!c.local,
  }));
}

/** Install a user table (array of {id, label, input, output, cacheRead, cacheWrite, estimated, local}) as the effective rate cards. */
export function setRuntimeTable(entries, referenceModel) {
  const t = {};
  for (const e of entries || []) {
    if (!e || typeof e.id !== "string" || !e.id.trim()) continue;
    const id = e.id.trim().toLowerCase();
    t[id] = {
      input: Number(e.input) || 0,
      output: Number(e.output) || 0,
      cacheRead: Number(e.cacheRead) || 0,
      cacheWrite: Number(e.cacheWrite) || 0,
      estimated: !!e.estimated,
      label: (typeof e.label === "string" && e.label.trim()) ? e.label.trim() : id,
      local: !!e.local,
    };
  }
  runtimeTable = t;
  runtimeReference = (typeof referenceModel === "string" && referenceModel.trim()) ? referenceModel.trim().toLowerCase() : null;
}

/** Current effective table as an array (for GET /pricing). */
export function runtimeEntries() {
  return Object.entries(runtimeTable).map(([id, c]) => ({ id, ...c }));
}

/** The model the WFH (local) compute is valued against. */
export function referenceModelId() { return runtimeReference; }

/** Marker: anything that looks like a self-hosted / free model prices at $0. */
const LOCAL_RE = /llama|gemma|mistral|phi-?3|gpt-?oss|mlx|gguf|ollama|lm-?studio|lmstudio|vllm|4bit|8bit|16bit|int8|fp8|local|blobs\/sha256/;

/** Strip provider prefixes + lowercase, so "anthropic.claude-sonnet-4-6" -> "claude-sonnet-4-6". */
export function normalizeModel(name) {
  if (!name) return "";
  let s = String(name).toLowerCase().trim();
  s = s.replace(/^(eu\.|us\.|us-east-1\.|us-west-2\.)?anthropic\./, "");
  s = s.replace(/^(eu\.|us\.)?openai\./, "");
  s = s.replace(/^xai\./, "");
  s = s.replace(/^(github-copilot(-official)?)\//, "");
  s = s.replace(/^(copilot(-official)?)\//, "");
  // bedrock-style "claude-sonnet-4-6" and dotted "claude-sonnet-4.6" both -> dotted canonical
  s = s.replace(/-(\d)\.(\d)/g, "-$1.$2"); // no-op safety
  return s;
}

/**
 * Resolve a rate card for a model name.
 * Order: exact (raw) -> exact (normalized) -> local/free marker -> family fallback -> null.
 */
export function priceFor(model) {
  if (!model) return null;
  const raw = String(model).toLowerCase();
  if (runtimeTable[raw]) return runtimeTable[raw];
  const norm = normalizeModel(raw);
  if (runtimeTable[norm]) return runtimeTable[norm];
  // bedrock "claude-sonnet-4-6" -> "claude-sonnet-4.6"
  const dotted = norm.replace(/-v\d+$/, "").replace(/-(\d+)-(\d+)$/, "-$1.$2");
  if (runtimeTable[dotted]) return runtimeTable[dotted];
  if (norm.includes("qwen")) return runtimeTable["qwen3.8-local"] || null; // metered local Qwen
  if (LOCAL_RE.test(norm)) return runtimeTable["local-free"] || null;       // other self-hosted → unpriced
  if (norm.includes("opus"))   return runtimeTable["claude-opus-4.6"] || null;
  if (norm.includes("sonnet")) return runtimeTable["claude-sonnet-4.6"] || null;
  if (norm.includes("haiku"))  return runtimeTable["claude-haiku-4.5"] || null;
  if (norm.includes("grok"))   return runtimeTable["grok-4.6"] || null;
  return null;
}

/** Break down the USD cost of a bucket set under a rate card. */
export function costBreakdown(buckets, card) {
  const b = buckets || {};
  const inputCost    = ((b.uncachedInputTokens || 0) / 1e6) * card.input;
  const outputCost   = ((b.outputTokens || 0) / 1e6) * card.output;
  const cacheReadCost   = ((b.cacheReadTokens || 0) / 1e6) * card.cacheRead;
  const cacheWriteCost  = ((b.cacheWriteTokens || 0) / 1e6) * card.cacheWrite;
  return {
    inputCost, outputCost, cacheReadCost, cacheWriteCost,
    total: inputCost + outputCost + cacheReadCost + cacheWriteCost,
  };
}

/** Total USD cost of a bucket set under a rate card. */
export function costFor(buckets, card) {
  return costBreakdown(buckets, card).total;
}

export function emptyBuckets() {
  return { uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
}

export function allTokens(buckets) {
  const b = buckets || {};
  return (b.uncachedInputTokens || 0) + (b.outputTokens || 0) + (b.cacheReadTokens || 0) + (b.cacheWriteTokens || 0);
}

// ── Real-usage (provider-aware) pricing ──────────────────────────────────
// The home-lab baseline is the OpenRouter price of Qwen 3.8 27B (qwen3.8-local above).
// Rule: a COPILOT provider keeps the specific model's card (Sonnet/Opus/Grok);
// ANY other provider is "local Qwen" (the home lab), priced at the Qwen baseline.

export const LOCAL_QWEN_KEY = "qwen3.8-local";

/** True when the provider is a paid Copilot provider. */
export function isCopilotProvider(provider) {
  return /copilot/i.test(String(provider || ""));
}

/**
 * Canonical key for REAL per-model usage:
 *   - Copilot provider -> the specific model (Sonnet/Opus/Grok card).
 *   - any other provider -> the local Qwen baseline (the home lab).
 */
export function modelKey(provider, model) {
  if (isCopilotProvider(provider)) return normalizeModel(model) || "unknown";
  return LOCAL_QWEN_KEY;
}

/** Rate card for a real (provider, model) usage point. */
export function priceForProvider(provider, model) {
  return priceFor(modelKey(provider, model));
}
