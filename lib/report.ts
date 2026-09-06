// token-gobbler · report.ts
// Aggregates usage from BOTH sources and prices it.
//   1. projcache    -> authoritative per-session token totals (always present, NO model)
//   2. trajectories -> (a) exact per-turn usage when present, and (b) ALWAYS the model
//                      timeline: which provider+model was active at each step.
//
// REAL per-model pricing is provider-aware (see pricing.modelKey): a Copilot provider
// keeps the specific model's card (Sonnet/Opus/Grok); ANY other provider is "local Qwen"
// (the home lab), priced at the Qwen 3.8 27B OpenRouter baseline.
//
// Per session we recover the per-model buckets by (best available):
//   exact  -> per-turn usage chunks (when the trajectory carries them)
//   est.   -> attribution: split the session totals across models by step count
//   assume -> the profile default model (when a session has no model signal)
// The what-if comparison (priceTotals) separately prices the whole aggregate under each
// candidate model's rate card.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import * as pricing from "./pricing.js";
import * as trajectory from "./trajectory.js";
import * as projcache from "./projcache.js";
import type { TokenBuckets, PricingEntry, RateCard, DiscoveredModel } from "./pricing.js";
import type { ModelChange, UsageRecord, EventCounts, CompactionEvent } from "./trajectory.js";
import type { ProjcacheResult, ProjSession } from "./projcache.js";

/** The models to cost the gobbling against: your free local baseline + Copilot's paid roster. */
export const DEFAULT_CANDIDATES: Candidate[] = [
  { id: "qwen3.8-local",     label: "Qwen 3.8 27B (local — what you ran)" },
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash (API)" },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6 (Copilot)" },
  { id: "claude-sonnet-5",   label: "Claude Sonnet 5 (Copilot)" },
  { id: "claude-opus-4.6",   label: "Claude Opus 4.6 (Copilot)" },
  { id: "grok-4.6",          label: "Grok 4.6 (Copilot)" },
];

/** A what-if candidate model. */
export interface Candidate { id: string; label: string; }
/** The profile default model (from settings.yaml). */
export interface DefaultModel { provider: string | null; model: string | null; label: string; }
/** Options accepted by the report builders. */
export interface ReportOptions {
  dshHome?: string;
  sessionsRoot?: string;
  storePath?: string;
  candidates?: Candidate[];
}
/** Resolved filesystem paths. */
export interface ResolvedPaths {
  dshHome: string;
  sessionsRoot: string;
  storePath: string;
  storeKind: "dir" | "file";
}
/** A scanned session's model timeline (for attribution). */
interface TimelineInfo {
  modelChanges: ModelChange[];
  stepSeqs: number[];
  stepTools: Record<string, string[]>;
}

export function resolvePaths(opts: ReportOptions = {}): ResolvedPaths {
  const dshHome = opts.dshHome || process.env.DSH_HOME || join(homedir(), ".dsh");
  // The dsh update (2026-09) moved the projection store from a single JSON file to a
  // directory of per-session files. Prefer the directory when it exists; fall back to
  // the legacy file (still written by older dsh versions).
  let storePath = opts.storePath || process.env.DSH_PROJCACHE || null;
  let storeKind: "dir" | "file" = "file";
  if (storePath) {
    try { storeKind = statSync(storePath).isDirectory() ? "dir" : "file"; } catch { storeKind = "file"; }
  } else {
    const dirStore = join(dshHome, "storages", "session_projcache");
    const fileStore = join(dshHome, "storages", "session_projcache.json");
    if (existsSync(dirStore) && statSync(dirStore).isDirectory()) { storePath = dirStore; storeKind = "dir"; }
    else { storePath = fileStore; storeKind = "file"; }
  }
  return {
    dshHome,
    sessionsRoot: opts.sessionsRoot || join(dshHome, "sessions"),
    storePath,
    storeKind,
  };
}

/**
 * Session ids the user archived in the DSH GUI. The workspace registry persists its
 * complete archive set at <dshHome>/storages/workspace.json (global.archivedSessionIds).
 * Empty set when the file is absent/legacy — archiving is opt-in per session.
 */
export function readArchivedSessions(dshHome: string): Set<string> {
  try {
    const raw = JSON.parse(readFileSync(join(dshHome, "storages", "workspace.json"), "utf8"));
    const ids = raw?.global?.archivedSessionIds;
    return new Set(Array.isArray(ids) ? ids.map(String) : []);
  } catch { return new Set(); }
}

/**
 * Force a full re-parse of every historic trajectory file. Invalidates the in-memory +
 * disk parse cache (trajectory.clearDiskCache), then rebuilds the whole report — which
 * re-reads, re-decompresses and re-parses every trajectory and flushes a fresh disk
 * cache. Used by the dashboard's ♻ Reprocess button so a parser upgrade (or a stale
 * cache) can be picked up on historic files without a code change or restart.
 * Returns what was reprocessed.
 */
export function reprocessTrajectories(opts: ReportOptions = {}) {
  const { dshHome } = resolvePaths(opts);
  trajectory.clearDiskCache(dshHome);
  const report = buildReport({ ...opts, dshHome });
  return {
    files: report.sources.trajectories.files,
    withUsage: report.sources.trajectories.withUsage,
    withModelTimeline: report.sources.trajectories.withModelTimeline,
    cache: report.sources.trajectories.cache,
    defaultModel: report.defaultModel ? report.defaultModel.model : null,
  };
}

/** Where the user's editable pricing table lives. Re-read on every request. */
export function pricingFilePath(dshHome: string): string {
  return join(dshHome, "token-gobbler", "pricing.json");
}

/**
 * The model to value local (home-lab) compute against. claude-opus-4.6 if it's in
 * the table, else the first corp entry, else the first non-local entry.
 */
function defaultReference(models: PricingEntry[]): string {
  if ((models || []).some((m) => m.id === "claude-opus-4.6")) return "claude-opus-4.6";
  const corp = (models || []).find((m) => m.corp && !m.local);
  if (corp) return corp.id;
  const nonLocal = (models || []).find((m) => !m.local);
  return (nonLocal && nonLocal.id) || (models && models[0] && models[0].id) || "claude-opus-4.6";
}

/** The default local baseline: the first local row (excluding the unpriced fallback marker). */
function defaultBaseline(models: PricingEntry[]): string | null {
  const local = (models || []).find((m) => m.local && m.id !== "local-free");
  return (local && local.id) || null;
}

/** The loaded pricing config (which models + which reference the WFH split uses). */
interface PriceConfig {
  path: string;
  fromFile: boolean;
  seeded: boolean;
  referenceModel: string | null;
  baselineModel: string | null;
  models: PricingEntry[];
}

/**
 * Load the user's pricing table (if saved) and install it as the effective rate
 * cards for this request. With no saved file, the FIRST table is seeded from the
 * models actually seen in the trajectory (discovered), so every provider/model
 * you've used gets a row you can mark corp or local; falling back to the built-in
 * cards when there's no trajectory data either. The WFH reference model (what
 * local compute is valued against) is always a corp model in the table.
 */
export function loadPricing(dshHome: string, discovered?: DiscoveredModel[] | null): PriceConfig {
  const p = pricingFilePath(dshHome);
  let file: { models?: unknown; referenceModel?: unknown; baselineModel?: unknown } | null = null;
  if (existsSync(p)) { try { file = JSON.parse(readFileSync(p, "utf8")) as { models?: unknown; referenceModel?: unknown; baselineModel?: unknown }; } catch { file = null; } }
  const hasModels = file && Array.isArray(file.models) && file.models.length > 0;
  let models: PricingEntry[]; let source: "file" | "seeded" | "builtin";
  if (hasModels) { models = file!.models as PricingEntry[]; source = "file"; }
  else if (discovered && discovered.length) {
    // FIRST table = the built-in known cards MERGED with every provider/model actually
    // used, so all known rates stay resolvable (family fallbacks + the reference model)
    // and the models you ran get a row you can mark corp or local.
    const byId = new Map<string, PricingEntry>();
    for (const e of pricing.builtinEntries()) byId.set(e.id, e);
    for (const e of pricing.seedEntries(discovered)) if (!byId.has(e.id)) byId.set(e.id, e);
    models = [...byId.values()];
    source = "seeded";
  }
  else { models = pricing.builtinEntries(); source = "builtin"; }
  const referenceModel = (file && typeof file.referenceModel === "string" && file.referenceModel.trim())
    ? file.referenceModel.trim().toLowerCase()
    : defaultReference(models);
  // The user's chosen local baseline (the home-lab card the comparison is priced
  // against). Only honored when it's still a local row in the table; otherwise the
  // first local row is the implied default.
  const rawBaseline = (file && typeof file.baselineModel === "string" && file.baselineModel.trim())
    ? file.baselineModel.trim().toLowerCase()
    : null;
  const baselineModel = (rawBaseline && models.some((m) => m.id === rawBaseline && m.local))
    ? rawBaseline
    : defaultBaseline(models);
  pricing.setRuntimeTable(models, referenceModel, baselineModel);
  return { path: p, fromFile: !!hasModels, seeded: source === "seeded", referenceModel, baselineModel, models };
}

/** A distinct provider/model discovered across the trajectory. */
interface DiscoveredItem {
  id: string;
  label: string;
  provider: string | null;
  steps: number;
}

/** Discover the distinct provider/model pairs used across the trajectory (for seeding the first table). */
export function discoverModels(dshHome: string, opts: ReportOptions = {}): DiscoveredItem[] {
  const { sessionsRoot } = resolvePaths({ ...opts, dshHome });
  const map = new Map<string, DiscoveredItem>();
  if (!existsSync(sessionsRoot)) return [];
  for (const f of trajectory.findTrajectoryFiles(sessionsRoot)) {
    let t: ReturnType<typeof trajectory.readTrajectory>; try { t = trajectory.readTrajectory(f); } catch { continue; }
    if (!t) continue;
    for (const mc of t.modelChanges || []) {
      if (!mc.model) continue;
      const id = pricing.normalizeModel(mc.model);
      if (!id) continue;
      const e = map.get(id) || { id, label: mc.model, provider: mc.provider, steps: 0 };
      e.provider = e.provider || mc.provider;
      e.steps += 1;
      map.set(id, e);
    }
  }
  return [...map.values()].sort((a, b) => b.steps - a.steps);
}

/** Derive the distinct provider/model pairs from an already-scanned timeline map (no re-read). */
function discoverFromTimelines(timelines: Map<string, TimelineInfo>): DiscoveredItem[] {
  const map = new Map<string, DiscoveredItem>();
  for (const [id, tl] of timelines) {
    for (const mc of tl.modelChanges || []) {
      if (!mc.model) continue;
      const idm = pricing.normalizeModel(mc.model);
      if (!idm) continue;
      const e = map.get(idm) || { id: idm, label: mc.model, provider: mc.provider, steps: 0 };
      e.provider = e.provider || mc.provider;
      e.steps += 1;
      map.set(idm, e);
    }
  }
  return [...map.values()].sort((a, b) => b.steps - a.steps);
}

/** A discovered model with its resolved (family-wise) rate card + billing kind. */
interface DiscoveredModelCard {
  id: string;
  label: string;
  provider: string | null;
  steps: number;
  local: boolean;
  corp: boolean;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  estimated: boolean;
}

/**
 * Re-scan every processed trajectory and return the DISTINCT provider/model pairs with
 * a resolved rate card + billing kind — local AND corp. Used by the Pricing tab's
 * "scan trajectories" button so a user can onboard every provider/model they ran into
 * the pricing table (mark corp/local, set rates), not just the local models. Rates are
 * resolved family-wise (Qwen -> metered, other self-hosted -> local-free, Copilot ->
 * its model card, DeepSeek -> the API card) so added rows are immediately costed.
 */
export function discoverModelCards(dshHome: string, opts: ReportOptions = {}): DiscoveredModelCard[] {
  const found = discoverModels(dshHome, opts);
  // Ensure the runtime rate table is populated so family rates resolve. Cheap: one
  // pricing file read, or builtin+discovered seeding when nothing is saved yet.
  loadPricing(dshHome, found);
  const out: DiscoveredModelCard[] = [];
  for (const m of found) {
    if (!m.id) continue;
    const kind = pricing.kindFor(m.provider, m.id);
    const card = pricing.priceForProvider(m.provider, m.id) || pricing.priceFor(m.id) || null;
    out.push({
      id: m.id,
      label: (m.label && String(m.label).toLowerCase() !== m.id) ? m.label : (card && card.label ? card.label : m.id),
      provider: m.provider || null,
      steps: m.steps,
      local: kind === "local",
      corp: kind !== "local",
      input: card ? card.input : 0,
      output: card ? card.output : 0,
      cacheRead: card ? card.cacheRead : 0,
      cacheWrite: card ? card.cacheWrite : 0,
      estimated: card ? !!card.estimated : false,
    });
  }
  return out.sort((a, b) => b.steps - a.steps);
}

/** A discovered local model with its (family-resolved) rate card. */
interface LocalModel {
  id: string;
  label: string;
  provider: string | null;
  steps: number;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/**
 * Re-scan every processed trajectory and return the DISTINCT LOCAL models with a
 * rate card — each local provider/model is its own entry (not collapsed into the
 * qwen baseline). Kept for backwards compatibility (tests / older callers); the
 * Pricing tab button now uses discoverModelCards (all providers + models).
 */
export function discoverLocalModels(dshHome: string, opts: ReportOptions = {}): LocalModel[] {
  return discoverModelCards(dshHome, opts)
    .filter((m) => m.local)
    .map((m) => ({
      id: m.id,
      label: m.label,
      provider: m.provider || null,
      steps: m.steps,
      input: m.input,
      output: m.output,
      cacheRead: m.cacheRead,
      cacheWrite: m.cacheWrite,
    }));
}

/** The pricing-table POST body (validated in savePricing). */
interface SavePricingBody {
  models?: unknown;
  referenceModel?: unknown;
  baselineModel?: unknown;
}

/**
 * Validate + persist the pricing table to the file. Throws on invalid input.
 * Returns the stored { referenceModel, baselineModel, models }.
 */
export function savePricing(dshHome: string, body: SavePricingBody = {}): { referenceModel: string | null; baselineModel: string | null; models: PricingEntry[] } {
  const isArray = (v: unknown): v is unknown[] => Array.isArray(v);
  const num = (v: unknown): number | null => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : null; };
  const models: PricingEntry[] = [];
  const seen = new Set<string>();
  for (const e of (isArray(body.models) ? body.models : []) as PricingEntry[]) {
    if (!e || typeof e.id !== "string" || !e.id.trim()) continue;
    const id = e.id.trim().toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    const input = num(e.input), output = num(e.output), cacheRead = num(e.cacheRead), cacheWrite = num(e.cacheWrite);
    if (input == null || output == null || cacheRead == null || cacheWrite == null) {
      throw new Error(`model "${e.id.trim()}": input/output/cacheRead/cacheWrite must be numbers >= 0`);
    }
    models.push({
      id,
      label: (typeof e.label === "string" && e.label.trim()) ? e.label.trim() : id,
      input, output, cacheRead, cacheWrite,
      estimated: !!e.estimated,
      local: !!e.local,
      corp: !!e.corp,
      provider: (typeof e.provider === "string" && e.provider.trim()) ? e.provider.trim() : null,
    });
  }
  if (!models.length) throw new Error("models must be a non-empty array of {id, input, output, cacheRead, cacheWrite}");
  const referenceModel = (typeof body.referenceModel === "string" && body.referenceModel.trim()) ? body.referenceModel.trim().toLowerCase() : null;
  if (!referenceModel || !seen.has(referenceModel)) throw new Error("referenceModel must be one of the model ids in the table");
  const refEntry = models.find((m) => m.id === referenceModel);
  if (refEntry && refEntry.local) throw new Error("referenceModel must be a corp (non-local) model — local compute is valued against a billed rate card");
  // Optional local baseline: which home-lab model the comparison is priced against.
  // Only honored when the id is in the table AND marked local.
  let baselineModel: string | null = null;
  if (body.baselineModel != null && String(body.baselineModel).trim()) {
    const b = String(body.baselineModel).trim().toLowerCase();
    if (!seen.has(b)) throw new Error("baselineModel must be one of the model ids in the table");
    const bEntry = models.find((m) => m.id === b);
    if (!bEntry || !bEntry.local) throw new Error("baselineModel must be a local model — the comparison baseline is your home-lab card");
    baselineModel = b;
  } else {
    baselineModel = defaultBaseline(models);
  }
  const p = pricingFilePath(dshHome);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify({ version: 1, referenceModel, baselineModel, models }, null, 2) + "\n");
  pricing.setRuntimeTable(models, referenceModel, baselineModel);
  return { referenceModel, baselineModel, models };
}

const r2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
/** The four token bucket keys (excludes the optional reasoningTokens). */
type BucketKey = "uncachedInputTokens" | "outputTokens" | "cacheReadTokens" | "cacheWriteTokens";
const BUCKETS: BucketKey[] = ["uncachedInputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"];
/** Sort a {name: count} tool map into a [{name, count}] array (top n). */
const toolsArray = (tools: Record<string, number> | null | undefined, n = 40): { name: string; count: number }[] =>
  Object.entries(tools || {}).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, n);

/** Local-time YYYY-MM-DD for a millisecond timestamp. */
export function localDate(ms: number | null | undefined): string {
  if (!ms) return "unknown";
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Read the profile's agent-default-model from settings.yaml (minimal line scan, no YAML dep). */
export function readDefaultModel(dshHome: string): DefaultModel | null {
  const p = join(dshHome, "settings.yaml");
  if (!existsSync(p)) return null;
  let text: string;
  try { text = readFileSync(p, "utf8"); } catch { return null; }
  let inBlock = false, provider: string | null = null, model: string | null = null;
  for (const line of text.split("\n")) {
    if (/^agent-default-model:\s*$/.test(line)) { inBlock = true; continue; }
    if (!inBlock) continue;
    if (/^\S/.test(line)) break;
    const prov = /^\s*provider:\s*(.+)$/.exec(line);
    if (prov) provider = prov[1].trim();
    const mod = /^\s*model:\s*(.+)$/.exec(line);
    if (mod) model = mod[1].trim();
  }
  if (!model) return null;
  return { provider, model, label: `${model} (local)` };
}

/** One what-if priced row (for the comparison table). */
interface PriceTotal {
  id: string;
  label: string;
  priced: boolean;
  cost: number | null;
  estimated?: boolean;
  local?: boolean;
  pricing?: { input: number; output: number; cacheRead: number; cacheWrite: number };
  breakdown?: { input: number; output: number; cacheRead: number; cacheWrite: number };
}

/** Price an aggregate bucket set under each candidate model's rate card. */
export function priceTotals(totals: TokenBuckets, candidates: Candidate[] = DEFAULT_CANDIDATES): PriceTotal[] {
  const out: PriceTotal[] = [];
  for (const c of candidates) {
    const card = pricing.priceFor(c.id);
    if (!card) { out.push({ id: c.id, label: c.label, priced: false, cost: null }); continue; }
    const breakdown = pricing.costBreakdown(totals, card);
    out.push({
      id: c.id, label: c.label, priced: true, estimated: !!card.estimated, local: !!card.local,
      pricing: { input: card.input, output: card.output, cacheRead: card.cacheRead, cacheWrite: card.cacheWrite },
      cost: r2(breakdown.total),
      breakdown: { input: r2(breakdown.inputCost), output: r2(breakdown.outputCost), cacheRead: r2(breakdown.cacheReadCost), cacheWrite: r2(breakdown.cacheWriteCost) },
    });
  }
  return out;
}

/** A comparison row (priced row + local-baseline flag + savings). */
interface ComparisonRow extends PriceTotal { baseline: boolean; savings: number | null; }
/** Savings summary (how much the local baseline beats the best/worst paid model). */
interface Savings { baselineId: string | null; baselineCost: number; min: number; max: number; }

/**
 * Attach a local-baseline flag + savings to a raw comparison list.
 * The local model (your home-lab baseline) is the cheapest priced row; every other
 * model's `savings` is how much cheaper local is than running on it.
 */
export function addSavings(rawComparison: PriceTotal[]): { comparison: ComparisonRow[]; savings: Savings } {
  const localRow = rawComparison.find((c) => c.priced && c.local) || rawComparison.find((c) => c.priced);
  const baselineCost = localRow ? localRow.cost || 0 : 0;
  const comparison: ComparisonRow[] = rawComparison.map((c) => ({
    ...c,
    baseline: !!localRow && c.id === localRow.id,
    savings: c.priced ? r2((c.cost || 0) - baselineCost) : null,
  }));
  const paidSavings = comparison.filter((c) => c.priced && !c.baseline && c.savings != null && c.savings > 0).map((c) => c.savings as number);
  const savings: Savings = {
    baselineId: localRow ? localRow.id : null,
    baselineCost: r2(baselineCost),
    min: paidSavings.length ? r2(Math.min(...paidSavings)) : 0,
    max: paidSavings.length ? r2(Math.max(...paidSavings)) : 0,
  };
  return { comparison, savings };
}

/** One model's attributed share of a session's totals. */
interface AttributedModel {
  model: string;
  provider: string | null;
  steps: number;
  share: number;
  buckets: TokenBuckets;
  allTokens: number;
}

/**
 * Attribute ONE session's real token totals across the models it actually used.
 * For each step, the active model is the modelChange with the largest seq <= the step's
 * seq (or the first change if the step predates all changes). The session's totals are
 * split across models in proportion to how many steps each model was active for.
 * Returns [{ model, provider, steps, share, buckets, allTokens }] sorted by allTokens desc.
 * `estimated` — each step is assumed to cost roughly equal tokens (no per-step counts).
 */
export function attributeSession(totals: TokenBuckets | null | undefined, modelChanges: ModelChange[] | null | undefined, stepSeqs: number[] | null | undefined, fallbackModel: string | null | undefined): AttributedModel[] {
  const t = totals || pricing.emptyBuckets();
  const all = (t.uncachedInputTokens || 0) + (t.outputTokens || 0) + (t.cacheReadTokens || 0) + (t.cacheWriteTokens || 0);
  const changes = (modelChanges || []).filter((c) => c && c.model).sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
  const mkBuckets = (share: number): TokenBuckets => { const b = emptyLikeBuckets(); for (const k of BUCKETS) b[k] = (t[k] || 0) * share; return b; };

  if (!changes.length) {
    const m = fallbackModel || "(unattributed)";
    return [{ model: m, provider: null, steps: 0, share: 1, buckets: { ...t }, allTokens: all }];
  }

  const countBy = new Map<string, { steps: number; provider: string | null }>();
  const activeAt = (seq: number): ModelChange => { let best = changes[0]; for (const c of changes) { if ((c.seq ?? 0) <= seq) best = c; else break; } return best; };
  const steps = (stepSeqs || []).filter((s): s is number => typeof s === "number");
  if (steps.length) {
    for (const s of steps) { const c = activeAt(s); const e = countBy.get(c.model) || { steps: 0, provider: c.provider }; e.steps++; e.provider = c.provider || e.provider; countBy.set(c.model, e); }
  } else {
    const c = changes[0];
    countBy.set(c.model, { steps: 1, provider: c.provider });
  }

  const totalSteps = [...countBy.values()].reduce((n, e) => n + e.steps, 0) || 1;
  return [...countBy.entries()]
    .map(([model, e]) => { const share = e.steps / totalSteps; return { model, provider: e.provider || null, steps: e.steps, share, buckets: mkBuckets(share), allTokens: all * share }; })
    .sort((a, b) => b.allTokens - a.allTokens);
}

// A zeroed bucket copy helper for attribution math.
function emptyLikeBuckets(): TokenBuckets {
  return { uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
}

/** A per-model contribution to one session. */
interface ContribModel {
  key: string;
  provider: string | null;
  steps: number;
  share?: number;
  buckets: TokenBuckets;
  allTokens: number;
  exact?: boolean;
  decodeTokens?: number; decodeMs?: number; decodeSteps?: number;
  prefillTokens?: number; prefillMs?: number; prefillSteps?: number;
  ctxTokens?: number;
  reasoningTokens?: number;
}
/** One session's recovered per-model contribution. */
interface Contrib { id: string; exact: boolean; models: ContribModel[]; }

/** Mutable per-model accumulator for the exact-usage branch of buildContrib. */
interface UsageAccumulator {
  key: string;
  provider: string | null;
  steps: number;
  buckets: TokenBuckets;
  decodeTokens: number; decodeMs: number; decodeSteps: number;
  prefillTokens: number; prefillMs: number; prefillSteps: number;
  ctxTokens: number;
  reasoningTokens: number;
}
/** Mutable per-model accumulator for the attribution branch of buildContrib. */
interface AttributedAccumulator {
  key: string;
  provider: string | null;
  steps: number;
  share: number;
  buckets: TokenBuckets;
}

/**
 * Build the per-session per-model contribution (the heart of the report).
 * For each projcache session, recover its per-model buckets using the best available signal:
 *   exact (usage chunks) > estimated (attribution) > assumed (default model).
 * Models are grouped by pricing.modelKey (Copilot model vs local Qwen).
 */
function buildContrib(pc: ProjcacheResult, timelines: Map<string, TimelineInfo>, usageById: Map<string, UsageRecord[]>, defaultModel: DefaultModel | null): Contrib[] {
  const fbKey = pricing.modelKey(defaultModel?.provider, defaultModel?.model) || pricing.LOCAL_QWEN_KEY;
  const contrib: Contrib[] = [];
  for (const s of pc.sessions) {
    const tl = timelines.get(s.id);
    const usage = usageById.get(s.id);
    let models: ContribModel[]; let exact: boolean;
    if (usage && usage.length) {
      const byM = new Map<string, UsageAccumulator>();
      for (const u of usage) {
        const key = pricing.modelKey(u.provider, u.model);
        let e = byM.get(key);
        if (!e) { e = { key, provider: u.provider || null, steps: 0, buckets: pricing.emptyBuckets(), decodeTokens: 0, decodeMs: 0, decodeSteps: 0, prefillTokens: 0, prefillMs: 0, prefillSteps: 0, ctxTokens: 0, reasoningTokens: 0 }; byM.set(key, e); }
        e.provider = e.provider || u.provider;
        for (const k of BUCKETS) e.buckets[k] += u.buckets[k];
        if (u.decodeMs != null) { e.decodeTokens += u.buckets.outputTokens || 0; e.decodeMs += u.decodeMs; e.decodeSteps++; }
        if (u.ttftMs != null) { e.prefillTokens += u.buckets.uncachedInputTokens || 0; e.prefillMs += u.ttftMs; e.prefillSteps++; }
        e.ctxTokens += (u.buckets.uncachedInputTokens || 0) + (u.buckets.cacheReadTokens || 0);
        // Thinking: authoritative reasoningTokens when the provider reports it, else
        // the chars/4 estimate from the reasoning text (same rule as per-step thinking
        // in the breakdown) — so model-level thinking matches the step trees for
        // providers that stream thinking but report reasoningTokens=0.
        const rt = u.buckets.reasoningTokens || 0;
        e.reasoningTokens += rt > 0 ? rt : (u.thinkingChars > 0 ? Math.ceil(u.thinkingChars / 4) : 0);
        e.steps++;
      }
      models = [...byM.values()].map((m) => ({ ...m, allTokens: pricing.allTokens(m.buckets), exact: true }));
      exact = true;
    } else if (tl && tl.modelChanges.length) {
      const raw = attributeSession(s.buckets, tl.modelChanges, tl.stepSeqs, defaultModel?.model);
      const byKey = new Map<string, AttributedAccumulator>();
      for (const m of raw) {
        const key = pricing.modelKey(m.provider, m.model);
        let e = byKey.get(key);
        if (!e) { e = { key, provider: m.provider, steps: 0, share: 0, buckets: pricing.emptyBuckets() }; byKey.set(key, e); }
        e.provider = e.provider || m.provider;
        e.steps += m.steps;
        e.share += m.share;
        for (const k of BUCKETS) e.buckets[k] += m.buckets[k];
      }
      models = [...byKey.values()].map((m) => ({ ...m, allTokens: pricing.allTokens(m.buckets), exact: false }));
      exact = false;
    } else {
      const b = s.buckets || pricing.emptyBuckets();
      models = [{ key: fbKey, provider: defaultModel?.provider || null, steps: 0, share: 1, buckets: { ...b }, allTokens: pricing.allTokens(b), exact: false }];
      exact = false;
    }
    models.sort((a, b) => b.allTokens - a.allTokens);
    contrib.push({ id: s.id, exact, models });
  }
  return contrib;
}

/** Global per-model rollup accumulator. */
interface AggregateAccumulator {
  key: string;
  provider: string | null;
  sessions: Set<string>;
  steps: number;
  exact: boolean;
  decodeTokens: number; decodeMs: number; decodeSteps: number;
  prefillTokens: number; prefillMs: number; prefillSteps: number;
  ctxTokens: number;
  reasoningTokens: number;
  uncachedInputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number;
}

/** A global per-model aggregate row. */
interface AggregateModel {
  model: string;
  label: string;
  provider: string | null;
  copilot: boolean;
  kind: "local" | "corp";
  sessions: number;
  steps: number;
  uncachedInputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  allTokens: number;
  cost: number | null;
  exact: boolean;
  estimated: boolean;
  decodeTokens: number; decodeMs: number; decodeSteps: number;
  tokPerSec: number | null;
  prefillTokens: number; prefillMs: number; prefillSteps: number;
  promptTokPerSec: number | null;
  avgTtftMs: number | null;
  avgContext: number | null;
  reasoningTokens: number;
}

/** Roll the per-session contributions up into a global per-model table (rounded, priced). */
export function aggregateContrib(contrib: Contrib[] | null, modelAliasMap?: Map<string, string> | null): AggregateModel[] {
  const map = new Map<string, AggregateAccumulator>();
  for (const c of contrib || []) {
    for (const m of c.models || []) {
      let e = map.get(m.key);
      if (!e) { e = { key: m.key, provider: m.provider, sessions: new Set(), steps: 0, exact: true, decodeTokens: 0, decodeMs: 0, decodeSteps: 0, prefillTokens: 0, prefillMs: 0, prefillSteps: 0, ctxTokens: 0, reasoningTokens: 0, ...pricing.emptyBuckets() }; map.set(m.key, e); }
      e.provider = e.provider || m.provider;
      e.sessions.add(c.id);
      e.steps += m.steps;
      e.exact = e.exact && !!m.exact;
      e.decodeTokens += m.decodeTokens || 0;
      e.decodeMs += m.decodeMs || 0;
      e.decodeSteps += m.decodeSteps || 0;
      e.prefillTokens += m.prefillTokens || 0;
      e.prefillMs += m.prefillMs || 0;
      e.prefillSteps += m.prefillSteps || 0;
      e.ctxTokens += m.ctxTokens || 0;
      e.reasoningTokens += m.reasoningTokens || 0;
      for (const k of BUCKETS) e[k] += m.buckets[k];
    }
  }
  return [...map.values()]
    .map((m) => {
      const card = pricing.priceFor(m.key);
      const buckets: TokenBuckets = {
        uncachedInputTokens: Math.round(m.uncachedInputTokens),
        outputTokens: Math.round(m.outputTokens),
        cacheReadTokens: Math.round(m.cacheReadTokens),
        cacheWriteTokens: Math.round(m.cacheWriteTokens),
      };
      return {
        model: m.key,
        label: (modelAliasMap && modelAliasMap.get(m.key)) || card?.label || m.key,
        provider: m.provider,
        copilot: pricing.isCopilotProvider(m.provider),
        kind: pricing.kindFor(m.provider, m.key),
        sessions: m.sessions.size,
        steps: m.steps,
        ...buckets,
        allTokens: pricing.allTokens(buckets),
        cost: card ? r2(pricing.costFor(buckets, card)) : null,
        exact: m.exact,
        estimated: !m.exact,
        decodeTokens: m.decodeTokens || 0,
        decodeMs: m.decodeMs || 0,
        decodeSteps: m.decodeSteps || 0,
        tokPerSec: m.decodeMs > 0 ? Math.round((m.decodeTokens / (m.decodeMs / 1000)) * 10) / 10 : null,
        prefillTokens: m.prefillTokens || 0,
        prefillMs: m.prefillMs || 0,
        prefillSteps: m.prefillSteps || 0,
        promptTokPerSec: m.prefillMs > 0 ? Math.round((m.prefillTokens / (m.prefillMs / 1000)) * 10) / 10 : null,
        avgTtftMs: m.prefillSteps > 0 ? Math.round(m.prefillMs / m.prefillSteps) : null,
        avgContext: m.ctxTokens > 0 ? Math.round(m.ctxTokens / m.steps) : null,
        reasoningTokens: Math.round(m.reasoningTokens || 0),
      };
    })
    .sort((a, b) => b.allTokens - a.allTokens);
}

/** Trajectory scan stats for the sources card. */
interface TrajStats {
  files: number;
  withUsage: number;
  usageRecords: number;
  withModelTimeline: number;
  cache: { hits: number; recomputed: number };
}

/** Everything loadSources computes, shared across the report builders. */
interface Sources {
  dshHome: string;
  sessionsRoot: string;
  storePath: string;
  storeKind: "dir" | "file";
  priceCfg: PriceConfig;
  pc: ProjcacheResult;
  traj: TrajStats;
  defaultModel: DefaultModel | null;
  contrib: Contrib[];
  byModel: AggregateModel[];
  eventsById: Map<string, EventCounts>;
  toolsById: Map<string, Record<string, number>>;
  toolCallsById: Map<string, Record<string, number>>;
  toolCallArgsById: Map<string, Record<string, number>>;
  stepToolArgsById: Map<string, Record<string, Record<string, number>>>;
  stepToolsById: Map<string, Record<string, string[]>>;
  usageById: Map<string, UsageRecord[]>;
  stepCtxById: Map<string, { byStep: Record<string, { sys: number; tools: number; msg: number }>; window: number | null; post: Record<string, number> }>;
  compactionsById: Map<string, { events: CompactionEvent[]; prunes: number; prunedTokens: number }>;
  aggEvents: EventCounts;
  aggTools: Record<string, number>;
  aggToolCalls: Record<string, number>;
}

/** Read projcache + trajectories + default model once; compute the per-session contribution. */
function loadSources(opts: ReportOptions = {}): Sources {
  const { dshHome, sessionsRoot, storePath, storeKind } = resolvePaths(opts);
  const defaultModel = readDefaultModel(dshHome);
  let pc: ProjcacheResult = { sessions: [], totals: pricing.emptyBuckets(), count: 0, nonZero: 0 };
  if (existsSync(storePath)) { try { pc = projcache.readProjcache(storePath); } catch { /* keep empty */ } }
  // NB: no llama.cpp/llama-server log — per-step prefill/decode cost and local-model
  // naming come entirely from the trajectory's own timestamps/provider/model strings.

  const traj: TrajStats = { files: 0, withUsage: 0, usageRecords: 0, withModelTimeline: 0, cache: { hits: 0, recomputed: 0 } };
  const timelines = new Map<string, TimelineInfo>(); // sessionId -> { modelChanges, stepSeqs }
  const usageById = new Map<string, UsageRecord[]>(); // sessionId -> [{ model, provider, buckets }]
  const eventsById = new Map<string, EventCounts>();  // sessionId -> activity-category counters
  const toolsById = new Map<string, Record<string, number>>();   // sessionId -> { dispatched code name: count }
  const toolCallsById = new Map<string, Record<string, number>>(); // sessionId -> { top-level tool name: count }
  const toolCallArgsById = new Map<string, Record<string, number>>(); // sessionId -> { toolName: total argsChars }
  const stepToolArgsById = new Map<string, Record<string, Record<string, number>>>(); // sessionId -> { "turn:step": { toolName: argsChars } }
  const stepToolsById = new Map<string, Record<string, string[]>>(); // sessionId -> { "turn:step": [toolNames] }
  const stepCtxById = new Map<string, { byStep: Record<string, { sys: number; tools: number; msg: number }>; window: number | null; post: Record<string, number> }>(); // sessionId -> per-step context allocation (chars) + window limit + post-compaction regime index per step
  const compactionsById = new Map<string, { events: CompactionEvent[]; prunes: number; prunedTokens: number }>(); // sessionId -> compaction events (existence + impact) + prune totals
  const aggEvents = trajectory.emptyEvents();
  const aggTools: Record<string, number> = {};
  const aggToolCalls: Record<string, number> = {};
  if (existsSync(sessionsRoot)) {
    const _cr = trajectory.loadDiskCache(dshHome); if (_cr.loaded) process.stderr.write("[token-gobbler] trajectory cache: " + _cr.loaded + " entries from disk" + "\n");
    const files = trajectory.findTrajectoryFiles(sessionsRoot);
    traj.files = files.length;
    const s0 = trajectory.parseStatsSnapshot();
    for (const f of files) {
      let t: ReturnType<typeof trajectory.readTrajectory>;
      try { t = trajectory.readTrajectory(f); } catch { continue; }
      if (!t) continue;
      const id = t.meta?.id;
      if (!id) continue;
      timelines.set(id, { modelChanges: t.modelChanges || [], stepSeqs: t.stepSeqs || [], stepTools: t.stepTools || {} });
      if (t.modelChanges.length) traj.withModelTimeline++;
      if (t.usage.length) { traj.withUsage++; traj.usageRecords += t.usage.length; usageById.set(id, t.usage); }
      if (t.events) {
        eventsById.set(id, t.events);
        for (const k of Object.keys(aggEvents) as (keyof EventCounts)[]) aggEvents[k] += t.events[k] || 0;
      }
      if (t.tools && Object.keys(t.tools).length) {
        toolsById.set(id, t.tools);
        for (const [n, c] of Object.entries(t.tools)) aggTools[n] = (aggTools[n] || 0) + c;
      }
      if (t.toolCalls && Object.keys(t.toolCalls).length) {
        toolCallsById.set(id, t.toolCalls);
        for (const [n, c] of Object.entries(t.toolCalls)) aggToolCalls[n] = (aggToolCalls[n] || 0) + c;
      }
      if (t.stepTools && Object.keys(t.stepTools).length) stepToolsById.set(id, t.stepTools);
      if (t.toolCallArgs && Object.keys(t.toolCallArgs).length) toolCallArgsById.set(id, t.toolCallArgs);
      if (t.stepToolArgs && Object.keys(t.stepToolArgs).length) stepToolArgsById.set(id, t.stepToolArgs);
      if (t.stepContext && Object.keys(t.stepContext).length) stepCtxById.set(id, { byStep: t.stepContext, window: t.contextWindow ?? null, post: t.postCompaction || {} });
      if ((t.compactions && t.compactions.length) || t.prunes) compactionsById.set(id, { events: t.compactions || [], prunes: t.prunes || 0, prunedTokens: t.prunedTokens || 0 });
    }
    const s1 = trajectory.parseStatsSnapshot();
    traj.cache = { hits: s1.cacheHits - s0.cacheHits, recomputed: s1.recomputed - s0.recomputed };
    if (traj.cache.recomputed > 0) trajectory.saveDiskCache(dshHome);
  }

  // Build the rate-card table — the user's saved file wins; otherwise seed the FIRST
  // table from the models actually used in the trajectory.
  const discovered = discoverFromTimelines(timelines);
  const priceCfg = loadPricing(dshHome, discovered);

  const contrib = buildContrib(pc, timelines, usageById, defaultModel);
  const byModel = aggregateContrib(contrib);
  return { dshHome, sessionsRoot, storePath, storeKind, priceCfg, pc, traj, defaultModel, contrib, byModel, eventsById, toolsById, toolCallsById, toolCallArgsById, stepToolArgsById, stepToolsById, usageById, stepCtxById, compactionsById, aggEvents, aggTools, aggToolCalls };
}

/** What-if candidates: the user-chosen local baseline first, then every non-local model in the user's table. */
function candidatesFromTable(models: PricingEntry[], baselineModel?: string | null): Candidate[] {
  const paid: Candidate[] = [];
  let localBaseline: Candidate | null = null;
  const wants = (baselineModel || "").trim().toLowerCase();
  for (const m of models || []) {
    if (!m || !m.id || m.id === "local-free") continue; // local-free is an unpriced fallback marker, not a candidate
    if (m.local) {
      // The user-set baseline wins (when it's still a local row); else the first local row.
      if (!localBaseline) localBaseline = { id: m.id, label: m.label + " — what you ran" };
      else if (m.id === wants) localBaseline = { id: m.id, label: m.label + " — what you ran" };
    }
    else paid.push({ id: m.id, label: m.label || m.id });
  }
  const out = localBaseline ? [localBaseline, ...paid] : [...paid];
  return out.length ? out : DEFAULT_CANDIDATES;
}

export function buildReport(opts: ReportOptions = {}) {
  const { dshHome, sessionsRoot, storePath, storeKind, priceCfg, pc, traj, defaultModel, contrib, byModel, aggEvents, aggTools, aggToolCalls, compactionsById } = loadSources(opts);
  const candidates = opts.candidates || candidatesFromTable(priceCfg.models, priceCfg.baselineModel);
  const totals = { ...pc.totals, allTokens: pricing.allTokens(pc.totals) };
  const rawComparison = priceTotals(totals, candidates);

  // Real per-model cost (the mix you actually ran).
  let actualCost = 0, pricedModels = 0;
  for (const m of byModel) { const card = pricing.priceFor(m.model); if (card) { actualCost += pricing.costFor(m, card); pricedModels++; } }

  const hasUsage = traj.withUsage > 0;
  const hasAttribution = contrib.some((c) => c.models.some((m) => m.steps > 0));
  const source = hasUsage ? "usage" : (hasAttribution ? "attribution" : "assumed");

  const { comparison, savings } = addSavings(rawComparison);
  const baselineCost = savings.baselineCost;
  const actualSavings = r2(actualCost - baselineCost); // how much cheaper all-local is than your actual mix

  // WFH (work-from-home) compute split: tokens that ran on local (home-lab) models vs
  // tokens that ran through paid Copilot. corpCost prices the local bucket set at the
  // Sonnet 4.6 card — what the corp would have billed for the same WFH compute.
  const sumRows = (rows: AggregateModel[]): TokenBuckets => { const b = pricing.emptyBuckets(); for (const m of rows) for (const k of BUCKETS) b[k] += m[k] || 0; return b; };
  const localRows = byModel.filter((m) => m.kind === "local");
  const corpRows = byModel.filter((m) => m.kind === "corp");
  const wfhBuckets = sumRows(localRows);
  const corpBuckets = sumRows(corpRows);
  // What the corp would have billed for the same WFH compute: the user-selected
  // reference model (default claude-opus-4.6), editable in the Pricing tab.
  const refId = pricing.referenceModelId() || "claude-opus-4.6";
  const refCard = pricing.priceFor(refId);
  const wfhSessionIds = new Set<string>();
  const corpSessionIds = new Set<string>();
  for (const c of contrib) {
    let local = false, corp = false;
    for (const m of c.models || []) {
      if (m.allTokens <= 0) continue;
      if (pricing.kindFor(m.provider, m.key) === "corp") corp = true; else local = true;
    }
    if (local) wfhSessionIds.add(c.id);
    if (corp) corpSessionIds.add(c.id);
  }
  const wfhCost = r2(localRows.reduce((n, m) => n + (m.cost != null ? m.cost : 0), 0));
  const wfhCorpCost = refCard ? r2(pricing.costFor(wfhBuckets, refCard)) : null;
  const split = {
    wfh: {
      sessions: wfhSessionIds.size,
      tokens: pricing.allTokens(wfhBuckets),
      cost: wfhCost,
      corpCost: wfhCorpCost,
      saved: wfhCorpCost != null ? r2(wfhCorpCost - wfhCost) : null,
      referenceModel: refId,
      referenceLabel: refCard ? refCard.label : null,
    },
    corp: {
      sessions: corpSessionIds.size,
      tokens: pricing.allTokens(corpBuckets),
      cost: r2(corpRows.reduce((n, m) => n + (m.cost != null ? m.cost : 0), 0)),
    },
  };

  const actual = {
    cost: r2(actualCost),
    source,
    fromTrajectories: source !== "assumed",
    pricedModels,
    assumedModel: source === "assumed" ? (defaultModel?.model || "qwen3.8-local") : null,
    note: source === "usage"
      ? "Priced from exact per-model usage (harness request events). Home-lab models at their configured rates (Pricing tab); corp models (Copilot, DeepSeek API, …) at their own rates."
      : source === "attribution"
        ? "Priced from the real per-model mix — session totals split across models by step count (estimated)."
        : "No model events found; assumed your default model for the full aggregate.",
  };

  // Global decode speed: streamed output tokens over pure decode time (trajectory chunk timestamps).
  const decodeTokens = byModel.reduce((n, m) => n + (m.decodeTokens || 0), 0);
  const decodeMs = byModel.reduce((n, m) => n + (m.decodeMs || 0), 0);
  const decode = {
    tokens: decodeTokens,
    ms: decodeMs,
    steps: byModel.reduce((n, m) => n + (m.decodeSteps || 0), 0),
    tokPerSec: decodeMs > 0 ? Math.round((decodeTokens / (decodeMs / 1000)) * 10) / 10 : null,
  };

  // Global prompt-processing speed: new (uncached) input tokens over TTFT.
  const prefillTokens = byModel.reduce((n, m) => n + (m.prefillTokens || 0), 0);
  const prefillMs = byModel.reduce((n, m) => n + (m.prefillMs || 0), 0);
  const prefillSteps = byModel.reduce((n, m) => n + (m.prefillSteps || 0), 0);
  const prefill = {
    tokens: prefillTokens,
    ms: prefillMs,
    steps: prefillSteps,
    tokPerSec: prefillMs > 0 ? Math.round((prefillTokens / (prefillMs / 1000)) * 10) / 10 : null,
    avgTtftMs: prefillSteps > 0 ? Math.round(prefillMs / prefillSteps) : null,
  };

  // Client-side cache fingerprint input: a compact signature of every
  // compaction event's STATE (endSeq = null while running, a seq once it has
  // ended) + its outcome. A compaction finishing changes this WITHOUT changing
  // any of the totals/counts above (no new usage records, same files, same
  // session count), so the client's cheap /usage probe detects the stale
  // "COMPACTING…" state on refresh and refetches the heavy endpoints.
  const compactionSig: string = (() => {
    const parts: string[] = [];
    for (const [id, c] of compactionsById) {
      for (const e of c.events) {
        parts.push(id.slice(-8) + ":" + (e.endSeq ?? "-") + ":" + (e.error ? 1 : 0) + ":" + (e.contextBefore ?? "-"));
      }
    }
    return parts.join("|");
  })();

  return {
    generatedAt: new Date().toISOString(),
    dshHome,
    decode,
    prefill,
    compactionSig,
    sources: {
      projcache: { storePath, storeKind, sessions: pc.count, nonZero: pc.nonZero },
      trajectories: { sessionsRoot, files: traj.files, withUsage: traj.withUsage, usageRecords: traj.usageRecords, withModelTimeline: traj.withModelTimeline, cache: traj.cache },
    },
    totals,
    byModel,
    sessions: pc.sessions,
    comparison,
    savings,
    actualSavings,
    split,
    actual,
    defaultModel,
    events: aggEvents,
    tools: toolsArray(aggTools),
    toolCalls: toolsArray(aggToolCalls),
  };
}

/** A per-tool token stat row. */
interface ToolTokenStat {
  tool: string;
  calls: number;
  min: number;
  avg: number;
  max: number;
  total: number;
  reasoning: number;
  input?: number;
}

/** A cross-session aggregated per-tool token stat (Tokens tab). */
interface AggregatedToolToken {
  tool: string;
  sessions: number;
  total: number;
  avgPerSession: number;
  reasoning: number;
  input: number;
}

/** A per-step timing block. */
interface StepTiming {
  turn: number;
  step: number | null;
  model: string | null;
  in: number;
  out: number;
  cache: number;
  thinking: number;
  thinkingEstimated: boolean;
  ttftMs: number | null;
  prefillTokPerSec: number | null;
  decodeMs: number | null;
  decodeTokPerSec: number | null;
  thinkingMs: number | null;
  // Context-window allocation for this step (estimated tokens, chars/4 of the
  // trajectory content): system prompt / tools / conversation messages, plus the
  // total prompt size and the model's window limit. ctxTotal is the ACTUAL prompt
  // (uncached + cached input) when usage is present, else the estimated sum.
  ctxSys: number | null;
  ctxTools: number | null;
  ctxMsg: number | null;
  ctxTotal: number | null;
  ctxWindow: number | null;
  // True when a compaction reset the context before this step started (the
  // compacted messages no longer count toward its prompt — a distinct regime).
  postCompaction: boolean;
  // Which compaction regime this step belongs to: 0 = before the first successful
  // compaction, 1 = after the 1st, 2 = after the 2nd, … Failed compactions do not
  // advance the regime (they leave the original messages in the context).
  compactionRegime: number;
}

/** A turn-grouped step tree entry. */
interface StepTreeEntry extends StepTiming {
  tools: string[];
  parallel: boolean;
}

/** One compaction event as surfaced to the client (chronological, 1-based index).
 *  The generated summary TEXT is deliberately NOT inlined — it can be many KB per
 *  compaction — and is fetched lazily via getCompactionDetail / the
 *  /token-gobbler/compaction route when the COMPACTED banner is opened. */
export interface CompactionLite {
  index: number;             // 1-based, chronological
  seq: number | null;
  time: number | null;       // start (ms epoch)
  endTime: number | null;    // end (ms epoch)
  durationMs: number | null;
  /** ok = produced a summary (context replaced) · failed = ended with an error
   *  (context untouched) · running = compaction/start seen but no end yet —
   *  a live compaction in progress, NOT a failure. */
  state: "ok" | "failed" | "running";
  ok: boolean;               // produced a summary (the context was actually replaced)
  error: string | null;      // error carried by compaction/end when it failed
  shadowedTokens: number;    // tokens removed from the context
  contextBefore: number | null; // prompt tokens in flight at compaction
  summaryChars: number;      // chars of the generated summary
  afterTurn: number | null;  // last LLM step (turn) before the compaction — banner anchor
  afterStep: number | null;  // ...and its step
}

/** One per-session breakdown row. */
interface SessionBreakdownRow {
  id: string;
  date: string;
  cwd: string | null;
  title: string | null;
  model: string;
  modelMix: string;
  models: ContribModel[];
  exact: boolean;
  createdAt: number | null;
  events: EventCounts | null;
  tools: { name: string; count: number }[];
  toolCalls: { name: string; count: number }[];
  meta: unknown;
  tokPerSec: number | null;
  uncachedInputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  allTokens: number;
  cost: number | null;
  toolTokens: ToolTokenStat[] | null;
  steps: StepTiming[] | null;
  stepTree: { turn: number; steps: StepTreeEntry[] }[] | null;
  /** True when the user archived this session in the DSH GUI (workspace.json). */
  archived: boolean;
  /** Compaction events in this session: count + total tokens removed from the
    *  context (shadowedTokenCount) + targeted prune count/tokens. */
  compactions: number;
  compactedTokens: number;
  /** Compactions that FAILED (aborted / terminated / context-exceeded — carried
    *  as error on compaction/end). Failed ones leave the original messages in
    *  the context, so they contribute no compactedTokens. */
  compactionErrors: number;
  prunes: number;
  prunedTokens: number;
  /** Per-compaction detail (existence + impact + the banner anchor). Used to draw
    *  the COMPACTED rows in the step table; the summary text is fetched lazily. */
  compactionEvents: CompactionLite[];
}

/**
 * Per-day / per-session / per-model token breakdown.
 * - byModel:   REAL per-model rollup (Copilot models + local Qwen).
 * - bySession: one row per session with its real model mix (dominant model + all models).
 * - byDay:     aggregate by local calendar day.
 */
export function buildBreakdown(opts: ReportOptions = {}) {
  const { dshHome, pc, traj, defaultModel, contrib, byModel, eventsById, toolsById, toolCallsById, toolCallArgsById, stepToolArgsById, stepToolsById, usageById, stepCtxById, compactionsById, aggEvents, aggTools, aggToolCalls } = loadSources(opts);
  const archivedIds = readArchivedSessions(dshHome);
  const contribById = new Map(contrib.map((c) => [c.id, c]));
  const fallbackLabel = "Qwen 3.8 27B (local)";
  const tps = (tok: number, ms: number | null | undefined): number | null => (ms && ms > 0 ? Math.round((tok / (ms / 1000)) * 10) / 10 : null);

  const bySession: SessionBreakdownRow[] = pc.sessions
    .filter((s): s is ProjSession & { buckets: TokenBuckets } => !!s.buckets && s.allTokens > 0)
    .map((s) => {
      const c = contribById.get(s.id);
      const models = c ? c.models : [];
      const dominant = models.length ? models[0] : null;
      const ml = (key: string): string => pricing.priceFor(key)?.label || key;
      const model = dominant ? ml(dominant.key) : fallbackLabel;
      const modelMix = models.length
        ? (models.length === 1
            ? model
            : models.slice(0, 3).map((m) => ml(m.key)).join(" · ") + (models.length > 3 ? ` +${models.length - 3}` : ""))
        : model;
      // Real cost of this session's actual model mix (local at the home-lab baseline,
      // Copilot at its model rates). null when no model in the mix has a rate card.
      let cost: number | null = null;
      if (models.length) {
        let sum = 0, hasCard = false;
        for (const m of models) { const card = pricing.priceFor(m.key); if (card) { sum += pricing.costFor(m.buckets, card); hasCard = true; } }
        cost = hasCard ? r2(sum) : null;
      }
      // Decode speed from trajectory chunk timestamps (only sessions with exact usage).
      const dTok = models.reduce((n, m) => n + (m.decodeTokens || 0), 0);
      const dMs = models.reduce((n, m) => n + (m.decodeMs || 0), 0);
        // Per-tool token stats: report the ACTUAL tool-call payload (the argument
        // text the tool received, ~chars/4 tokens) for every call, NOT the whole
        // LLM step. Attributing the full step context to each tool inflated the
        // numbers badly (e.g. a 453-token remember() billed at 71.4K). min/avg/
        // max/total below are payload-token stats across the calls.
        let toolTokens: ToolTokenStat[] | null = null;
        const _usage = usageById.get(s.id);
        const _stepTools = stepToolsById.get(s.id);
        const _comp = compactionsById.get(s.id);
        if (_usage && _usage.length && _stepTools && Object.keys(_stepTools).length) {
          const byTool = new Map<string, { payload: number[]; reasoning: number[] }>(); // toolName -> { payload: [], reasoning: [] }
          for (const u of _usage) {
            const stepKey = (u.turn ?? "?") + ":" + (u.step ?? "?");
            const tools = _stepTools[stepKey];
            if (!tools) continue;
            const rt = u.buckets.reasoningTokens || 0;
            const reasoning = rt > 0 ? rt : (u.thinkingChars > 0 ? Math.ceil(u.thinkingChars / 4) : 0); // same estimate used in per-step thinking
            const layer = stepToolArgsById.get(s.id) ?? ({} as Record<string, Record<string, number>>);
            const stepArgs = layer[stepKey] ?? ({} as Record<string, number>);
            // stepToolArgs holds the SUM of args chars per tool in this step, while `tools`
            // is the per-invocation list. Divide by the call count so a step that calls the
            // same tool N times bills the total once (not N × the sum).
            const toolCounts: Record<string, number> = {};
            for (const t of tools) toolCounts[t] = (toolCounts[t] || 0) + 1;
            // The step's reasoning is one thinking episode, not per-tool — split it evenly
            // across the step's tool calls so it isn't counted once per tool.
            const perToolReasoning = tools.length ? Math.ceil(reasoning / tools.length) : 0;
            for (const tool of tools) {
              let e = byTool.get(tool);
              if (!e) { e = { payload: [], reasoning: [] }; byTool.set(tool, e); }
              // Actual tool-call argument payload for this invocation (~chars/4 tokens).
              e.payload.push(Math.ceil(((stepArgs[tool] || 0) / (toolCounts[tool] || 1)) / 4));
              e.reasoning.push(perToolReasoning);
            }
          }
          if (byTool.size) {
            toolTokens = [...byTool.entries()].map(([name, e]) => {
              const p = e.payload;
              const r = e.reasoning;
              const sum = p.reduce((a, b) => a + b, 0);
              return {
                tool: name,
                calls: p.length,
                min: p.length ? Math.min(...p) : 0,
                avg: p.length ? Math.round(sum / p.length) : 0,
                max: p.length ? Math.max(...p) : 0,
                total: sum,
                reasoning: r.reduce((a, b) => a + b, 0),
                input: sum,
              };
            }).sort((a, b) => b.total - a.total);
          }
        }
          // Estimation fallback: no per-step usage, but we know which steps called which tools.
          // Distribute the session total tokens uniformly across tool-calling steps.
          else if (_stepTools && Object.keys(_stepTools).length && s.allTokens > 0) {
            const totalStepsWithTools = Object.keys(_stepTools).length;
            const estPerStep = Math.round(s.allTokens / totalStepsWithTools);
            const callCount = new Map<string, number>(); // toolName -> stepCount
            for (const tools of Object.values(_stepTools)) {
              for (const tool of tools) callCount.set(tool, (callCount.get(tool) || 0) + 1);
            }
            toolTokens = [...callCount.entries()].map(([name, calls]) => ({
              tool: name,
              calls,
              min: estPerStep,
              avg: estPerStep,
              max: estPerStep,
              total: estPerStep * calls,
              reasoning: 0,
            })).sort((a, b) => b.total - a.total);
          }
      // Per-step breakdown: prefill/decode speed + thinking impact for each LLM step.
      let steps: StepTiming[] | null = null;
      if (_usage && _usage.length) {
        const _stepCtx = stepCtxById.get(s.id);
        steps = _usage
          .filter((u): u is UsageRecord & { turn: number } => u.turn != null)
          .map((u) => {
            const b = u.buckets;
            // Thinking tokens: authoritative reasoningTokens when present, else an
            // estimate from the reasoning text (chars/4) for providers that stream
            // thinking but report reasoningTokens=0. Marked thinkingEstimated.
            const rt = b.reasoningTokens || 0;
            const thinking = rt > 0 ? rt : (u.thinkingChars > 0 ? Math.ceil(u.thinkingChars / 4) : 0);
            const thinkingEstimated = rt === 0 && u.thinkingChars > 0;
            // Context allocation for this step's prompt (chars/4 estimate of the
            // trajectory content); the total is the ACTUAL prompt size (uncached +
            // cached input) when usage reports it, else the estimated sum.
            const ctx = _stepCtx?.byStep?.[(u.turn ?? "?") + ":" + (u.step ?? "?")];
            const regime = (_stepCtx?.post && _stepCtx.post[(u.turn ?? "?") + ":" + (u.step ?? "?")]) || 0;
            const promptTotal = (b.uncachedInputTokens || 0) + (b.cacheReadTokens || 0) + (b.cacheWriteTokens || 0);
            return {
              turn: u.turn,
              step: u.step,
              model: u.model || null,
              in: b.uncachedInputTokens || 0,
              out: b.outputTokens || 0,
              cache: b.cacheReadTokens || 0,
              thinking,
              thinkingEstimated,
              ttftMs: u.ttftMs,
              prefillTokPerSec: tps(b.uncachedInputTokens || 0, u.ttftMs),
              decodeMs: u.decodeMs,
              decodeTokPerSec: tps(b.outputTokens || 0, u.decodeMs),
              thinkingMs: u.thinkingMs,
              ctxSys: ctx ? Math.round(ctx.sys / 4) : null,
              ctxTools: ctx ? Math.round(ctx.tools / 4) : null,
              ctxMsg: ctx ? Math.round(ctx.msg / 4) : null,
              ctxTotal: promptTotal > 0 ? promptTotal : (ctx ? Math.round((ctx.sys + ctx.tools + ctx.msg) / 4) : null),
              ctxWindow: _stepCtx?.window ?? null,
              postCompaction: regime > 0,
              compactionRegime: regime,
            };
          })
          .sort((a, b) => ((a.turn ?? 0) - (b.turn ?? 0)) || ((a.step ?? 0) - (b.step ?? 0)));
      }
      // Per-step timing comes from the trajectory's own timestamps (TTFT + decode
      // window) — no external llama-server log. Turn-grouped step tree follows.
      // Turn-grouped step tree with the tool calls made after each step. A step
      // with >1 tool is treated as a parallel call group.
      let stepTree: { turn: number; steps: StepTreeEntry[] }[] | null = null;
      if (steps && steps.length) {
        const toolsByStep = stepToolsById.get(s.id) || {};
        const byTurn = new Map<number, StepTreeEntry[]>();
        for (const st of steps) {
          const stepKey = (st.turn ?? "?") + ":" + (st.step ?? "?");
          const tools = toolsByStep[stepKey] || [];
          const stepEntry: StepTreeEntry = { ...st, tools, parallel: tools.length > 1 };
          const arr = byTurn.get(st.turn) || [];
          arr.push(stepEntry);
          byTurn.set(st.turn, arr);
        }
        stepTree = [...byTurn.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([turn, turnSteps]) => ({ turn, steps: turnSteps }));
      }
      return {
        id: s.id,
        date: localDate(s.createdAt),
        cwd: s.cwd,
        title: s.title,
        model,
        modelMix,
        models,
        exact: c ? c.exact : false,
        createdAt: s.createdAt,
        events: eventsById.get(s.id) || null,
        tools: toolsArray(toolsById.get(s.id), 40),
        toolCalls: toolsArray(toolCallsById.get(s.id), 40),
        meta: s.meta || null,
        tokPerSec: dMs > 0 ? Math.round((dTok / (dMs / 1000)) * 10) / 10 : null,
        ...s.buckets,
        allTokens: s.allTokens,
        cost,
        toolTokens,
        steps,
        stepTree,
        archived: archivedIds.has(s.id),
        compactions: _comp ? _comp.events.length : 0,
        compactedTokens: _comp ? _comp.events.reduce((n, e) => n + (e.shadowedTokens || 0), 0) : 0,
        compactionErrors: _comp ? _comp.events.filter((e) => e.error).length : 0,
        prunes: _comp ? _comp.prunes : 0,
        prunedTokens: _comp ? _comp.prunedTokens : 0,
        compactionEvents: (_comp ? _comp.events : []).map((ev, i) => ({
          index: i + 1,
          seq: ev.seq,
          time: ev.time,
          endTime: ev.endTime,
          durationMs: ev.durationMs,
          state: ev.hasSummary ? "ok" : ev.endSeq != null ? "failed" : "running",
          ok: ev.hasSummary,
          error: ev.error,
          shadowedTokens: ev.shadowedTokens || 0,
          contextBefore: ev.contextBefore,
          summaryChars: ev.summaryChars || 0,
          afterTurn: ev.afterTurn,
          afterStep: ev.afterStep,
        })),
      };
    });

  const dayMap = new Map<string, { date: string; sessions: number; cost: number | null; uncachedInputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number }>();
  for (const row of bySession) {
    let d = dayMap.get(row.date);
    if (!d) { d = { date: row.date, sessions: 0, cost: null, ...pricing.emptyBuckets() }; dayMap.set(row.date, d); }
    d.sessions++;
    if (row.cost != null) d.cost = (d.cost || 0) + row.cost;
    for (const k of BUCKETS) d[k] += row[k];
  }
  const byDay = [...dayMap.values()].map((d) => ({ ...d, allTokens: pricing.allTokens(d), cost: d.cost != null ? r2(d.cost) : null })).sort((a, b) => (a.date > b.date ? 1 : -1));


    // Aggregate per-tool token stats across ALL sessions (for the Tokens tab).
    const toolTokensAggregate: AggregatedToolToken[] | null = (function() {
      const byTool = new Map<string, { tokens: number[]; reasoning: number[]; inputTokens: number[]; sessions: Set<string> }>(); // toolName -> { contextTokens: [], reasoning: [], inputTokens: [], sessions: Set }
      for (const row of bySession) {
        if (!row.toolTokens) continue;
        for (const t of row.toolTokens) {
          let e = byTool.get(t.tool);
          if (!e) { e = { tokens: [], reasoning: [], inputTokens: [], sessions: new Set() }; byTool.set(t.tool, e); }
          // Expand the per-session stats back into individual step values is lossy;
          // instead we accumulate: total += total, and track min/max from session-level min/max.
          e.tokens.push(t.total); // session-level context-attributed total for this tool
          e.reasoning.push(t.reasoning);
          e.inputTokens.push(t.input || 0);
          e.sessions.add(row.id);
        }
      }
      if (!byTool.size) return null;
      return [...byTool.entries()].map(([name, e]) => {
        const sums = e.tokens;
        const total = sums.reduce((a, b) => a + b, 0);
        const reasoning = e.reasoning.reduce((a, b) => a + b, 0);
        return {
          tool: name,
          sessions: e.sessions.size,
          total,
          avgPerSession: Math.round(total / sums.length),
          reasoning,
          input: e.inputTokens.reduce((a, b) => a + b, 0),
        };
      }).sort((a, b) => b.total - a.total);
    })();
  return {
    defaultModel,
    byDay,
    byModel,
    bySession,
    events: aggEvents,
    tools: toolsArray(aggTools),
    toolCalls: toolsArray(aggToolCalls),
    toolTokensAggregate,
    sources: { projcache: { sessions: pc.count, nonZero: pc.nonZero }, trajectories: { withUsage: traj.withUsage, withModelTimeline: traj.withModelTimeline, cache: traj.cache } },
  };
}

/**
 * Full detail for ONE compaction event — including the generated summary text,
 * which is deliberately kept out of the (large) breakdown payload. Serves the
 * /token-gobbler/compaction route: index is 1-based, chronological within the
 * session. Returns null when the session or index is unknown.
 */
export function getCompactionDetail(sessionId: string, index: number) {
  const { compactionsById } = loadSources();
  const comp = compactionsById.get(sessionId);
  if (!comp) return null;
  const ev = comp.events[index - 1];
  if (!ev) return null;
  return ev;
}

/**
 * Model performance: decode + prompt-processing (prefill) speed.
 * - byModel:   global per-model rollup (steps, streamed tokens, decode tok/s,
 *              new-context tokens, prompt tok/s, avg TTFT, avg context size).
 * - sessions:  per session × per model — a session that switched models mid-flight
 *              shows one row per model, each with that model's own timing stats.
 * Only exact-usage sessions carry timing (attribution/assumed sessions have none).
 * Prompt-processing speed = new (uncached) input tokens / TTFT (request -> first
 * token). TTFT includes network + queue, so it is a lower bound on true prefill.
 */
export function buildPerformance(opts: ReportOptions = {}) {
  const { pc, contrib, byModel } = loadSources(opts);
  const contribById = new Map(contrib.map((c) => [c.id, c]));
  const tps = (tok: number, ms: number | null | undefined): number | null => (ms && ms > 0 ? Math.round((tok / (ms / 1000)) * 10) / 10 : null);

  const modelRows = byModel
    .map((m) => ({
      model: m.model,
      label: m.label,
      provider: m.provider,
      copilot: m.copilot,
      kind: m.kind,
      sessions: m.sessions,
      steps: m.steps,
      exact: m.exact,
      decodeTokens: m.decodeTokens || 0,
      decodeMs: m.decodeMs || 0,
      decodeSteps: m.decodeSteps || 0,
      tokPerSec: m.tokPerSec,
      prefillTokens: m.prefillTokens || 0,
      prefillMs: m.prefillMs || 0,
      prefillSteps: m.prefillSteps || 0,
      promptTokPerSec: m.promptTokPerSec,
      avgTtftMs: m.avgTtftMs,
      avgContext: m.avgContext,
    }))
    .filter((m) => m.decodeSteps > 0 || m.prefillSteps > 0)
    .sort((a, b) => (b.decodeTokens + b.prefillTokens) - (a.decodeTokens + a.prefillTokens));

  const sessionRows = pc.sessions
    .filter((s) => s.buckets && s.allTokens > 0)
    .map((s) => {
      const c = contribById.get(s.id);
      if (!c || !c.exact) return null; // only exact-usage sessions have timing
      const models = (c.models || [])
        .filter((m) => (m.decodeSteps || 0) > 0 || (m.prefillSteps || 0) > 0)
        .map((m) => ({
          model: m.key,
          label: pricing.priceFor(m.key)?.label || m.key,
          copilot: pricing.isCopilotProvider(m.provider),
          kind: pricing.kindFor(m.provider, m.key),
          steps: m.steps,
          decodeTokens: m.decodeTokens || 0,
          tokPerSec: tps(m.decodeTokens || 0, m.decodeMs || 0),
          prefillTokens: m.prefillTokens || 0,
          promptTokPerSec: tps(m.prefillTokens || 0, m.prefillMs || 0),
          avgTtftMs: (m.prefillSteps || 0) > 0 ? Math.round((m.prefillMs || 0) / (m.prefillSteps || 0)) : null,
        }));
      if (!models.length) return null;
      return {
        id: s.id,
        date: localDate(s.createdAt),
        cwd: s.cwd,
        title: s.title,
        createdAt: s.createdAt,
        modelCount: (c.models || []).length,
        models,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => ((a.createdAt || 0) > (b.createdAt || 0) ? -1 : 1));

  const dTok = byModel.reduce((n, m) => n + (m.decodeTokens || 0), 0);
  const dMs = byModel.reduce((n, m) => n + (m.decodeMs || 0), 0);
  const pTok = byModel.reduce((n, m) => n + (m.prefillTokens || 0), 0);
  const pMs = byModel.reduce((n, m) => n + (m.prefillMs || 0), 0);
  const pSteps = byModel.reduce((n, m) => n + (m.prefillSteps || 0), 0);
  return {
    totals: {
      decode: { tokens: dTok, ms: dMs, tokPerSec: tps(dTok, dMs) },
      prefill: { tokens: pTok, ms: pMs, steps: pSteps, tokPerSec: tps(pTok, pMs), avgTtftMs: pSteps > 0 ? Math.round(pMs / pSteps) : null },
    },
    byModel: modelRows,
    sessions: sessionRows,
  };
}
