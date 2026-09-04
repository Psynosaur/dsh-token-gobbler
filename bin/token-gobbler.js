#!/usr/bin/env node
// token-gobbler · CLI
//   token-gobbler                 pretty report (all time)
//   token-gobbler --days 7        last 7 days
//   token-gobbler --breakdown     per-day / per-model / per-session tables
//   token-gobbler --json          machine-readable
//   token-gobbler --dsh-home DIR  override DSH home (default ~/.dsh)
import { buildReport, buildBreakdown, priceTotals, addSavings } from "../lib/report.js";
import { priceFor, costFor, emptyBuckets } from "../lib/pricing.js";
import { parseStatsSnapshot } from "../lib/trajectory.js";

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const json = has("--json");
const days = parseInt(val("--days", "0"), 10) || 0;
const opts = {};
const dshHome = val("--dsh-home", "");
if (dshHome) opts.dshHome = dshHome;

const report = buildReport(opts);
const breakdown = buildBreakdown(opts);

// Optional window: recompute everything from the sessions in range.
let totals = report.totals;
let byModel = report.byModel;
let byDay = breakdown.byDay;
let bySession = breakdown.bySession;
let comparison = report.comparison;
let savings = report.savings;
let actualCost = report.actual.cost;
let actualSavings = report.actualSavings;
let ev = report.events || {};
let tl = report.tools || [];

const B = ["uncachedInputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"];
const sumBuckets = (rows) => {
  const t = emptyBuckets();
  for (const r of rows) for (const k of B) t[k] += r[k] || 0;
  t.allTokens = t.uncachedInputTokens + t.outputTokens + t.cacheReadTokens + t.cacheWriteTokens;
  return t;
};
const rollupModels = (rows) => {
  const map = new Map();
  for (const r of rows) for (const m of r.models || []) {
    const e = map.get(m.key) || { key: m.key, label: m.key, provider: m.provider, sessions: new Set(), steps: 0, ...emptyBuckets() };
    map.set(m.key, e);
    e.sessions.add(r.id);
    e.steps += m.steps;
    for (const k of B) e[k] += m.buckets[k];
  }
  return [...map.values()]
    .map((m) => {
      const card = priceFor(m.key);
      const b = {}; for (const k of B) b[k] = Math.round(m[k]);
      const all = b.uncachedInputTokens + b.outputTokens + b.cacheReadTokens + b.cacheWriteTokens;
      return { model: m.key, label: card ? card.label : m.key, copilot: /copilot/i.test(String(m.provider || "")), sessions: m.sessions.size, steps: m.steps, ...b, allTokens: all, cost: card ? Math.round(costFor(b, card) * 100) / 100 : null };
    })
    .sort((a, b) => b.allTokens - a.allTokens);
};
const rollupDay = (rows) => {
  const map = new Map();
  for (const r of rows) { const e = map.get(r.date) || { date: r.date, sessions: 0, ...emptyBuckets() }; map.set(r.date, e); e.sessions++; for (const k of B) e[k] += r[k] || 0; }
  return [...map.values()].map((d) => ({ ...d, allTokens: d.uncachedInputTokens + d.outputTokens + d.cacheReadTokens + d.cacheWriteTokens })).sort((a, b) => (a.date > b.date ? 1 : -1));
};

if (days > 0) {
  const cutoff = Date.now() - days * 86400000;
  bySession = breakdown.bySession.filter((s) => s.createdAt && s.createdAt >= cutoff);
  totals = sumBuckets(bySession);
  byModel = rollupModels(bySession);
  byDay = rollupDay(bySession);
  const rep = addSavings(priceTotals(totals, report.comparison.map((c) => ({ id: c.id, label: c.label }))));
  comparison = rep.comparison;
  savings = rep.savings;
  actualCost = byModel.reduce((n, m) => n + (m.cost || 0), 0);
  actualSavings = Math.round((actualCost - savings.baselineCost) * 100) / 100;
  const evAgg = {};
  const toolAgg = {};
  for (const s of bySession) {
    if (s.events) for (const k of Object.keys(s.events)) evAgg[k] = (evAgg[k] || 0) + (s.events[k] || 0);
    for (const t of (s.tools || [])) toolAgg[t.name] = (toolAgg[t.name] || 0) + t.count;
  }
  ev = evAgg;
  tl = Object.entries(toolAgg).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

if (json) {
  console.log(JSON.stringify({ ...report, totals, byModel, byDay, bySession, comparison, savings, actualCost, actualSavings }, null, 2));
  process.exit(0);
}

// ── pretty ────────────────────────────────────────────────────────────────
const useColor = process.stdout.isTTY && !has("--no-color");
const wrap = (code) => (s) => (useColor ? "\x1b[" + code + "m" + s + "\x1b[0m" : String(s));
const bold = wrap("1"), dim = wrap("2"), green = wrap("32"), yellow = wrap("33"), cyan = wrap("36");
const fmt = (n) => (n == null ? 0 : n).toLocaleString("en-US");
const fmtC = (n) => {
  if (n == null) return "0";
  n = Number(n);
  if (n < 1000) return String(n);
  if (n < 1e6) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (n < 1e9) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
};
const money = (n) => (n == null ? "unpriced" : (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2));
const line = (n = 68) => dim("─".repeat(n));

console.log();
console.log(bold("  🦃 TOKEN GOBBLER — the corp token meter"));
console.log(line());
console.log("  " + dim("DSH home") + "     : " + dim(report.dshHome));
console.log("  " + dim("Sessions") + "     : " + fmt(report.sources.projcache.sessions) + " total, " + fmt(report.sources.projcache.nonZero) + " with usage");
const cache = parseStatsSnapshot();
console.log("  " + dim("Trajectories") + " : " + fmt(report.sources.trajectories.files) + " files, " + fmt(report.sources.trajectories.withUsage) + " with per-turn usage, " + fmt(report.sources.trajectories.withModelTimeline) + " with model events · parse cache " + fmt(cache.cacheHits) + " hits / " + fmt(cache.recomputed) + " recomputed");
if (days > 0) console.log("  " + dim("Window") + "       : last " + days + " day(s)");
console.log();
console.log(bold("  TOTALS GOBLED"));
console.log(line());
console.log("  Input (uncached) : " + cyan(fmt(totals.uncachedInputTokens)));
console.log("  Output           : " + cyan(fmt(totals.outputTokens)));
console.log("  Cache read       : " + dim(fmt(totals.cacheReadTokens)));
console.log("  Cache write      : " + dim(fmt(totals.cacheWriteTokens)));
console.log("  Total tokens     : " + bold(fmt(totals.allTokens)));
console.log();
console.log(bold("  ACTUAL (what you actually ran)"));
console.log(line());
console.log("  " + green(money(actualCost)) + "  " + dim(report.actual.note));
if (actualSavings > 0) {
  console.log("  " + green("💰 All-local (Qwen) would've been " + money(savings.baselineCost) + " — the home lab saved " + money(actualSavings) + " vs what you actually spent."));
}
console.log();
console.log(bold("  BY MODEL (what you actually ran)"));
console.log(line());
console.log("  " + "MODEL".padEnd(30) + " " + "KIND".padEnd(8) + " " + "SESS".padStart(5) + "  " + "INPUT".padStart(10) + "  " + "OUTPUT".padStart(10) + "  " + "CACHE R".padStart(11) + "  " + "COST".padStart(10));
for (const m of byModel) {
  const cost = m.cost != null ? money(m.cost) : yellow("unpriced");
  const kind = m.copilot ? "Copilot" : dim("local");
  console.log("  " + m.label.slice(0, 30).padEnd(30) + " " + kind.padEnd(8) + " " + String(m.sessions).padStart(5) + "  " + fmtC(m.uncachedInputTokens).padStart(10) + "  " + fmtC(m.outputTokens).padStart(10) + "  " + fmtC(m.cacheReadTokens).padStart(11) + "  " + cost.padStart(10));
}
console.log();
console.log(bold("  WHAT IT WOULD COST THE CORP (all tokens on one model)"));
console.log(line());
console.log("  " + "MODEL".padEnd(36) + " " + "COST".padStart(10) + "  " + "YOU SAVE".padStart(10));
for (const c of comparison) {
  const tag = c.estimated ? dim(" (est.)") : "";
  const cost = c.priced ? green(money(c.cost)) : yellow("unpriced");
  const save = c.baseline ? dim("baseline") : (c.savings != null ? green(money(c.savings)) : "—");
  console.log("  " + c.label.slice(0, 36).padEnd(36) + " " + cost.padStart(10) + "  " + save + tag);
}
if (savings && savings.max > 0) {
  const range = (savings.min > 0 && savings.min < savings.max) ? money(savings.min) + "–" + money(savings.max) : money(savings.max);
  console.log("  " + green("💰 You save " + range + " by running local instead of Copilot."));
}

// ── ACTIVITY (events + tools) ────────────────────────────────────────────
console.log();
console.log(bold("  ACTIVITY (events)"));
console.log(line());
const evPairs = [
  ["LLM steps", ev.steps], ["Tool calls", ev.toolCalls], ["Tool runs", ev.toolSubCalls],
  ["Your messages", ev.userMessages], ["Assistant msgs", ev.assistantMessages], ["Turns", ev.turns],
  ["Compactions", ev.compactions], ["Retries", ev.retries], ["Approvals", ev.approvals],
  ["Todos", ev.todos], ["Commands", ev.commands],
];
for (let i = 0; i < evPairs.length; i += 3) {
  const cells = evPairs.slice(i, i + 3).map((p) => p[0].padEnd(16) + cyan(fmt(p[1] || 0)));
  console.log("  " + cells.join("   "));
}
if (tl.length) {
  console.log();
  console.log(bold("  TOP TOOLS (what actually ran)"));
  console.log(line());
  const maxTool = tl[0].count || 1;
  for (const t of tl.slice(0, 12)) {
    const barLen = Math.max(1, Math.round((t.count / maxTool) * 20));
    console.log("  " + t.name.slice(0, 28).padEnd(28) + " " + String(t.count).padStart(6) + "  " + dim("▮".repeat(barLen)));
  }
}

if (has("--breakdown") || json) {
  console.log();
  console.log(bold("  BY DAY"));
  console.log(line());
  console.log("  " + "DATE".padEnd(12) + " " + "SESS".padStart(5) + "  " + "INPUT".padStart(10) + "  " + "OUTPUT".padStart(10) + "  " + "CACHE R".padStart(11) + "  " + "TOTAL".padStart(12));
  for (const d of byDay) {
    console.log("  " + d.date.padEnd(12) + " " + String(d.sessions).padStart(5) + "  " + fmtC(d.uncachedInputTokens).padStart(10) + "  " + fmtC(d.outputTokens).padStart(10) + "  " + fmtC(d.cacheReadTokens).padStart(11) + "  " + fmtC(d.allTokens).padStart(12));
  }
  console.log();
  console.log(bold("  BY SESSION (model mix, most recent " + bySession.length + ")"));
  console.log(line());
  for (const s of bySession) {
    const label = (s.title || s.cwd || s.id).slice(0, 26);
    const mix = s.modelMix.slice(0, 26);
    console.log("  " + s.date + "  " + label.padEnd(26) + "  " + mix.padEnd(26) + "  " + fmtC(s.uncachedInputTokens).padStart(9) + "  " + fmtC(s.outputTokens).padStart(8) + "  " + fmtC(s.cacheReadTokens).padStart(10) + "  " + fmtC(s.allTokens).padStart(12));
  }
}
console.log();
console.log(line());
console.log(dim("  same gobbling, different invoices. watch the corp tokens get chomped."));
console.log();
