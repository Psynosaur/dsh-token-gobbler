// token-gobbler · test/import-sources.test.js
// The imported-homes UI: the shared source index + badge (which is what MARKS an
// imported session), the filter chips, and the settings card that manages the
// list (add / pause / resync / remove) against a stubbed /token-gobbler/sources.
//
// Both layers are bundled with the same esbuild the plugin ships, then rendered
// with a minimal hooks runtime (real state slots + effects flushed + a re-render
// loop), because the card owns async state.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const entry = join(repo, "test", "import-sources.entry.tsx");
const outfile = join(mkdtempSync(join(tmpdir(), "tg-imports-")), "imports.mjs");
execFileSync(join(repo, "node_modules", ".bin", "esbuild"), [entry, "--bundle", "--format=esm", "--platform=node", "--outfile=" + outfile, "--log-level=warning"], { cwd: repo });
assert.ok(existsSync(outfile), "bundle written");

const S = await import(outfile);

// The client modules build elements with the AMBIENT jsx/jsxs helpers (the host
// runtime installs them). mount() borrows them for a render; the direct calls to
// sourceBadge / SourceFilterBar below need them too.
globalThis.React = { createElement: (type, p, ...kids) => ({ type, props: { ...(p || {}), children: kids.length > 1 ? kids : kids[0] } }), Fragment: Symbol("Fragment") };
globalThis.jsx = (type, props, key) => ({ type, props: props || {}, key });
globalThis.jsxs = globalThis.jsx;

// ── tree helpers ─────────────────────────────────────────────────────────
function walk(node, fn) {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) { for (const n of node) walk(n, fn); return; }
  if (node.props) {
    fn(node);
    // A plain function component (Seg, …) is expanded so its children are found.
    if (typeof node.type === "function" && !node.$$typeof) { walk(node.type(node.props), fn); return; }
    walk(node.props.children, fn);
  }
}
function byClass(tree, cls) {
  const out = [];
  walk(tree, (n) => { if (typeof n.props.className === "string" && n.props.className.split(/\s+/).includes(cls)) out.push(n); });
  return out;
}
function texts(node, out = []) {
  if (node == null || typeof node === "boolean") return out;
  if (typeof node === "string" || typeof node === "number") { out.push(String(node)); return out; }
  if (Array.isArray(node)) { for (const n of node) texts(n, out); return out; }
  if (node.props) texts(node.props.children, out);
  return out;
}
const allText = (tree) => texts(tree).join(" ");
/** Click the first element with the class + matching text. */
function click(tree, cls, label) {
  const hit = byClass(tree, cls).find((n) => !label || texts(n.props.children).join(" ").includes(label));
  assert.ok(hit, "no " + cls + " matching " + JSON.stringify(label));
  hit.props.onClick();
}

/** Minimal hooks runtime: real state slots, effects flushed after the tree is
 *  built, and a re-render loop that keeps going while async state lands. */
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
    /** Let pending promises land, then re-render until the tree settles. */
    async settle() {
      for (let i = 0; i < 6; i++) { await new Promise((r) => setTimeout(r, 0)); render(); }
      return tree;
    },
  };
}

/** A fake /token-gobbler/sources endpoint (GET list + POST mutations). */
function stubApi(initial) {
  const state = { sources: initial.sources || [], candidates: initial.candidates || null, posts: [], fail: null };
  globalThis.fetch = async (url, opts) => {
    const path = String(url);
    if (opts && opts.method === "POST") {
      const body = JSON.parse(opts.body);
      state.posts.push(body);
      if (state.fail) return { ok: false, status: 400, json: async () => ({ ok: false, error: state.fail }) };
      if (body.action === "add") state.sources = [...state.sources, { id: "added", label: body.label || "added", os: body.os && body.os !== "auto" ? body.os : "windows", path: body.path, imported: true, enabled: true, addedAt: 1, lastSyncAt: Date.now() - 3600_000, error: null, scan: { sessions: 2, legacySessions: 0, files: 3, bytes: 4, tokens: 5, newest: 6 }, live: null }];
      if (body.action === "remove") state.sources = state.sources.filter((s) => s.id !== body.id);
      if (body.action === "update") state.sources = state.sources.map((s) => (s.id === body.id ? { ...s, ...(body.enabled != null ? { enabled: body.enabled } : {}), ...(body.label ? { label: body.label } : {}) } : s));
      if (body.action === "resync") state.sources = state.sources.map((s) => (s.id === body.id ? { ...s, lastSyncAt: 99 } : s));
      return { ok: true, status: 200, json: async () => ({ ok: true, value: { result: state.sources.find((s) => s.id === body.id) || state.sources[state.sources.length - 1] || {}, sources: state.sources } }) };
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, value: { sources: state.sources, ...(path.includes("scan=1") ? { candidates: state.candidates } : {}) } }) };
  };
  return state;
}

const SRC_WIN = { id: "sabrent-ohan", label: "Sabrent · Ohan", os: "windows", path: "/media/ohan/Sabrent/Users/Ohan/.dsh", imported: true, enabled: true, addedAt: 1, lastSyncAt: Date.now() - 3600_000, error: null, scan: { sessions: 229, legacySessions: 184, files: 231, bytes: 160960567, tokens: 931029104, newest: 6 }, live: { sessions: 230, tokens: 936326170, files: 230, withUsage: 212, duplicates: 0, synthetic: 1 } };
const SRC_MAC = { id: "air", label: "MacBook Air", os: "macos", path: "/Volumes/backup/.dsh", imported: true, enabled: false, addedAt: 2, lastSyncAt: null, error: null, scan: { sessions: 3, legacySessions: 0, files: 3, bytes: 10, tokens: 20, newest: 3 }, live: null };
const LOCAL = { id: "local", label: "This machine", os: "linux", path: "/home/ohan/.dsh", imported: false, sessions: 12, tokens: 3456, files: 20, withUsage: 18, duplicates: 0, synthetic: 0 };

const payload = () => ({ local: LOCAL, imported: [SRC_WIN, SRC_MAC] });

// ── the shared index + the badge ─────────────────────────────────────────
test("index: local + imported homes, with the label/icon a badge needs", () => {
  S.setSourceIndex(payload());
  assert.equal(S.sourceInfo("sabrent-ohan").label, "Sabrent · Ohan");
  assert.equal(S.sourceInfo("sabrent-ohan").os, "windows");
  assert.equal(S.localSource().label, "This machine");
  assert.equal(S.importedSources().length, 2);
  assert.equal(S.hasImports(), true);
  assert.equal(S.osIcon("windows"), "🪟");
  assert.equal(S.osName("macos"), "macOS");
});

test("isImported: only rows tagged with a foreign home", () => {
  S.setSourceIndex(payload());
  assert.equal(S.isImported({ id: "a", source: "local" }), false);
  assert.equal(S.isImported({ id: "a" }), false);
  assert.equal(S.isImported({ id: "a", source: "sabrent-ohan" }), true);
});

test("sourceBadge: an imported row shows its home's icon + label, a local one nothing", () => {
  S.setSourceIndex(payload());
  const badge = S.sourceBadge({ id: "w", source: "sabrent-ohan" });
  assert.equal(badge.props.className, "tg-src-badge");
  assert.match(allText(badge), /🪟/);
  assert.match(allText(badge), /Sabrent · Ohan/);
  assert.match(String(badge.props.title), /Windows/);
  assert.match(String(badge.props.title), /\/media\/ohan\/Sabrent/);
  assert.equal(S.sourceBadge({ id: "l", source: "local" }), null);
  assert.equal(S.sourceBadge({ id: "x" }), null);
  // short: only the part before the "·" separator, for tight table cells
  assert.match(allText(S.sourceBadge({ source: "sabrent-ohan" }, { short: true })), /Sabrent/);
  assert.ok(!allText(S.sourceBadge({ source: "sabrent-ohan" }, { short: true })).includes("Ohan"));
});

test("sourceBadge: a row whose source is unknown still renders (raw id, no crash)", () => {
  S.setSourceIndex(payload());
  const badge = S.sourceBadge({ id: "z", source: "ghost-home" });
  assert.match(allText(badge), /ghost-home/);
  assert.match(allText(badge), /💾/); // unknown OS icon
});

test("inSourceFilter: all / local / one imported home", () => {
  S.setSourceIndex(payload());
  const localRow = { id: "l", source: "local" };
  const winRow = { id: "w", source: "sabrent-ohan" };
  assert.equal(S.inSourceFilter(localRow, "all"), true);
  assert.equal(S.inSourceFilter(winRow, "all"), true);
  assert.equal(S.inSourceFilter(winRow, "local"), false);
  assert.equal(S.inSourceFilter(localRow, "local"), true);
  assert.equal(S.inSourceFilter(winRow, "sabrent-ohan"), true);
  assert.equal(S.inSourceFilter(localRow, "sabrent-ohan"), false);
});

test("importedSummary: counts homes, sessions and tokens of the payload", () => {
  S.setSourceIndex(payload());
  const sum = S.importedSummary(payload());
  assert.equal(sum.sources, 2);
  assert.equal(sum.sessions, 230); // the paused one has no live counters
  assert.match(sum.text, /2 imported homes/);
  assert.match(sum.text, /230 sessions/);
  assert.match(sum.text, /1 off/);
  assert.equal(S.importedSummary({ imported: [] }), null);
  assert.equal(S.importedSummary(null), null);
});

// ── the filter chips ─────────────────────────────────────────────────────
test("SourceFilterBar: hidden with no imports, otherwise one chip per home + counts", () => {
  S.setSourceIndex({ local: LOCAL, imported: [] });
  assert.equal(S.SourceFilterBar({ value: "all", onChange: () => {}, rows: [] }), null);

  S.setSourceIndex(payload());
  const rows = [{ id: "1", source: "local" }, { id: "2", source: "sabrent-ohan" }, { id: "3", source: "sabrent-ohan" }];
  const bar = S.SourceFilterBar({ value: "all", onChange: () => {}, compact: true, rows });
  const chips = byClass(bar, "tg-srcchip");
  assert.equal(chips.length, 3); // compact: All + this machine + the Windows home (the paused one has no rows)
  assert.equal(byClass(S.SourceFilterBar({ value: "all", onChange: () => {}, rows }), "tg-srcchip").length, 4, "without compact every registered home keeps a chip");
  assert.equal(chips[0].props.className.includes("active"), true); // "all" is selected
  assert.deepEqual(chips.map((c) => texts(c.props.children[0]).join("")), ["All sources", "🐧 This machine", "🪟 Sabrent · Ohan"]);
  assert.deepEqual(chips.map((c) => texts(c.props.children[1]).join("")), ["3", "1", "2"]);

  // picking a source moves the active chip
  let picked = null;
  const bar2 = S.SourceFilterBar({ value: "sabrent-ohan", onChange: (v) => { picked = v; }, compact: true, rows });
  const chips2 = byClass(bar2, "tg-srcchip");
  assert.equal(chips2[2].props.className.includes("active"), true);
  chips2[1].props.onClick();
  assert.equal(picked, "local");
  // an id that is no longer in the index falls back to "all" being active
  const bar3 = S.SourceFilterBar({ value: "gone", onChange: () => {}, compact: true, rows });
  assert.equal(byClass(bar3, "tg-srcchip")[0].props.className.includes("active"), true);
});

// ── the settings card ────────────────────────────────────────────────────
test("ImportSourcesCard: lists each home with its OS, path, counts and controls", async () => {
  const api = stubApi({ sources: [SRC_WIN, SRC_MAC] });
  const m = mount(S.ImportSourcesCard, {});
  await m.settle();
  const rows = byClass(m.tree, "tg-src-row");
  assert.equal(rows.length, 2);
  const text = allText(m.tree);
  assert.match(text, /🪟/);
  assert.match(text, /Sabrent · Ohan/);
  assert.match(text, /Windows/);
  // The live counters (this load) win over the last cheap scan; the byte size
  // and the sync time come from the scan/registry.
  assert.match(text, /230 sessions · 230 trajectories/);
  assert.match(text, /936.3M tokens/);
  assert.match(text, /153.5 MB/);
  assert.match(text, /synced 1h ago/);
  assert.match(text, /MacBook Air/);
  assert.match(text, /paused/); // the disabled source is labelled, and dimmed
  assert.ok(byClass(m.tree, "tg-src-row-off").length >= 1);
  // Even the paused home keeps its own row (removable, re-enableable).
  assert.equal(byClass(m.tree, "tg-src-btn").filter((b) => texts(b.props.children).join("").includes("Remove")).length, 2);
  assert.equal(api.posts.length, 0, "listing never mutates");
});

test("ImportSourcesCard: a broken source shows its error instead of counts", async () => {
  stubApi({ sources: [{ ...SRC_MAC, error: "path not found — is the drive mounted?", enabled: true }] });
  const m = mount(S.ImportSourcesCard, {});
  await m.settle();
  assert.match(allText(m.tree), /⚠ path not found/);
  assert.ok(byClass(m.tree, "tg-src-row-bad").length === 1);
});

test("ImportSourcesCard: importing a path POSTs action=add and refreshes the list", async () => {
  let refreshed = 0;
  const api = stubApi({ sources: [] });
  const m = mount(S.ImportSourcesCard, { onChanged: () => { refreshed++; } });
  await m.settle();
  assert.match(allText(m.tree), /No imports yet/);

  const pathInput = byClass(m.tree, "tg-src-path")[0];
  pathInput.props.onChange({ target: { value: "/media/ohan/Sabrent/Users/Ohan/.dsh" } });
  m.render();
  click(m.tree, "tg-refresh", "Import source");
  await m.settle();
  assert.equal(api.posts.length, 1);
  assert.equal(api.posts[0].action, "add");
  assert.equal(api.posts[0].path, "/media/ohan/Sabrent/Users/Ohan/.dsh");
  assert.equal(refreshed, 1, "the dashboard data is reloaded so the import shows up");
  assert.match(allText(m.tree), /Imported added — its sessions are now folded in and marked/);
  assert.equal(byClass(m.tree, "tg-src-row").length, 1);
});

test("ImportSourcesCard: an empty path is refused before any request", async () => {
  const api = stubApi({ sources: [] });
  const m = mount(S.ImportSourcesCard, {});
  await m.settle();
  click(m.tree, "tg-refresh", "Import source");
  await m.settle();
  assert.equal(api.posts.length, 0);
  assert.match(allText(m.tree), /Give the path/);
});

test("ImportSourcesCard: a rejected add (bad path) shows the server message", async () => {
  const api = stubApi({ sources: [] });
  const m = mount(S.ImportSourcesCard, {});
  await m.settle();
  api.fail = "no DSH sessions found — expected a .dsh home";
  byClass(m.tree, "tg-src-path")[0].props.onChange({ target: { value: "/tmp/empty" } });
  m.render();
  click(m.tree, "tg-refresh", "Import source");
  await m.settle();
  assert.match(allText(m.tree), /no DSH sessions found/);
});

test("ImportSourcesCard: resync / pause / remove each POST their action", async () => {
  const api = stubApi({ sources: [SRC_WIN] });
  const m = mount(S.ImportSourcesCard, {});
  await m.settle();

  click(m.tree, "tg-src-btn", "Resync");
  await m.settle();
  assert.equal(api.posts.at(-1).action, "resync");
  assert.equal(api.posts.at(-1).id, "sabrent-ohan");

  click(m.tree, "tg-src-btn", "Pause");
  await m.settle();
  assert.deepEqual(api.posts.at(-1), { action: "update", id: "sabrent-ohan", enabled: false });
  assert.match(allText(m.tree), /paused/);

  // Remove is two-step: the first click only asks, the second one acts.
  click(m.tree, "tg-src-btn", "Remove");
  m.render();
  assert.equal(api.posts.filter((p) => p.action === "remove").length, 0, "no request before confirmation");
  assert.match(allText(m.tree), /Cancel/);
  click(m.tree, "tg-src-btn", "Cancel");
  m.render();
  assert.equal(byClass(m.tree, "tg-src-row").length, 1, "cancel keeps the home");
  click(m.tree, "tg-src-btn", "Remove");
  m.render();
  const confirm = byClass(m.tree, "tg-src-danger")[0];
  assert.ok(confirm, "the confirm button is the danger-styled one");
  confirm.props.onClick();
  await m.settle();
  assert.equal(api.posts.at(-1).action, "remove");
  assert.match(allText(m.tree), /its files were not touched/);
});

test("ImportSourcesCard: Scan lists candidates and adds one straight from the list", async () => {
  const cands = [
    { path: "/media/ohan/Sabrent/Users/Ohan/.dsh", label: "Sabrent · Ohan", os: "windows", sessions: 413, files: 231, tokens: 931029104, known: false },
    { path: "/home/ohan/.dsh", label: "ohan · .dsh", os: "linux", sessions: 12, files: 20, tokens: 3456, known: true },
  ];
  const api = stubApi({ sources: [SRC_WIN], candidates: cands });
  const m = mount(S.ImportSourcesCard, {});
  await m.settle();
  click(m.tree, "tg-ghost", "Scan for DSH homes");
  await m.settle();
  const rows = byClass(m.tree, "tg-src-cand");
  assert.equal(rows.length, 2);
  assert.match(allText(m.tree), /413 sessions · 231 trajectories · Windows/);
  assert.match(allText(m.tree), /already imported/); // the known one is not addable

  const addBtn = byClass(m.tree, "tg-src-btn").find((b) => texts(b.props.children).join("").includes("Add"));
  assert.ok(addBtn, "the unknown candidate has an Add button");
  addBtn.props.onClick();
  await m.settle();
  assert.equal(api.posts.at(-1).action, "add");
  assert.equal(api.posts.at(-1).path, "/media/ohan/Sabrent/Users/Ohan/.dsh");
});

test("ImportSourcesCard: the OS override is sent with a new import", async () => {
  const api = stubApi({ sources: [] });
  const m = mount(S.ImportSourcesCard, {});
  await m.settle();
  const segs = byClass(m.tree, "tg-seg-btn");
  assert.deepEqual(texts(segs[0].props.children), ["Auto-detect"]);
  segs[2].props.onClick(); // 🍎 macOS
  m.render();
  byClass(m.tree, "tg-src-path")[0].props.onChange({ target: { value: "/Volumes/x/.dsh" } });
  m.render();
  byClass(m.tree, "tg-src-name")[0].props.onChange({ target: { value: "Old Mac" } });
  m.render();
  click(m.tree, "tg-refresh", "Import source");
  await m.settle();
  assert.equal(api.posts[0].os, "macos");
  assert.equal(api.posts[0].label, "Old Mac");
});
