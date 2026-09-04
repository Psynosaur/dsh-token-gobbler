// token-gobbler · report.js
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

/** The models to cost the gobbling against: your free local baseline + Copilot's paid roster. */
export const DEFAULT_CANDIDATES = [
  { id: "qwen3.8-local",     label: "Qwen 3.8 27B (local — what you ran)" },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6 (Copilot)" },
  { id: "claude-sonnet-5",   label: "Claude Sonnet 5 (Copilot)" },
  { id: "claude-opus-4.6",   label: "Claude Opus 4.6 (Copilot)" },
  { id: "grok-4.6",          label: "Grok 4.6 (Copilot)" },
];

export function resolvePaths(opts = {}) {
  const dshHome = opts.dshHome || process.env.DSH_HOME || join(homedir(), ".dsh");
  // The dsh update (2026-09) moved the projection store from a single JSON file to a
  // directory of per-session files. Prefer the directory when it exists; fall back to
  // the legacy file (still written by older dsh versions).
  let storePath = opts.storePath || process.env.DSH_PROJCACHE || null;
  let storeKind = null;
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

/** Where the user's editable pricing table lives. Re-read on every request. */
export function pricingFilePath(dshHome) {
  return join(dshHome, "token-gobbler", "pricing.json");
}

/**
 * Load the user's pricing table (if saved) and install it as the effective rate
 * cards for this request. Falls back to the built-in cards when no file exists.
 * The WFH reference model (what local compute is valued against) defaults to
 * claude-opus-4.6.
 */
export function loadPricing(dshHome) {
  const p = pricingFilePath(dshHome);
  let file = null;
  if (existsSync(p)) { try { file = JSON.parse(readFileSync(p, "utf8")); } catch { file = null; } }
  const hasModels = file && Array.isArray(file.models) && file.models.length > 0;
  const models = hasModels ? file.models : pricing.builtinEntries();
  const referenceModel = (file && typeof file.referenceModel === "string" && file.referenceModel.trim()) ? file.referenceModel.trim().toLowerCase() : "claude-opus-4.6";
  pricing.setRuntimeTable(models, referenceModel);
  return { path: p, fromFile: !!hasModels, referenceModel, models };
}

/**
 * Validate + persist the pricing table to the file. Throws on invalid input.
 * Returns the stored { referenceModel, models }.
 */
export function savePricing(dshHome, body = {}) {
  const num = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : null; };
  const models = [];
  const seen = new Set();
  for (const e of Array.isArray(body.models) ? body.models : []) {
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
    });
  }
  if (!models.length) throw new Error("models must be a non-empty array of {id, input, output, cacheRead, cacheWrite}");
  const referenceModel = (typeof body.referenceModel === "string" && body.referenceModel.trim()) ? body.referenceModel.trim().toLowerCase() : null;
  if (!referenceModel || !seen.has(referenceModel)) throw new Error("referenceModel must be one of the model ids in the table");
  const p = pricingFilePath(dshHome);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify({ version: 1, referenceModel, models }, null, 2) + "\n");
  pricing.setRuntimeTable(models, referenceModel);
  return { referenceModel, models };
}

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const BUCKETS = ["uncachedInputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"];
/** Sort a {name: count} tool map into a [{name, count}] array (top n). */
const toolsArray = (tools, n = 40) => Object.entries(tools || {}).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, n);

/** Local-time YYYY-MM-DD for a millisecond timestamp. */
export function localDate(ms) {
  if (!ms) return "unknown";
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Read the profile's agent-default-model from settings.yaml (minimal line scan, no YAML dep). */
export function readDefaultModel(dshHome) {
  const p = join(dshHome, "settings.yaml");
  if (!existsSync(p)) return null;
  let text;
  try { text = readFileSync(p, "utf8"); } catch { return null; }
  let inBlock = false, provider = null, model = null;
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

/** Price an aggregate bucket set under each candidate model's rate card. */
export function priceTotals(totals, candidates) {
  const out = [];
  for (const c of candidates || DEFAULT_CANDIDATES) {
    const card = pricing.priceFor(c.id);
    if (!card) { out.push({ id: c.id, label: c.label, priced: false, cost: null }); continue; }
    const breakdown = pricing.costBreakdown(totals, card);
    out.push({
      id: c.id, label: c.label, priced: true, estimated: !!card.estimated,
      pricing: { input: card.input, output: card.output, cacheRead: card.cacheRead, cacheWrite: card.cacheWrite },
      cost: r2(breakdown.total),
      breakdown: { input: r2(breakdown.inputCost), output: r2(breakdown.outputCost), cacheRead: r2(breakdown.cacheReadCost), cacheWrite: r2(breakdown.cacheWriteCost) },
    });
  }
  return out;
}

/**
 * Attach a local-baseline flag + savings to a raw comparison list.
 * The local model (your home-lab baseline) is the cheapest priced row; every other
 * model's `savings` is how much cheaper local is than running on it.
 */
export function addSavings(rawComparison) {
  const localRow = rawComparison.find((c) => c.priced && (c.id === "qwen3.8-local" || c.id === "local-free")) || rawComparison.find((c) => c.priced);
  const baselineCost = localRow ? localRow.cost : 0;
  const comparison = rawComparison.map((c) => ({
    ...c,
    baseline: !!localRow && c.id === localRow.id,
    savings: c.priced ? r2(c.cost - baselineCost) : null,
  }));
  const paidSavings = comparison.filter((c) => c.priced && !c.baseline && c.savings != null && c.savings > 0).map((c) => c.savings);
  const savings = {
    baselineId: localRow ? localRow.id : null,
    baselineCost: r2(baselineCost),
    min: paidSavings.length ? r2(Math.min(...paidSavings)) : 0,
    max: paidSavings.length ? r2(Math.max(...paidSavings)) : 0,
  };
  return { comparison, savings };
}

/**
 * Attribute ONE session's real token totals across the models it actually used.
 * For each step, the active model is the modelChange with the largest seq <= the step's
 * seq (or the first change if the step predates all changes). The session's totals are
 * split across models in proportion to how many steps each model was active for.
 * Returns [{ model, provider, steps, share, buckets, allTokens }] sorted by allTokens desc.
 * `estimated` — each step is assumed to cost roughly equal tokens (no per-step counts).
 */
export function attributeSession(totals, modelChanges, stepSeqs, fallbackModel) {
  const t = totals || {};
  const all = (t.uncachedInputTokens || 0) + (t.outputTokens || 0) + (t.cacheReadTokens || 0) + (t.cacheWriteTokens || 0);
  const changes = (modelChanges || []).filter((c) => c && c.model).sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
  const mkBuckets = (share) => { const b = {}; for (const k of BUCKETS) b[k] = (t[k] || 0) * share; return b; };

  if (!changes.length) {
    const m = fallbackModel || "(unattributed)";
    return [{ model: m, provider: null, steps: 0, share: 1, buckets: { ...t }, allTokens: all }];
  }

  const countBy = new Map();
  const activeAt = (seq) => { let best = changes[0]; for (const c of changes) { if ((c.seq ?? 0) <= seq) best = c; else break; } return best; };
  const steps = (stepSeqs || []).filter((s) => typeof s === "number");
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

/**
 * Build the per-session per-model contribution (the heart of the report).
 * For each projcache session, recover its per-model buckets using the best available signal:
 *   exact (usage chunks) > estimated (attribution) > assumed (default model).
 * Models are grouped by pricing.modelKey (Copilot model vs local Qwen).
 */
function buildContrib(pc, timelines, usageById, defaultModel) {
  const fbKey = pricing.modelKey(defaultModel?.provider, defaultModel?.model) || pricing.LOCAL_QWEN_KEY;
  const contrib = [];
  for (const s of pc.sessions) {
    const tl = timelines.get(s.id);
    const usage = usageById.get(s.id);
    let models, exact;
    if (usage && usage.length) {
      const byM = new Map();
      for (const u of usage) {
        const key = pricing.modelKey(u.provider, u.model);
        let e = byM.get(key);
        if (!e) { e = { key, provider: u.provider || null, steps: 0, buckets: pricing.emptyBuckets(), decodeTokens: 0, decodeMs: 0, decodeSteps: 0, prefillTokens: 0, prefillMs: 0, prefillSteps: 0, ctxTokens: 0 }; byM.set(key, e); }
        e.provider = e.provider || u.provider;
        for (const k of BUCKETS) e.buckets[k] += u.buckets[k];
        if (u.decodeMs != null) { e.decodeTokens += u.buckets.outputTokens || 0; e.decodeMs += u.decodeMs; e.decodeSteps++; }
        if (u.ttftMs != null) { e.prefillTokens += u.buckets.uncachedInputTokens || 0; e.prefillMs += u.ttftMs; e.prefillSteps++; }
        e.ctxTokens += (u.buckets.uncachedInputTokens || 0) + (u.buckets.cacheReadTokens || 0);
        e.steps++;
      }
      models = [...byM.values()].map((m) => ({ ...m, allTokens: pricing.allTokens(m.buckets), exact: true }));
      exact = true;
    } else if (tl && tl.modelChanges.length) {
      const raw = attributeSession(s.buckets, tl.modelChanges, tl.stepSeqs, defaultModel?.model);
      const byKey = new Map();
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

/** Roll the per-session contributions up into a global per-model table (rounded, priced). */
export function aggregateContrib(contrib) {
  const map = new Map();
  for (const c of contrib || []) {
    for (const m of c.models || []) {
      let e = map.get(m.key);
      if (!e) { e = { key: m.key, provider: m.provider, sessions: new Set(), steps: 0, exact: true, decodeTokens: 0, decodeMs: 0, decodeSteps: 0, prefillTokens: 0, prefillMs: 0, prefillSteps: 0, ctxTokens: 0, ...pricing.emptyBuckets() }; map.set(m.key, e); }
      e.provider = e.provider || m.provider;
      e.sessions.add(c.id);
      e.steps += m.steps;
      e.exact = e.exact && m.exact;
      e.decodeTokens += m.decodeTokens || 0;
      e.decodeMs += m.decodeMs || 0;
      e.decodeSteps += m.decodeSteps || 0;
      e.prefillTokens += m.prefillTokens || 0;
      e.prefillMs += m.prefillMs || 0;
      e.prefillSteps += m.prefillSteps || 0;
      e.ctxTokens += m.ctxTokens || 0;
      for (const k of BUCKETS) e[k] += m.buckets[k];
    }
  }
  return [...map.values()]
    .map((m) => {
      const card = pricing.priceFor(m.key);
      const buckets = {};
      for (const k of BUCKETS) buckets[k] = Math.round(m[k]);
      return {
        model: m.key,
        label: card?.label || m.key,
        provider: m.provider,
        copilot: pricing.isCopilotProvider(m.provider),
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
      };
    })
    .sort((a, b) => b.allTokens - a.allTokens);
}

/** Read projcache + trajectories + default model once; compute the per-session contribution. */
function loadSources(opts = {}) {
  const { dshHome, sessionsRoot, storePath, storeKind } = resolvePaths(opts);
  const priceCfg = loadPricing(dshHome); // re-read the user's pricing file on every request
  const defaultModel = readDefaultModel(dshHome);
  let pc = { sessions: [], totals: pricing.emptyBuckets(), count: 0, nonZero: 0 };
  if (existsSync(storePath)) { try { pc = projcache.readProjcache(storePath); } catch { /* keep empty */ } }

  const traj = { files: 0, withUsage: 0, usageRecords: 0, withModelTimeline: 0, cache: { hits: 0, recomputed: 0 } };
  const timelines = new Map(); // sessionId -> { modelChanges, stepSeqs }
  const usageById = new Map(); // sessionId -> [{ model, provider, buckets }]
  const eventsById = new Map();  // sessionId -> activity-category counters
  const toolsById = new Map();   // sessionId -> { dispatched code name: count }
  const toolCallsById = new Map(); // sessionId -> { top-level tool name: count }
  const aggEvents = trajectory.emptyEvents();
  const aggTools = {};
  const aggToolCalls = {};
  if (existsSync(sessionsRoot)) {
    const files = trajectory.findTrajectoryFiles(sessionsRoot);
    traj.files = files.length;
    const s0 = trajectory.parseStatsSnapshot();
    for (const f of files) {
      let t;
      try { t = trajectory.readTrajectory(f); } catch { continue; }
      if (!t) continue;
      const id = t.meta?.id;
      if (!id) continue;
      timelines.set(id, { modelChanges: t.modelChanges || [], stepSeqs: t.stepSeqs || [] });
      if (t.modelChanges.length) traj.withModelTimeline++;
      if (t.usage.length) { traj.withUsage++; traj.usageRecords += t.usage.length; usageById.set(id, t.usage); }
      if (t.events) {
        eventsById.set(id, t.events);
        for (const k of Object.keys(aggEvents)) aggEvents[k] += t.events[k] || 0;
      }
      if (t.tools && Object.keys(t.tools).length) {
        toolsById.set(id, t.tools);
        for (const [n, c] of Object.entries(t.tools)) aggTools[n] = (aggTools[n] || 0) + c;
      }
      if (t.toolCalls && Object.keys(t.toolCalls).length) {
        toolCallsById.set(id, t.toolCalls);
        for (const [n, c] of Object.entries(t.toolCalls)) aggToolCalls[n] = (aggToolCalls[n] || 0) + c;
      }
    }
    const s1 = trajectory.parseStatsSnapshot();
    traj.cache = { hits: s1.cacheHits - s0.cacheHits, recomputed: s1.recomputed - s0.recomputed };
  }

  const contrib = buildContrib(pc, timelines, usageById, defaultModel);
  const byModel = aggregateContrib(contrib);
  return { dshHome, sessionsRoot, storePath, storeKind, priceCfg, pc, traj, defaultModel, contrib, byModel, eventsById, toolsById, toolCallsById, aggEvents, aggTools, aggToolCalls };
}

/** What-if candidates: the local baseline first, then every non-local model in the user's table. */
function candidatesFromTable(models) {
  const local = [], paid = [];
  for (const m of models || []) {
    if (!m || !m.id || m.id === "local-free") continue; // local-free is an unpriced fallback marker, not a candidate
    if (m.local) local.push({ id: m.id, label: m.id === "qwen3.8-local" ? m.label + " — what you ran" : m.label });
    else paid.push({ id: m.id, label: m.label });
  }
  return local.length + paid.length ? [...local, ...paid] : DEFAULT_CANDIDATES;
}

export function buildReport(opts = {}) {
  const { dshHome, sessionsRoot, storePath, storeKind, priceCfg, pc, traj, defaultModel, contrib, byModel, aggEvents, aggTools, aggToolCalls } = loadSources(opts);
  const candidates = opts.candidates || candidatesFromTable(priceCfg.models);
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
  const sumRows = (rows) => { const b = pricing.emptyBuckets(); for (const m of rows) for (const k of BUCKETS) b[k] += m[k] || 0; return b; };
  const localRows = byModel.filter((m) => !m.copilot);
  const copilotRows = byModel.filter((m) => m.copilot);
  const wfhBuckets = sumRows(localRows);
  const copilotBuckets = sumRows(copilotRows);
  // What the corp would have billed for the same WFH compute: the user-selected
  // reference model (default claude-opus-4.6), editable in the Pricing tab.
  const refId = pricing.referenceModelId() || "claude-opus-4.6";
  const refCard = pricing.priceFor(refId);
  const wfhSessionIds = new Set();
  const copilotSessionIds = new Set();
  for (const c of contrib) {
    let local = false, copilot = false;
    for (const m of c.models || []) {
      if (m.allTokens <= 0) continue;
      if (pricing.isCopilotProvider(m.provider)) copilot = true; else local = true;
    }
    if (local) wfhSessionIds.add(c.id);
    if (copilot) copilotSessionIds.add(c.id);
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
    copilot: {
      sessions: copilotSessionIds.size,
      tokens: pricing.allTokens(copilotBuckets),
      cost: r2(copilotRows.reduce((n, m) => n + (m.cost != null ? m.cost : 0), 0)),
    },
  };

  const actual = {
    cost: r2(actualCost),
    source,
    fromTrajectories: source !== "assumed",
    pricedModels,
    assumedModel: source === "assumed" ? (defaultModel?.model || "qwen3.8-local") : null,
    note: source === "usage"
      ? "Priced from exact per-model usage (harness request events). Local Qwen at the OpenRouter baseline; Copilot at its model rates."
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

  return {
    generatedAt: new Date().toISOString(),
    dshHome,
    decode,
    prefill,
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

/**
 * Per-day / per-session / per-model token breakdown.
 * - byModel:   REAL per-model rollup (Copilot models + local Qwen).
 * - bySession: one row per session with its real model mix (dominant model + all models).
 * - byDay:     aggregate by local calendar day.
 */
export function buildBreakdown(opts = {}) {
  const { pc, traj, defaultModel, contrib, byModel, eventsById, toolsById, toolCallsById, aggEvents, aggTools, aggToolCalls } = loadSources(opts);
  const contribById = new Map(contrib.map((c) => [c.id, c]));
  const fallbackLabel = "Qwen 3.8 27B (local)";

  const bySession = pc.sessions
    .filter((s) => s.buckets && s.allTokens > 0)
    .map((s) => {
      const c = contribById.get(s.id);
      const models = c ? c.models : [];
      const dominant = models.length ? models[0] : null;
      const model = dominant ? (pricing.priceFor(dominant.key)?.label || dominant.key) : fallbackLabel;
      const modelMix = models.length
        ? (models.length === 1
            ? model
            : models.slice(0, 3).map((m) => (pricing.priceFor(m.key)?.label || m.key)).join(" · ") + (models.length > 3 ? ` +${models.length - 3}` : ""))
        : model;
      // Real cost of this session's actual model mix (local at the home-lab baseline,
      // Copilot at its model rates). null when no model in the mix has a rate card.
      let cost = null;
      if (models.length) {
        let sum = 0, any = false;
        for (const m of models) { const card = pricing.priceFor(m.key); if (card) { sum += pricing.costFor(m.buckets, card); any = true; } }
        cost = any ? r2(sum) : null;
      }
      // Decode speed from trajectory chunk timestamps (only sessions with exact usage).
      const dTok = models.reduce((n, m) => n + (m.decodeTokens || 0), 0);
      const dMs = models.reduce((n, m) => n + (m.decodeMs || 0), 0);
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
      };
    });

  const dayMap = new Map();
  for (const row of bySession) {
    let d = dayMap.get(row.date);
    if (!d) { d = { date: row.date, sessions: 0, cost: null, ...pricing.emptyBuckets() }; dayMap.set(row.date, d); }
    d.sessions++;
    if (row.cost != null) d.cost = (d.cost || 0) + row.cost;
    for (const k of BUCKETS) d[k] += row[k];
  }
  const byDay = [...dayMap.values()].map((d) => ({ ...d, allTokens: pricing.allTokens(d), cost: d.cost != null ? r2(d.cost) : null })).sort((a, b) => (a.date > b.date ? 1 : -1));

  return {
    defaultModel,
    byDay,
    byModel,
    bySession,
    events: aggEvents,
    tools: toolsArray(aggTools),
    toolCalls: toolsArray(aggToolCalls),
    sources: { projcache: { sessions: pc.count, nonZero: pc.nonZero }, trajectories: { withUsage: traj.withUsage, withModelTimeline: traj.withModelTimeline, cache: traj.cache } },
  };
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
export function buildPerformance(opts = {}) {
  const { pc, contrib, byModel } = loadSources(opts);
  const contribById = new Map(contrib.map((c) => [c.id, c]));
  const tps = (tok, ms) => (ms > 0 ? Math.round((tok / (ms / 1000)) * 10) / 10 : null);

  const modelRows = byModel
    .map((m) => ({
      model: m.model,
      label: m.label,
      provider: m.provider,
      copilot: m.copilot,
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
          steps: m.steps,
          decodeTokens: m.decodeTokens || 0,
          tokPerSec: tps(m.decodeTokens || 0, m.decodeMs || 0),
          prefillTokens: m.prefillTokens || 0,
          promptTokPerSec: tps(m.prefillTokens || 0, m.prefillMs || 0),
          avgTtftMs: (m.prefillSteps || 0) > 0 ? Math.round((m.prefillMs || 0) / m.prefillSteps) : null,
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
    .filter(Boolean)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

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
