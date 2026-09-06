// token-gobbler · pricing.ts
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
// Each entry carries a billing kind:
//   corp  -> billed at this card's rate, counted in the "corp" (company) bucket.
//   local -> the home lab: priced at its configured rates (set in the Pricing tab)
//            so you can track what your local compute costs. The WFH split shows
//            local cost vs. what the same tokens would cost at the reference model.
//
// The rate-card table is user-editable in the Pricing tab; the FIRST table is
// seeded from the models actually seen in the trajectory (report.seedPricing),
// so every provider/model you've used gets a row you can mark corp or local.
//
// Anthropic rates are authoritative (https://platform.claude.com/docs/en/about-claude/pricing).
// DeepSeek rates come from api.deepseek.com (peak; off-peak is half price).
// Grok and Claude Sonnet 5 are ESTIMATES and flagged with estimated:true.

/** A rate card: per-1M-token prices (USD) for one model id. */
export interface RateCard {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  estimated: boolean;
  label: string;
  corp?: boolean;
  local?: boolean;
}

/** A user-editable pricing table row (what the Pricing tab holds per model). */
export interface PricingEntry {
  id: string;
  label?: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  estimated: boolean;
  local: boolean;
  corp: boolean;
  provider?: string | null;
}

/** The four token buckets DSH tracks per session. */
export interface TokenBuckets {
  uncachedInputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens?: number;
}

/** A partial bucket set (any field may be absent; treated as 0). */
export type BucketsLike = Partial<TokenBuckets>;

/** A model the trajectory revealed (id + optional label/provider). */
export interface DiscoveredModel {
  id: string;
  label?: string;
  provider?: string | null;
  steps?: number;
}

/** Per-bucket USD cost breakdown for a bucket set under a rate card. */
export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cacheReadCost: number;
  cacheWriteCost: number;
  total: number;
}

const P = (input: number, output: number, cacheRead: number, cacheWrite: number, estimated = false, label = "", corp = false): RateCard => ({
  input, output, cacheRead, cacheWrite, estimated, label, corp,
});

/** Rate card keyed by normalized model id. corp:true = billed, local:true = home lab ($0). */
export const PRICING: Record<string, RateCard> = {
  // ── Anthropic (authoritative, corp) ────────────────────────────────────
  "claude-opus-4.6":    P(5,    25,  0.50, 6.25,  false, "Claude Opus 4.6", true),
  "claude-opus-4.5":    P(5,    25,  0.50, 6.25,  false, "Claude Opus 4.5", true),
  "claude-opus-4.1":    P(15,   75,  1.50, 18.75, false, "Claude Opus 4.1", true),
  "claude-opus-4":      P(15,   75,  1.50, 18.75, false, "Claude Opus 4", true),
  "claude-sonnet-4.6":  P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 4.6", true),
  "claude-sonnet-4.5":  P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 4.5", true),
  "claude-sonnet-4":    P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 4", true),
  "claude-sonnet-3.7":  P(3,    15,  0.30, 3.75,  false, "Claude Sonnet 3.7", true),
  "claude-sonnet-5":    P(3,    15,  0.30, 3.75,  true,  "Claude Sonnet 5", true),
  "claude-haiku-4.5":   P(1,    5,   0.10, 1.25,  false, "Claude Haiku 4.5", true),
  "claude-haiku-3.5":   P(0.8,  4,   0.08, 1.00,  false, "Claude Haiku 3.5", true),
  "claude-haiku-3":     P(0.25, 1.25, 0.03, 0.30,  false, "Claude Haiku 3", true),
  // ── xAI (estimated, Grok 4 tier, corp) ─────────────────────────────────
  "grok-4.6":           P(3,    15,  0.30, 3.75,  true,  "Grok 4.6", true),
  "grok-4":             P(3,    15,  0.30, 3.75,  true,  "Grok 4", true),
  // ── DeepSeek API (corp, https://api.deepseek.com — peak rate) ──────────
  // Off-peak is half price (flash: 0.22/0.66/0.007; pro: 0.66/1.98/0.022).
  // DeepSeek does not bill cache writes, so cacheWrite = 0.
  "deepseek-v4-flash":          P(0.44,  1.32, 0.014, 0, false, "DeepSeek V4 Flash (API)", true),
  "deepseek-v4-flash-0731":     P(0.44,  1.32, 0.014, 0, false, "DeepSeek V4 Flash 0731 (API)", true),
  "deepseek-v4-flash-vision-exp": P(0.44, 1.32, 0.014, 0, false, "DeepSeek V4 Flash Vision (API)", true),
  "deepseek-v4-pro":            P(1.32,  3.96, 0.044, 0, false, "DeepSeek V4 Pro (API)", true),
  "deepseek-v4-pro-0813":       P(1.32,  3.96, 0.044, 0, false, "DeepSeek V4 Pro 0813 (API)", true),
  // ── Local (home lab — $0 cost, still measured in performance) ──────────
  // Qwen 3.8 27B — the metered home-lab gateway (qweno). cacheWrite assumed 1.25× input.
  "qwen3.8-local":      { ...P(0.25, 2.5, 0.05, 0.3125, false, "Qwen 3.8 27B (local)"), local: true },
  "local-free":         { ...P(0,    0,   0,    0,     false, "Local (unpriced)"), local: true },
};

/**
 * Effective rate cards (id -> card). Seeded from the built-in table above;
 * replaced by the user's saved pricing file via setRuntimeTable() on every
 * request (see report.loadPricing). The user can edit, add and remove
 * entries from the Pricing tab of the dashboard.
 */
let runtimeTable: Record<string, RateCard> = (() => { const t: Record<string, RateCard> = {}; for (const [id, c] of Object.entries(PRICING)) t[id] = c; return t; })();
let runtimeReference: string | null = null;
let runtimeBaseline: string | null = null;

/** Built-in table as a plain array (the seed for the user's editable file). */
export function builtinEntries(): PricingEntry[] {
  return Object.entries(PRICING).map(([id, c]) => ({
    id,
    label: c.label || id,
    input: c.input, output: c.output, cacheRead: c.cacheRead, cacheWrite: c.cacheWrite,
    estimated: !!c.estimated,
    local: !!c.local,
    corp: !!c.corp,
  }));
}

/** Install a user table (array of {id, label, input, output, cacheRead, cacheWrite, estimated, local, corp}) as the effective rate cards. */
export function setRuntimeTable(entries: PricingEntry[] | null | undefined, referenceModel?: string | null, baselineModel?: string | null): void {
  const t: Record<string, RateCard> = {};
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
      corp: !!e.corp,
    };
  }
  runtimeTable = t;
  runtimeReference = (typeof referenceModel === "string" && referenceModel.trim()) ? referenceModel.trim().toLowerCase() : null;
  runtimeBaseline = (typeof baselineModel === "string" && baselineModel.trim()) ? baselineModel.trim().toLowerCase() : null;
}

/** Current effective table as an array (for GET /pricing). */
export function runtimeEntries(): (RateCard & { id: string })[] {
  return Object.entries(runtimeTable).map(([id, c]) => ({ id, ...c }));
}

/** The model the WFH (local) compute is valued against. */
export function referenceModelId(): string | null { return runtimeReference; }

/** The user-chosen local baseline model (the home-lab card the comparison is priced against). */
export function baselineModelId(): string | null { return runtimeBaseline; }

/** Marker: anything that looks like a self-hosted / free model prices at $0. */
const LOCAL_RE = /llama|gemma|mistral|phi-?3|gpt-?oss|mlx|gguf|ollama|lm-?studio|lmstudio|vllm|4bit|8bit|16bit|int8|fp8|local|blobs\/sha256/;

/** Strip provider prefixes + lowercase, so "anthropic.claude-sonnet-4-6" -> "claude-sonnet-4-6". */
export function normalizeModel(name: unknown): string {
  if (!name) return "";
  let s = String(name).toLowerCase().trim();
  s = s.replace(/^(eu\.|us\.|us-east-1\.|us-west-2\.)?anthropic\./, "");
  s = s.replace(/^(eu\.|us\.)?openai\./, "");
  s = s.replace(/^deepseek\./, "");
  s = s.replace(/^xai\./, "");
  s = s.replace(/^(github-copilot(-official)?)\//, "");
  s = s.replace(/^(copilot(-official)?)\//, "");
  // NB: bedrock-style "claude-sonnet-4-6" -> dotted "claude-sonnet-4.6" happens in priceFor
  // (its `dotted` step), not here — normalizeModel only strips provider prefixes.
  return s;
}

/**
 * Resolve a rate card for a model name.
 * Order: exact (raw) -> exact (normalized) -> local/free marker -> family fallback -> null.
 */
export function priceFor(model: unknown): RateCard | null {
  if (!model) return null;
  const raw = String(model).toLowerCase();
  if (runtimeTable[raw]) return runtimeTable[raw];
  const norm = normalizeModel(raw);
  if (runtimeTable[norm]) return runtimeTable[norm];
  // bedrock "claude-sonnet-4-6" -> "claude-sonnet-4.6"
  const dotted = norm.replace(/-v\d+$/, "").replace(/-(\d+)-(\d+)$/, "-$1.$2");
  if (runtimeTable[dotted]) return runtimeTable[dotted];
  // Qwen is the metered home-lab baseline — but a DeepSeek model that happens to contain
  // "qwen" is a DeepSeek API model (corp), not local, so exclude deepseek from the qwen rule.
  if (norm.includes("qwen") && !norm.includes("deepseek")) return runtimeTable["qwen3.8-local"] || null; // metered local Qwen
  // DeepSeek API (corp) unless it's a self-hosted DeepSeek (gguf/4bit/… → local-free below).
  if (norm.includes("deepseek") && !LOCAL_RE.test(norm)) return runtimeTable["deepseek-v4-flash"] || null;  // DeepSeek API (corp)
  if (LOCAL_RE.test(norm)) return runtimeTable["local-free"] || null;       // self-hosted → unpriced (incl. a local DeepSeek GGUF)
  if (norm.includes("opus"))   return runtimeTable["claude-opus-4.6"] || null;
  if (norm.includes("sonnet")) return runtimeTable["claude-sonnet-4.6"] || null;
  if (norm.includes("haiku"))  return runtimeTable["claude-haiku-4.5"] || null;
  if (norm.includes("grok"))   return runtimeTable["grok-4.6"] || null;
  return null;
}

/** Break down the USD cost of a bucket set under a rate card. Local (home-lab) cards price at their configured rates (set in the Pricing tab) so you can track what your local compute "costs". */
export function costBreakdown(buckets: BucketsLike | null | undefined, card: RateCard | null): CostBreakdown {
  if (!card) return { inputCost: 0, outputCost: 0, cacheReadCost: 0, cacheWriteCost: 0, total: 0 };
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
export function costFor(buckets: BucketsLike | null | undefined, card: RateCard | null): number {
  return costBreakdown(buckets, card).total;
}

export function emptyBuckets(): TokenBuckets {
  return { uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
}

export function allTokens(buckets: BucketsLike | null | undefined): number {
  const b = buckets || {};
  return (b.uncachedInputTokens || 0) + (b.outputTokens || 0) + (b.cacheReadTokens || 0) + (b.cacheWriteTokens || 0);
}

// ── Real-usage pricing: the rate-card TABLE is the source of truth ──────
//   - a model with a matching table entry (corp OR local) prices at that entry;
//   - a Copilot / paid-API provider model with no entry keeps its own name (so the
//     priceFor family fallback can find a card);
//   - otherwise it's the home lab (the qwen3.8-local baseline).
// Local entries price at their configured rates (set in the Pricing tab) so you
// can track what your local compute costs. The WFH split compares local cost vs.
// the reference model's cost for the same tokens.

export const LOCAL_QWEN_KEY = "qwen3.8-local";

/** True when the provider is a paid Copilot provider. */
export function isCopilotProvider(provider: string | null | undefined): boolean {
  return /copilot/i.test(String(provider || ""));
}

/** True when the provider is a direct (paid, non-Copilot) API provider, e.g. the DeepSeek API. */
const API_PROVIDER_RE = /deepseek/i;
export function isApiProvider(provider: string | null | undefined): boolean {
  return API_PROVIDER_RE.test(String(provider || ""));
}

/** The table key (id) that exactly matches a model name, if any (raw -> normalized -> dotted). */
function lookupKey(name: unknown): string | null {
  if (!name) return null;
  const raw = String(name).toLowerCase();
  if (runtimeTable[raw]) return raw;
  const norm = normalizeModel(raw);
  if (runtimeTable[norm]) return norm;
  const dotted = norm.replace(/-v\d+$/, "").replace(/-(\d+)-(\d+)$/, "-$1.$2");
  if (runtimeTable[dotted]) return dotted;
  return null;
}

/**
 * Canonical key for REAL per-model usage — the table entry this usage prices under.
 * A matching entry (corp or local) wins; otherwise the model keeps its own normalized
 * name. We do NOT fold every non-Copilot, non-API model into a single local baseline:
 * each local provider/model is shown under its own name (e.g. "qwen3.8-27b-q6-gguf",
 * "llama-3-8b") so the report reflects the full set of local models you actually ran.
 * The per-model rate is still resolved family-wise by priceFor (Qwen -> the metered
 * qwen3.8-local card, other self-hosted -> the local-free card).
 */
export function modelKey(provider: string | null | undefined, model: string | null | undefined): string {
  const key = lookupKey(model);
  if (key) return key;
  return normalizeModel(model) || "unknown";
}

/** Billing kind for a real usage point: "local" (home lab, $0) or "corp" (billed). */
export function kindFor(provider: string | null | undefined, model: string | null | undefined): "local" | "corp" {
  const card = priceFor(modelKey(provider, model));
  if (card) return card.local ? "local" : "corp";
  // No rate card resolves (an unrecognizable local model): classify by provider so a
  // self-hosted / home-lab model stays local instead of being mis-billed as corp.
  return isCopilotProvider(provider) || isApiProvider(provider) ? "corp" : "local";
}

/** Rate card for a real (provider, model) usage point. */
export function priceForProvider(provider: string | null | undefined, model: string | null | undefined): RateCard | null {
  return priceFor(modelKey(provider, model));
}

// ── First-table seeding from the trajectory ──────────────────────────────
// We already read every trajectory; use the provider/model pairs we saw to build
// the FIRST cost table (before the user saves pricing.json). Known models get
// their real rates; the rest start at 0 and are auto-classified local/corp so the
// user only has to tweak.

const LOCAL_MODEL_RE = /qwen|llama|gemma|mistral|phi-?3|gpt-?oss|mlx|gguf|ollama|4bit|8bit|16bit|int8|fp8|int4|snapshots/i;
const LOCAL_PROVIDER_RE = /llama|ollama|vllm|transformers|mlx|lm-?studio|lmstudio|ninfer|fast-qwen|v-llm|sss|ddd|local/i;

/** Build the initial table from the models actually seen in the trajectory: [{ id, label, provider }]. */
export function seedEntries(discovered: DiscoveredModel[] = []): PricingEntry[] {
  const out: PricingEntry[] = [];
  const seen = new Set();
  for (const d of discovered) {
    if (!d || !d.id) continue;
    const id = d.id.trim().toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const known = PRICING[id];
    const provider = String(d.provider || "");
    // Home lab unless it's a known paid model or a clearly external/billed provider.
    // NB: no id.includes("/") — paid gateway ids (openrouter/claude-sonnet-4.6) carry a
    // slash and must NOT seed as local. Local models are caught by the model/provider
    // name patterns below (gguf, ollama, local, …) instead.
    const local = known ? !!known.local
      : LOCAL_MODEL_RE.test(id) || LOCAL_PROVIDER_RE.test(provider) || LOCAL_RE.test(id);
    out.push({
      id,
      label: known && known.label ? known.label : (d.label || id),
      input: known ? known.input : 0,
      output: known ? known.output : 0,
      cacheRead: known ? known.cacheRead : 0,
      cacheWrite: known ? known.cacheWrite : 0,
      estimated: known ? !!known.estimated : false,
      local,
      corp: !local,
    });
  }
  return out;
}
