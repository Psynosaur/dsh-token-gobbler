// token-gobbler · scripts/census.js
//
// Shared core for the corpus-analysis CLIs (day-compare.js, corpus-snapshot.js).
// Reads DSH session trajectories through the normal report pipeline and turns them
// into flat per-STEP rows for one model (or all models), plus per-session rows.
//
// WHY STEP ROWS: a session's own tokPerSec is a session-wide rate. A session that
// mixed the local model with a cloud API dilutes it, and a session that spans
// context sizes hides the fact that decode slows down as the context grows. Every
// comparison in these scripts is therefore re-derived from ONE MODEL'S OWN STEPS,
// and every aggregate is time-weighted (total tokens ÷ total ms), never the mean
// of per-step rates.
//
// PORTABILITY: no dependencies, no build step, no external `zstd` binary — the
// trajectory decompressor is node:zlib's zstdDecompressSync (Node >= 22.15/24).
// Pure ESM; requires the repo's package.json ("type": "module") to be alongside.

import { buildBreakdown, localDate } from "../lib/report.js";
import { kindFor } from "../lib/pricing.js";

// ── context / output / reasoning bands used by the matched comparisons ───────
export const CTX_BANDS = [
  [0, 8e3, "<8K"],
  [8e3, 16e3, "8-16K"],
  [16e3, 32e3, "16-32K"],
  [32e3, 64e3, "32-64K"],
  [64e3, 128e3, "64-128K"],
  [128e3, Infinity, ">128K"],
];
export const OUT_BANDS = [
  [0, 100, "<100"],
  [100, 250, "100-250"],
  [250, 600, "250-600"],
  [600, 2000, "600-2K"],
  [2000, Infinity, ">2K"],
];
export const THINK_BANDS = [
  [0, 0.1, "<10%"],
  [0.1, 0.3, "10-30%"],
  [0.3, 0.6, "30-60%"],
  [0.6, 1.01, ">60%"],
];

// ── small numeric helpers ───────────────────────────────────────────────────
/** Linear-interpolated quantile of a numeric array (NaNs/nulls dropped). */
export function quantile(values, p) {
  const a = values.filter((v) => v != null && Number.isFinite(v)).sort((x, y) => x - y);
  if (!a.length) return null;
  const i = (a.length - 1) * p;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * (i - lo);
}
const sum = (rows, f) => rows.reduce((n, r) => n + (f(r) || 0), 0);
export const r1 = (n) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 10) / 10);

/** A valid timing sample: the step produced output AND carried a decode time. */
export const hasDecode = (r) => r.decMs > 0 && r.out > 0;

// ── statistics over a set of step rows ──────────────────────────────────────
/** Decode tok/s, time-weighted: Σ output tokens ÷ Σ decode seconds. */
export function wDecode(rows) {
  const R = rows.filter(hasDecode);
  const ms = sum(R, (r) => r.decMs);
  return ms > 0 ? sum(R, (r) => r.out) / (ms / 1000) : null;
}
/** Prefill tok/s, time-weighted: Σ new (uncached) input tokens ÷ Σ TTFT. */
export function wPrefill(rows) {
  const R = rows.filter((r) => r.ttft > 0);
  const ms = sum(R, (r) => r.ttft);
  return ms > 0 ? sum(R, (r) => r.in) / (ms / 1000) : null;
}
/** Share of measurable steps that decoded faster than `thr` tok/s (0..1). */
export function fastShare(rows, thr) {
  const R = rows.filter(hasDecode);
  return R.length ? R.filter((r) => r.dec > thr).length / R.length : null;
}

/**
 * The one row shape every renderer consumes: a compact per-group summary.
 * `sessions` counts DISTINCT sessions, so a group is never mistaken for N samples.
 */
export function rollup(rows, { fast = 60 } = {}) {
  const decs = rows.filter(hasDecode).map((r) => r.dec);
  const ttfts = rows.filter((r) => r.ttft > 0).map((r) => r.ttft);
  const ctxs = rows.map((r) => r.ctx).filter((v) => v != null && v > 0);
  const out = sum(rows, (r) => r.out);
  const prompt = sum(rows, (r) => r.in + r.cache);
  return {
    steps: rows.length,
    sessions: new Set(rows.map((r) => r.sid)).size,
    decode: wDecode(rows),
    decodeP50: quantile(decs, 0.5),
    decodeP90: quantile(decs, 0.9),
    prefill: wPrefill(rows),
    ttftP50: quantile(ttfts, 0.5),
    ttftP90: quantile(ttfts, 0.9),
    ctxP50: quantile(ctxs, 0.5),
    ctxP90: quantile(ctxs, 0.9),
    out,
    outPerStep: rows.length ? out / rows.length : null,
    cachePct: prompt > 0 ? (sum(rows, (r) => r.cache) / prompt) * 100 : null,
    thinkPct: out > 0 ? (sum(rows, (r) => r.think) / out) * 100 : null,
    fastShare: fastShare(rows, fast),
    fast,
  };
}

// ── deterministic RNG + SESSION-CLUSTERED bootstrap ─────────────────────────
/** mulberry32 — same seed, same CI, on every machine. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bootstrap the DIFFERENCE between two groups (focus − rest) for one statistic.
 *
 * Steps inside a session are NOT independent — they share a server config, a
 * context history and a conversation. Resampling steps would therefore fake
 * precision. This resamples SESSIONS with replacement inside each group, which is
 * the honest unit here and the reason a 300-step session counts as one draw.
 *
 * Returns { value, lo, hi, p } — value is the observed delta, [lo, hi] the 95 %
 * interval, p the two-sided bootstrap p-value (share of resamples whose delta
 * crosses zero). null when a group has fewer than MIN_SESSIONS sessions.
 */
export function bootstrapDelta(focus, rest, statFn, { B = 400, seed = 42, minSessions = 3, mode = "rel" } = {}) {
  const diff = (a, b) => {
    if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return null;
    // "rel" = relative change (rates), "pp" = absolute percentage-point change
    // (shares, where a relative change against a near-zero base is meaningless).
    return mode === "pp" ? a - b : b === 0 ? null : ((a - b) / b) * 100;
  };
  const value = diff(statFn(focus), statFn(rest));
  const bySid = (rows) => {
    const m = new Map();
    for (const r of rows) {
      if (!m.has(r.sid)) m.set(r.sid, []);
      m.get(r.sid).push(r);
    }
    return [...m.values()];
  };
  const A = bySid(focus), Bg = bySid(rest);
  if (A.length < minSessions || Bg.length < minSessions) return { value, lo: null, hi: null, p: null, mode, reason: "too few sessions" };
  const rand = rng(seed);
  const draws = [];
  const pick = (clusters) => {
    const out = [];
    for (let i = 0; i < clusters.length; i++) out.push(...clusters[(rand() * clusters.length) | 0]);
    return out;
  };
  for (let i = 0; i < B; i++) {
    const d = diff(statFn(pick(A)), statFn(pick(Bg)));
    if (d != null) draws.push(d);
  }
  if (!draws.length) return { value, lo: null, hi: null, p: null, mode, reason: "no valid resamples" };
  draws.sort((x, y) => x - y);
  const lo = draws[Math.floor(draws.length * 0.025)];
  const hi = draws[Math.floor(draws.length * 0.975)];
  const crossings = draws.filter((d) => (value >= 0 ? d <= 0 : d >= 0)).length;
  return { value, lo, hi, p: Math.min(1, (2 * crossings) / draws.length), mode, method: "session bootstrap", B };
}

/** Relative delta in percent (a vs b), or null when either side is unusable. */
export function delta(a, b) {
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return ((a - b) / b) * 100;
}

// ── collection ──────────────────────────────────────────────────────────────
/**
 * The models a session ACTUALLY used: a non-empty key with at least one step.
 * Same definition the Runs tab uses, so the CLI and the UI agree on "mixed".
 */
export function usedModels(s) {
  return (s.models || []).filter((m) => m.key && (m.steps || 0) > 0);
}
/** True when a session switched models mid-flight (it contributes to >1 model). */
export function isMixed(s) {
  return usedModels(s).length > 1;
}

/**
 * Read the corpus and return { meta, steps, sessions }.
 *
 * opts:
 *   model     model-id substring to match (default "davidau"); "" = no filter
 *   all       ignore `model` entirely (every step of every model)
 *   since/until  inclusive YYYY-MM-DD day bounds (local calendar days)
 *   exclude   array of substrings matched against session title/id (meta sessions)
 *   dshHome   override ~/.dsh
 *   approx    fold in sessions that have no per-step usage (session rollup only)
 *   includeMixed  keep sessions that switched models (default: they are HELD OUT)
 */
export function collect(opts = {}) {
  const { model = "davidau", all = false, since = "", until = "", exclude = [], dshHome = "", approx = true, includeMixed = false } = opts;
  const needle = all ? "" : String(model || "").toLowerCase();
  const bd = buildBreakdown(dshHome ? { dshHome } : {});

  const steps = [];
  const sessions = [];
  const skipped = { excluded: 0, noSteps: 0, approx: 0, noMatch: 0, mixed: 0, mixedSteps: 0, mixedDays: new Set() };
  const localModels = new Map(); // model key -> steps, for --model auto

  for (const s of bd.bySession || []) {
    for (const m of s.models || []) {
      const k = kindFor(m.provider, m.key);
      if (k === "local") localModels.set(m.key, (localModels.get(m.key) || 0) + (m.steps || 0));
    }
    const hay = ((s.title || "") + " " + (s.id || "")).toLowerCase();
    if (exclude.length && exclude.some((x) => hay.includes(x))) { skipped.excluded++; continue; }
    if (since && s.date < since) continue;
    if (until && s.date > until) continue;

    const allSteps = s.steps || [];
    const rows = [];
    for (const st of allSteps) {
      if (needle && !(st.model || "").toLowerCase().includes(needle)) continue;
      const out = st.out || 0;
      const dec = st.decodeTokPerSec != null && Number.isFinite(st.decodeTokPerSec) && st.decodeTokPerSec > 0 ? st.decodeTokPerSec : null;
      rows.push({
        day: s.date,
        sid: s.id,
        title: (s.title || "").trim(),
        cwd: s.cwd || "",
        p2p: !!s.p2p,
        turn: st.turn,
        step: st.step,
        out,
        in: st.in || 0,
        cache: st.cache || 0,
        think: st.thinking || 0,
        // ctxTotal is the ACTUAL prompt (uncached + cache read) when usage is present.
        ctx: st.ctxTotal != null ? st.ctxTotal : (st.in || 0) + (st.cache || 0),
        dec,
        decMs: dec && out > 0 ? (out / dec) * 1000 : null,
        ttft: st.ttftMs || 0,
        pref: st.prefillTokPerSec != null && Number.isFinite(st.prefillTokPerSec) ? st.prefillTokPerSec : null,
        regime: st.compactionRegime || 0,
        tools: (st.tools || []).length,
        approx: false,
      });
    }

    // Fallback for foreign corpora: a session with no per-step usage records still
    // carries a per-model rollup. One pseudo-step keeps it in the corpus, clearly
    // flagged, so it can never be mistaken for a measured step.
    let usedApprox = false;
    if (!rows.length && approx) {
      for (const m of s.models || []) {
        if (needle && !String(m.key || "").toLowerCase().includes(needle)) continue;
        if (!(m.decodeTokens > 0 && m.decodeMs > 0)) continue;
        const stepsN = m.steps || 1;
        const dec = (m.decodeTokens / (m.decodeMs / 1000));
        const outTok = m.buckets?.outputTokens || 0;
        rows.push({
          day: s.date, sid: s.id, title: (s.title || "").trim(), cwd: s.cwd || "", p2p: !!s.p2p,
          turn: null, step: null,
          out: outTok, in: m.buckets?.uncachedInputTokens || 0, cache: m.buckets?.cacheReadTokens || 0,
          think: m.reasoningTokens || 0,
          ctx: stepsN ? (m.ctxTokens || 0) / stepsN : 0,
          dec, decMs: m.decodeMs, ttft: m.prefillMs || 0,
          pref: m.prefillTokPerSec ?? null, regime: 0, tools: 0, approx: true,
        });
        usedApprox = true;
      }
    }
    if (!rows.length) { (allSteps.length ? skipped.noMatch++ : skipped.noSteps++); continue; }

    // A session that CHANGED MODELS mid-flight is not a clean sample of this model:
    // its steps may have run against a different server/config, and the turns around
    // them belong to another model's conversation. Held out by default — the same
    // call the Runs tab makes when it pulls mixed sessions into the Mix drawer.
    // Only meaningful with a model filter: with --all there is no "the model".
    if (!includeMixed && needle && isMixed(s)) {
      skipped.mixed++;
      skipped.mixedSteps += rows.length;
      skipped.mixedDays.add(s.date);
      continue;
    }

    if (usedApprox) skipped.approx++;
    steps.push(...rows);

    const R = rows.filter(hasDecode);
    const tok = sum(R, (r) => r.out), ms = sum(R, (r) => r.decMs);
    sessions.push({
      day: s.date,
      sid: s.id,
      title: (s.title || "").trim(),
      cwd: s.cwd || "",
      p2p: !!s.p2p,
      archived: !!s.archived,
      compactions: s.compactions || 0,
      t0: s.createdAt || null,
      hour: s.createdAt ? String(new Date(s.createdAt).getHours()).padStart(2, "0") : "",
      time: s.createdAt ? new Date(s.createdAt).toTimeString().slice(0, 5) : "",
      steps: rows.length,
      allSteps: allSteps.length,
      approx: usedApprox,
      decode: ms > 0 ? tok / (ms / 1000) : null,
      ctx: rows.length ? sum(rows, (r) => r.ctx) / rows.length : null,
      out: sum(rows, (r) => r.out),
      fastPct: fastShare(rows, 60) == null ? null : fastShare(rows, 60) * 100,
    });
  }

  const days = [...new Set(steps.map((r) => r.day))].sort();
  const topLocal = [...localModels.entries()].sort((a, b) => b[1] - a[1])[0] || null;
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      model: all ? "*" : model,
      all,
      since: since || null,
      until: until || null,
      exclude,
      days,
      steps: steps.length,
      sessions: sessions.length,
      measuredSteps: steps.filter((r) => !r.approx).length,
      approxSessions: skipped.approx,
      includeMixed,
      skipped: { ...skipped, mixedDays: [...skipped.mixedDays].sort() },
      topLocalModel: topLocal ? { key: topLocal[0], steps: topLocal[1] } : null,
      sources: bd.sources || null,
    },
    steps,
    sessions,
  };
}

// ── rendering helpers shared by the CLIs ────────────────────────────────────
export const fmtInt = (n) => (n == null || !Number.isFinite(n) ? "—" : Math.round(n).toLocaleString("en-US"));
export const fmtC = (n) =>
  n == null || !Number.isFinite(n) ? "—" : n < 1e4 ? String(Math.round(n)) : n < 1e6 ? (n / 1e3).toFixed(1) + "K" : (n / 1e6).toFixed(1) + "M";
export const fmt1 = (n) => (n == null || !Number.isFinite(n) ? "—" : n.toFixed(1));
export const fmtPct = (n, d = 1) => (n == null || !Number.isFinite(n) ? "—" : n.toFixed(d) + "%");
export const plus = (n) => (n == null ? "—" : (n >= 0 ? "+" : "") + n.toFixed(1) + "%");
export const pad = (s, n) => String(s == null ? "—" : s).padEnd(n);
export const padL = (s, n) => String(s == null ? "—" : s).padStart(n);
export const rule = (n = 100) => "─".repeat(n);

/** 95 % CI as "lo..hi" in percent, or "—" when it could not be bootstrapped. */
export function ciStr(ci) {
  if (!ci || ci.lo == null) return ci && ci.reason ? "(" + ci.reason + ")" : "—";
  const f = ci.mode === "pp" ? (v) => (v >= 0 ? "+" : "") + v.toFixed(1) + "pp" : plus;
  return `${f(ci.lo)} .. ${f(ci.hi)}${ci.p != null && ci.p < 0.05 ? " *" : ""}`;
}

/**
 * The matched-band table: for each band, the focus group's statistic against the
 * rest, with the session-clustered CI on the delta. Bands with too few steps on
 * either side are printed as gaps rather than as a number.
 */
export function matchedTable({ title, focusLabel, restLabel, focus, rest, bands, keyFn, statFn, statLabel, minSteps = 3, B = 400, seed = 42, mode = "rel" }) {
  const lines = [];
  lines.push(title);
  lines.push(pad("BAND", 12) + padL(focusLabel, 16) + padL(restLabel, 16) + padL("DELTA", 10) + "   95% CI (session bootstrap)");
  for (const [lo, hi, label] of bands) {
    const inBand = (r) => { const v = keyFn(r); return v != null && v >= lo && v < hi; };
    const F = focus.filter(inBand);
    const R = rest.filter(inBand);
    const fCell = F.length ? `${fmt1(statFn(F))} (${F.length})` : "—";
    const rCell = R.length ? `${fmt1(statFn(R))} (${R.length})` : "—";
    if (F.length < minSteps || R.length < minSteps) {
      lines.push(pad(label, 12) + padL(fCell, 16) + padL(rCell, 16) + padL("—", 10) + "   too few steps on one side");
      continue;
    }
    const ci = bootstrapDelta(F, R, statFn, { B, seed, mode });
    lines.push(pad(label, 12) + padL(fCell, 16) + padL(rCell, 16) + padL(plus(ci.value), 10) + "   " + ciStr(ci));
  }
  lines.push("  " + statLabel);
  return lines.join("\n");
}

/** The daily (or per-source) rollup table. */
export function dailyTable(groups, { fast = 60, label = "DATE" } = {}) {
  const head = [label, "SESS", "STEPS", "DECODE", "p50", "p90", "TTFT p50", "TTFT p90", "PREFILL", "OUT", "OUT/step", "CTX p50", "CTX p90", "CACHE", "THINK", `>${fast}`, "FAST%"];
  const out = [head.map((h, i) => (i === 0 ? pad(h, 14) : padL(h, 9))).join("")];
  for (const [name, rows] of groups) {
    const s = rollup(rows, { fast });
    out.push([
      pad(name, 14), padL(s.sessions, 9), padL(s.steps, 9), padL(fmt1(s.decode), 9), padL(fmt1(s.decodeP50), 9), padL(fmt1(s.decodeP90), 9),
      padL(s.ttftP50 == null ? "—" : Math.round(s.ttftP50) + "ms", 9), padL(s.ttftP90 == null ? "—" : Math.round(s.ttftP90) + "ms", 9),
      padL(s.prefill == null ? "—" : Math.round(s.prefill), 9), padL(fmtC(s.out), 9), padL(fmt1(s.outPerStep), 9),
      padL(fmtC(s.ctxP50), 9), padL(fmtC(s.ctxP90), 9), padL(fmtPct(s.cachePct, 1), 9), padL(fmtPct(s.thinkPct, 1), 9),
      padL(s.fastShare == null ? "—" : Math.round(s.fastShare * s.steps), 9), padL(s.fastShare == null ? "—" : fmtPct(s.fastShare * 100, 0), 9),
    ].join(""));
  }
  return out.join("\n");
}

/** Group step rows by an arbitrary key, preserving first-seen order (then sorted if asked). */
export function groupRows(rows, keyFn, { sort = true } = {}) {
  const m = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (k == null) continue;
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  const entries = [...m.entries()];
  return sort ? entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)) : entries;
}

export { localDate, kindFor };
