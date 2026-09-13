// token-gobbler · test/runs-render.test.js
// The Runs tab's per-model chart. It is built as plain props for the canvas engine
// (client/graph-canvas.tsx), so the interesting decisions are testable without a
// browser: which metrics are plotted, how a run is labelled on the x axis, and —
// when a model's runs came from more than one home — that they are split per home
// instead of being averaged into one trend.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const entry = join(repo, "test", "runs-render.entry.tsx");
const outfile = join(mkdtempSync(join(tmpdir(), "tg-runs-")), "runs.mjs");
execFileSync(join(repo, "node_modules", ".bin", "esbuild"), [entry, "--bundle", "--format=esm", "--platform=node", "--outfile=" + outfile, "--log-level=warning"], { cwd: repo });
assert.ok(existsSync(outfile), "bundle written");

const R = await import(outfile);

globalThis.React = { createElement: (type, p, ...kids) => ({ type, props: { ...(p || {}), children: kids.length > 1 ? kids : kids[0] } }), Fragment: Symbol("Fragment") };
globalThis.jsx = (type, props, key) => ({ type, props: props || {}, key });
globalThis.jsxs = globalThis.jsx;

function byType(tree, name, out = []) {
  if (tree == null || typeof tree !== "object") return out;
  if (Array.isArray(tree)) { for (const n of tree) byType(n, name, out); return out; }
  if (tree.props) {
    if (typeof tree.type === "function" && tree.type.name === name) out.push(tree);
    byType(tree.props.children, name, out);
  }
  return out;
}

/** Minimal hooks runtime (state slots + effects flushed). */
function mount(Component, props = {}) {
  const hooks = [];
  const effects = [];
  let cursor = 0, pending = false, tree = null;
  const same = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const runtime = {
    createElement: (type, p, ...children) => ({ type, props: { ...(p || {}), children: children.length > 1 ? children : children[0] } }),
    Fragment: Symbol("Fragment"),
    useState(init) {
      const i = cursor++;
      if (!(i in hooks)) hooks[i] = typeof init === "function" ? init() : init;
      const set = (v) => { const next = typeof v === "function" ? v(hooks[i]) : v; if (!Object.is(next, hooks[i])) { hooks[i] = next; pending = true; } };
      return [hooks[i], set];
    },
    useMemo(fn, deps) { const i = cursor++; const prev = hooks[i]; if (!prev || !same(prev.deps, deps)) hooks[i] = { deps, v: fn() }; return hooks[i].v; },
    useRef(init) { const i = cursor++; if (!(i in hooks)) hooks[i] = { current: init }; return hooks[i]; },
    useEffect(fn, deps) { const i = cursor++; const prev = hooks[i]; if (!prev || !same(prev.deps, deps)) { hooks[i] = { deps }; effects.push(fn); } },
    useCallback(fn) { return fn; },
  };
  const jsx = (type, p, key) => ({ type, props: p || {}, key });
  const render = () => {
    const prev = { React: globalThis.React, jsx: globalThis.jsx, jsxs: globalThis.jsxs, Fragment: globalThis.Fragment };
    globalThis.React = runtime; globalThis.jsx = jsx; globalThis.jsxs = jsx; globalThis.Fragment = runtime.Fragment;
    try {
      let guard = 0;
      do {
        pending = false; cursor = 0; effects.length = 0;
        tree = Component(props);
        for (const fn of effects.splice(0)) fn();
      } while (pending && ++guard < 20);
    } finally {
      globalThis.React = prev.React; globalThis.jsx = prev.jsx; globalThis.jsxs = prev.jsxs; globalThis.Fragment = prev.Fragment;
    }
    return tree;
  };
  render();
  return { render, get tree() { return tree; } };
}

const SRC_WIN = { id: "sabrent-ohan", label: "Sabrent · Ohan", os: "windows", path: "/media/ohan/Sabrent/Users/Ohan/.dsh", imported: true, enabled: true, addedAt: 1, lastSyncAt: 1, error: null, scan: null, live: null };

/** One single-model session that ran `model`. */
function session(id, date, source, model, decodeTokens) {
  return {
    id, date, source, cwd: "/home/ohan/git/x", title: "run " + id, p2p: false,
    models: [{
      key: model, provider: "local", steps: 5,
      buckets: { uncachedInputTokens: 100, outputTokens: 200, cacheReadTokens: 300, cacheWriteTokens: 40 },
      reasoningTokens: 10, ctxTokens: 5000,
      decodeTokens, decodeMs: 10_000, prefillTokens: 400, prefillMs: 500, prefillSteps: 2,
    }],
  };
}

test("RunsTab: one line per metric over the runs' ordinals, ticks labelled by date", () => {
  const rows = [session("s-a", "2026-09-01", "local", "qwen3-27b", 1000), session("s-b", "2026-09-02", "local", "qwen3-27b", 1200)];
  const m = mount(R.RunsTab, { bySession: rows });
  const charts = byType(m.tree, "GraphCanvas");
  assert.equal(charts.length, 1, "one chart for the model's group");
  const p = charts[0].props;

  assert.equal(p.xField, "n", "runs are plotted by ORDINAL…");
  assert.equal(p.xTickFormat(0), "09-01", "…and every tick is labelled with that run's date");
  assert.equal(p.xTickFormat(1), "09-02");
  assert.equal(p.xTickFormat(9), "", "a tick past the last run has no label");

  assert.deepEqual(p.series.map((s) => s.key), ["decode", "prefill", "ttft", "ctx"], "one line per metric");
  assert.equal(p.series[0].key, "decode");
  assert.equal(p.series[0].axis, 0, "decode rides the left linear axis");
  assert.ok(p.series.slice(1).every((s) => s.axis === 1), "the other three share the right log axis");
  assert.equal(p.axes[1].log, true);
  assert.equal(p.axes[1].hideLabels, true, "whose labels are dropped — the tooltip carries the values");
  assert.deepEqual(p.metricChips.map((c) => c.k), ["decode", "prefill", "ttft", "ctx"], "every metric has a chip");
  assert.equal(p.chips, undefined, "one home needs no home chips");
  assert.equal(p.modeChips, true);
  assert.equal(p.persistKey, "runs", "the mode + chips are remembered per chart");

  // The rows carry a NUMBER or nothing: a run without a measured speed is a gap,
  // never a zero-height bar (which is what the old bar chart drew).
  assert.equal(p.data[0].decode, 100);
  assert.equal(p.data[0].ttft, 0.3, "TTFT is plotted in seconds");
  assert.equal(p.data[0].ctx, 1000);
  assert.equal(p.data[0].label, "2026-09-01 · s-a", "the hover box names the run");
  assert.equal(p.data[0].n, 0);
  assert.equal(p.data[1].decode, 120);
});

test("RunsTab: a model that ran in two homes is split per home, one chip each", () => {
  R.setSourceIndex({ local: { id: "local", label: "This machine", os: "linux", path: "/home/ohan/.dsh", imported: false }, imported: [SRC_WIN] });
  const rows = [
    session("s-a", "2026-09-01", "local", "qwen3-27b", 1000),
    session("s-b", "2026-09-02", "sabrent-ohan", "qwen3-27b", 400),
  ];
  const m = mount(R.RunsTab, { bySession: rows });
  const p = byType(m.tree, "GraphCanvas")[0].props;

  assert.equal(p.series.length, 8, "four metrics × two homes");
  const local = p.series.filter((s) => s.regime === "local");
  const win = p.series.filter((s) => s.regime === "sabrent-ohan");
  assert.equal(local.length, 4);
  assert.equal(win.length, 4);
  assert.equal(local[0].dash, undefined, "this machine's lines are solid");
  assert.deepEqual(win[0].dash, [4, 3], "an imported home is dashed as well as chipped, so the split survives a colour-blind reading");
  assert.equal(local[0].data.length, 1, "each series only carries its own home's runs");
  assert.equal(win[0].data[0].n, 1, "…at their ORIGINAL ordinal, so the x axis still reads as run order");
  assert.deepEqual(p.chips, [
    { name: "This machine", color: "#60a5fa", k: "local" },
    { name: "Sabrent · Ohan", color: "#fbbf24", k: "sabrent-ohan" },
  ], "a chip per home");
  assert.match(p.data[1].label, /Sabrent · Ohan/, "the hover box says which home the run came from");
  assert.equal(p.tipData.length, 2, "both homes' runs are hoverable");
});
