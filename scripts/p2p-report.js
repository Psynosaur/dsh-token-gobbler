#!/usr/bin/env node
// token-gobbler · scripts/p2p-report.js
// Performance report for the davidAU Qwen runs, split by whether GPU P2P
// (peer-to-peer) was ENABLED in the session or not — so the effect of the
// driver/P2P work shows up as a before/after speed delta.
//
//   node scripts/p2p-report.js                 # davidAU sessions (default)
//   node scripts/p2p-report.js --model qwen    # any model-id substring
//   node scripts/p2p-report.js --all           # every session, not just davidAU
//   node scripts/p2p-report.js --since 2026-09-09   # only sessions on/after a date
//   node scripts/p2p-report.js --exclude "analyser,p2p report"   # drop meta sessions
//   node scripts/p2p-report.js --include-mixed  # keep sessions that switched models
//   node scripts/p2p-report.js --json          # machine-readable
//
// SESSIONS THAT SWITCHED MODELS are HELD OUT by default (the Runs tab does the same
// for its Mix drawer): the steps attributed to this model inside a mixed session may
// have run against a different server/config, so they are not a clean sample. The
// number held out is always printed.
//
// Timings come from the trajectory itself: decode = streamed output tokens ÷
// (first chunk → usage chunk); prefill = new (uncached) input tokens ÷ TTFT
// (request → first token, so network + queue are included → a lower bound).
// Only sessions with per-turn usage carry timing.
//
// P2P flag: an evidence-based scan of the trajectory for P2P ENABLEMENT
// phrasings ("P2P access enabled", "enable P2P", a driver/kernel patched for
// P2P, "P2P: on", nvlink↔p2p). It is a heuristic: a session that merely writes
// ABOUT P2P can trip it, so the mention count is printed alongside for triage.
import { assertNode } from "./runtime.js";

assertNode();
const { buildBreakdown } = await import("../lib/report.js");
const { isMixed } = await import("./census.js");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const modelFilter = val("--model", "davidau").toLowerCase();
const allSessions = has("--all");
const asJson = has("--json");
const since = val("--since", "");                                  // YYYY-MM-DD (inclusive)
// Meta-session escape hatch: sessions that DISCUSS p2p (a report being written,
// a detector being built) trip the keyword evidence and would pollute the
// comparison — drop them by title/id substring.
const excludes = val("--exclude", "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

const breakdown = buildBreakdown({});
let rows = (breakdown.bySession || []).filter((s) => s.steps && s.steps.length);

if (!allSessions) {
  rows = rows.filter((s) => {
    const hay = ((s.models || []).map((m) => m.key).join(" ") + " " + (s.modelMix || "") + " " + (s.model || "")).toLowerCase();
    return hay.includes(modelFilter);
  });
}
if (since) rows = rows.filter((s) => s.date >= since);
// Mixed-model sessions are held out unless asked for — and only when a model filter
// is in play (with --all there is no "the model" that could have been switched away).
const includeMixed = has("--include-mixed");
let heldOut = 0, heldOutSteps = 0;
if (!includeMixed && !allSessions) {
  const keep = [];
  for (const s of rows) {
    if (isMixed(s)) { heldOut++; heldOutSteps += (s.models || []).reduce((n, m) => n + (m.key && m.key.toLowerCase().includes(modelFilter) ? m.steps || 0 : 0), 0); continue; }
    keep.push(s);
  }
  rows = keep;
}
if (excludes.length) {
  rows = rows.filter((s) => {
    const hay = ((s.title || "") + " " + (s.id || "")).toLowerCase();
    return !excludes.some((x) => hay.includes(x));
  });
}

// ── per-session timing for the model under test ─────────────────────────────
// A session's own tokPerSec is the session-wide rate; when a session mixed
// models (e.g. a davidAU run continued on the DeepSeek API), the davidAU steps
// would be diluted by the other model's rate — so we re-derive decode/prefill
// from ONLY the matching model's rollup and keep the raw totals for weighting.
const modelsOf = (s) => {
  const all = s.models || [];
  if (allSessions) return all;
  const hit = all.filter((m) => m.key.toLowerCase().includes(modelFilter));
  return hit.length ? hit : [];
};
const speedOf = (s) => {
  const use = modelsOf(s);
  const dTok = use.reduce((n, m) => n + (m.decodeTokens || 0), 0);
  const dMs = use.reduce((n, m) => n + (m.decodeMs || 0), 0);
  const pTok = use.reduce((n, m) => n + (m.prefillTokens || 0), 0);
  const pMs = use.reduce((n, m) => n + (m.prefillMs || 0), 0);
  const pSteps = use.reduce((n, m) => n + (m.prefillSteps || 0), 0);
  const ctx = use.reduce((n, m) => n + (m.ctxTokens || 0), 0);
  const steps = use.reduce((n, m) => n + (m.steps || 0), 0);
  return {
    steps,
    decode: dMs > 0 ? Math.round((dTok / (dMs / 1000)) * 10) / 10 : null,
    prefill: pMs > 0 ? Math.round((pTok / (pMs / 1000)) * 10) / 10 : null,
    ttft: pSteps > 0 ? Math.round(pMs / pSteps) : null,
    avgCtx: steps > 0 ? Math.round(ctx / steps) : null,
    // raw timing totals — the aggregate weights by these, never by rounded rates
    dTok, dMs, pTok, pMs, pSteps,
  };
};

let shaped = rows.map((s) => {
  const sp = speedOf(s);
  return {
    id: s.id, date: s.date, title: (s.title || s.cwd || s.id).trim(),
    p2p: !!s.p2p, mentions: s.p2pMentions || 0,
    ...sp,
    out: s.outputTokens || 0, in: s.uncachedInputTokens || 0,
    cache: s.cacheReadTokens || 0, tools: (s.events && s.events.toolCalls) || 0,
    cost: s.cost,
  };
}).filter((r) => r.steps > 0 && (r.decode != null || r.prefill != null))
  .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

// ── aggregate helper: weighted speeds (total tokens ÷ total time) ────────────
const agg = (list) => {
  const T = list.reduce((a, r) => {
    a.sessions++; a.steps += r.steps;
    a.dTok += r.dTok; a.dMs += r.dMs; a.pTok += r.pTok; a.pMs += r.pMs; a.pSteps += r.pSteps;
    a.out += r.out; a.in += r.in; a.cache += r.cache; a.tools += r.tools;
    if (r.cost != null) a.cost += r.cost;
    return a;
  }, { sessions: 0, steps: 0, dTok: 0, dMs: 0, pTok: 0, pMs: 0, pSteps: 0, out: 0, in: 0, cache: 0, tools: 0, cost: 0 });
  const rates = list.map((r) => r.decode).filter((v) => v != null);
  return {
    sessions: T.sessions, steps: T.steps,
    decode: T.dMs > 0 ? Math.round((T.dTok / (T.dMs / 1000)) * 10) / 10 : null,
    prefill: T.pMs > 0 ? Math.round((T.pTok / (T.pMs / 1000)) * 10) / 10 : null,
    ttft: T.pSteps > 0 ? Math.round(T.pMs / T.pSteps) : null,
    medianDecode: (() => { const a = [...rates].sort((x, y) => x - y); if (!a.length) return null; const m = a.length >> 1; return a.length % 2 ? a[m] : Math.round(((a[m - 1] + a[m]) / 2) * 10) / 10; })(),
    out: T.out, in: T.in, cache: T.cache, tools: T.tools, cost: Math.round(T.cost * 100) / 100,
  };
};

const p2pRows = shaped.filter((r) => r.p2p);
const nonRows = shaped.filter((r) => !r.p2p);
const A = agg(p2pRows), B = agg(nonRows);

if (asJson) {
  console.log(JSON.stringify({ model: modelFilter, allSessions, sessions: shaped, p2p: A, nonP2P: B }, null, 2));
  process.exit(0);
}

// ── pretty ─────────────────────────────────────────────────────────────────
const fmt = (n) => (n == null ? "—" : n.toLocaleString("en-US"));
const fmtC = (n) => (n == null ? "—" : n < 1000 ? String(n) : n < 1e6 ? (n / 1e3).toFixed(1) + "K" : (n / 1e6).toFixed(1) + "M");
const pad = (s, n) => String(s == null ? "—" : s).padEnd(n);
const padL = (s, n) => String(s == null ? "—" : s).padStart(n);
const money = (n) => (n == null ? "—" : "$" + n.toFixed(2));
const line = (n = 104) => "─".repeat(n);

const pct = (a, b) => (a == null || b == null || b === 0 ? null : Math.round(((a - b) / b) * 1000) / 10);
const delta = (a, b) => { const p = pct(a, b); return p == null ? "—" : (p >= 0 ? "+" : "") + p + "%"; };

console.log();
console.log("  🦃 P2P PERFORMANCE REPORT — " + (allSessions ? "all sessions" : "model ≈ " + modelFilter));
console.log(line());
console.log("  sessions matched : " + fmt(shaped.length) + " (with per-step timing)");
console.log("  P2P enabled      : " + fmt(p2pRows.length) + "   ·   not detected: " + fmt(nonRows.length));
if (since) console.log("  since            : " + since);
if (excludes.length) console.log("  excluded         : " + excludes.join(", "));
if (heldOut) console.log("  held out         : " + fmt(heldOut) + " session(s) · " + fmt(heldOutSteps) +
  " steps — switched models mid-session (--include-mixed keeps them)");
// Sample-size guard: a "P2P enabled" group built from a handful of LLM steps
// cannot support a speed claim, and saying so up front is the whole point —
// the two groups are ALSO not controlled for context size or model mix.
const MIN_STEPS = 200;
if (A.steps < MIN_STEPS || B.steps < MIN_STEPS) {
  console.log();
  console.log("  ⚠  SMALL SAMPLE — P2P " + fmt(A.steps) + " steps / non-P2P " + fmt(B.steps) +
    " steps (want ≥ " + MIN_STEPS + " each).");
  console.log("     Treat the deltas below as DIRECTIONAL ONLY. The groups are also not controlled for");
  console.log("     context size, model mix, or sampling settings — a session flagged P2P may still have");
  console.log("     run most of its steps on a different model.");
}
console.log();

console.log("  TIMELINE (oldest → newest; P2P = P2P-enablement evidence in the trajectory)");
console.log(line());
console.log("  " + pad("DATE", 12) + pad("P2P", 6) + padL("MENT", 6) + padL("DECODE", 9) + padL("PREFILL", 9) + padL("TTFT", 9) + padL("CTX", 9) + padL("OUT", 8) + "  TITLE");
for (const r of shaped) {
  console.log("  " + pad(r.date, 12) + pad(r.p2p ? "● yes" : "·", 6) + padL(r.mentions, 6) +
    padL(r.decode != null ? r.decode.toFixed(1) : "—", 9) +
    padL(r.prefill != null ? Math.round(r.prefill) : "—", 9) +
    padL(r.ttft != null ? (r.ttft / 1000).toFixed(1) + "s" : "—", 9) +
    padL(fmtC(r.avgCtx), 9) + padL(fmtC(r.out), 8) + "  " + r.title.slice(0, 38));
}
console.log();

console.log("  P2P vs NON-P2P (weighted: total tokens ÷ total time)");
console.log(line());
const col = (label, a, b, d, unit) => console.log("  " + pad(label, 26) + padL(a, 14) + padL(b, 14) + padL(d, 10) + "   " + unit);
console.log("  " + pad("", 26) + padL("P2P ENABLED", 14) + padL("NOT DETECTED", 14) + padL("DELTA", 10));
col("sessions", A.sessions, B.sessions, "—", "");
col("LLM steps", fmt(A.steps), fmt(B.steps), "—", "");
col("decode (tok/s)", A.decode != null ? A.decode.toFixed(1) : "—", B.decode != null ? B.decode.toFixed(1) : "—", delta(A.decode, B.decode), "higher is faster");
col("decode median (tok/s)", A.medianDecode != null ? A.medianDecode.toFixed(1) : "—", B.medianDecode != null ? B.medianDecode.toFixed(1) : "—", delta(A.medianDecode, B.medianDecode), "per-session, outlier-resistant");
col("prefill (tok/s)", A.prefill != null ? Math.round(A.prefill) : "—", B.prefill != null ? Math.round(B.prefill) : "—", delta(A.prefill, B.prefill), "higher is faster");
col("avg TTFT (ms)", A.ttft != null ? fmt(A.ttft) : "—", B.ttft != null ? fmt(B.ttft) : "—", delta(A.ttft, B.ttft), "lower is better");
col("output tokens", fmtC(A.out), fmtC(B.out), "—", "");
col("uncached input", fmtC(A.in), fmtC(B.in), "—", "");
col("cache read", fmtC(A.cache), fmtC(B.cache), "—", "");
col("tool calls", fmt(A.tools), fmt(B.tools), "—", "");
console.log();

console.log("  READING THIS");
console.log(line());
console.log("  Decode = streamed output tokens ÷ decode time (first→last chunk) — the model's raw");
console.log("  generation rate. Prefill = new (uncached) input tokens ÷ TTFT, a LOWER BOUND on true");
console.log("  prompt-processing speed (TTFT also carries network + queue). Cache reads are served");
console.log("  from the provider's cache and are not new work. A session is 'P2P enabled' when its");
console.log("  trajectory carries affirmative P2P evidence; the MENT column shows how often 'p2p' is");
console.log("  mentioned, so a session that merely DISCUSSES p2p (e.g. writing this report) is visible");
console.log("  as a high-mention outlier and should be discounted by hand.");
console.log("  Both groups are measured over the FILTERED model's steps only — a session's other-model");
console.log("  steps never enter its bar.");
console.log();
