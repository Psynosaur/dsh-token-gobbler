#!/usr/bin/env node
// token-gobbler · scripts/day-compare.js
//
// Day-over-day performance comparison for ONE model's own LLM steps — built to
// answer "are today's runs different from the other days, or is that just the
// workload?" without being fooled by context length, output length or reasoning
// volume.
//
//   node scripts/day-compare.js                          # model ≈ davidau, every day
//   node scripts/day-compare.js --vs 2026-09-10           # focus a specific day
//   node scripts/day-compare.js --model qwen3.8           # any model-id substring
//   node scripts/day-compare.js --model auto              # the busiest LOCAL model
//   node scripts/day-compare.js --all                     # every model in the corpus
//   node scripts/day-compare.js --since 2026-09-01 --until 2026-09-10
//   node scripts/day-compare.js --exclude "analyser,p2p report"   # drop meta sessions
//   node scripts/day-compare.js --sessions --top 30       # per-session table
//   node scripts/day-compare.js --fast 60 --band 32-64 --out-band 100-400
//   node scripts/day-compare.js --json                    # machine-readable
//   node scripts/day-compare.js --dsh-home /path/to/.dsh
//
// READ THIS BEFORE TRUSTING A NUMBER
//  * Every aggregate is TIME-WEIGHTED (Σ tokens ÷ Σ ms), never a mean of per-step
//    rates — one 3 ms step must not outvote a 30 s session.
//  * The matched tables re-ask the same question inside narrow slices (context
//    band / output size / reasoning share) so a workload shift cannot masquerade
//    as a speed change.
//  * The CI is a SESSION-clustered bootstrap: steps inside one session are not
//    independent samples, so each session counts as one draw. "insufficient"
//    means the band had too few steps on one side — it is a gap, not a zero.
//  * A `*` next to the CI means the bootstrap delta did not cross zero.
//  * Sessions that carry no per-step usage are folded in from their per-model
//    rollup and counted separately (`approx`), so they never look measured.
//  * Sessions that SWITCHED MODELS mid-flight are HELD OUT by default — the steps
//    attributed to this model in a mixed session may have run against a different
//    server/config, and the conversation around them belongs to another model.
//    The Runs tab makes the same call for its "Mix" drawer. --include-mixed keeps
//    them (the held-out count is always printed, so the corpus size stays honest).
//
// Runs anywhere Node >= 24 runs, macOS included: pure ESM, no dependencies, no
// external `zstd` binary, no build step. Needs this repo's lib/*.js + package.json.

import { assertNode } from "./runtime.js";

// Fail on a too-old Node BEFORE anything loads the zstd-dependent report pipeline.
assertNode();
const {
  CTX_BANDS, OUT_BANDS, THINK_BANDS,
  collect, groupRows, rollup, matchedTable, dailyTable, bootstrapDelta,
  wDecode, wPrefill, fastShare, quantile,
  fmtInt, fmt1, fmtPct, plus, pad, padL, rule, ciStr,
} = await import("./census.js");

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const num = (f, d) => { const v = parseFloat(val(f, "")); return Number.isFinite(v) ? v : d; };

if (has("--help") || has("-h")) {
  console.log(`
🦃 day-compare — day-over-day performance for one model's own steps

MODEL SELECTION
  --model <substr>     model-id substring to match           (default "davidau")
  --model auto         pick the busiest LOCAL (home-lab) model in the corpus
  --all                ignore --model and use every step
  --since YYYY-MM-DD   inclusive lower day bound
  --until YYYY-MM-DD   inclusive upper day bound
  --exclude "a,b"      drop sessions whose title/id contains a or b
  --include-mixed      KEEP sessions that switched models (they are held out by
                       default: a session that changed models mid-flight is not a
                       clean sample of this model — the Runs tab holds them out too)

COMPARISON
  --vs YYYY-MM-DD      focus day                              (default: the latest day)
  --fast <n>           "fast step" threshold in tok/s          (default 60)
  --band <lo-hi>       clean-subset context band, in K tokens  (default 32-64)
  --out-band <lo-hi>   clean-subset output-token band          (default 100-400)
  --think <lo-hi>      reasoning-share band, in percent        (default 20-60)
  --boot <n>           bootstrap resamples                     (default 400)
  --min-steps <n>      minimum steps per side of a band        (default 3)

OUTPUT
  --sessions           per-session table
  --top <n>            cap the per-session table               (default 40)
  --json               machine-readable dump instead of tables
  --no-approx          ignore sessions that only have a rollup (no per-step usage)
  --dsh-home <dir>     override ~/.dsh
`);
  process.exit(0);
}

const modelArg = val("--model", "davidau");
const all = has("--all");
const since = val("--since", "");
const until = val("--until", "");
const exclude = val("--exclude", "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const dshHome = val("--dsh-home", "");
const json = has("--json");
const wantSessions = has("--sessions");
const top = parseInt(val("--top", "40"), 10) || 40;
const fast = num("--fast", 60);
const B = Math.max(20, parseInt(val("--boot", "400"), 10) || 400);
const minSteps = Math.max(2, parseInt(val("--min-steps", "3"), 10) || 3);

/** "32-64" → [32000, 64000] in tokens; a bare "32" means 32K..∞. */
function bandK(flag, dflt) {
  const raw = val(flag, "");
  if (!raw) return dflt;
  const m = String(raw).trim().match(/^([\d.]+)\s*[Kk]?\s*(?:-\s*([\d.]+)\s*[Kk]?)?$/);
  if (!m) return dflt;
  const lo = parseFloat(m[1]) * 1000;
  const hi = m[2] ? parseFloat(m[2]) * 1000 : Infinity;
  return Number.isFinite(lo) ? [lo, hi] : dflt;
}
/** "100-400" → [100, 400] raw counts; a bare "100" means 100..∞. */
function bandAbs(flag, dflt) {
  const raw = val(flag, "");
  if (!raw) return dflt;
  const m = String(raw).trim().match(/^([\d.]+)\s*(?:-\s*([\d.]+))?$/);
  if (!m) return dflt;
  const lo = parseFloat(m[1]);
  const hi = m[2] ? parseFloat(m[2]) : Infinity;
  return Number.isFinite(lo) ? [lo, hi] : dflt;
}

const [bandLo, bandHi] = bandK("--band", [32e3, 64e3]);
const [outLo, outHi] = bandAbs("--out-band", [100, 400]);
const [thinkLo, thinkHi] = bandAbs("--think", [20, 60]).map((v) => v / 100);

// ── collect ─────────────────────────────────────────────────────────────────
let useModel = modelArg;
if (!all && String(modelArg).toLowerCase() === "auto") {
  const probe = collect({ model: "", all: true, since, until, exclude, dshHome, approx: false });
  const top1 = probe.meta.topLocalModel;
  if (!top1) {
    console.error("day-compare: no local (home-lab) model found in this corpus. Pass --model <substr> or --all.");
    process.exit(2);
  }
  useModel = top1.key;
}

const includeMixed = has("--include-mixed");
const { meta, steps, sessions } = collect({ model: useModel, all, since, until, exclude, dshHome, approx: !has("--no-approx"), includeMixed });

if (!steps.length) {
  console.error(`day-compare: no steps matched (model ≈ ${all ? "*" : useModel}).`);
  if (meta.topLocalModel) console.error(`  busiest local model in this corpus: ${meta.topLocalModel.key} (${fmtInt(meta.topLocalModel.steps)} steps) — try --model auto`);
  console.error("  a corpus of cloud-API sessions has no per-step timings to compare; try --all to see what is there.");
  process.exit(3);
}

const days = meta.days;
const focusDay = val("--vs", days[days.length - 1]);
const byDay = groupRows(steps, (r) => r.day);
const focus = steps.filter((r) => r.day === focusDay);
const rest = steps.filter((r) => r.day !== focusDay);

// ── sections ────────────────────────────────────────────────────────────────
const out = [];
out.push("");
out.push("  🦃 DAY COMPARE — " + (all ? "every model" : "model ≈ " + useModel));
out.push(rule(112));
out.push("  corpus        : " + fmtInt(meta.sessions) + " sessions · " + fmtInt(meta.steps) + " steps · " +
  (days.length) + (days.length === 1 ? " day" : " days") + (days.length ? "  (" + days[0] + " → " + days[days.length - 1] + ")" : ""));
out.push("  measured steps: " + fmtInt(meta.measuredSteps) + (meta.approxSessions ? "  (+" + meta.approxSessions + " sessions via per-model rollup, not per-step)" : ""));
if (meta.skipped.mixed) {
  out.push("  held out      : " + meta.skipped.mixed + " session(s) · " + fmtInt(meta.skipped.mixedSteps) + " steps — SWITCHED MODELS mid-session (" +
    meta.skipped.mixedDays.join(", ") + "); not a clean sample of this model. --include-mixed keeps them.");
}
if (meta.skipped.noSteps) out.push("  note          : " + meta.skipped.noSteps + " session(s) had no usable per-step usage and were skipped");
out.push("  focus day     : " + focusDay + "  (" + fmtInt(focus.length) + " steps vs " + fmtInt(rest.length) + " on every other day)");
out.push("");

out.push("  DAILY ROLLUP — this model's steps only, time-weighted");
out.push(rule(112));
out.push(dailyTable(byDay, { fast }));
out.push("");

out.push("  FOCUS DAY " + focusDay + " vs ALL OTHER DAYS — matched slices");
out.push(rule(112));
out.push(matchedTable({
  title: "  by CONTEXT band (tokens in the prompt)",
  focusLabel: focusDay, restLabel: "other days",
  focus, rest, bands: CTX_BANDS, keyFn: (r) => r.ctx, statFn: wDecode, statLabel: "decode tok/s (time-weighted) — context is the strongest confound",
  minSteps, B,
}));
out.push("");
out.push(matchedTable({
  title: "  by OUTPUT size (tokens generated in the step)",
  focusLabel: focusDay, restLabel: "other days",
  focus, rest, bands: OUT_BANDS, keyFn: (r) => r.out, statFn: wDecode, statLabel: "decode tok/s (time-weighted) — short steps carry more per-step overhead",
  minSteps, B,
}));
out.push("");
out.push(matchedTable({
  title: "  by REASONING share (thinking tokens ÷ output)",
  focusLabel: focusDay, restLabel: "other days",
  focus, rest, bands: THINK_BANDS, keyFn: (r) => (r.out > 0 ? r.think / r.out : null), statFn: wDecode,
  statLabel: "decode tok/s (time-weighted) — rules out \"it just reasoned less today\"", minSteps, B,
}));
out.push("");

// ── clean subset: both the context and the output band at once ──────────────
const inClean = (r) => r.ctx >= bandLo && r.ctx < bandHi && r.out >= outLo && r.out < outHi;
const cleanF = focus.filter(inClean), cleanR = rest.filter(inClean);
const cleanLabel = `${bandLo / 1000}-${Number.isFinite(bandHi) ? bandHi / 1000 : "∞"}K ctx, ${outLo}-${Number.isFinite(outHi) ? outHi : "∞"} out`;
out.push("  CLEAN SUBSET — " + cleanLabel + " (both bands at once)");
out.push(rule(112));
const cleanStats = [
  ["decode tok/s", wDecode, "rel"],
  ["prefill tok/s", wPrefill, "rel"],
  ["fast steps", (R) => (fastShare(R, fast) == null ? null : fastShare(R, fast) * 100), "pp"],
];
for (const [label, statFn, mode] of cleanStats) {
  if (cleanF.length < minSteps || cleanR.length < minSteps) { out.push("  " + pad(label, 24) + "insufficient steps in this band"); continue; }
  const ci = bootstrapDelta(cleanF, cleanR, statFn, { B, mode });
  const unit = mode === "pp" ? "pp" : "";
  out.push("  " + pad(label, 24) + padL(fmt1(statFn(cleanF)) + unit, 12) + "  vs " + padL(fmt1(statFn(cleanR)) + unit, 12) +
    "   " + padL(mode === "pp" ? (ci.value >= 0 ? "+" : "") + fmt1(ci.value) + "pp" : plus(ci.value), 9) +
    "   95% CI " + ciStr(ci) +
    "   (n=" + cleanF.length + "/" + cleanR.length + ", " + new Set(cleanF.map((r) => r.sid)).size + "/" + new Set(cleanR.map((r) => r.sid)).size + " sessions)");
}

// ── one more slice: matched on the requested reasoning band ─────────────────
const inThink = (r) => r.out > 0 && r.think / r.out >= thinkLo && r.think / r.out < thinkHi;
const thinkF = focus.filter(inThink), thinkR = rest.filter(inThink);
out.push("  REASONING-MATCHED — steps whose thinking share is " + Math.round(thinkLo * 100) + "-" +
  (Number.isFinite(thinkHi) ? Math.round(thinkHi * 100) : "∞") + "% of their output (--think)");
out.push(rule(112));
if (thinkF.length < minSteps || thinkR.length < minSteps) {
  out.push("  too few steps in this band (" + thinkF.length + " focus / " + thinkR.length + " rest)");
} else {
  const ciT = bootstrapDelta(thinkF, thinkR, wDecode, { B });
  out.push("  decode tok/s            " + padL(fmt1(wDecode(thinkF)), 12) + "  vs " + padL(fmt1(wDecode(thinkR)), 12) +
    "   " + padL(plus(ciT.value), 9) + "   95% CI " + ciStr(ciT) +
    "   (n=" + thinkF.length + "/" + thinkR.length + ", " + new Set(thinkF.map((r) => r.sid)).size + "/" + new Set(thinkR.map((r) => r.sid)).size + " sessions)");
}
out.push("");

// ── the fast regime ─────────────────────────────────────────────────────────
out.push("  FAST REGIME — share of steps above " + fast + " tok/s");
out.push(rule(112));
out.push("  " + pad("day", 14) + CTX_BANDS.map(([, , l]) => padL(l, 12)).join("") + padL("ALL", 12));
for (const [day, rows] of byDay) {
  const cells = CTX_BANDS.map(([lo, hi]) => {
    const R = rows.filter((r) => r.ctx >= lo && r.ctx < hi);
    const s = fastShare(R, fast);
    return s == null ? "—" : fmtPct(s * 100, 0) + " (" + R.length + ")";
  });
  const allS = fastShare(rows, fast);
  out.push("  " + pad(day, 14) + cells.map((c) => padL(c, 12)).join("") + padL(allS == null ? "—" : fmtPct(allS * 100, 0), 12));
}
out.push("  A day where the fast regime is normal (not one lucky session) shows a high share in EVERY column.");
out.push("");

// ── P2P split (heuristic flag — see the caveat) ─────────────────────────────
out.push("  P2P EVIDENCE — trajectory text mentions, NOT the server's actual config");
out.push(rule(112));
out.push("  " + pad("day", 14) + padL("p2p steps", 11) + padL("decode", 9) + padL("ctx p50", 10) + padL("no-p2p", 10) + padL("decode", 9) + padL("ctx p50", 10));
for (const [day, rows] of byDay) {
  const cell = (R) => (R.length ? [fmt1(wDecode(R)), R.length, fmtC0(quantile(R.map((r) => r.ctx), 0.5))] : ["—", 0, "—"]);
  const [d1, n1, c1] = cell(rows.filter((r) => r.p2p));
  const [d2, n2, c2] = cell(rows.filter((r) => !r.p2p));
  out.push("  " + pad(day, 14) + padL(n1, 11) + padL(d1, 9) + padL(c1, 10) + padL(n2, 10) + padL(d2, 9) + padL(c2, 10));
}
out.push("  The flag is affirmative P2P-enablement EVIDENCE IN THE TRAJECTORY. A session about P2P");
out.push("  trips it by construction, so a day spent editing P2P code reads as 100% P2P. Treat it as");
out.push("  a pointer, never as proof of the serving config. See scripts/p2p-report.js.");
out.push("");

// ── per-session ─────────────────────────────────────────────────────────────
if (wantSessions) {
  const rows = [...sessions].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : (a.t0 || 0) - (b.t0 || 0)));
  const shown = rows.slice(-top);
  out.push("  PER-SESSION (this model's steps only" + (rows.length > shown.length ? ", last " + shown.length + " of " + rows.length : "") + ")");
  out.push(rule(112));
  out.push("  " + [pad("DATE", 12), pad("TIME", 6), pad("SID", 9), padL("DAV/ALL", 9), padL("DECODE", 8), padL("FAST%", 7), padL("AVGCTX", 9), padL("OUT", 9), padL("P2P", 5), padL("CMP", 4)].join("") + "  TITLE");
  for (const s of shown) {
    out.push("  " + [pad(s.day, 12), pad(s.time || "—", 6), pad(s.sid.slice(-8), 9),
      padL(s.steps + (s.approx ? "~" : "") + "/" + s.allSteps, 9), padL(fmt1(s.decode), 8),
      padL(s.fastPct == null ? "—" : Math.round(s.fastPct) + "%", 7), padL(fmtC0(s.ctx), 9), padL(fmtC0(s.out), 9),
      padL(s.p2p ? "●" : "·", 5), padL(s.compactions || "", 4)].join("") + "  " + (s.title || s.cwd || "").slice(0, 38));
  }
  out.push("  FAST% = share of that session's steps above " + fast + " tok/s. A ~ after DAV/ALL marks a");
  out.push("  session folded in from its per-model rollup (no per-step usage).");
  out.push("");
}

function fmtC0(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n < 1e4 ? String(Math.round(n)) : n < 1e6 ? (n / 1e3).toFixed(0) + "K" : (n / 1e6).toFixed(1) + "M";
}

// ── JSON ────────────────────────────────────────────────────────────────────
if (json) {
  const dayJson = {};
  for (const [day, rows] of byDay) dayJson[day] = { ...rollup(rows, { fast }), sessRows: null };
  const summary = (rows) => {
    const s = rollup(rows, { fast });
    return {
      ...s,
      sessionsListed: new Set(rows.map((r) => r.sid)).size,
    };
  };
  const stat = (rows, fn) => fn(rows);
  const m = (F, R, fn) => {
    const ci = F.length >= minSteps && R.length >= minSteps ? bootstrapDelta(F, R, fn, { B }) : null;
    return { focus: fn(F), rest: fn(R), deltaPct: ci ? ci.value : null, ci };
  };
  console.log(JSON.stringify({
    meta: { ...meta, focusDay, fast, clean: { ctx: [bandLo, bandHi], out: [outLo, outHi], think: [thinkLo * 100, thinkHi * 100] }, boot: B },
    days: dayJson,
    focus: summary(focus),
    rest: summary(rest),
    matched: {
      byContext: { bands: CTX_BANDS, decode: CTX_BANDS.map(([lo, hi, label]) => ({ label, ...m(focus.filter((r) => r.ctx >= lo && r.ctx < hi), rest.filter((r) => r.ctx >= lo && r.ctx < hi), wDecode) })) },
      byOutput: { bands: OUT_BANDS, decode: OUT_BANDS.map(([lo, hi, label]) => ({ label, ...m(focus.filter((r) => r.out >= lo && r.out < hi), rest.filter((r) => r.out >= lo && r.out < hi), wDecode) })) },
      byReasoning: { bands: THINK_BANDS, decode: THINK_BANDS.map(([lo, hi, label]) => ({ label, ...m(focus.filter((r) => r.out > 0 && r.think / r.out >= lo && r.think / r.out < hi), rest.filter((r) => r.out > 0 && r.think / r.out >= lo && r.think / r.out < hi), wDecode) })) },
    },
    reasoningMatched: { band: [thinkLo * 100, thinkHi * 100], decode: m(thinkF, thinkR, wDecode) },
    clean: {
      label: cleanLabel,
      decode: m(cleanF, cleanR, wDecode),
      prefill: m(cleanF, cleanR, wPrefill),
      fastShare: m(cleanF, cleanR, (R) => (fastShare(R, fast) == null ? null : fastShare(R, fast) * 100)),
    },
    sessions: sessions.map((s) => ({ ...s, title: s.title, cwd: undefined })),
  }, null, 1));
} else {
  console.log(out.join("\n"));
}
