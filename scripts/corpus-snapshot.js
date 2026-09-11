#!/usr/bin/env node
// token-gobbler · scripts/corpus-snapshot.js
//
// Export one machine's corpus as a compact snapshot, then pool/compare snapshots
// from several machines — the way to put a laptop's much larger session history
// next to the home-lab box's and ask the SAME question of all of it at once:
//
//   node scripts/corpus-snapshot.js --out box.json                 # on the box
//   node scripts/corpus-snapshot.js --out mac.json                 # on the mac
//   node scripts/corpus-snapshot.js --compare box.json mac.json    # pooled + per host
//   node scripts/corpus-snapshot.js --out - > box.json             # to stdout
//   node scripts/corpus-snapshot.js --compare a.json --focus 2026-09-10
//
// A snapshot is COLUMNAR JSON (a header + numeric arrays) so a 100k-step corpus
// stays a couple of MB and parses in one pass. It stores the same step fields
// day-compare.js analyses, so a pooled comparison runs the identical maths.
//
// WHAT POOLING DOES AND DOES NOT GIVE YOU
//  * More days on one machine = more evidence for "today differs from the rest".
//    That is the strongest use: run day-compare.js per machine, then pool the
//    snapshots to see whether the direction and size hold across both.
//  * Sessions are namespaced per host and stay the bootstrap cluster, so pooling
//    two machines cannot fake precision by pretending 2 hosts = 1 big sample.
//  * Hosts are different hardware. A day that mixes hosts is labelled `2 hosts`
//    in the pooled table — do not read a pooled day as one configuration.
//
// Reads ~/.dsh by default; --dsh-home overrides. Pure ESM, no dependencies.

import { writeFileSync, readFileSync } from "node:fs";
import { hostname, platform, arch, release } from "node:os";
import { assertNode } from "./runtime.js";

// Fail on a too-old Node BEFORE anything loads the zstd-dependent report pipeline.
assertNode();
const {
  CTX_BANDS, collect, groupRows, rollup, matchedTable, dailyTable, bootstrapDelta,
  wDecode, fastShare, quantile,
  fmtInt, fmt1, fmtPct, plus, pad, padL, rule, ciStr,
} = await import("./census.js");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const listAfter = (f) => { const i = argv.indexOf(f); if (i < 0) return []; const out = []; for (let j = i + 1; j < argv.length && !argv[j].startsWith("--"); j++) out.push(argv[j]); return out; };

if (has("--help") || has("-h")) {
  console.log(`
🦃 corpus-snapshot — carry a corpus between machines and pool it

EXPORT
  --out <file|->       write this machine's snapshot ("-" = stdout)
  --label <name>       host label to embed                 (default: hostname)
  --model <substr>     model-id filter                      (default "davidau")
  --model auto         the busiest LOCAL model in the corpus
  --all                snapshot every model in the corpus
  --include-mixed      keep sessions that switched models (held out by default)
  --since/--until      inclusive day bounds
  --exclude "a,b"      drop sessions whose title/id contains a or b
  --dsh-home <dir>     override ~/.dsh

COMPARE
  --compare <files...> pool + compare snapshots
  --focus YYYY-MM-DD   focus day                            (default: latest in the pool)
  --fast <n>           "fast step" threshold in tok/s        (default 60)
  --boot <n>           bootstrap resamples                   (default 400)
  --min-steps <n>      minimum steps per side of a band      (default 3)
  --json               machine-readable result
`);
  process.exit(0);
}

const FORMAT = "token-gobbler-corpus/1";
const fast = parseFloat(val("--fast", "60")) || 60;
const B = Math.max(20, parseInt(val("--boot", "400"), 10) || 400);
const minSteps = Math.max(2, parseInt(val("--min-steps", "3"), 10) || 3);
const json = has("--json");

// ── export ──────────────────────────────────────────────────────────────────
const COLS = ["day", "sid", "hour", "out", "in", "cache", "think", "ctx", "dec", "ttft", "pref", "regime", "tools", "p2p", "approx"];

function encodeRows(steps, hostLabel) {
  return steps.map((r) => [
    r.day,
    r.sid,
    r.hour ?? "",
    r.out,
    r.in,
    r.cache,
    r.think,
    Math.round(r.ctx || 0),
    r.dec == null ? null : Math.round(r.dec * 100) / 100,
    Math.round(r.ttft || 0),
    r.pref == null ? null : Math.round(r.pref * 10) / 10,
    r.regime || 0,
    r.tools || 0,
    r.p2p ? 1 : 0,
    r.approx ? 1 : 0,
  ]);
}

function decodeRows(cols, rows, hostLabel) {
  const ix = Object.fromEntries(cols.map((c, i) => [c, i]));
  return rows.map((r) => {
    const out = r[ix.out] || 0;
    const dec = r[ix.dec];
    return {
      day: r[ix.day],
      // Namespace the session id per host so clusters never merge across machines.
      sid: hostLabel + ":" + r[ix.sid],
      rawSid: r[ix.sid],
      host: hostLabel,
      hour: r[ix.hour] || "",
      out,
      in: r[ix.in] || 0,
      cache: r[ix.cache] || 0,
      think: r[ix.think] || 0,
      ctx: r[ix.ctx] || 0,
      dec,
      decMs: dec && out > 0 ? (out / dec) * 1000 : null,
      ttft: r[ix.ttft] || 0,
      pref: r[ix.pref],
      regime: r[ix.regime] || 0,
      tools: r[ix.tools] || 0,
      p2p: !!r[ix.p2p],
      approx: !!r[ix.approx],
    };
  });
}

const outFile = val("--out", "");
if (outFile) {
  const modelArg = val("--model", "davidau");
  let useModel = modelArg;
  const all = has("--all");
  if (!all && String(modelArg).toLowerCase() === "auto") {
    const probe = collect({ model: "", all: true, approx: false });
    if (!probe.meta.topLocalModel) { console.error("corpus-snapshot: no local model found; pass --model <substr> or --all"); process.exit(2); }
    useModel = probe.meta.topLocalModel.key;
  }
  const { meta, steps } = collect({
    model: useModel, all,
    since: val("--since", ""), until: val("--until", ""),
    exclude: val("--exclude", "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    dshHome: val("--dsh-home", ""),
    includeMixed: has("--include-mixed"),
  });
  const label = val("--label", hostname() || "unknown");
  const snap = {
    format: FORMAT,
    label,
    generatedAt: new Date().toISOString(),
    host: { platform: platform(), arch: arch(), kernel: release(), node: process.version, hostname: hostname() },
    model: all ? "*" : useModel,
    includeMixed: has("--include-mixed"),
    meta: { days: meta.days, steps: meta.steps, sessions: meta.sessions, measuredSteps: meta.measuredSteps, skipped: meta.skipped },
    cols: COLS,
    rows: encodeRows(steps, label),
  };
  const text = JSON.stringify(snap);
  if (outFile === "-") console.log(text);
  else {
    writeFileSync(outFile, text);
    console.error(`corpus-snapshot: wrote ${outFile} — ${label} · model ≈ ${snap.model} · ${fmtInt(meta.sessions)} sessions · ${fmtInt(meta.steps)} steps · ${meta.days.length} days`);
  }
  if (!has("--compare")) process.exit(0);
}

// ── compare ─────────────────────────────────────────────────────────────────
const files = listAfter("--compare");
if (!files.length) {
  console.error("corpus-snapshot: pass --out <file> to export, or --compare <files...> to pool snapshots. See --help.");
  process.exit(1);
}

const sources = [];
for (const f of files) {
  let snap;
  try { snap = JSON.parse(readFileSync(f, "utf8")); } catch (e) { console.error(`corpus-snapshot: cannot read ${f}: ${e.message}`); process.exit(1); }
  if (snap.format !== FORMAT) { console.error(`corpus-snapshot: ${f} is not a ${FORMAT} snapshot`); process.exit(1); }
  const label = snap.label || f.replace(/\.json$/, "");
  sources.push({ file: f, label, model: snap.model, meta: snap.meta, host: snap.host, rows: decodeRows(snap.cols, snap.rows, label) });
}

const pooled = sources.flatMap((s) => s.rows);
const days = [...new Set(pooled.map((r) => r.day))].sort();
const focusDay = val("--focus", days[days.length - 1]);
const focus = pooled.filter((r) => r.day === focusDay);
const rest = pooled.filter((r) => r.day !== focusDay);

if (json) {
  const summary = (rows) => rollup(rows, { fast });
  console.log(JSON.stringify({
    format: FORMAT,
    focusDay,
    fast,
    sources: sources.map((s) => ({ file: s.file, label: s.label, model: s.model, host: s.host, meta: s.meta, stats: summary(s.rows) })),
    pooled: { days, stats: summary(pooled) },
    focus: summary(focus),
    rest: summary(rest),
  }, null, 1));
  process.exit(0);
}

const o = [];
o.push("");
o.push("  🦃 CORPUS POOL — " + sources.length + " snapshot(s)");
o.push(rule(112));
o.push("  pool   : " + fmtInt(new Set(pooled.map((r) => r.sid)).size) + " sessions · " + fmtInt(pooled.length) + " steps · " +
  days.length + " days  (" + days[0] + " → " + days[days.length - 1] + ")");
for (const s of sources) {
  const st = rollup(s.rows, { fast });
  o.push("  source : " + pad(s.label, 18) + padL(s.model, 22) + padL(fmtInt(st.sessions) + " sess", 12) + padL(fmtInt(st.steps) + " steps", 13) +
    padL((s.meta?.days?.length ?? "?") + " days", 9) + padL(fmt1(st.decode), 9) + padL(st.fastShare == null ? "—" : fmtPct(st.fastShare * 100, 0), 8) + "   " + s.file);
}
o.push("");

// Pooled daily rollup — days are calendar days, so two hosts that ran on the same
// date land on one row. Flag those, because a mixed-host row is not one config.
const byDay = groupRows(pooled, (r) => r.day);
const hostsByDay = new Map(byDay.map(([d, rows]) => [d, new Set(rows.map((r) => r.host)).size]));
o.push("  POOLED DAILY ROLLUP — time-weighted, every day in every snapshot");
o.push(rule(112));
o.push(dailyTable(byDay, { fast }));
const shared = [...hostsByDay.entries()].filter(([, n]) => n > 1).map(([d]) => d);
if (shared.length) o.push("  ⚠ " + shared.join(", ") + " contain runs from MORE THAN ONE host — a pooled day is not one configuration.");
o.push("");

o.push("  FOCUS DAY " + focusDay + " vs ALL OTHER DAYS — pooled, matched on context");
o.push(rule(112));
o.push(matchedTable({
  title: "  pooled across " + sources.length + " host(s)",
  focusLabel: focusDay, restLabel: "other days",
  focus, rest, bands: CTX_BANDS, keyFn: (r) => r.ctx, statFn: wDecode,
  statLabel: "decode tok/s (time-weighted); CI is a session-clustered bootstrap, so 2 hosts never look like 1 big sample",
  minSteps, B,
}));
o.push("");

o.push("  SAME QUESTION, PER HOST — does the direction hold on each machine on its own?");
o.push(rule(112));
o.push("  " + pad("host", 18) + pad("band", 10) + padL(focusDay, 14) + padL("other days", 14) + padL("DELTA", 10) + "   95% CI");
for (const s of sources) {
  const f = s.rows.filter((r) => r.day === focusDay);
  const rr = s.rows.filter((r) => r.day !== focusDay);
  if (!f.length || !rr.length) {
    o.push("  " + pad(s.label, 18) + pad("all", 10) + padL(f.length ? fmt1(wDecode(f)) : "—", 14) + padL(rr.length ? fmt1(wDecode(rr)) : "—", 14) + "   no " + (f.length ? "rest" : "focus-day") + " data on this host");
    continue;
  }
  for (const [lo, hi, label] of CTX_BANDS) {
    const F = f.filter((r) => r.ctx >= lo && r.ctx < hi);
    const R = rr.filter((r) => r.ctx >= lo && r.ctx < hi);
    if (F.length < minSteps || R.length < minSteps) continue;
    const ci = bootstrapDelta(F, R, wDecode, { B });
    o.push("  " + pad(s.label, 18) + pad(label, 10) + padL(fmt1(wDecode(F)) + " (" + F.length + ")", 14) +
      padL(fmt1(wDecode(R)) + " (" + R.length + ")", 14) + padL(plus(ci.value), 10) + "   " + ciStr(ci));
  }
  const ciAll = bootstrapDelta(f, rr, wDecode, { B });
  o.push("  " + pad(s.label, 18) + pad("ALL", 10) + padL(fmt1(wDecode(f)) + " (" + f.length + ")", 14) +
    padL(fmt1(wDecode(rr)) + " (" + rr.length + ")", 14) + padL(plus(ciAll.value), 10) + "   " + ciStr(ciAll));
  o.push("");
}
o.push("  A conclusion worth carrying between machines is one where EVERY host shows the same sign,");
o.push("  not just the pool. A host whose focus day has no data is skipped, not silently averaged.");
o.push("");
console.log(o.join("\n"));
