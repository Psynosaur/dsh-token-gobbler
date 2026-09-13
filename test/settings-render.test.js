// token-gobbler · test/settings-render.test.js
// The DSH settings section (client/activity.tsx TokenGobblerSettings): every
// group of settings is one collapsible drawer whose HEAD carries the
// at-a-glance numbers, and the imported homes are the LAST drawer — this
// machine's numbers lead, other machines are opt-in reading.
//
// The section is rendered with the shared client stub runtime (real state slots,
// effects flushed, async settling) against a stubbed /token-gobbler API.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const entry = join(repo, "test", "settings-render.entry.tsx");
const outfile = join(mkdtempSync(join(tmpdir(), "tg-settings-")), "settings.mjs");
execFileSync(join(repo, "node_modules", ".bin", "esbuild"), [entry, "--bundle", "--format=esm", "--platform=node", "--outfile=" + outfile, "--log-level=warning"], { cwd: repo });
assert.ok(existsSync(outfile), "bundle written");

const S = await import(outfile);

globalThis.React = { createElement: (type, p, ...kids) => ({ type, props: { ...(p || {}), children: kids.length > 1 ? kids : kids[0] } }), Fragment: Symbol("Fragment") };
globalThis.jsx = (type, props, key) => ({ type, props: props || {}, key });
globalThis.jsxs = globalThis.jsx;

function walk(node, fn) {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) { for (const n of node) walk(n, fn); return; }
  if (node.props) { fn(node); walk(node.props.children, fn); }
}
function byClass(tree, cls) {
  const out = [];
  walk(tree, (n) => { if (typeof n.props.className === "string" && n.props.className.split(/\s+/).includes(cls)) out.push(n); });
  return out;
}
function byType(tree, name, out = []) {
  if (tree == null || typeof tree !== "object") return out;
  if (Array.isArray(tree)) { for (const n of tree) byType(n, name, out); return out; }
  if (tree.props) {
    if (typeof tree.type === "function" && tree.type.name === name) out.push(tree);
    byType(tree.props.children, name, out);
  }
  return out;
}
function texts(node, out = []) {
  if (node == null || typeof node === "boolean") return out;
  if (typeof node === "string" || typeof node === "number") { out.push(String(node)); return out; }
  if (Array.isArray(node)) { for (const n of node) texts(n, out); return out; }
  if (node.props) texts(node.props.children, out);
  return out;
}

/** Minimal hooks runtime: real state slots + effects flushed after the build. */
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
  return {
    render,
    get tree() { return tree; },
    async settle() {
      for (let i = 0; i < 6; i++) { await new Promise((r) => setTimeout(r, 0)); render(); }
      return tree;
    },
  };
}

/** One imported home, as lib/sources.ts reports it. */
const SRC_WIN = { id: "sabrent-ohan", label: "Sabrent · Ohan", os: "windows", path: "/media/ohan/Sabrent/Users/Ohan/.dsh", imported: true, enabled: true, addedAt: 1, lastSyncAt: Date.now() - 3600_000, error: null, scan: { sessions: 229, legacySessions: 184, files: 231, bytes: 160960567, tokens: 931029104, newest: 6 }, live: { sessions: 230, tokens: 936326170, files: 230, withUsage: 212, duplicates: 0, synthetic: 1 } };

function usage(imported) {
  return {
    dshHome: "/home/ohan/.dsh",
    totals: { uncachedInputTokens: 1000, outputTokens: 2000, cacheReadTokens: 3000, cacheWriteTokens: 400, allTokens: 6400 },
    events: { steps: 12, turns: 3, toolCalls: 4, toolSubCalls: 1, userMessages: 2, assistantMessages: 2, compactions: 1 },
    decode: { tokPerSec: 117.9, tokens: 1000, ms: 8000 },
    prefill: { tokPerSec: 989, tokens: 500, ms: 500, avgTtftMs: 20 },
    byModel: [],
    split: { wfh: null },
    actual: { cost: 12.34, note: "priced from the test fixture", source: "fixture" },
    actualSavings: 4.2,
    sources: {
      local: { id: "local", label: "This machine", os: "linux", path: "/home/ohan/.dsh", sessions: 5, tokens: 6400, files: 3 },
      imported: imported || [],
      projcache: { sessions: 5, nonZero: 5 },
      trajectories: { files: 3, withUsage: 3, withModelTimeline: 3, cache: null },
    },
  };
}

function stubApi(payload) {
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    const path = String(url);
    calls.push(path.replace(/^.*\/token-gobbler/, ""));
    const value = path.includes("/usage") ? payload
      : path.includes("/breakdown") ? { bySession: [], byDay: [], toolTokensAggregate: [] }
      : path.includes("/performance") ? {}
      : path.includes("/sources") ? { sources: (payload.sources && payload.sources.imported) || [] }
      : {};
    return { ok: true, status: 200, json: async () => ({ ok: true, value }) };
  };
  return calls;
}

const headsOf = (tree) => byType(tree, "Collapse").map((d) => texts(d.props.label).join(" ").replace(/\s+/g, " ").trim());

test("settings: every group is a collapsible drawer, the imported homes LAST", async () => {
  stubApi(usage([]));
  const m = mount(S.TokenGobblerSettings, {});
  await m.settle();

  const drawers = byType(m.tree, "Collapse");
  const heads = headsOf(m.tree);
  assert.equal(drawers.length, 6, "one drawer per group of settings");
  assert.deepEqual(heads.map((h) => h.split(" — ")[0]), [
    "💰 Cost", "🪙 Tokens", "⚡ Speed", "📊 Activity", "📈 Chart defaults", "🔌 Imported sources",
  ], "Cost leads, the imported homes close the list");

  // The cost drawer is the one that opens itself — the headline number is the
  // reason the page exists; everything else starts folded.
  assert.equal(drawers[0].props.defaultOpen, true, "the cost drawer opens on its own");
  assert.ok(drawers.slice(1).every((d) => !d.props.defaultOpen), "every other drawer starts folded");

  // The imported-sources CARD lives inside the last drawer, not loose on the page.
  const imported = drawers[drawers.length - 1];
  const card = byType(imported, "ImportSourcesCard")[0];
  assert.ok(card, "the import card is the bottom drawer's body");
});

test("settings: the drawer heads carry the at-a-glance numbers", async () => {
  stubApi(usage([SRC_WIN]));
  const m = mount(S.TokenGobblerSettings, {});
  await m.settle();

  const heads = headsOf(m.tree);
  assert.match(heads[0], /actually ran/, "the cost head names what the number is");
  assert.match(heads[0], /\$12\.34/, "…and carries it");
  assert.match(heads[0], /saved \$4\.2/, "…plus the saving against corp rates");
  assert.match(heads[1], /total 6\.4K/, "the token head carries the total");
  assert.match(heads[2], /decode 117\.9 tok\/s/, "the speed head carries the decode rate");
  assert.match(heads[2], /prefill 989 tok\/s/, "…and prefill");
  assert.match(heads[3], /sessions 5/, "the activity head carries the session count");
  assert.match(heads[4], /opens as Lines/, "the chart head names the default plot mode");
  assert.match(heads[5], /home 1/, "the imports head counts the imported homes");

  // With a home folded in, the page-level import line appears above the drawers.
  assert.equal(byClass(m.tree, "tg-importline").length, 1, "the folded-in banner is outside the drawers");
});

test("settings: the chart-defaults head follows the shared chart store", async () => {
  stubApi(usage([]));
  // The mode the settings card would have written (client/graph-store).
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  S.saveChartSettings({ ...S.loadChartSettings(), mode: "bars" });

  const m = mount(S.TokenGobblerSettings, {});
  await m.settle();
  assert.match(headsOf(m.tree)[4], /opens as Bars/, "the settings head reads the mode the store now holds");
  delete globalThis.localStorage;
});
