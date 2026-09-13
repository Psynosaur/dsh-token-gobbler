// token-gobbler · test/drawers-render.test.js
// Render smoke tests for the session drawers. The drawers are plain functions
// returning React elements built with the ambient jsx/jsxs helpers, and they are
// invoked from the shared table — so a bad element here crashes the whole modal
// (React error #31). This bundles client/drawers.tsx and renders it against a
// minimal React stub, asserting the tree contains what it should and that no
// element has a non-primitive child.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const entry = join(repo, "test", "drawers-render.entry.tsx");
const outfile = join(mkdtempSync(join(tmpdir(), "tg-drawers-")), "drawers.mjs");

// Bundle the drawers as ESM for Node (the same esbuild that builds the plugin).
execFileSync(join(repo, "node_modules", ".bin", "esbuild"), [entry, "--bundle", "--format=esm", "--platform=node", "--outfile=" + outfile, "--log-level=warning"], { cwd: repo });
assert.ok(existsSync(outfile), "bundle written");

/** Minimal React + jsx-runtime stub: hooks are inert, elements are plain objects. */
function installStubs() {
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...(props || {}), children: children.length > 1 ? children : children[0] } }),
    Fragment: Symbol("Fragment"),
    useState: (init) => [typeof init === "function" ? init() : init, () => {}],
    useMemo: (fn) => fn(),
    useRef: (init) => ({ current: init }),
    useEffect: () => {},
    useCallback: (fn) => fn,
  };
  const jsx = (type, props, key) => ({ type, props: props || {}, key });
  const jsxs = jsx;
  globalThis.React = React;
  globalThis.jsx = jsx;
  globalThis.jsxs = jsxs;
  globalThis.Fragment = React.Fragment;
}

/** Walk an element tree; return every child that React could not render. */
function badChildren(node, path = "root", out = []) {
  if (node == null || typeof node === "boolean") return out;
  if (typeof node === "string" || typeof node === "number") return out;
  if (Array.isArray(node)) { node.forEach((n, i) => badChildren(n, path + "[" + i + "]", out)); return out; }
  if (typeof node === "object" && node.$$typeof !== undefined) return out; // host element from another renderer
  if (typeof node === "object" && node.props !== undefined) {
    if (typeof node.type === "function") { badChildren(node.type(node.props), path + "<" + (node.type.name || "fn") + ">", out); return out; }
    badChildren(node.props.children, path + "<" + String(node.type) + ">", out);
    return out;
  }
  out.push(path + " = " + Object.prototype.toString.call(node));
  return out;
}

/** Collect every text string in the tree (for content assertions). */
function texts(node, out = []) {
  if (node == null || typeof node === "boolean") return out;
  if (typeof node === "string" || typeof node === "number") { out.push(String(node)); return out; }
  if (Array.isArray(node)) { for (const n of node) texts(n, out); return out; }
  if (typeof node === "object" && node.props !== undefined) {
    if (typeof node.type === "function") { texts(node.type(node.props), out); return out; }
    texts(node.props.children, out);
  }
  return out;
}

/** A session row like the server sends: steps + the trajectory turn timeline. */
function fakeSession() {
  const steps = [
    { turn: 1, step: 1, model: "deepseek-v4-flash", in: 100, out: 50, cache: 0, thinking: 0, ttftMs: 100, decodeMs: 200, decodeTokPerSec: 250, prefillTokPerSec: 1000, ctxTotal: 500, ctxWindow: 100000 },
    { turn: 1, step: 2, model: "deepseek-v4-flash", in: 120, out: 60, cache: 1000, thinking: 10, ttftMs: 120, decodeMs: 240, decodeTokPerSec: 250, prefillTokPerSec: 900, ctxTotal: 1200, ctxWindow: 100000 },
    { turn: 2, step: 1, model: "deepseek-v4-flash", in: 80, out: 40, cache: 2000, thinking: 0, ttftMs: 90, decodeMs: 180, decodeTokPerSec: 222, prefillTokPerSec: 800, ctxTotal: 2400, ctxWindow: 100000 },
  ];
  return {
    id: "session-test-0001", date: "2026-09-11", cwd: "/x", title: "test session",
    model: "deepseek-v4-flash", models: [{ key: "deepseek-v4-flash", provider: "deepseek-official", steps: 3 }],
    exact: true, createdAt: 1_700_000_000_000, turns: 2, allTokens: 3450, cost: 0.01,
    tokPerSec: 250, uncachedInputTokens: 300, outputTokens: 150, cacheReadTokens: 3000, cacheWriteTokens: 0,
    events: { steps: 3, toolCalls: 3, userMessages: 2, assistantMessages: 3, systemMessages: 1, turns: 2, userStops: 1, compactions: 1, retries: 1, approvals: 1, todos: 1, commands: 0, toolSubCalls: 0 },
    meta: { toolMs: 100, ttftMs: 310, ttftSteps: 3, decodeMs: 620, decodeTokens: 150, sandbox: "workspace-write", approval: "ask", preset: "workspace-write" },
    steps,
    stepTree: [{ turn: 1, steps: [steps[0], steps[1]] }, { turn: 2, steps: [steps[2]] }],
    turnTimeline: {
      totalTurns: 2, totalEvents: 6,
      turns: [
        { turn: 1, seq: 4, startTime: 1000, endTime: 5000, status: "aborted", detail: "stopped by user", prompt: "do the thing", response: "I'll start with a memory recall.", steps: 2 },
        { turn: 2, seq: 50, startTime: 6000, endTime: 9000, status: "completed", detail: null, prompt: "and now this", response: "→ bash", steps: 1 },
      ],
      events: [
        { turn: null, step: null, seq: 3, time: 900, kind: "system", text: "System prompt — 4000 chars · first sent in turn 1" },
        { turn: 1, step: null, seq: 4, time: 1000, kind: "prompt", text: "do the thing" },
        { turn: 1, step: null, seq: 30, time: 3000, kind: "approval", text: "Approval asked · bash — escalate sandbox" },
        { turn: 1, step: null, seq: 40, time: 4000, kind: "user-stop", text: "Turn stopped by user" },
        { turn: 2, step: null, seq: 60, time: 7000, kind: "compaction", text: "Compaction summary — 3226 tokens shadowed (900 chars)" },
        { turn: 2, step: null, seq: 70, time: 8000, kind: "retry", text: "Retry 1/5 · TRANSPORT: terminated (after 504ms)" },
      ],
    },
  };
}

test("combinedDrawer + sessionDrawer render a session with a turn timeline", async () => {
  installStubs();
  const mod = await import(outfile);
  const s = fakeSession();

  for (const [name, fn] of [["combinedDrawer", mod.combinedDrawer], ["sessionDrawer", mod.sessionDrawer]]) {
    const el = fn(s, { defaultClosed: true });
    const bad = badChildren(el);
    assert.deepEqual(bad, [], name + ": every child is renderable");
    const t = texts(el).join(" | ");
    assert.ok(t.includes("Turn outline & events"), name + ": timeline section header present");
    assert.ok(t.includes("do the thing"), name + ": turn prompt rendered");
    assert.ok(t.includes("stopped by user") || t.includes("aborted"), name + ": turn outcome rendered");
    assert.ok(t.includes("Turn stopped by user"), name + ": user-stop event rendered");
    assert.ok(t.includes("Retry 1/5"), name + ": retry event rendered");
    assert.ok(t.includes("Compaction summary"), name + ": compaction event rendered");
  }
});

/** Every element of a given component (matched by function name) in a tree. */
function byType(node, name, out = []) {
  if (node == null || typeof node !== "object") return out;
  if (Array.isArray(node)) { for (const n of node) byType(n, name, out); return out; }
  if (node.props) {
    if (typeof node.type === "function" && node.type.name === name) out.push(node);
    byType(node.props.children, name, out);
  }
  return out;
}

test("combinedDrawer wires the perf chart for the dot modes + persisted toggles", async () => {
  installStubs();
  const mod = await import(outfile);
  const el = mod.combinedDrawer(fakeSession(), { defaultClosed: true });
  assert.deepEqual(badChildren(el), [], "the drawer still renders");

  const chart = byType(el, "GraphCanvas")[0];
  assert.ok(chart, "the perf panel is drawn by the canvas engine");
  assert.equal(chart.props.modeChips, true, "the Lines / Both / Dots switch is offered");
  assert.equal(chart.props.persistKey, "perf", "and its chips + plot mode are remembered for next time");
  assert.ok(chart.props.chips.length >= 1 && chart.props.metricChips.length === 6, "the togglable chips are wired");
  assert.equal(chart.props.tipData.length, 3, "one tooltip row per plotted step");
});

test("drawers render a legacy session with no turn timeline", async () => {
  installStubs();
  const mod = await import(outfile);
  const s = fakeSession();
  delete s.turnTimeline;
  s.meta.turnOutline = [{ turn: 1, prompt: "legacy prompt", response: "legacy response" }];

  const combined = mod.combinedDrawer(s, { defaultClosed: true });
  assert.deepEqual(badChildren(combined), []);
  const t = texts(combined).join(" | ");
  assert.ok(t.includes("Turn outline & events"), "turns still listed from the step tree");
  assert.ok(t.includes("Turn 1") && t.includes("Turn 2"));

  const sd = mod.sessionDrawer(s);
  assert.deepEqual(badChildren(sd), []);
  assert.ok(texts(sd).join(" | ").includes("legacy prompt"), "the projcache turn outline is still used when there is no timeline");
});
