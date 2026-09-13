// token-gobbler · test/graph-render.test.js
// The canvas graph engine (client/graph.ts + client/graph-canvas.tsx) is the
// dependency-free replacement for the vendored amCharts bundle. Tested in two
// layers:
//   1. the pure core — scales, ticks, frame building, visibility, hit-testing
//      and the draw calls, recorded from a Proxy canvas context;
//   2. the React shell — rendered with a minimal hooks runtime and DOM stubs,
//      so the measure → resize → paint path, the chips, the plot-mode switch and
//      the persisted UI state are exercised without a browser.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const entry = join(repo, "test", "graph.entry.tsx");
const outfile = join(mkdtempSync(join(tmpdir(), "tg-graph-")), "graph.mjs");
execFileSync(join(repo, "node_modules", ".bin", "esbuild"), [entry, "--bundle", "--format=esm", "--platform=node", "--outfile=" + outfile, "--log-level=warning"], { cwd: repo });
assert.ok(existsSync(outfile), "bundle written");

const g = await import(outfile);

// ── fixtures ─────────────────────────────────────────────────────────────
/** Two context windows (compaction regimes) with a ✂ rule between them — the
 *  same shape the Daily tab's per-session drawer feeds the chart. */
function fixture() {
  const w0 = [
    { g: 0, ctx: 1000, in: 100, out: 20, pf: 900, dc: 200, tip: "T1S1 · ctx 1,000\nin 100 · out 20" },
    { g: 1, ctx: 1500, in: 120, out: 30, pf: 800, dc: 180, tip: "T1S2 · ctx 1,500\nin 120 · out 30" },
    { g: 2, ctx: 2200, in: 140, out: 40, pf: 700, dc: 160, tip: "T1S3 · ctx 2,200\nin 140 · out 40" },
  ];
  const w1 = [
    { g: 3, ctx: 800, in: 90, out: 10, pf: 600, dc: 150, tip: "T2S1 · ctx 800\nin 90 · out 10" },
    { g: 4, ctx: null, in: 95, out: 12, pf: 610, dc: 155, tip: "T2S2 · ctx —\nin 95 · out 12" },
    { g: 5, ctx: 1900, in: 110, out: 25, pf: 620, dc: 165, tip: "T2S3 · ctx 1,900\nin 110 · out 25" },
  ];
  return {
    xField: "g", xLabel: "step", xStep: 1,
    series: [
      { key: "ctx", label: "Before compaction", tipName: "ctx", color: "#e5e7eb", axis: 0, line: true, fill: true, regime: 0, data: w0 },
      { key: "in", label: "in", color: "#4ade80", axis: 1, line: true, regime: 0, data: w0 },
      { key: "ctx", label: "After compaction 1", tipName: "ctx", color: "#f87171", axis: 0, line: true, fill: true, regime: 1, data: w1 },
      { key: "in", label: "in", color: "#4ade80", axis: 1, line: true, regime: 1, data: w1 },
    ],
    axes: [{}, { log: true, hideLabels: true }],
    chips: [
      { name: "Before compaction", color: "#e5e7eb", k: 0 },
      { name: "After compaction 1", color: "#f87171", k: 1 },
    ],
    metricChips: [{ name: "in · tok", color: "#4ade80", k: "in" }],
    rules: [{ x: 3, label: "✂ C1", windows: [0, 1] }],
    tipField: "tip",
    tipData: [...w0, ...w1],
    height: 300,
  };
}

/** A recording 2D context: every method call and property write is logged. */
function makeCtx() {
  const ops = [];
  const target = { ops, measureText: (t) => ({ width: String(t).length * 5 }) };
  return new Proxy(target, {
    get(t, k) {
      if (k in t) return t[k];
      return (...args) => { ops.push([String(k), ...args]); };
    },
    set(t, k, v) { ops.push(["set:" + String(k), v]); t[k] = v; return true; },
  });
}
const argsOf = (ops, op) => ops.filter((o) => o[0] === op).map((o) => o[1]);
const texts = (ops) => argsOf(ops, "fillText").map(String);
const ink = (ops) => ops.filter((o) => o[0] === "set:strokeStyle" || o[0] === "set:fillStyle").map((o) => o[1]);

// ── 1. the pure core ─────────────────────────────────────────────────────
test("scales map a domain onto pixels and invert back", () => {
  const lin = g.makeScale([0, 100], [200, 0]);
  assert.equal(lin(0), 200);
  assert.equal(lin(50), 100);
  assert.equal(lin(100), 0);
  assert.ok(Math.abs(lin.invert(100) - 50) < 1e-9);

  const log = g.makeScale([1, 1000], [100, 0], true);
  assert.equal(log(1), 100);
  assert.equal(log(1000), 0);
  assert.ok(Math.abs(log(10) - 200 / 3) < 1e-9, "log decades are evenly spaced");
  assert.ok(Math.abs(log.invert(log(37)) - 37) < 1e-6, "invert round-trips");
  assert.equal(log(0), 100, "a non-positive value is clamped to the axis floor on a log scale");
});

test("ticks: 1/2/5 steps on a linear axis, decades on a log axis", () => {
  assert.equal(g.niceStep(3), 5);
  assert.equal(g.niceStep(0.011), 0.02);
  assert.equal(g.niceCeil(357_100), 500_000);
  assert.deepEqual(g.linearTicks(0, 450_000, 5), [0, 100_000, 200_000, 300_000, 400_000]);
  assert.deepEqual(g.logTicks(1, 1000), [1, 10, 100, 1000]);
  const dense = g.logTicks(100, 1000);
  assert.ok(dense.length >= 3, "a one-decade log axis still gets helper ticks");
  assert.ok(dense.every((v) => v >= 100 && v <= 1000));
});

test("fmtValue stays compact for axis labels", () => {
  assert.equal(g.fmtValue(0), "0");
  assert.equal(g.fmtValue(950), "950");
  assert.equal(g.fmtValue(45_000), "45K");
  assert.equal(g.fmtValue(1_250_000), "1.3M");
  assert.equal(g.fmtValue(262.5), "262.5");
});

test("visibility: metric chips hide a metric, window chips hide a whole window", () => {
  const line = { key: "ctx", label: "ctx", color: "#fff", regime: 1 };
  const met = { key: "in", label: "in", color: "#0f0", regime: 1 };
  assert.equal(g.seriesVisible(line, g.noHidden()), true);
  assert.equal(g.seriesVisible(line, { chips: { 1: true }, metrics: {} }), false, "the window chip hides its context line");
  assert.equal(g.seriesVisible(met, { chips: {}, metrics: { in: true } }), false, "the metric chip hides that metric in every window");
  assert.equal(g.seriesVisible(met, { chips: { 0: true }, metrics: {} }), true, "another window's chip leaves it alone");
  assert.equal(g.seriesVisible({ ...met, hidden: true }, g.noHidden()), false);
});

test("buildFrame: domains, ticks, per-axis scales and broken points", () => {
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 });
  assert.equal(f.columns.length, 2, "one column per value axis");
  assert.deepEqual(f.xDomain, [0, 5]);
  assert.deepEqual(f.xTicks.map((t) => t.v), [0, 1, 2, 3, 4, 5], "xStep = 1");
  assert.equal(f.columns[0].domain[0], 0, "the linear context axis starts at zero");
  assert.equal(f.columns[0].domain[1], 2200 * 1.1, "the ceiling is the largest value + 10%");
  assert.equal(f.columns[1].log, true);
  assert.equal(f.columns[1].domain[0], 10, "log floor = the decade below the smallest value");
  assert.ok(Math.abs(f.columns[1].domain[1] - Math.pow(10, Math.log10(140) + 0.1 * (Math.log10(140) - 1))) < 1e-9,
    "log ceiling = the largest value + 10% of the decade span");

  assert.equal(f.lines.length, 4);
  assert.ok(f.lines[0].points.every((pt) => pt.ok));
  assert.equal(f.lines[2].points[1].ok, false, "a null value becomes a hole so the line breaks");
  assert.equal(f.lines[2].points[1].py, f.plot.y + f.plot.h, "a hole sits on the baseline");

  assert.equal(f.rules.length, 1);
  assert.equal(f.rules[0].label, "✂ C1");
  assert.equal(f.tips.length, 6, "every tooltip row is hit-testable");
});

test("buildFrame: chips hide series, their ✂ rules and rescale the axes", () => {
  const off1 = g.buildFrame(fixture(), { chips: { 1: true }, metrics: {} }, { width: 800, height: 300 });
  assert.equal(off1.lines.length, 2, "the window's context line + its metric line are gone");
  assert.equal(off1.rules.length, 0, "a rule hides when either window it bounds is hidden");
  assert.equal(off1.columns[0].domain[1], 2200 * 1.1, "the remaining window still drives the axis");

  const other = g.buildFrame(fixture(), { chips: { 0: true }, metrics: {} }, { width: 800, height: 300 });
  assert.equal(other.columns[0].domain[1], 1900 * 1.1, "hiding a window rescales the value axis to what is left");
  assert.deepEqual(other.xDomain, [3, 5], "…and the x axis starts at the first step of the remaining window");
  assert.deepEqual(other.tips.map((t) => t.row.g), [3, 4, 5], "steps of the hidden window are no longer hoverable");
  assert.equal(other.xTicks[0].px >= other.plot.x, true, "the first tick sits inside the plot");
  assert.deepEqual(g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 }).xDomain, [0, 5], "restoring the chip expands it back");

  const offMetric = g.buildFrame(fixture(), { chips: {}, metrics: { in: true } }, { width: 800, height: 300 });
  assert.equal(offMetric.lines.length, 2, "only the two context lines are left");
  assert.equal(offMetric.columns[1].domain[1], 10, "an empty axis falls back to a 1..10 decade");
});

test("buildFrame: the x axis auto-scales to the visible data", () => {
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 });
  assert.deepEqual(f.xDomain, [0, 5]);
  assert.deepEqual(f.tips.map((t) => t.row.g), [0, 1, 2, 3, 4, 5], "every step is hoverable");
  assert.ok(f.xTicks.every((t) => t.px >= f.plot.x && t.px <= f.plot.x + f.plot.w), "ticks stay inside the plot");
});

test("value axes scale to the data with 10% headroom — never a fixed max", () => {
  const f = g.buildFrame({
    xField: "g",
    series: [{ key: "v", label: "v", color: "#fff", data: [{ g: 0, v: 1234 }, { g: 1, v: 4321 }] }],
    axes: [{}],
  }, g.noHidden(), { width: 400, height: 200 });
  assert.equal(f.columns[0].domain[0], 0);
  assert.equal(f.columns[0].domain[1], 4321 * 1.1, "ceiling = max × (1 + headroom)");
  const top = f.lines[0].points[1].py;
  assert.ok(Math.abs(top - (f.plot.y + f.plot.h * (1 - 1 / 1.1))) < 1e-6, "the peak sits exactly 10% below the top of the plot");
  assert.equal(g.AXIS_HEADROOM, 0.1);

  // one bigger value anywhere in the data raises the ceiling (nothing is clipped)
  const taller = g.buildFrame({
    xField: "g",
    series: [{ key: "v", label: "v", color: "#fff", data: [{ g: 0, v: 1234 }, { g: 1, v: 4321 }, { g: 2, v: 9000 }] }],
    axes: [{}],
  }, g.noHidden(), { width: 400, height: 200 });
  assert.equal(taller.columns[0].domain[1], 9000 * 1.1);

  // log axes follow the same rule
  const log = g.buildFrame({
    xField: "g",
    series: [{ key: "v", label: "v", color: "#fff", axis: 1, data: [{ g: 0, v: 10 }, { g: 1, v: 1000 }] }],
    axes: [{}, { log: true, hideLabels: true }],
  }, g.noHidden(), { width: 400, height: 200 });
  assert.deepEqual(log.columns[1].domain, [10, Math.pow(10, 3 + 0.1 * 2)], "log ceiling: 10% of the span above the peak");
  const peak = log.lines[0].points[1].py;
  assert.ok(Math.abs(peak - (log.plot.y + log.plot.h * (1 - 1 / 1.1))) < 1e-6,
    "on a log axis the peak also sits 10% below the top of the panel");
});

test("hitTest picks the nearest step and refuses a far-away pointer", () => {
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 });
  const mid = f.tips[3];
  assert.equal(g.hitTest(f, mid.px + 3).row.g, mid.row.g);
  assert.equal(g.hitTest(f, mid.px + 200), null, "beyond maxDist there is no tooltip");
});

test("renderGraph: fills, lines, ticks, the ✂ rule and the hover crosshair", () => {
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 });
  const ctx = makeCtx();
  g.renderGraph(ctx, f, { hoverPx: f.tips[2].px });
  const ops = ctx.ops;

  assert.ok(ops.some((o) => o[0] === "fill"), "the context area is filled");
  assert.ok(ops.filter((o) => o[0] === "stroke").length >= 4, "grid + axes + one stroke per line");
  assert.ok(ink(ops).includes("#e5e7eb") && ink(ops).includes("#f87171"), "both windows draw in their own colour");
  assert.ok(ink(ops).includes("#4ade80"), "the metric lines draw");
  assert.ok(argsOf(ops, "set:lineWidth").every((v) => v <= 1.5), "hairlines only");

  const labels = texts(ops);
  assert.ok(labels.includes("1K") && labels.includes("2K"), "left axis labels are compact: " + labels.join(","));
  assert.ok(labels.includes("✂ C1"), "the compaction rule is labelled");
  assert.ok(labels.includes("0") && labels.includes("5"), "x tick labels are drawn");
  assert.ok(!labels.includes("10") && !labels.includes("100"), "the hidden right axis draws no labels");

  assert.ok(ops.some((o) => o[0] === "arc"), "the hovered step gets a ring on each line");
  assert.ok(ops.some((o) => o[0] === "clip"), "series are clipped to the plot rect");
});

test("smoothing: monotone cubic curves that never overshoot the data", () => {
  // a spike: the middle point is a local maximum, so its tangent goes flat
  const spike = [{ px: 0, py: 100, ok: true }, { px: 10, py: 0, ok: true }, { px: 20, py: 100, ok: true }];
  const m = g.smoothTangents(spike);
  assert.equal(m[1], 0, "a local extremum gets a flat tangent");
  assert.ok(m[0] < 0 && m[2] > 0, "the outer tangents follow their only slope");

  const f = g.buildFrame({ ...fixture(), smooth: true }, g.noHidden(), { width: 800, height: 300 });
  assert.ok(f.lines.every((ln) => ln.smooth), "the chart-level flag reaches every series");
  const ctx = makeCtx();
  g.renderGraph(ctx, f);

  // replay the recorded path: each control point must stay inside the y range of
  // the segment it shapes — that is the no-overshoot guarantee of Fritsch–Carlson
  let cur = null, curves = 0;
  for (const op of ctx.ops) {
    if (op[0] === "moveTo" || op[0] === "lineTo") cur = { x: op[1], y: op[2] };
    else if (op[0] === "bezierCurveTo") {
      curves++;
      const c1x = op[1], c1y = op[2], c2x = op[3], c2y = op[4], x = op[5], y = op[6];
      const lo = Math.min(cur.y, y) - 1e-6, hi = Math.max(cur.y, y) + 1e-6;
      assert.ok(c1y >= lo && c1y <= hi, "control point 1 stays inside its segment");
      assert.ok(c2y >= lo && c2y <= hi, "control point 2 stays inside its segment");
      assert.ok(c1x > cur.x && c2x < x, "the handles point forward along x");
      cur = { x, y };
    }
  }
  // one cubic per adjacent pair in every smoothed run — plus the same again for
  // the area fill of a filled series (the hole in w1 splits it into single points,
  // which stay straight)
  const expected = f.lines.reduce((n, ln) => {
    const segs = g.lineRuns(ln.points).reduce((k, run) => k + (run.length >= 3 ? run.length - 1 : 0), 0);
    return n + segs * (1 + (ln.series.fill ? 1 : 0));
  }, 0);
  assert.ok(expected > 0);
  assert.equal(curves, expected, "the lines are drawn as cubic Béziers: " + curves);

  const flat = makeCtx();
  g.renderGraph(flat, g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 }));
  assert.equal(flat.ops.some((o) => o[0] === "bezierCurveTo"), false, "unsmoothed lines stay polylines");
});

test("renderGraph: a hidden window leaves no ink at all", () => {
  const f = g.buildFrame(fixture(), { chips: { 1: true }, metrics: {} }, { width: 800, height: 300 });
  const ctx = makeCtx();
  g.renderGraph(ctx, f);
  assert.ok(!ink(ctx.ops).includes("#f87171"), "the toggled-off window is not drawn");
  assert.ok(!texts(ctx.ops).includes("✂ C1"), "and its ✂ rule is gone too");
  assert.equal(ctx.ops.some((o) => o[0] === "arc"), false, "no crosshair without a hover");
});

// ── 2. plot modes: lines / both / dots (scatter) ─────────────────────────
test("plot modes: dots scatter the series, both keeps the lines", () => {
  const f = g.buildFrame({ ...fixture(), smooth: true }, g.noHidden(), { width: 800, height: 300 });
  const points = f.lines.reduce((n, ln) => n + ln.points.filter((pt) => pt.ok).length, 0);
  assert.ok(points > 0);

  const dots = makeCtx();
  g.renderGraph(dots, f, { mode: "dots" });
  assert.equal(argsOf(dots.ops, "bezierCurveTo").length, 0, "no connecting line, even when the chart is smoothed");
  // closePath is used by the area fill ONLY (dots are beginPath + arc + fill), so
  // it is the mark of an area — and a filled point cloud would read as data
  assert.equal(dots.ops.some((o) => o[0] === "closePath"), false, "the area fill goes with the line");
  assert.equal(argsOf(dots.ops, "fill").length, points, "the only fills are the dots themselves");
  assert.equal(argsOf(dots.ops, "arc").length, points, "every drawable point gets a dot");
  assert.ok(dots.ops.filter((o) => o[0] === "arc").every((o) => o[3] === 2.4), "scatter dots use a visible radius");
  assert.ok(ink(dots.ops).includes("#e5e7eb") && ink(dots.ops).includes("#f87171"), "each window still draws in its own colour");

  const lines = makeCtx();
  g.renderGraph(lines, f);
  assert.ok(argsOf(lines.ops, "bezierCurveTo").length > 0, "the default mode is unchanged");
  assert.equal(argsOf(lines.ops, "arc").length, 0, "…and draws no dots for series that do not ask for them");
  assert.ok(lines.ops.some((o) => o[0] === "closePath"), "…and keeps the area fill");

  const both = makeCtx();
  g.renderGraph(both, f, { mode: "both" });
  assert.ok(argsOf(both.ops, "bezierCurveTo").length > 0, "both keeps the lines");
  assert.equal(argsOf(both.ops, "arc").length, points, "…dots every point");
  assert.ok(both.ops.some((o) => o[0] === "closePath"), "…and keeps the area fill");

  // holes stay holes in a scatter: a null value is not a dot at the baseline
  const hidden = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 });
  const holefree = makeCtx();
  g.renderGraph(holefree, hidden, { mode: "dots" });
  assert.equal(argsOf(holefree.ops, "arc").length, hidden.lines.reduce((n, ln) => n + ln.points.filter((pt) => pt.ok).length, 0));
});

test("dotRadius: an explicit radius wins, the scatter modes dot every series", () => {
  const bare = { key: "v", label: "v", color: "#fff" };
  assert.equal(g.dotRadius(bare), 0, "no dots by default");
  assert.equal(g.dotRadius(bare, "dots"), 2.4);
  assert.equal(g.dotRadius(bare, "both"), 2);
  assert.equal(g.dotRadius({ ...bare, radius: 5 }, "dots"), 5, "a series can size its own dots");
  assert.equal(g.dotRadius({ ...bare, line: false }), 2, "a dots-only series draws dots in line mode too");
  assert.deepEqual(g.POINT_MODES.map((m) => m.k), ["line", "both", "dots", "trend", "bars", "heat"]);
  assert.ok(g.POINT_MODES.every((m) => m.name && m.title));
  assert.equal(g.dotRadius(bare, "bars"), 0, "bars mode draws bars, not dots");
  assert.deepEqual(g.POINT_MODE_KEYS, g.POINT_MODES.map((m) => m.k), "the store accepts every mode the engine can draw");
  assert.equal(g.isPointMode("bars"), true, "…including the one the cost charts open in");
});

test("renderGraph: bars mode grows one bar per point from the axis floor", () => {
  // A discrete series (a day's cost): two values and one hole. The hole is not a
  // zero bar — there is nothing to draw there.
  const rows = [{ g: 0, cost: 10 }, { g: 1, cost: 30 }, { g: 2, cost: null }];
  const props = {
    data: rows, xField: "g", xLabel: "day", xStep: 1,
    series: [{ key: "cost", label: "Cost", color: "#fbbf24", axis: 0, line: true }],
    axes: [{}],
  };
  const f = g.buildFrame(props, g.noHidden(), { width: 400, height: 200 });
  const ctx = makeCtx();
  g.renderGraph(ctx, f, { mode: "bars" });
  // the plot background is a fillRect too — the bars are the narrow ones
  const bars = (ops, plot) => ops.filter((o) => o[0] === "fillRect").map((o) => o.slice(1)).filter(([, , w, h]) => !(w === plot.w && h === plot.h));
  const rects = bars(ctx.ops, f.plot);
  assert.equal(rects.length, 2, "one bar per drawn point — the null row draws nothing");
  assert.equal(ctx.ops.some((o) => o[0] === "bezierCurveTo"), false, "bars are not lines");
  assert.equal(argsOf(ctx.ops, "arc").length, 0, "…and carry no dots");
  assert.ok(ink(ctx.ops).includes("#fbbf24"), "the bar wears its series' colour");

  const bottom = f.plot.y + f.plot.h;
  const sc = f.columns[0].scale;
  const baseY = Math.max(f.plot.y, Math.min(bottom, sc(sc.domain[0])));
  const [p0, p1] = f.lines[0].points;
  const barAt = (pt) => rects.find(([x, , w]) => Math.abs(x + w / 2 - pt.px) < 0.6);
  const b0 = barAt(p0), b1 = barAt(p1);
  assert.ok(b0 && b1, "each bar is centred on its own point");
  assert.ok(Math.abs(b0[3] - Math.abs(baseY - p0.py)) < 0.6, "its height is the value's distance from the axis floor");
  assert.ok(Math.abs(b0[1] - Math.min(p0.py, baseY)) < 0.6, "…starting at the floor (a linear axis is zero-based)");
  assert.ok(b1[3] > b0[3], "a bigger value is a taller bar");
  assert.ok(rects.every(([, , , h]) => h > 0), "every bar has a visible height");

  // Several series share the slot side by side instead of stacking on each other.
  const two = { ...props, series: [...props.series, { key: "v", label: "v", color: "#60a5fa", axis: 0, line: true }] };
  const f2 = g.buildFrame({ ...two, data: rows.map((r) => ({ ...r, v: r.cost == null ? null : 5 })) }, g.noHidden(), { width: 400, height: 200 });
  const ctx2 = makeCtx();
  g.renderGraph(ctx2, f2, { mode: "bars" });
  const r2 = bars(ctx2.ops, f2.plot);
  assert.equal(r2.length, 4, "two series × two points");
  const centres = r2.map(([x, , w]) => Math.round(x + w / 2));
  assert.equal(new Set(centres).size, 4, "…each with its own x, so no bar hides another");
});

test("xTickFormat: a numeric index axis is LABELLED as its category", () => {
  const days = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"];
  const rows = days.map((d, i) => ({ g: i, v: 10 + i }));
  const props = {
    data: rows, xField: "g", xLabel: "day", xStep: 1,
    xTickFormat: (v) => days[Math.round(v)] || "",
    series: [{ key: "v", label: "v", color: "#fff", axis: 0, line: true }],
    axes: [{}],
  };
  const f = g.buildFrame(props, g.noHidden(), { width: 400, height: 200 });
  assert.deepEqual(f.xTicks.map((t) => t.label), days, "every tick reads as its date");
  const plain = g.buildFrame({ ...props, xTickFormat: undefined }, g.noHidden(), { width: 400, height: 200 });
  assert.deepEqual(plain.xTicks.map((t) => t.label), ["0", "1", "2", "3"], "without the formatter the ticks stay numeric");
});


test("renderGraph: trend draws the rolling statistic over faint raw steps", () => {
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 });
  const points = f.lines.reduce((n, ln) => n + ln.points.filter((p) => p.ok).length, 0);

  const ctx = makeCtx();
  g.renderGraph(ctx, f, { mode: "trend", trend: { stat: "median", window: 3, dots: true, dotsAlpha: 0.3 } });
  const ops = ctx.ops;
  assert.equal(ops.filter((o) => o[0] === "arc").length, points, "every raw step stays as a dot behind the trend");
  assert.ok(!ops.some((o) => o[0] === "bezierCurveTo"), "the trend joins its window statistics with straight segments");
  assert.equal(ops.some((o) => o[0] === "closePath"), false, "no band unless it is asked for");
  assert.ok(ops.some((o) => o[0] === "set:globalAlpha" && Math.abs(o[1] - 0.3) < 1e-9), "the raw steps carry the configured opacity");
  assert.ok(ops.some((o) => o[0] === "set:lineWidth" && o[1] >= 1.8), "the trend is the heavier line");
  assert.ok(ink(ops).includes("#e5e7eb") && ink(ops).includes("#f87171"), "…drawn in each series' own colour");

  const band = makeCtx();
  g.renderGraph(band, f, { mode: "trend", trend: { stat: "mean", window: 5, band: true, dots: false } });
  assert.ok(band.ops.some((o) => o[0] === "closePath"), "the spread band is a filled polygon");
  assert.equal(band.ops.filter((o) => o[0] === "arc").length, 0, "the raw steps can be switched off entirely");
});

test("renderGraph: heat draws the lattice, names its rows and stops labelling the value axis", () => {
  const heat = { rows: "metric", ramp: "row", scale: "log", maxCols: 400, strip: true, labels: true };
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 }, { mode: "heat", heat });
  const ctx = makeCtx();
  g.renderGraph(ctx, f, { mode: "heat", heat });
  const ops = ctx.ops;
  const cells = f.heat.rows.reduce((n, r) => n + r.cells.length, 0);
  assert.equal(ops.filter((o) => o[0] === "fillRect").length, cells + 1 + f.heat.strip.length + f.rules.length,
    "one rect per cell, plus the panel background, the window strip and the ✂ label chip");
  assert.equal(ops.filter((o) => o[0] === "arc").length, 0, "heat draws no points at all");
  assert.ok(!ops.some((o) => o[0] === "bezierCurveTo"), "…and no lines");
  const labels = texts(ops);
  assert.ok(labels.includes("ctx") && labels.includes("in"), "the rows are named in the gutter: " + labels.join(","));
  assert.ok(!labels.includes("1K") && !labels.includes("2K"), "the value axis stops labelling itself — the rows are categories");
  assert.ok(labels.includes("0") && labels.includes("5"), "…but the x axis still reads");

  const shared = makeCtx();
  g.renderGraph(shared, f, { mode: "heat", heat: { ...heat, ramp: "shared" } });
  assert.ok(ink(shared.ops).some((c) => String(c).startsWith("rgb(")), "the shared ramp shades the cells");
  assert.ok(texts(shared.ops).includes("low") && texts(shared.ops).includes("high"), "…with a low→high legend");

  const hov = makeCtx();
  g.renderGraph(hov, f, { mode: "heat", heat, hoverPx: f.tips[2].px });
  assert.equal(hov.ops.filter((o) => o[0] === "arc").length, 0, "no per-series rings in heat mode");
  assert.ok(hov.ops.some((o) => o[0] === "fillRect" && Math.abs(o[1] + o[3] / 2 - f.tips[2].px) < 1),
    "the hovered COLUMN lights up instead");
});

// ── 2b. trend (a rolling statistic through the dots) ─────────────────────
test("trendWindow: auto is 8% of the steps, forced odd, clamped to 3..51", () => {
  assert.equal(g.trendWindow(150, 0), 13, "12 rounded up to the next odd number");
  assert.equal(g.trendWindow(10, 0), 3, "never narrower than three steps");
  assert.equal(g.trendWindow(400, 0), 33);
  assert.equal(g.trendWindow(2000, 0), 51, "never wider than 51");
  assert.equal(g.trendWindow(150, 20), 21, "an even window is widened — a median needs a middle value");
  assert.equal(g.trendWindow(150, 1), 3);
  assert.equal(g.trendWindow(150, 21), 21, "an explicit window is honoured");
});

test("trendOf: the median shrugs off a spike, the mean follows it, the EMA leans recent", () => {
  const mk = (pys) => pys.map((py, i) => ({ px: i, py, v: 0, ok: py != null, row: {} }));
  const spike = mk([10, 10, 10, 90, 10, 10, 10]);
  const med = g.trendOf(spike, { stat: "median", window: 3 });
  const mean = g.trendOf(spike, { stat: "mean", window: 3 });
  assert.equal(med[3].py, 10, "the median at the spike is still the typical value");
  assert.ok(Math.abs(mean[3].py - 110 / 3) < 1e-9, "the mean is dragged to it: " + mean[3].py);
  assert.equal(med[0].py, 10, "the window is clipped at the edges, never padded with invented values");
  assert.ok(med[3].lo <= med[3].py && med[3].hi >= med[3].py, "the spread band brackets the trend");
  assert.equal(med[3].lo, 10);
  assert.equal(med[3].hi, 90, "p25..p75 of a three-value window spans it");

  const ema = g.trendOf(spike, { stat: "ema", window: 3 });
  assert.equal(ema[0].py, 10, "the EMA starts on the first value");
  assert.equal(ema[3].py, 50, "alpha = 2/(3+1): a 90 lifts it halfway");
  assert.ok(ema[6].py < ema[3].py && ema[6].py > 10, "…and it decays back toward the data");
});

test("trendOf: a gap in the data breaks the trend instead of being smoothed over", () => {
  const pts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ px: i, py: 10 + i, v: 0, ok: i >= 5, row: {} }));
  const tv = g.trendOf(pts, { stat: "median", window: 5 });
  assert.equal(tv[0], null, "no trend before the data starts");
  assert.equal(tv[4], null, "…and none while the window holds less than half a window of values");
  assert.ok(tv[5] && tv[9], "the covered stretch gets one");
  assert.deepEqual(g.trendRuns(tv).map((r) => [r.i, r.j]), [[5, 9]], "the gap ends the run");

  // the EMA is recursive, so it carries across a hole and stays continuous
  const ema = g.trendOf(pts, { stat: "ema", window: 3 });
  assert.ok(ema.slice(0, 5).every((v) => v === null), "an EMA has no value before the first one");
  assert.ok(ema.slice(5).every((v) => v !== null), "…and one from there on, straight through the gap");
});

test("trendRuns: contiguous stretches of a trend", () => {
  const tv = [null, { py: 1, lo: 0, hi: 2 }, { py: 1, lo: 0, hi: 2 }, null, { py: 3, lo: 3, hi: 3 }];
  assert.deepEqual(g.trendRuns(tv).map((r) => [r.i, r.j]), [[1, 2], [4, 4]]);
});

// ── 2c. heat (a metric × step lattice) ───────────────────────────────────
test("heatLayout: one row per metric, shaded inside its own range, holes left empty", () => {
  const heat = { rows: "metric", ramp: "row", scale: "log", maxCols: 400, strip: true, labels: true };
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 }, { mode: "heat", heat });
  assert.ok(f.heat, "heat mode builds the lattice");
  assert.equal(f.pad.l, 62, "the left gutter holds the row names");
  assert.deepEqual(f.heat.rows.map((r) => r.key), ["ctx", "in"], "one row per METRIC key — a per-window row would repeat the same steps");

  const ctx = f.heat.rows[0];
  assert.deepEqual(ctx.cells.map((c) => c.v), [1000, 1500, 2200, 800, 1900], "the null ctx step (g=4) leaves no cell at all");
  assert.equal(ctx.cells.find((c) => c.v === 800).t, 0, "the row's own minimum is the dark end");
  assert.equal(ctx.cells.find((c) => c.v === 2200).t, 1, "…and its maximum the bright end");
  assert.ok(ctx.cells.every((c) => c.t >= 0 && c.t <= 1));
  assert.equal(f.heat.rows[1].cells.length, 6, "a metric with no holes covers every step");

  // the grid spans the plot: the first cell starts at its left edge
  assert.equal(Math.round(ctx.cells[0].x), Math.round(f.plot.x));
  const last = ctx.cells[ctx.cells.length - 1];
  assert.ok(Math.abs(last.x + last.w - (f.plot.x + f.plot.w)) < 1.5, "…and the last one ends at its right edge");

  assert.equal(f.heat.strip.length, 2, "one strip segment per compaction window");
  assert.deepEqual(f.heat.strip.map((s) => s.color), ["#e5e7eb", "#f87171"], "in the window chip colours");
  assert.equal(f.heat.stripH, g.HEAT_STRIP_H);
});

test("heatLayout: binning keeps the spikes, series rows, hidden windows drop out", () => {
  const heat = { rows: "metric", scale: "log", maxCols: 3, strip: true, labels: true };
  const f = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 }, { mode: "heat", heat });
  const binned = g.heatLayout(fixture(), f, heat);
  assert.equal(binned.rows[0].cells.length, 3, "6 steps at maxCols 3 => bins of 2");
  assert.deepEqual(binned.rows[0].cells.map((c) => c.v), [1500, 2200, 1900], "a cell shows the largest step it covers");

  const bySeries = g.heatLayout(fixture(), f, { ...heat, rows: "series" });
  assert.equal(bySeries.rows.length, 4, "one row per drawn series");
  assert.deepEqual(bySeries.rows.map((r) => r.label), ["Before compaction", "in 0", "After compaction 1", "in 1"],
    "repeated metric names are numbered by window");

  const hidden = g.buildFrame(fixture(), { chips: { 1: true }, metrics: {} }, { width: 800, height: 300 }, { mode: "heat", heat });
  assert.deepEqual(hidden.heat.rows.map((r) => r.key), ["ctx", "in"], "the surviving window still has its rows");
  assert.equal(hidden.heat.rows[1].cells.length, 3, "…but only its own steps");
  assert.deepEqual(hidden.heat.strip.map((s) => s.color), ["#e5e7eb"], "the strip loses the hidden window");

  const linear = g.heatLayout({ ...fixture(), chips: [] }, f, { ...heat, maxCols: 0, strip: false, labels: false, scale: "linear" });
  assert.equal(linear.stripH, 0, "the strip can be switched off");
  assert.equal(linear.strip.length, 0);
  const linRow = linear.rows[0];
  assert.ok(Math.abs(linRow.cells.find((c) => c.v === 1500).t - (1500 - 800) / (2200 - 800)) < 1e-9, "linear shading is linear in the value");

  const noLabels = g.buildFrame(fixture(), g.noHidden(), { width: 800, height: 300 }, { mode: "heat", heat: { ...heat, labels: false } });
  assert.equal(noLabels.pad.l, 12, "without row names the gutter collapses");
});

test("heatLayout: rows are matched by step value, not by row identity", () => {
  // The perf panel's context line carries its OWN copy of the rows (it appends
  // the compaction reset step), so a lookup by object identity would drop the
  // ctx row from the grid entirely — the step value is what identifies a column.
  const w0 = [{ g: 0, ctx: 1000, in: 100 }, { g: 1, ctx: 2000, in: 120 }];
  const w1 = [{ g: 2, ctx: 800, in: 90 }, { g: 3, ctx: 1500, in: 95 }];
  const props = {
    xField: "g", xStep: 1, axes: [{}],
    series: [
      { key: "ctx", label: "w0", tipName: "ctx", color: "#e5e7eb", axis: 0, regime: 0, line: true, data: w0.map((r) => ({ g: r.g, ctx: r.ctx })) },
      { key: "in", label: "in", color: "#4ade80", axis: 0, regime: 0, line: true, data: w0 },
      { key: "ctx", label: "w1", tipName: "ctx", color: "#f87171", axis: 0, regime: 1, line: true, data: w1.map((r) => ({ g: r.g, ctx: r.ctx })) },
      { key: "in", label: "in", color: "#4ade80", axis: 0, regime: 1, line: true, data: w1 },
    ],
    chips: [{ name: "w0", color: "#e5e7eb", k: 0 }, { name: "w1", color: "#f87171", k: 1 }],
    tipData: [...w0, ...w1],
  };
  const f = g.buildFrame(props, g.noHidden(), { width: 600, height: 300 }, { mode: "heat" });
  assert.deepEqual(f.heat.rows.map((r) => r.key), ["ctx", "in"], "the ctx row survives its copied rows");
  assert.deepEqual(f.heat.rows[0].cells.map((c) => c.v), [1000, 2000, 800, 1500], "…and holds every step");
  assert.deepEqual(f.heat.rows.map((r) => r.label), ["ctx", "in"], "a metric row is named by the metric");
});

test("sampleRamp: interpolates between the shared ramp's stops", () => {
  assert.equal(g.sampleRamp(["#000000", "#ffffff"], 0), "rgb(0,0,0)");
  assert.equal(g.sampleRamp(["#000000", "#ffffff"], 1), "rgb(255,255,255)");
  assert.equal(g.sampleRamp(["#000000", "#ffffff"], 0.5), "rgb(128,128,128)");
  assert.equal(g.sampleRamp(["#000000", "#ffffff"], 5), "rgb(255,255,255)", "t is clamped");
  assert.equal(g.SHARED_RAMP[0], "#0b1220");
});

// ── 3. the persisted UI state (client/graph-store.ts) ────────────────────
/** A stand-in for window.localStorage. Node has no global one, and the browser
 *  module must be exercisable without a browser. */
function stubStorage(init) {
  const map = new Map(Object.entries(init || {}));
  return {
    map,
    get length() { return map.size; },
    key: (i) => Array.from(map.keys())[i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}
/** Expand the card's function components (Seg / Toggle / Num — all hook-free)
 *  into host elements, so byClass can reach the controls they render. */
function expand(node) {
  // the card's components read the ambient jsx helper, which the mount harness
  // only installs while it renders — lend them the same stub for this walk
  const stub = (type, p, key) => ({ type, props: p || {}, key });
  const prev = { jsx: globalThis.jsx, jsxs: globalThis.jsxs };
  globalThis.jsx = stub; globalThis.jsxs = stub;
  try { return expandIn(node); } finally { globalThis.jsx = prev.jsx; globalThis.jsxs = prev.jsxs; }
}
function expandIn(node) {
  if (node == null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(expandIn);
  if (!node.props) return node;
  if (typeof node.type === "function") return expandIn(node.type(node.props));
  return { ...node, props: { ...node.props, children: expandIn(node.props.children) } };
}

const withStorage = (store, fn) => {
  const prev = globalThis.localStorage;
  if (store == null) delete globalThis.localStorage; else globalThis.localStorage = store;
  try { return fn(store); } finally { if (prev === undefined) delete globalThis.localStorage; else globalThis.localStorage = prev; }
};

test("graph UI state round-trips through storage", () => {
  withStorage(stubStorage(), (store) => {
    assert.deepEqual(g.loadUi("perf"), { chips: {}, metrics: {}, mode: "line" }, "an untouched chart opens with the defaults");
    g.saveUi("perf", { chips: { 1: true }, metrics: { in: true }, mode: "dots" });
    assert.deepEqual(g.loadUi("perf"), { chips: { 1: true }, metrics: { in: true }, mode: "dots" });
    assert.equal(store.map.size, 1, "one record per chart key");
    assert.deepEqual(g.loadUi("other"), { chips: {}, metrics: {}, mode: "line" }, "another chart is unaffected");
    assert.deepEqual(g.loadUi(undefined), { chips: {}, metrics: {}, mode: "line" }, "no key, no memory");
    g.saveUi(undefined, { chips: { 1: true }, metrics: {}, mode: "dots" });
    assert.equal(store.map.size, 1, "a chart without a persistKey writes nothing");
    assert.equal(g.loadUi("perf").mode, "dots", "the saved mode wins over the caller default");
    assert.equal(g.loadUi("missing", "dots").mode, "dots", "…and the caller default is used when nothing was saved");
    // unchanged state is not rewritten (no storage churn on every drawer open)
    const before = store.map.get(g.GRAPH_STORE_KEY + "perf");
    g.saveUi("perf", { chips: { 1: true }, metrics: { in: true }, mode: "dots" });
    assert.equal(store.map.get(g.GRAPH_STORE_KEY + "perf"), before);
  });
});

test("graph UI state survives corrupt, foreign and denied storage", () => {
  withStorage(stubStorage({ [g.GRAPH_STORE_KEY + "perf"]: "{not json" }), () => {
    assert.deepEqual(g.loadUi("perf"), { chips: {}, metrics: {}, mode: "line" }, "a truncated record reads as empty");
  });
  withStorage(stubStorage({ [g.GRAPH_STORE_KEY + "perf"]: JSON.stringify({ chips: { 1: "yes", 2: true }, metrics: null, mode: "spiral" }) }), () => {
    const ui = g.loadUi("perf", "both");
    assert.deepEqual(ui.chips, { 2: true }, "only real true flags survive");
    assert.deepEqual(ui.metrics, {}, "a missing group is not fatal");
    assert.equal(ui.mode, "both", "an unknown mode falls back to the caller default");
  });
  withStorage(stubStorage({ [g.GRAPH_STORE_KEY + "perf"]: JSON.stringify("nonsense") }), () => {
    assert.equal(g.loadUi("perf").mode, "line", "a non-object record is ignored");
  });
  withStorage(stubStorage({ ["some-other-app:state"]: JSON.stringify({ mode: "dots" }) }), () => {
    assert.equal(g.loadUi("perf").mode, "line", "another app's keys are never read");
  });
  const denied = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
  withStorage(denied, () => {
    assert.equal(g.loadUi("perf").mode, "line", "an unreadable store reads as empty");
    g.saveUi("perf", { chips: {}, metrics: {}, mode: "dots" });  // must not throw
  });
  withStorage(null, () => {
    assert.equal(g.graphStorage(), null, "no localStorage at all");
    assert.equal(g.loadUi("perf").mode, "line");
    g.saveUi("perf", { chips: {}, metrics: {}, mode: "dots" });
  });
});

test("chart settings: defaults, round trip, clamping and reset", () => {
  withStorage(stubStorage(), (store) => {
    assert.deepEqual(g.loadChartSettings(), g.DEFAULT_CHART_SETTINGS, "a fresh browser gets the shipped defaults");
    assert.equal(g.loadChartSettings().trend.stat, "median");
    assert.equal(g.loadChartSettings().trend.window, 0, "auto");
    assert.equal(g.loadChartSettings().heat.rows, "metric");
    assert.equal(g.loadChartSettings().heat.ramp, "row");

    const saved = g.saveChartSettings({ ...g.DEFAULT_CHART_SETTINGS, mode: "heat", trend: { ...g.DEFAULT_CHART_SETTINGS.trend, stat: "ema", window: 21 } });
    assert.equal(saved.mode, "heat");
    assert.deepEqual(g.loadChartSettings(), saved, "…and they come back on the next mount");
    assert.ok(store.map.has(g.CHART_SETTINGS_KEY), "under one shared key");

    // a hand-edited / stale record is normalized field by field, never trusted
    store.map.set(g.CHART_SETTINGS_KEY, JSON.stringify({ mode: "spiral", trend: { stat: "mode", window: 999, dotsAlpha: 5, dots: "yes" }, heat: { rows: "nope", maxCols: -3, scale: "sqrt" } }));
    const junk = g.loadChartSettings();
    assert.equal(junk.mode, "line", "an unknown mode falls back to the default");
    assert.equal(junk.trend.stat, "median");
    assert.equal(junk.trend.window, 51, "the window is clamped to a drawable range");
    assert.equal(junk.trend.dotsAlpha, 0.8, "…and so is the opacity");
    assert.equal(junk.trend.dots, true, "a non-boolean keeps the default");
    assert.equal(junk.heat.rows, "metric");
    assert.equal(junk.heat.maxCols, 0);
    assert.equal(junk.heat.scale, "log");

    assert.equal(g.trendWindowSize({ ...g.DEFAULT_CHART_SETTINGS.trend, window: 0 }, 150), 13, "the settings tab shows the engine's own window rule");
    assert.equal(g.trendWindowSize({ ...g.DEFAULT_CHART_SETTINGS.trend, window: 21 }, 150), 21);
  });
});

test("chart settings: subscribers fire, reset restores, per-chart state stays separate", () => {
  withStorage(stubStorage(), () => {
    let hits = 0;
    const off = g.subscribeChartSettings(() => { hits++; });
    g.saveChartSettings({ ...g.DEFAULT_CHART_SETTINGS, mode: "dots" });
    assert.equal(hits, 1, "a save wakes every open chart");
    g.resetChartSettings();
    assert.equal(hits, 2, "and so does a reset");
    assert.equal(g.loadChartSettings().mode, "line", "reset restores the shipped defaults");
    off();
    g.saveChartSettings({ ...g.DEFAULT_CHART_SETTINGS, mode: "heat" });
    assert.equal(hits, 2, "an unsubscribed chart is left alone");

    // the per-chart record is a different record: resetting the defaults must not
    // forget the mode a chart was switched to by hand
    g.saveUi("perf", { chips: { 1: true }, metrics: {}, mode: "dots" });
    g.resetChartSettings();
    assert.equal(g.loadUi("perf").mode, "dots");
  });
});

test("clearChartModes: hands the per-chart modes back to the default, keeping the chips", () => {
  withStorage(stubStorage(), () => {
    g.saveUi("perf", { chips: { 1: true }, metrics: { in: true }, mode: "dots" });
    g.saveUi("other", { chips: {}, metrics: {}, mode: "heat" });
    assert.equal(g.clearChartModes(), 2, "both charts had a mode of their own");
    assert.equal(g.loadUi("perf").mode, "line", "the mode is back to the caller's default…");
    assert.deepEqual(g.loadUi("perf").chips, { 1: true }, "…while the chip toggles survive");
    assert.deepEqual(g.loadUi("perf").metrics, { in: true });
    assert.equal(g.clearChartModes(), 0, "nothing left to forget");
    g.saveChartSettings({ ...g.DEFAULT_CHART_SETTINGS, mode: "dots" });
    assert.equal(g.loadUi("perf", g.loadChartSettings().mode).mode, "dots", "and the settings default now reaches it");
  });
  withStorage(null, () => assert.equal(g.clearChartModes(), 0, "no storage, nothing to forget"));
});

test("chart settings: storage that throws leaves the charts on their defaults", () => {
  const denied = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
  withStorage(denied, () => {
    assert.deepEqual(g.loadChartSettings(), g.DEFAULT_CHART_SETTINGS);
    g.saveChartSettings({ ...g.DEFAULT_CHART_SETTINGS, mode: "heat" });   // must not throw
  });
  withStorage(null, () => {
    assert.deepEqual(g.loadChartSettings(), g.DEFAULT_CHART_SETTINGS, "no localStorage at all");
    g.saveChartSettings({ ...g.DEFAULT_CHART_SETTINGS, mode: "dots" });
    assert.equal(g.resetChartSettings().mode, "line");
  });
});

// ── 4. the React shell ───────────────────────────────────────────────────
// A minimal hooks runtime (real slot storage, shallow-compared deps, effects
// flushed after the tree is built so refs bind to the DOM stubs first, and a
// re-render loop while state keeps changing). The component reads React/jsx/jsxs
// from the ambient globals — client/index.ts installs them from the host
// runtime — so render() borrows those globals for the duration of the call.
function mount(Component, props, opts = {}) {
  const hooks = [];
  const effects = [];
  const cleanups = [];
  const ctx = opts.ctx || makeCtx();
  const nodes = {
    div: { clientWidth: opts.width || 800 },
    canvas: { width: 0, height: 0, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 300 }) },
  };
  let cursor = 0, pending = false, tree = null;
  const same = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const stores = [];
  const runtime = {
    createElement: (type, p, ...children) => ({ type, props: { ...(p || {}), children: children.length > 1 ? children : children[0] } }),
    Fragment: Symbol("Fragment"),
    useState(init) {
      const i = cursor++;
      if (!(i in hooks)) hooks[i] = typeof init === "function" ? init() : init;
      const set = (v) => { const next = typeof v === "function" ? v(hooks[i]) : v; if (!Object.is(next, hooks[i])) { hooks[i] = next; pending = true; } };
      return [hooks[i], set];
    },
    useMemo(fn, deps) {
      const i = cursor++;
      const prev = hooks[i];
      if (!prev || !same(prev.deps, deps)) hooks[i] = { deps, v: fn() };
      return hooks[i].v;
    },
    useRef(init) { const i = cursor++; if (!(i in hooks)) hooks[i] = { current: init }; return hooks[i]; },
    useEffect(fn, deps) {
      const i = cursor++;
      const prev = hooks[i];
      if (!prev || !same(prev.deps, deps)) { hooks[i] = { deps }; effects.push(fn); }
    },
    useCallback(fn) { return fn; },
  };
  const jsx = (type, p, key) => ({ type, props: p || {}, key });
  const bind = (node) => {
    if (node == null || typeof node !== "object") return;
    if (Array.isArray(node)) { for (const n of node) bind(n); return; }
    if (node.props) {
      if (node.props.ref && node.props.ref.current == null) node.props.ref.current = node.type === "canvas" ? nodes.canvas : nodes.div;
      bind(node.props.children);
    }
  };
  const render = () => {
    const prev = { React: globalThis.React, jsx: globalThis.jsx, jsxs: globalThis.jsxs, Fragment: globalThis.Fragment };
    globalThis.React = runtime; globalThis.jsx = jsx; globalThis.jsxs = jsx; globalThis.Fragment = runtime.Fragment;
    try {
      let guard = 0;
      do {
        pending = false; cursor = 0; effects.length = 0;
        tree = Component(props);
        bind(tree);
        for (const fn of effects.splice(0)) { const c = fn(); if (typeof c === "function") cleanups.push(c); }
      } while (pending && ++guard < 10);
    } finally {
      globalThis.React = prev.React; globalThis.jsx = prev.jsx; globalThis.jsxs = prev.jsxs; globalThis.Fragment = prev.Fragment;
    }
    return tree;
  };
  return { render, get tree() { return tree; }, ctx, nodes, unmount: () => cleanups.forEach((c) => c()) };
}

/** Every element carrying the class as a whole className TOKEN (so the
 *  "tg-legend-chips" row is not mistaken for a "tg-legend-chip" button).
 *  Original doc: every element whose className contains `cls`. */
function byClass(node, cls, out = []) {
  if (node == null || typeof node !== "object") return out;
  if (Array.isArray(node)) { for (const n of node) byClass(n, cls, out); return out; }
  if (node.props) {
    const cn = node.props.className;
    if (typeof cn === "string" && cn.split(/\s+/).includes(cls)) out.push(node);
    byClass(node.props.children, cls, out);
  }
  return out;
}

test("GraphCanvas: the hover box labels the x value through xTickFormat", () => {
  globalThis.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800 };
  try {
    const rows = [{ g: 0, v: 5 }, { g: 1, v: 6 }];
    const days = { 0: "2026-09-01", 1: "2026-09-02" };
    const h = mount(g.GraphCanvas, {
      data: rows, xField: "g", xLabel: "day", xStep: 1,
      xTickFormat: (v) => days[v] || "",
      series: [{ key: "v", label: "v", color: "#fff", axis: 0, line: true }],
      axes: [{}], height: 200,
    }, { width: 600 });
    h.render();
    byClass(h.tree, "tg-graph-canvas")[0].props.onMouseMove({ clientX: 50, clientY: 10 });
    h.render();
    const tip = byClass(h.tree, "tg-tip")[0];
    assert.ok(tip, "hovering opens the tooltip");
    assert.match(String(byClass(tip, "tg-tip-date")[0].props.children), /^day 2026-09-0[12]$/,
      "the x value reads as its date, not as the raw index");
    h.unmount();
  } finally {
    delete globalThis.window;
  }
});

test("GraphCanvas: the hover box is one colour-coded row per series", () => {
  globalThis.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800 };
  try {
    // two series whose lines sit a few pixels apart + one hole: the title names
    // the step and every value carries the colour of the line it came from
    const rows = [
      { g: 0, label: "T1S1", ctx: 1000, cache: 900, out: null },
      { g: 1, label: "T1S2", ctx: 2000, cache: 1900, out: 40 },
    ];
    const props = {
      xField: "g", xLabel: "step", xStep: 1,
      series: [
        { key: "ctx", label: "Before compaction", tipName: "ctx", color: "#e5e7eb", axis: 0, line: true, fill: true, unit: "tok", data: rows },
        { key: "cache", label: "cache", color: "#2dd4bf", axis: 1, line: true, unit: "tok", data: rows },
        { key: "out", label: "out", color: "#94a3b8", axis: 1, line: true, unit: "tok", data: rows },
      ],
      axes: [{}, { log: true, hideLabels: true }],
      tipHeadField: "label", tipData: rows, height: 200,
    };
    const h = mount(g.GraphCanvas, props, { width: 600 });
    h.render();
    byClass(h.tree, "tg-graph-canvas")[0].props.onMouseMove({ clientX: 50, clientY: 10 });
    h.render();
    const tip = byClass(h.tree, "tg-tip")[0];
    assert.ok(tip, "hovering opens the tooltip");
    assert.equal(byClass(tip, "tg-tip-date")[0].props.children, "T1S1 · step 0", "the title names the step");

    const lines = byClass(tip, "tg-cv-tip-row");
    assert.equal(lines.length, 2, "one row per series that HAS a value (out is a hole here, so it is omitted)");
    const text = JSON.stringify(tip.props.children);
    assert.ok(text.includes("ctx") && text.includes("cache"), "both series are named: " + text);
    assert.ok(text.includes("1K tok") && text.includes("900 tok"), "values carry their unit");
    assert.equal(lines[0].props.children[0].props.style.background, "#e5e7eb", "the ctx row dots in the context line's colour");
    assert.equal(lines[1].props.children[0].props.style.background, "#2dd4bf", "the cache row dots in the cache line's colour");

    h.unmount();
  } finally {
    delete globalThis.window;
  }
});

test("GraphCanvas: measures its container, paints at device resolution, toggles chips", () => {
  globalThis.window = { devicePixelRatio: 2, innerWidth: 1280, innerHeight: 800 };
  try {
    const h = mount(g.GraphCanvas, fixture(), { width: 800 });
    const tree = h.render();

    // one canvas, sized for the container × DPR, painted through a 2D context
    const canvas = byClass(tree, "tg-graph-canvas")[0];
    assert.ok(canvas, "the chart renders a canvas");
    assert.equal(canvas.type, "canvas");
    assert.equal(h.nodes.canvas.width, 1600, "800 css px at devicePixelRatio 2");
    assert.equal(h.nodes.canvas.height, 600);
    assert.ok(h.ctx.ops.some((o) => o[0] === "fill"), "the first paint filled the context area");
    assert.ok(h.ctx.ops.some((o) => o[0] === "setTransform" && o[1] === 2), "the DPR transform is applied");

    // chips: one per context window + one per metric
    const chips = byClass(tree, "tg-legend-chip");
    assert.equal(chips.length, 3, "2 window chips + 1 metric chip");
    assert.equal(byClass(tree, "tg-xmin").length, 0, "no x-min input");

    // toggling a window chip repaints without that window
    const mark = h.ctx.ops.length;
    chips[1].props.onClick();
    h.render();
    const after = h.ctx.ops.slice(mark);
    assert.ok(after.length > 0, "the chart repainted");
    assert.ok(!ink(after).includes("#f87171"), "the toggled-off window left no ink");
    assert.ok(ink(after).includes("#e5e7eb"), "the remaining window still draws");
    assert.equal(byClass(h.tree, "tg-legend-chip")[1].props.className.includes("off"), true, "the chip shows as off");

    // the shared hover tooltip: the multi-line tip text of the nearest step
    byClass(h.tree, "tg-graph-canvas")[0].props.onMouseMove({ clientX: 60, clientY: 10 });
    h.render();
    const tip = byClass(h.tree, "tg-tip")[0];
    assert.ok(tip, "hovering opens the tooltip");
    const tipText = JSON.stringify(tip.props.children);
    assert.ok(/T[12]S[0-9]/.test(tipText), "the tooltip carries the hovered step's stats: " + tipText.slice(0, 140));

    // a pointer far from every step closes it again
    byClass(h.tree, "tg-graph-canvas")[0].props.onMouseLeave();
    h.render();
    assert.equal(byClass(h.tree, "tg-tip").length, 0, "leaving the chart closes the tooltip");

    h.unmount();
  } finally {
    delete globalThis.window;
  }
});

test("GraphCanvas: the plot mode + the chips are restored, then remembered", () => {
  globalThis.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800 };
  // what the user left behind: window 1 hidden, the "in" metric hidden, scatter mode
  const store = stubStorage({
    [g.GRAPH_STORE_KEY + "perf"]: JSON.stringify({ chips: { 1: true }, metrics: { in: true }, mode: "dots" }),
  });
  withStorage(store, () => {
    const h = mount(g.GraphCanvas, { ...fixture(), smooth: true, modeChips: true, persistKey: "perf" }, { width: 800 });
    const tree = h.render();

    // the very FIRST paint already honours the stored state (no flash of the defaults)
    assert.ok(!ink(h.ctx.ops).includes("#f87171"), "the window toggled off last time is still off");
    assert.ok(!ink(h.ctx.ops).includes("#4ade80"), "…and so is the metric toggled off last time");
    assert.equal(argsOf(h.ctx.ops, "bezierCurveTo").length, 0, "the chart opens as a scatter");
    assert.ok(argsOf(h.ctx.ops, "arc").length > 0, "…with a dot per point");
    assert.deepEqual(byClass(tree, "tg-legend-chip").map((c) => c.props.className.includes("off")), [false, true, true],
      "the window chip and the metric chip both render as off");

    // the mode switch: three states, the restored one active
    const modes = byClass(tree, "tg-graph-mode");
    assert.deepEqual(modes.map((m) => m.props.children), ["Lines", "Both", "Dots", "Trend", "Bars", "Heat"]);
    assert.deepEqual(modes.map((m) => m.props.className.includes("on")), [false, false, true, false, false, false], "Dots is the active mode");
    assert.ok(modes.every((m) => m.props.title), "each mode explains itself on hover");

    // switching back to Lines repaints the lines and is written straight to storage
    const mark = h.ctx.ops.length;
    modes[0].props.onClick();
    h.render();
    const after = h.ctx.ops.slice(mark);
    assert.ok(argsOf(after, "bezierCurveTo").length > 0, "the lines are back");
    assert.equal(argsOf(after, "arc").length, 0, "…and the scatter dots are gone");
    assert.deepEqual(JSON.parse(store.map.get(g.GRAPH_STORE_KEY + "perf")),
      { chips: { 1: true }, metrics: { in: true }, mode: "line" }, "the switch persisted without losing the chips");
    // the mode is a pure rendering choice: switching it must not rescale anything
    const axisLabels = (ops) => texts(ops).filter((t) => /^[0-9][0-9.]*[KMB]?$/.test(t));
    assert.ok(axisLabels(after).length > 0, "the axes are labelled in both modes");
    assert.deepEqual(axisLabels(after), axisLabels(h.ctx.ops.slice(0, mark)), "the axes keep their values across the switch");

    // toggling a chip persists too, and brings the window's ink back
    const mark2 = h.ctx.ops.length;
    byClass(h.tree, "tg-legend-chip")[1].props.onClick();
    h.render();
    assert.ok(ink(h.ctx.ops.slice(mark2)).includes("#f87171"), "the window is drawn again");
    assert.deepEqual(JSON.parse(store.map.get(g.GRAPH_STORE_KEY + "perf")).chips, {}, "the chip state was saved");
    assert.equal(byClass(h.tree, "tg-graph-mode")[0].props.className.includes("on"), true, "the mode survived that re-render");

    h.unmount();
  });
  delete globalThis.window;
});

test("GraphCanvas: without a persistKey nothing is written", () => {
  globalThis.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800 };
  const clean = stubStorage();
  withStorage(clean, () => {
    const h = mount(g.GraphCanvas, { ...fixture(), modeChips: true }, { width: 800 });
    h.render();
    byClass(h.tree, "tg-graph-mode")[2].props.onClick();  // even a mode switch
    h.render();
    assert.equal(clean.map.size, 0, "a chart that did not ask to be remembered writes nothing");
    h.unmount();
  });
  delete globalThis.window;
});

// ── 5. the settings tab's chart defaults ─────────────────────────────────
test("ChartDefaultsCard: every knob writes straight into the shared record", () => {
  withStorage(stubStorage(), (store) => {
    const h = mount(g.ChartDefaultsCard, {}, { width: 800 });
    h.render();
    const row = (name) => byClass(h.tree, "tg-set-row").find((r) => r.props.children[0].props.children === name);
    const segs = (name) => byClass(expand(row(name).props.children[1]), "tg-seg-btn");
    const toggle = (name) => byClass(expand(row(name).props.children[1]), "tg-set-toggle")[0];

    assert.ok(row("Default plot mode") && row("Trend statistic"), "the card has a row per knob");
    assert.deepEqual(segs("Default plot mode").map((b) => b.props.children), ["Lines", "Both", "Dots", "Trend", "Bars", "Heat"]);
    assert.equal(segs("Default plot mode")[0].props.className.includes("active"), true, "it opens on the shipped default");
    assert.deepEqual(segs("Trend statistic").map((b) => b.props.children), ["Median", "Mean", "EMA"]);
    assert.deepEqual(segs("Heat rows").map((b) => b.props.children), ["Per metric", "Per series"]);
    assert.deepEqual(segs("Heat colours").map((b) => b.props.children), ["Row hue", "Shared ramp"]);
    assert.deepEqual(segs("Heat shading").map((b) => b.props.children), ["Log", "Linear"]);

    // the default plot mode (Heat is the last of the six)
    segs("Default plot mode")[5].props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().mode, "heat");
    assert.equal(segs("Default plot mode")[5].props.className.includes("active"), true, "the card shows the new choice");
    assert.equal(JSON.parse(store.map.get(g.CHART_SETTINGS_KEY)).mode, "heat", "…and it is persisted, not just held in state");

    // the trend statistic and window
    segs("Trend statistic")[2].props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().trend.stat, "ema");
    const win = byClass(expand(row("Trend window").props.children[1]), "tg-set-num")[0];
    win.props.onChange({ target: { value: "21" } });
    h.render();
    assert.equal(g.loadChartSettings().trend.window, 21);
    toggle("Trend window").props.onClick();          // "Auto"
    h.render();
    assert.equal(g.loadChartSettings().trend.window, 0, "auto is stored as 0");

    // toggles
    toggle("Raw steps under the trend").props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().trend.dots, false);
    toggle("Spread band").props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().trend.band, true);
    toggle("Row labels").props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().heat.labels, false);

    // heat groups
    segs("Heat colours")[1].props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().heat.ramp, "shared");
    segs("Heat rows")[1].props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().heat.rows, "series");
    segs("Heat shading")[1].props.onClick();
    h.render();
    assert.equal(g.loadChartSettings().heat.scale, "linear");
    byClass(expand(row("Heat max columns").props.children[1]), "tg-set-num")[0].props.onChange({ target: { value: "0" } });
    h.render();
    assert.equal(g.loadChartSettings().heat.maxCols, 0, "0 means never bin");

    // forget the per-chart modes (so the default above can reach them again)
    g.saveUi("perf", { chips: { 1: true }, metrics: {}, mode: "dots" });
    byClass(h.tree, "tg-ghost").find((b) => String(b.props.children).includes("Forget")).props.onClick();
    assert.equal(g.loadUi("perf").mode, "line", "the button clears the remembered modes");

    // reset
    byClass(h.tree, "tg-ghost").find((b) => String(b.props.children).includes("Reset")).props.onClick();
    h.render();
    assert.deepEqual(g.loadChartSettings(), g.DEFAULT_CHART_SETTINGS, "Reset restores every knob");
    assert.equal(segs("Default plot mode")[0].props.className.includes("active"), true, "…and the card follows");
    h.unmount();
  });
});

test("GraphCanvas: the settings tab's defaults and knobs reach the chart", () => {
  globalThis.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800 };
  withStorage(stubStorage(), () => {
    // 1. a chart with no mode of its own opens in the settings' default mode
    g.saveChartSettings({ ...g.DEFAULT_CHART_SETTINGS, mode: "heat" });
    const h = mount(g.GraphCanvas, { ...fixture(), smooth: true, modeChips: true }, { width: 800 });
    h.render();
    const chip = (name) => byClass(h.tree, "tg-graph-mode").find((b) => b.props.children === name);
    assert.equal(chip("Heat").props.className.includes("on"), true, "the chart opens in the default mode");
    assert.ok(h.ctx.ops.some((o) => o[0] === "fillRect"), "…and paints the lattice");

    // 2. switching the chart itself to Trend draws straight trend segments
    const mark = h.ctx.ops.length;
    chip("Trend").props.onClick();
    h.render();
    const trendOps = h.ctx.ops.slice(mark);
    assert.ok(trendOps.some((o) => o[0] === "arc"), "the raw steps stay visible, faintly");
    assert.equal(trendOps.some((o) => o[0] === "bezierCurveTo"), false, "…under straight trend segments");

    // 3. a settings change repaints the chart that is already on screen
    const mark2 = h.ctx.ops.length;
    const s1 = g.loadChartSettings();
    g.saveChartSettings({ ...s1, trend: { ...s1.trend, stat: "mean", band: true } });
    h.render();
    const after = h.ctx.ops.slice(mark2);
    assert.ok(after.length > 0, "the open chart repainted when the settings changed");
    assert.ok(after.some((o) => o[0] === "closePath"), "…with the spread band the new setting asked for");

    // 4. and the heat knobs reach it too
    chip("Heat").props.onClick();
    h.render();
    const mark3 = h.ctx.ops.length;
    const s2 = g.loadChartSettings();
    g.saveChartSettings({ ...s2, heat: { ...s2.heat, ramp: "shared" } });
    h.render();
    assert.ok(ink(h.ctx.ops.slice(mark3)).some((c) => String(c).startsWith("rgb(")), "the shared ramp is used");
    h.unmount();
  });
  delete globalThis.window;
});

