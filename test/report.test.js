// token-gobbler · tests (node --test). Self-contained: uses temp dirs, not ~/.dsh.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, writeFileSync, mkdirSync, statSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zstdCompressSync } from "node:zlib";

import { priceFor, costFor, costBreakdown, modelKey, priceForProvider, isCopilotProvider, LOCAL_QWEN_KEY, seedEntries, kindFor } from "../lib/pricing.js";
import { attributeSession } from "../lib/report.js";
import { parseTrajectoryText, readTrajectory, parseStatsSnapshot } from "../lib/trajectory.js";
import { readProjcache } from "../lib/projcache.js";
import { buildReport, priceTotals, buildBreakdown, buildPerformance, addSavings, resolvePaths, loadPricing, savePricing, pricingFilePath, reprocessTrajectories, discoverLocalModels, discoverModelCards } from "../lib/report.js";
import { builtinEntries, setRuntimeTable } from "../lib/pricing.js";

// ── pricing ──────────────────────────────────────────────────────────────
test("priceFor: exact + normalized + bedrock", () => {
  assert.equal(priceFor("claude-sonnet-4.6").input, 3);
  assert.equal(priceFor("anthropic.claude-sonnet-4-6").input, 3);
  assert.equal(priceFor("eu.anthropic.claude-opus-4-5-v1").output, 25);
  assert.equal(priceFor("claude-opus-4.6").output, 25);
});

test("priceFor: Qwen local is metered", () => {
  for (const m of ["Qwen3.8-27B-Q6-GGUF", "Qwen3.8-27B-MLX-4bit", "qwen3.8-27b"]) {
    const c = priceFor(m);
    assert.ok(c, m);
    assert.equal(c.input, 0.25);
    assert.equal(c.output, 2.5);
    assert.equal(c.cacheRead, 0.05);
  }
});

test("priceFor: other local models are free", () => {
  for (const m of ["llama-3-8b", "gemma-2-9b", "/Users/x/.ollama/models/blobs/sha256-abc"]) {
    const c = priceFor(m);
    assert.ok(c, m);
    assert.equal(c.input, 0);
    assert.equal(c.output, 0);
  }
});

test("priceFor: family fallback + unknown", () => {
  assert.equal(priceFor("some-sonnet-thing").input, 3);
  assert.equal(priceFor("grok-9.9").input, 3);
  assert.equal(priceFor("totally-unknown-model-xyz"), null);
});

test("costFor: math", () => {
  const b = { uncachedInputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 1_000_000, cacheWriteTokens: 1_000_000 };
  const c = priceFor("claude-sonnet-4.6"); // 3 / 15 / 0.30 / 3.75
  assert.ok(Math.abs(costFor(b, c) - (3 + 15 + 0.3 + 3.75)) < 1e-9);
  const bd = costBreakdown(b, c);
  assert.ok(Math.abs(bd.inputCost - 3) < 1e-9);
  assert.ok(Math.abs(bd.outputCost - 15) < 1e-9);
});

test("costFor: local models price at their configured rates, corp models bill", () => {
  const b = { uncachedInputTokens: 5_000_000, outputTokens: 2_000_000, cacheReadTokens: 9_000_000, cacheWriteTokens: 0 };
  assert.equal(costFor(b, priceFor("llama-3-8b")), 0); // non-Qwen local -> local-free card (all-zero rates)
  const q = { uncachedInputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 1_000_000, cacheWriteTokens: 0 };
  // local Qwen -> qwen3.8-local card (0.25 / 2.5 / 0.05 / 0.3125)
  assert.ok(Math.abs(costFor(q, priceFor("Qwen3.8-27B-Q6-GGUF")) - (0.25 + 2.5 + 0.05)) < 1e-6);
  assert.ok(Math.abs(costFor(q, priceFor("qwen3.8-local")) - (0.25 + 2.5 + 0.05)) < 1e-6);
  // a corp card still bills at its rate
  assert.ok(Math.abs(costFor(q, priceFor("deepseek-v4-flash")) - (0.44 + 1.32 + 0.014)) < 1e-6);
});

// ── provider-aware pricing ───────────────────────────────────────────────
test("modelKey: the table decides (copilot keeps its card; local keeps its own name)", () => {
  assert.equal(modelKey("github-copilot-official", "claude-sonnet-4.6"), "claude-sonnet-4.6");
  assert.equal(modelKey("github-copilot", "claude-opus-4.6"), "claude-opus-4.6");
  // local providers are NOT collapsed into the qwen baseline — each keeps its own model name
  assert.equal(modelKey("qweno", "Qwen3.8-27B-Q6-GGUF"), "qwen3.8-27b-q6-gguf");
  assert.equal(modelKey("omlx", "Qwen3.8-27B-MLX-4bit"), "qwen3.8-27b-mlx-4bit");
  assert.equal(modelKey("vllm", "qwen3.8-27b"), "qwen3.8-27b");
  assert.equal(modelKey("deepseek-official", "deepseek-v4-flash"), "deepseek-v4-flash"); // corp card keeps its own card
  assert.equal(modelKey(null, "claude-sonnet-4.6"), "claude-sonnet-4.6"); // corp-marked card stays corp even with no provider
});

test("isCopilotProvider + priceForProvider", () => {
  assert.equal(isCopilotProvider("github-copilot-official"), true);
  assert.equal(isCopilotProvider("qweno"), false);
  assert.equal(priceForProvider("github-copilot-official", "claude-opus-4.6").input, 5);
  assert.equal(priceForProvider("qweno", "Qwen3.8-27B-Q6-GGUF").input, 0.25); // local Qwen -> metered qwen card
  assert.equal(priceForProvider("omlx", "Qwen3.8-27B-MLX-4bit").input, 0.25); // local Qwen -> metered qwen card
  assert.equal(priceForProvider("ollama", "llama-3-8b").input, 0); // other self-hosted -> local-free
  assert.equal(priceForProvider("omlx", "totally-unknown"), null); // unrecognizable local -> no card
});

test("attributeSession: splits totals by step count per model", () => {
  const totals = { uncachedInputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
  const changes = [
    { seq: 0, provider: "github-copilot-official", model: "claude-sonnet-4.6" },
    { seq: 100, provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" },
  ];
  const steps = [];
  for (let i = 0; i < 10; i++) steps.push(i); // 0..9 -> sonnet
  for (let i = 100; i < 130; i++) steps.push(i); // 100..129 -> qwen
  const out = attributeSession(totals, changes, steps, "fallback");
  const sonnet = out.find((m) => m.model === "claude-sonnet-4.6");
  const qwen = out.find((m) => m.model === "Qwen3.8-27B-Q6-GGUF");
  assert.equal(sonnet.steps, 10);
  assert.equal(qwen.steps, 30);
  assert.ok(Math.abs(sonnet.buckets.uncachedInputTokens - 250_000) < 1e-6); // 10/40
  assert.ok(Math.abs(qwen.buckets.uncachedInputTokens - 750_000) < 1e-6); // 30/40
});

test("attributeSession: no changes -> fallback model gets everything", () => {
  const totals = { uncachedInputTokens: 100, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
  const out = attributeSession(totals, [], [1, 2, 3], "Qwen3.8-27B-Q6-GGUF");
  assert.equal(out.length, 1);
  assert.equal(out[0].model, "Qwen3.8-27B-Q6-GGUF");
  assert.equal(out[0].buckets.uncachedInputTokens, 100);
});

// ── trajectory ───────────────────────────────────────────────────────────
test("parseTrajectoryText: usage + model attribution", () => {
  const lines = [
    { type: "session", id: "s1", createdAt: 1, cwd: "/x", agentPreset: "code" },
    { type: "request/context", data: { provider: "copilot", model: "claude-sonnet-4.6", contextWindow: 200000 } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 50, cacheReadTokens: 200, reasoningTokens: 10 } } } },
    { type: "assistant/chunk", data: { turn: 1, step: 2, chunk: { type: "usage", usage: { inputTokens: 30, outputTokens: 20, cacheReadTokens: 40 } } } },
    { type: "assistant/chunk", data: { turn: 1, step: 2, chunk: { type: "finish", replayState: { response: { provider: "copilot", model: "claude-sonnet-4.6" } } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.meta.id, "s1");
  assert.equal(r.usage.length, 2);
  assert.equal(r.usage[0].model, "claude-sonnet-4.6");
  assert.equal(r.usage[0].buckets.uncachedInputTokens, 100);
  assert.equal(r.usage[0].buckets.reasoningTokens, 10);
  assert.equal(r.modelCounts["claude-sonnet-4.6"], 2);
});

test("parseTrajectoryText: header-only -> no usage", () => {
  const r = parseTrajectoryText(JSON.stringify({ type: "session", id: "s2", cwd: "/y" }));
  assert.equal(r.usage.length, 0);
});

// ── P2P evidence ─────────────────────────────────────────────────────────
test("parseTrajectoryText: p2p — affirmative enablement evidence counts", () => {
  const mk = (text) => parseTrajectoryText(JSON.stringify({ type: "session", id: "s", cwd: "/x", data: { text } }));
  // nvidia-smi / driver confirmation lines
  assert.equal(mk("P2P access enabled between GPU 0 and GPU 1").p2p, true);
  assert.equal(mk("P2P is enabled by default in this build").p2p, true);
  assert.equal(mk("we need to enable P2P for the dual 3090s").p2p, true);
  assert.equal(mk("P2P: on").p2p, true);
  assert.equal(mk("patch the nvidia driver with p2p support").p2p, true);
});

test("parseTrajectoryText: p2p — a passing mention is NOT enablement", () => {
  const mk = (text) => parseTrajectoryText(JSON.stringify({ type: "session", id: "s", cwd: "/x", data: { text } }));
  const off = mk("what does P2P mean for multi-gpu inference?");
  assert.equal(off.p2p, false);
  // …but the mention volume is still recorded so the UI can flag it for triage
  assert.equal(off.p2pMentions, 1);
  assert.equal(mk("no p2p here at all").p2pMentions, 1);
});

test("readTrajectory: content-hash parse cache", () => {
  const dir = mkdtempSync(join(tmpdir(), "tg-cache-"));
  const p = join(dir, "session.jsonl.zstd");
  const compress = (lines) => zstdCompressSync(Buffer.from(lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf8"));

  const s0 = parseStatsSnapshot();
  const delta = () => { const d = parseStatsSnapshot(); return { hits: d.cacheHits - s0.cacheHits, recomputed: d.recomputed - s0.recomputed }; };

  // 1. first read -> recomputed
  writeFileSync(p, compress([{ type: "session", id: "s1", cwd: "/x" }]));
  assert.equal(readTrajectory(p).meta.id, "s1");
  assert.deepEqual(delta(), { hits: 0, recomputed: 1 });

  // 2. unchanged -> cache hit (no recompute, no re-read)
  assert.equal(readTrajectory(p).meta.id, "s1");
  assert.deepEqual(delta(), { hits: 1, recomputed: 1 });

  // 3. mtime bumped but content identical -> hash backstop, still a hit
  const st = statSync(p);
  utimesSync(p, new Date(st.atimeMs + 5000), new Date(st.mtimeMs + 5000));
  assert.equal(readTrajectory(p).meta.id, "s1");
  assert.deepEqual(delta(), { hits: 2, recomputed: 1 });

  // 4. content changed -> recomputed
  writeFileSync(p, compress([
    { type: "session", id: "s2", cwd: "/x" },
    { type: "step/end", seq: 1, data: { turn: 1, step: 1 } },
  ]));
  const r4 = readTrajectory(p);
  assert.equal(r4.meta.id, "s2");
  assert.equal(r4.stepSeqs.length, 1);
  assert.deepEqual(delta(), { hits: 2, recomputed: 2 });
});

test("parseTrajectoryText: event categories + tool names", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "step/end", seq: 1 },
    { type: "step/end", seq: 2 },
    { type: "tool/call", seq: 3, data: { name: "run_code" } },
    { type: "tool/code-dispatch", seq: 4, data: { name: "bash" } },
    { type: "tool/code-dispatch", seq: 5, data: { name: "bash" } },
    { type: "tool/code-dispatch", seq: 6, data: { name: "read" } },
    { type: "user/message", seq: 7 },
    { type: "assistant/message", seq: 8 },
    { type: "turn/end", seq: 9 },
    { type: "compaction/end", seq: 10 },
    { type: "llm/retry", seq: 11 },
    { type: "approval/asked", seq: 12 },
    { type: "todo/write", seq: 13 },
    { type: "command/done", seq: 14 },
    { type: "reasoning-chunks", seq: 15 }, // not an activity category -> ignored
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.events.steps, 2);
  assert.equal(r.events.toolCalls, 1);
  assert.equal(r.events.toolSubCalls, 3);
  assert.equal(r.events.userMessages, 1);
  assert.equal(r.events.assistantMessages, 1);
  assert.equal(r.events.turns, 1);
  assert.equal(r.events.userStops, 0); // turn/end without aborted-by-user reason
  assert.equal(r.events.compactions, 1);
  assert.equal(r.events.retries, 1);
  assert.equal(r.events.approvals, 1);
  assert.equal(r.events.todos, 1);
  assert.equal(r.events.commands, 1);
  assert.equal(r.tools.bash, 2);
  assert.equal(r.tools.read, 1);
  assert.equal(r.tools.run_code, undefined); // tool/call names are not counted in tools
});

test("parseTrajectoryText: user stop = turn/end aborted by user", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "turn/end", seq: 1, data: { turn: 1, reason: { kind: "aborted", reason: { kind: "user" } } } }, // USER STOP
    { type: "turn/end", seq: 2, data: { turn: 2, reason: { kind: "completed" } } }, // normal end
    { type: "turn/end", seq: 3, data: { turn: 3, reason: { kind: "aborted", reason: { kind: "parent" } } } }, // NOT user-initiated
    { type: "turn/end", seq: 4, data: { turn: 4, reason: { kind: "aborted", reason: { kind: "user" } } } }, // USER STOP
    { type: "turn/end", seq: 5, data: { turn: 5, reason: { kind: "interrupted" } } }, // crash-orphan marker, not a stop
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.events.turns, 5); // every turn/end still counts as a turn
  assert.equal(r.events.userStops, 2); // only the two aborted-by-user turns
});

test("buildBreakdown: aggregate + per-session events/tools", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-ev-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "session-e");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "session-e": { identity: { createdAt: 100, cwd: "/tmp" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 100, outputTokens: 50, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "session-e", createdAt: 100, cwd: "/tmp" },
    { type: "step/end", seq: 1 },
    { type: "tool/call", seq: 2, data: { name: "run_code" } },
    { type: "tool/code-dispatch", seq: 3, data: { name: "bash" } },
    { type: "user/message", seq: 4 },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));
  const bd = buildBreakdown({ dshHome: home });
  assert.equal(bd.events.steps, 1);
  assert.equal(bd.events.toolCalls, 1);
  assert.equal(bd.events.toolSubCalls, 1);
  assert.equal(bd.events.userMessages, 1);
  assert.equal(bd.tools.length, 1);
  assert.equal(bd.tools[0].name, "bash");
  assert.equal(bd.tools[0].count, 1);
  assert.equal(bd.bySession.length, 1);
  assert.equal(bd.bySession[0].events.steps, 1);
  assert.equal(bd.bySession[0].tools[0].name, "bash");
});

// ── projcache ────────────────────────────────────────────────────────────
test("readProjcache: aggregates totals", () => {
  const dir = mkdtempSync(join(tmpdir(), "tg-"));
  const store = { unit: { name: "session_projcache", version: 3 }, tables: { sessions: {
    a: { identity: { createdAt: 2, cwd: "/a" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 10, outputTokens: 5, cacheReadTokens: 7, cacheWriteTokens: 1 } } } } },
    b: { identity: { createdAt: 1, cwd: "/b" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}};
  const p = join(dir, "session_projcache.json");
  writeFileSync(p, JSON.stringify(store));
  const r = readProjcache(p);
  assert.equal(r.count, 2);
  assert.equal(r.nonZero, 1);
  assert.equal(r.totals.uncachedInputTokens, 10);
  assert.equal(r.totals.cacheReadTokens, 7);
});

// ── report (integration, temp DSH home) ──────────────────────────────────
test("buildReport: merges sources + prices", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-home-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "session-x");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "session-x": { identity: { createdAt: 100, cwd: "/tmp" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 1_000_000, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "session-x", createdAt: 100, cwd: "/tmp" },
    { type: "request/context", data: { provider: "copilot", model: "claude-opus-4.6" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 1_000_000 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  const rep = buildReport({ dshHome: home });
  assert.equal(rep.totals.uncachedInputTokens, 1_000_000);
  assert.equal(rep.totals.allTokens, 3_000_000);
  const local = rep.comparison.find((c) => c.id === "qwen3.8-local");
  const opus = rep.comparison.find((c) => c.id === "claude-opus-4.6");
  assert.ok(Math.abs(local.cost - (0.25 + 2.5 + 0.05)) < 1e-6); // local Qwen priced at qwen3.8-local rates
  assert.ok(Math.abs(opus.cost - (5 + 25 + 0.5)) < 1e-6);
  // savings vs the local (home-lab) baseline
  assert.equal(local.baseline, true);
  assert.equal(local.savings, 0);
  assert.equal(opus.baseline, false);
  assert.ok(Math.abs(opus.savings - ((5 + 25 + 0.5) - (0.25 + 2.5 + 0.05))) < 1e-6);
  assert.equal(rep.savings.baselineId, "qwen3.8-local");
  assert.ok(Math.abs(rep.savings.baselineCost - (0.25 + 2.5 + 0.05)) < 1e-6);
  assert.ok(rep.savings.max > 0);
  assert.equal(rep.byModel.length, 1);
  assert.equal(rep.byModel[0].model, "claude-opus-4.6");
  assert.ok(rep.actual.fromTrajectories);
  assert.ok(Math.abs(rep.actual.cost - (5 + 25 + 0.5)) < 1e-6);
});

test("priceTotals: re-prices a window", () => {
  const totals = { uncachedInputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
  const out = priceTotals(totals, [{ id: "claude-sonnet-4.6", label: "S" }, { id: "qwen3.8-local", label: "L" }]);
  assert.ok(Math.abs(out[0].cost - 3) < 1e-9);
  assert.ok(Math.abs(out[1].cost - 0.25) < 1e-9); // home-lab baseline priced at qwen3.8-local input rate
});

test("addSavings: local baseline + per-model savings", () => {
  const raw = [
    { id: "qwen3.8-local", label: "L", priced: true, cost: 2.8 },
    { id: "claude-opus-4.6", label: "O", priced: true, cost: 30.5 },
    { id: "unknown-model", label: "U", priced: false, cost: null },
  ];
  const { comparison, savings } = addSavings(raw);
  assert.equal(comparison[0].baseline, true);
  assert.equal(comparison[0].savings, 0);
  assert.equal(comparison[1].baseline, false);
  assert.ok(Math.abs(comparison[1].savings - 27.7) < 1e-6);
  assert.equal(comparison[2].savings, null);
  assert.equal(savings.baselineId, "qwen3.8-local");
  assert.ok(Math.abs(savings.baselineCost - 2.8) < 1e-6);
  assert.ok(Math.abs(savings.max - 27.7) < 1e-6);
  assert.ok(Math.abs(savings.min - 27.7) < 1e-6);
});

// ── breakdown ────────────────────────────────────────────────────────────
test("buildBreakdown: per-day / per-model / per-session (Qwen assumed)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-bd-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  writeFileSync(join(home, "settings.yaml"), ["agent-default-model:", "  provider: qweno", "  model: Qwen3.8-27B-Q6-GGUF"].join("\n"));
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    a: { identity: { createdAt: Date.parse("2026-09-01T10:00:00Z"), cwd: "/a" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 100_000, cacheReadTokens: 5_000_000, cacheWriteTokens: 0 } } } } },
    b: { identity: { createdAt: Date.parse("2026-09-02T10:00:00Z"), cwd: "/b" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 2_000_000, outputTokens: 200_000, cacheReadTokens: 10_000_000, cacheWriteTokens: 0 } } } } },
  }}}));
  const bd = buildBreakdown({ dshHome: home });
  assert.equal(bd.defaultModel.model, "Qwen3.8-27B-Q6-GGUF");
  assert.equal(bd.byDay.length, 2);
  assert.equal(bd.bySession.length, 2);
  assert.equal(bd.byModel.length, 1);
  assert.equal(bd.byModel[0].model, "qwen3.8-27b-q6-gguf"); // the default model keeps its own name (not folded into the qwen baseline)
  assert.equal(bd.byModel[0].sessions, 2);
  assert.equal(bd.byModel[0].cacheReadTokens, 15_000_000);
  // local Qwen priced at qwen3.8-local rates: a=(1M*.25+100K*2.5+5M*.05)=0.75, b=(2M*.25+200K*2.5+10M*.05)=1.5
  assert.ok(Math.abs(bd.byModel[0].cost - 2.25) < 1e-6);
  const sA = bd.bySession.find((s) => s.id === "a");
  const sB = bd.bySession.find((s) => s.id === "b");
  assert.ok(Math.abs(sA.cost - 0.75) < 1e-6);
  assert.ok(Math.abs(sB.cost - 1.5) < 1e-6);
  // per-day cost rolls the session costs up (byDay is date-ascending)
  assert.ok(Math.abs(bd.byDay[0].cost - 0.75) < 1e-6);
  assert.ok(Math.abs(bd.byDay[1].cost - 1.5) < 1e-6);
});

test("buildReport: WFH split (local vs Copilot)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-wfh-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const mk = (id) => { const ws = join(home, "sessions", "--tmp--", id); mkdirSync(ws, { recursive: true }); return ws; };
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-local": { identity: { createdAt: 100, cwd: "/a" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
    "s-copilot": { identity: { createdAt: 200, cwd: "/b" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const tLocal = [
    { type: "session", id: "s-local", cwd: "/a" },
    { type: "request/context", data: { provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1_000_000 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const tCopilot = [
    { type: "session", id: "s-copilot", cwd: "/b" },
    { type: "request/context", data: { provider: "github-copilot-official", model: "claude-sonnet-4.6" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1_000_000 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(mk("s-local"), "session.jsonl.zstd"), zstdCompressSync(Buffer.from(tLocal, "utf8")));
  writeFileSync(join(mk("s-copilot"), "session.jsonl.zstd"), zstdCompressSync(Buffer.from(tCopilot, "utf8")));

  const rep = buildReport({ dshHome: home });
  // local: seeded entry has zero rates (user hasn't set them yet) -> $0; copilot: 1M @ 3/M -> $3
  assert.equal(rep.split.wfh.sessions, 1);
  assert.equal(rep.split.wfh.tokens, 1_000_000);
  assert.equal(rep.split.wfh.cost, 0); // local model's own table entry has 0 rates until user sets them
  // WFH reference model defaults to claude-opus-4.6: same local tokens @ 5/M input -> $5
  assert.equal(rep.split.wfh.referenceModel, "claude-opus-4.6");
  assert.ok(rep.split.wfh.referenceLabel.includes("Opus 4.6"));
  assert.ok(Math.abs(rep.split.wfh.corpCost - 5) < 1e-6);
  assert.ok(Math.abs(rep.split.wfh.saved - 5) < 1e-6); // corp would bill $5, home lab is $0 (unset rates)
  assert.equal(rep.split.corp.sessions, 1);
  assert.equal(rep.split.corp.tokens, 1_000_000);
  assert.ok(Math.abs(rep.split.corp.cost - 3) < 1e-6);
  // actual = local($0) + copilot($3) = $3; baseline (all local) = 2M @ 0.25/M = $0.50
  assert.ok(Math.abs(rep.actual.cost - 3) < 1e-6);
  assert.ok(Math.abs(rep.actualSavings - 2.5) < 1e-6);
});

// ── new projcache directory layout (dsh update, 2026-09) ────────────────
test("readProjcache: new per-session directory layout", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-dir-"));
  const sdir = join(home, "storages", "session_projcache", "sessions");
  mkdirSync(sdir, { recursive: true });
  const mk = (id, rows, identity) => writeFileSync(join(sdir, id + ".json"), JSON.stringify({ version: 5, record: { identity, rows } }));
  mk("session-a", {
    tokenUsage: { val: { totals: { uncachedInputTokens: 100, outputTokens: 50, cacheReadTokens: 200, cacheWriteTokens: 0 } } },
    sessionStats: { val: { turns: 3, steps: 10, llmMs: 1234, toolMs: 56, ttftMs: 100, ttftSteps: 2, decodeMs: 900, decodeTokens: 50, lastTurn: 3 } },
    title: { val: "dir layout session" },
    contextPressure: { val: { surfaceTokens: 1000, contextWindow: 2000, pressureTokens: 0 } },
    permissions: { val: { preset: "workspace-write", sandbox: "workspace-write", approval: "ask" } },
    modelSelection: { val: { lastUsed: { provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" } } },
    turnOutline: { val: { turns: [{ turn: 1, prompt: "p1", response: "r1" }] } },
  }, { createdAt: 200, cwd: "/a" });
  mk("session-b", {
    tokenUsage: { val: { totals: { uncachedInputTokens: 10, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } } },
    title: { val: "b" },
  }, { createdAt: 100, cwd: "/b" });

  const r = readProjcache(join(home, "storages", "session_projcache"));
  assert.equal(r.count, 2);
  assert.equal(r.nonZero, 2);
  assert.equal(r.totals.uncachedInputTokens, 110);
  assert.equal(r.totals.cacheReadTokens, 200);
  const a = r.sessions.find((s) => s.id === "session-a");
  assert.equal(a.title, "dir layout session");
  assert.equal(a.turns, 3);
  assert.equal(a.meta.sandbox, "workspace-write");
  assert.equal(a.meta.approval, "ask");
  assert.equal(a.meta.lastUsedModel.model, "Qwen3.8-27B-Q6-GGUF");
  assert.equal(a.meta.contextPressure.surfaceTokens, 1000);
  assert.equal(a.meta.turnOutline[0].prompt, "p1");
  assert.equal(a.meta.goal, null);
});

test("resolvePaths: prefers new directory store over legacy file", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-rc-"));
  mkdirSync(join(home, "storages", "session_projcache", "sessions"), { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), "{}");
  const p = resolvePaths({ dshHome: home });
  assert.equal(p.storeKind, "dir");
  assert.ok(p.storePath.endsWith("session_projcache"));
  // legacy-only home falls back to the file
  const home2 = mkdtempSync(join(tmpdir(), "tg-rc2-"));
  mkdirSync(join(home2, "storages"), { recursive: true });
  writeFileSync(join(home2, "storages", "session_projcache.json"), "{}");
  const p2 = resolvePaths({ dshHome: home2 });
  assert.equal(p2.storeKind, "file");
  assert.ok(p2.storePath.endsWith("session_projcache.json"));
});

test("buildBreakdown: directory store + per-session meta + toolCalls", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-bddir-"));
  const sdir = join(home, "storages", "session_projcache", "sessions");
  mkdirSync(sdir, { recursive: true });
  writeFileSync(join(sdir, "session-d.json"), JSON.stringify({ version: 5, record: {
    identity: { createdAt: Date.parse("2026-09-04T10:00:00Z"), cwd: "/d" },
    rows: {
      tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 100_000, cacheReadTokens: 0, cacheWriteTokens: 0 } } },
      title: { val: "dir session" },
      sessionStats: { val: { turns: 1, steps: 2, llmMs: 500, toolMs: 50 } },
      contextPressure: { val: { surfaceTokens: 500, contextWindow: 1000, pressureTokens: 0 } },
    },
  }}));
  const ws = join(home, "sessions", "--tmp--", "session-d");
  mkdirSync(ws, { recursive: true });
  const traj = [
    { type: "session", id: "session-d", createdAt: Date.parse("2026-09-04T10:00:00Z"), cwd: "/d" },
    { type: "request/context", data: { provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" } },
    { type: "step/end", seq: 1 },
    { type: "tool/call", seq: 2, data: { name: "bash" } },
    { type: "tool/code-dispatch", seq: 3, data: { name: "bash" } },
    { type: "tool/call", seq: 4, data: { name: "read" } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  const bd = buildBreakdown({ dshHome: home });
  assert.equal(bd.bySession.length, 1);
  const s = bd.bySession[0];
  assert.equal(s.id, "session-d");
  assert.equal(s.meta.contextPressure.surfaceTokens, 500);
  assert.equal(s.meta.toolMs, 50);
  assert.deepEqual(s.toolCalls, [{ name: "bash", count: 1 }, { name: "read", count: 1 }]);
  assert.deepEqual(s.tools, [{ name: "bash", count: 1 }]);
});

// ── editable pricing table (file-backed, re-read per request) ───────────
test("loadPricing: no file -> built-in table + default reference (opus 4.6)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-px-"));
  const p = loadPricing(home);
  assert.equal(p.fromFile, false);
  assert.equal(p.referenceModel, "claude-opus-4.6");
  assert.ok(p.models.length >= 10);
  assert.ok(p.models.some((m) => m.id === "qwen3.8-local" && m.local));
  assert.ok(p.models.every((m) => m.id && m.label && Number.isFinite(m.input)));
  // built-in rates are effective
  assert.equal(priceFor("claude-sonnet-4.6").input, 3);
});

test("savePricing: round-trip + reference model drives WFH corpCost", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-px2-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-local");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-local": { identity: { createdAt: 100, cwd: "/a" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const tLocal = [
    { type: "session", id: "s-local", cwd: "/a" },
    { type: "request/context", data: { provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1_000_000 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(tLocal, "utf8")));

  // default reference: opus 4.6 -> 1M input @ 5 -> $5
  let rep = buildReport({ dshHome: home });
  assert.equal(rep.split.wfh.referenceModel, "claude-opus-4.6");
  assert.ok(Math.abs(rep.split.wfh.corpCost - 5) < 1e-6);

  // user switches the reference to haiku 4.5 and tweaks a rate
  const models = builtinEntries().map((m) => (m.id === "claude-sonnet-4.6" ? { ...m, input: 9.99 } : m));
  const saved = savePricing(home, { referenceModel: "claude-haiku-4.5", models });
  assert.equal(saved.referenceModel, "claude-haiku-4.5");
  assert.ok(existsSync(pricingFilePath(home)));

  // file is re-read on the next request: reference = haiku (1/M input -> $1), override effective
  rep = buildReport({ dshHome: home });
  assert.equal(rep.split.wfh.referenceModel, "claude-haiku-4.5");
  assert.ok(Math.abs(rep.split.wfh.corpCost - 1) < 1e-6);
  assert.equal(priceFor("claude-sonnet-4.6").input, 9.99);
  const p2 = loadPricing(home);
  assert.equal(p2.fromFile, true);

  // removing an entry makes that model unpriced
  const withoutOpus = saved.models.filter((m) => m.id !== "claude-opus-4.6");
  savePricing(home, { referenceModel: "claude-haiku-4.5", models: withoutOpus });
  assert.equal(priceFor("claude-opus-4.6"), null);

  // a fresh home without the file restores the built-in table
  const home2 = mkdtempSync(join(tmpdir(), "tg-px3-"));
  loadPricing(home2);
  assert.equal(priceFor("claude-opus-4.6").input, 5);
  assert.equal(priceFor("claude-sonnet-4.6").input, 3);
});

test("savePricing: validation", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-px4-"));
  assert.throws(() => savePricing(home, { referenceModel: "claude-opus-4.6", models: [] }), /non-empty/);
  assert.throws(() => savePricing(home, { referenceModel: "not-in-table", models: builtinEntries() }), /referenceModel/);
  assert.throws(() => savePricing(home, { referenceModel: "claude-opus-4.6", models: [{ id: "x", input: -1, output: 1, cacheRead: 0, cacheWrite: 0 }] }), /numbers >= 0/);
  assert.throws(() => savePricing(home, { referenceModel: "claude-opus-4.6", models: [{ id: "x", input: "abc", output: 1, cacheRead: 0, cacheWrite: 0 }] }), /numbers >= 0/);
  // duplicates collapse, ids are lowercased, label defaults to id
  const out = savePricing(home, {
    referenceModel: "My-Model",
    models: [
      { id: "My-Model", input: 1, output: 2, cacheRead: 0.1, cacheWrite: 1.25 },
      { id: "my-model", input: 9, output: 9, cacheRead: 9, cacheWrite: 9 },
      { id: "", input: 1, output: 1, cacheRead: 0, cacheWrite: 0 },
      { id: "other", input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    ],
  });
  assert.equal(out.models.length, 2);
  assert.equal(out.models[0].id, "my-model");
  assert.equal(out.models[0].label, "my-model");
  assert.equal(out.referenceModel, "my-model");
});

// ── DeepSeek API + first-table seeding ─────────────────────────────────
test("priceFor: DeepSeek API is listed + family fallback", () => {
  setRuntimeTable(builtinEntries(), "claude-opus-4.6");
  const c = priceFor("deepseek-v4-flash");
  assert.equal(c.input, 0.44);
  assert.equal(c.output, 1.32);
  assert.equal(c.cacheRead, 0.014);
  assert.equal(c.cacheWrite, 0);
  assert.equal(c.corp, true);
  assert.equal(priceFor("deepseek-v4-pro-0813").input, 1.32);
  assert.equal(priceFor("deepseek-v9.9").input, 0.44); // unknown DeepSeek version -> v4-flash card
});

test("seedEntries: auto-classifies real usage (DeepSeek API = corp, Qwen = local)", () => {
  const seeded = seedEntries([
    { id: "deepseek-v4-flash", provider: "deepseek-official", label: "deepseek-v4-flash" },
    { id: "deepseek-v4-flash-vision-exp", provider: "deepseek-official", label: "deepseek-v4-flash-vision-exp" },
    { id: "qwen3.8-27b-q6-gguf", provider: "llamaserver", label: "Qwen3.8-27B-Q6-GGUF" },
    { id: "snapshots/f1bfb127c64f", provider: "ddd", label: "snapshots/f1bfb127c64f" },
  ]);
  const flash = seeded.find((e) => e.id === "deepseek-v4-flash");
  const qwen = seeded.find((e) => e.id === "qwen3.8-27b-q6-gguf");
  const snap = seeded.find((e) => e.id === "snapshots/f1bfb127c64f");
  assert.equal(flash.corp, true);
  assert.equal(flash.local, false);
  assert.equal(flash.input, 0.44);
  assert.equal(qwen.local, true);
  assert.equal(qwen.corp, false);
  assert.equal(qwen.input, 0);
  assert.equal(snap.local, true); // file-path model -> home lab
});

test("loadPricing: seeds the FIRST table from discovered models", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-seed-"));
  const disc = [
    { id: "deepseek-v4-flash", provider: "deepseek-official", label: "deepseek-v4-flash" },
    { id: "qwen3.8-27b-q6-gguf", provider: "llamaserver", label: "Qwen3.8-27B-Q6-GGUF" },
  ];
  const p = loadPricing(home, disc);
  assert.equal(p.fromFile, false);
  assert.equal(p.seeded, true);
  // known cards stay resolvable (family fallbacks + the WFH reference model)
  assert.ok(p.models.some((m) => m.id === "claude-opus-4.6"));
  assert.ok(p.models.some((m) => m.id === "deepseek-v4-flash" && m.corp));
  assert.ok(p.models.some((m) => m.id === "qwen3.8-27b-q6-gguf" && m.local));
  assert.equal(p.referenceModel, "claude-opus-4.6");
  // deepseek keeps its own card from a non-Copilot provider
  assert.equal(modelKey("deepseek-official", "deepseek-v4-flash"), "deepseek-v4-flash");
  assert.equal(kindFor("deepseek-official", "deepseek-v4-flash"), "corp");
  assert.equal(kindFor("llamaserver", "qwen3.8-27b-q6-gguf"), "local");
});

test("buildReport: DeepSeek API usage lands in the corp bucket (its own card)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-ds-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-ds");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-ds": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 100_000, cacheReadTokens: 4_000_000, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-ds", cwd: "/x" },
    { type: "request/context", data: { provider: "deepseek-official", model: "deepseek-v4-flash" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1_000_000, outputTokens: 100_000, cacheReadTokens: 4_000_000 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  const rep = buildReport({ dshHome: home });
  const row = rep.byModel.find((m) => m.model === "deepseek-v4-flash");
  assert.ok(row);
  assert.equal(row.kind, "corp");
  assert.ok(Math.abs(row.cost - 0.63) < 1e-6); // 1M*0.44 + 0.1M*1.32 + 4M*0.014 -> $0.63
  assert.equal(rep.split.corp.sessions, 1);
  assert.equal(rep.split.wfh.sessions, 0);
  assert.ok(Math.abs(rep.split.corp.cost - 0.63) < 1e-6);
  assert.ok(Math.abs(rep.actual.cost - 0.63) < 1e-6);
  // the what-if comparison now lists DeepSeek API
  assert.ok(rep.comparison.some((c) => c.id === "deepseek-v4-flash" && c.priced));
});

// keep the built-in table effective after the file-backed tests mutate it
test("pricing: built-in table restored for later runs", () => {
  setRuntimeTable(builtinEntries(), "claude-opus-4.6");
  assert.equal(priceFor("claude-sonnet-4.6").input, 3);
  assert.equal(priceFor("claude-opus-4.6").input, 5);
});

// ── decode speed (tokens/s from trajectory chunk timestamps) ────────────
test("parseTrajectoryText: decode timing from chunk timestamps", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "request/context", data: { provider: "copilot", model: "claude-sonnet-4.6" } },
    { type: "assistant/chunk", time: 1000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 200, cacheReadTokens: 0 } } } },
    { type: "assistant/chunk", time: 4000, data: { turn: 1, step: 2, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 4500, data: { turn: 1, step: 2, chunk: { type: "usage", usage: { inputTokens: 50, outputTokens: 100, cacheReadTokens: 0 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.usage.length, 2);
  assert.equal(r.usage[0].decodeMs, 2000); // usage.time - firstChunk.time (TTFT excluded)
  assert.equal(r.usage[1].decodeMs, 500);
  assert.deepEqual(r.decode, { tokens: 300, ms: 2500, steps: 2 });
});

test("parseTrajectoryText: no timestamps -> no decode stats (back-compat)", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "request/context", data: { provider: "copilot", model: "claude-sonnet-4.6" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 200 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.usage[0].decodeMs, null);
  assert.deepEqual(r.decode, { tokens: 0, ms: 0, steps: 0 });
});

test("buildReport: decode speed per model + global + per session", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-dec-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-d");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-d": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1500, outputTokens: 250, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-d", cwd: "/x" },
    { type: "request/context", data: { provider: "github-copilot-official", model: "claude-sonnet-4.6" } },
    { type: "assistant/chunk", time: 1000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 0 } } } },
    { type: "request/context", data: { provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 2, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 4000, data: { turn: 1, step: 2, chunk: { type: "usage", usage: { inputTokens: 500, outputTokens: 50, cacheReadTokens: 0 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  const rep = buildReport({ dshHome: home });
  const sonnet = rep.byModel.find((m) => m.model === "claude-sonnet-4.6");
  const qwen = rep.byModel.find((m) => m.model === "qwen3.8-27b-q6-gguf");
  assert.equal(sonnet.tokPerSec, 100); // 200 tokens / 2000ms
  assert.equal(qwen.tokPerSec, 50);    // 50 tokens / 1000ms
  assert.equal(rep.decode.tokens, 250);
  assert.equal(rep.decode.ms, 3000);
  assert.equal(rep.decode.steps, 2); // one timed usage record per model
  assert.ok(Math.abs(rep.decode.tokPerSec - 83.3) < 0.05); // 250 / 3s

  const bd = buildBreakdown({ dshHome: home });
  assert.equal(bd.bySession.length, 1);
  assert.ok(Math.abs(bd.bySession[0].tokPerSec - 83.3) < 0.05);
});

// ── prompt processing speed (TTFT + prefill) ────────────────────────────
test("parseTrajectoryText: TTFT + prefill from step/start timestamps (primary)", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "step/start", seq: 1, time: 1000, data: { turn: 1, step: 1 } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 5000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 5000 } } } },
    { type: "step/end", seq: 2, time: 5100, data: { turn: 1, step: 1 } },
    { type: "step/start", seq: 3, time: 5200, data: { turn: 1, step: 2 } },
    { type: "assistant/chunk", time: 5700, data: { turn: 1, step: 2, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 6200, data: { turn: 1, step: 2, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 100, cacheReadTokens: 6000 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.usage.length, 2);
  assert.equal(r.usage[0].ttftMs, 2000); // first chunk 3000 - step start 1000
  assert.equal(r.usage[0].decodeMs, 2000); // usage 5000 - first chunk 3000
  assert.equal(r.usage[1].ttftMs, 500); // first chunk 5700 - step start 5200
  assert.equal(r.usage[1].decodeMs, 500);
  // prefill counts NEW (uncached) input tokens over TTFT — cached reads excluded
  assert.deepEqual(r.prefill, { tokens: 1100, ms: 2500, steps: 2 });
  assert.deepEqual(r.decode, { tokens: 300, ms: 2500, steps: 2 });
});

test("parseTrajectoryText: TTFT falls back to request events without step/start", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "request/context", time: 1000, data: { provider: "copilot", model: "claude-sonnet-4.6" } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1000, outputTokens: 200 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.usage[0].ttftMs, 2000); // first chunk 3000 - request 1000
  assert.deepEqual(r.prefill, { tokens: 1000, ms: 2000, steps: 1 });
});

test("parseTrajectoryText: no timing at all -> no TTFT (back-compat)", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "request/context", data: { provider: "copilot", model: "claude-sonnet-4.6" } }, // no time
    { type: "assistant/chunk", time: 1000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 50 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.usage[0].ttftMs, null);
  assert.deepEqual(r.prefill, { tokens: 0, ms: 0, steps: 0 });
});

// ── per-step thinking + prefill/decode speed ─────────────────────────────
test("parseTrajectoryText: thinking (reasoning) time + chars per step", () => {
  const lines = [
    { type: "session", id: "s1", cwd: "/x" },
    { type: "step/start", seq: 1, time: 1000, data: { turn: 1, step: 1 } },
    { type: "reasoning-chunks", seq0: 2, time0: 3000, data: { turn: 1, step: 1, texts: ["abcd"] } },
    { type: "reasoning-chunks", seq0: 3, time0: 5000, data: { turn: 1, step: 1, texts: ["efgh"] } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "reasoning" } } },
    { type: "assistant/chunk", time: 3200, data: { turn: 1, step: 1, chunk: { type: "reasoning-delta", text: "aaaaaaaaaaaaaaaaaaaa" } } }, // 20 chars — delta stream is the authoritative full thinking text
    { type: "assistant/chunk", time: 6000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 200, reasoningTokens: 0 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  const r = parseTrajectoryText(lines);
  assert.equal(r.usage[0].thinkingMs, 2000); // last reasoning-chunk 5000 - first 3000
  assert.equal(r.usage[0].thinkingChars, 20); // max("abcd"+"efgh"=8, reasoning-delta=20) — the delta stream wins
  assert.equal(r.usage[0].buckets.reasoningTokens, 0);
});

test("buildBreakdown: per-step prefill/decode speed + thinking (estimated)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-step-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-st");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-st": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 100, outputTokens: 200, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-st", cwd: "/x" },
    { type: "step/start", seq: 1, time: 1000, data: { turn: 1, step: 1 } },
    { type: "reasoning-chunks", seq0: 2, time0: 3000, data: { turn: 1, step: 1, texts: ["abcd"] } },
    { type: "reasoning-chunks", seq0: 3, time0: 5000, data: { turn: 1, step: 1, texts: ["efgh"] } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "reasoning" } } },
    { type: "assistant/chunk", time: 6000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 200, reasoningTokens: 0 } } } },
    { type: "step/end", seq: 4, time: 6100, data: { turn: 1, step: 1 } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));
  const bd = buildBreakdown({ dshHome: home });
  assert.equal(bd.bySession.length, 1);
  const s = bd.bySession[0];
  assert.ok(s.steps && s.steps.length === 1);
  const st = s.steps[0];
  assert.equal(st.in, 100);
  assert.equal(st.out, 200);
  assert.equal(st.thinking, 2); // estimated: ceil(8 chars / 4)
  assert.equal(st.thinkingEstimated, true);
  assert.equal(st.thinkingMs, 2000);
  assert.equal(st.prefillTokPerSec, 50); // 100 tokens / 2000ms TTFT
  assert.ok(Math.abs(st.decodeTokPerSec - 66.7) < 0.05); // 200 / 3000ms
});

test("buildBreakdown: per-step thinking uses authoritative reasoningTokens when present", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-step2-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-st2");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-st2": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 100, outputTokens: 200, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-st2", cwd: "/x" },
    { type: "step/start", seq: 1, time: 1000, data: { turn: 1, step: 1 } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "reasoning" } } },
    { type: "assistant/chunk", time: 6000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 200, reasoningTokens: 150 } } } },
    { type: "step/end", seq: 4, time: 6100, data: { turn: 1, step: 1 } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));
  const bd = buildBreakdown({ dshHome: home });
  const st = bd.bySession[0].steps[0];
  assert.equal(st.thinking, 150); // authoritative reasoningTokens, not estimated
  assert.equal(st.thinkingEstimated, false);
});

test("buildBreakdown: per-tool tokens report the ACTUAL payload, not the whole step", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-payload-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-pl");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-pl": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 100, outputTokens: 200, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const args = "a".repeat(800); // 800 chars -> 200 tokens payload
  const traj = [
    { type: "session", id: "s-pl", cwd: "/x" },
    { type: "step/start", seq: 1, time: 1000, data: { turn: 1, step: 1 } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 100, outputTokens: 200, reasoningTokens: 0 } } } },
    { type: "step/end", seq: 4, time: 6100, data: { turn: 1, step: 1 } },
    { type: "tool/call", seq: 5, data: { name: "remember", arguments: args } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));
  const bd = buildBreakdown({ dshHome: home });
  const s = bd.bySession[0];
  assert.ok(s.toolTokens && s.toolTokens.length === 1);
  const t = s.toolTokens[0];
  assert.equal(t.tool, "remember");
  assert.equal(t.calls, 1);
  assert.equal(t.total, 200); // payload = ceil(800 chars / 4), NOT the step's 300 context tokens
  assert.equal(t.min, 200);
  assert.equal(t.avg, 200);
  assert.equal(t.max, 200);
});




test("buildPerformance: per model + per session x model (model switch)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-perf-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-p");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-p": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1500, outputTokens: 250, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-p", cwd: "/x" },
    { type: "request/header", seq: 0, data: { header: { config: { provider: "github-copilot-official", model: "claude-sonnet-4.6" } } } },
    { type: "step/start", seq: 1, time: 1000, data: { turn: 1, step: 1 } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 5000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 0 } } } },
    { type: "request/context", data: { provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" } },
    { type: "step/start", seq: 2, time: 6000, data: { turn: 1, step: 2 } },
    { type: "assistant/chunk", time: 6500, data: { turn: 1, step: 2, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 7000, data: { turn: 1, step: 2, chunk: { type: "usage", usage: { inputTokens: 500, outputTokens: 50, cacheReadTokens: 0 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  const perf = buildPerformance({ dshHome: home });
  // global totals: 250 streamed / 2.5s; 1500 new ctx / 2.5s
  assert.equal(perf.totals.decode.tokPerSec, 100);
  assert.equal(perf.totals.prefill.tokens, 1500);
  assert.equal(perf.totals.prefill.tokPerSec, 600);
  assert.equal(perf.totals.prefill.avgTtftMs, 1250); // (2000+500)/2
  // per model
  const sonnet = perf.byModel.find((m) => m.model === "claude-sonnet-4.6");
  const qwen = perf.byModel.find((m) => m.model === "qwen3.8-27b-q6-gguf");
  assert.ok(sonnet && qwen);
  assert.equal(sonnet.tokPerSec, 100); // 200 / 2s
  assert.equal(sonnet.promptTokPerSec, 500); // 1000 / 2s
  assert.equal(sonnet.avgTtftMs, 2000);
  assert.equal(sonnet.avgContext, 1000);
  assert.equal(qwen.tokPerSec, 100); // 50 / 0.5s
  assert.equal(qwen.promptTokPerSec, 1000); // 500 / 0.5s
  assert.equal(qwen.avgTtftMs, 500);
  // per session x model: the mid-session model switch shows two rows
  assert.equal(perf.sessions.length, 1);
  const s = perf.sessions[0];
  assert.equal(s.modelCount, 2);
  assert.equal(s.models.length, 2);
  const sSonnet = s.models.find((m) => m.model === "claude-sonnet-4.6");
  const sQwen = s.models.find((m) => m.model === "qwen3.8-27b-q6-gguf");
  assert.equal(sSonnet.tokPerSec, 100);
  assert.equal(sSonnet.promptTokPerSec, 500);
  assert.equal(sQwen.tokPerSec, 100);
  assert.equal(sQwen.promptTokPerSec, 1000);
});

test("buildReport: prefill aggregate + byModel prompt fields", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-pref-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-q");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-q": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1000, outputTokens: 200, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-q", cwd: "/x" },
    { type: "request/context", data: { provider: "github-copilot-official", model: "claude-sonnet-4.6" } },
    { type: "step/start", seq: 1, time: 1000, data: { turn: 1, step: 1 } },
    { type: "assistant/chunk", time: 3000, data: { turn: 1, step: 1, chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 5000, data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 0 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  const rep = buildReport({ dshHome: home });
  assert.equal(rep.prefill.tokens, 1000);
  assert.equal(rep.prefill.ms, 2000);
  assert.equal(rep.prefill.steps, 1);
  assert.equal(rep.prefill.tokPerSec, 500);
  assert.equal(rep.prefill.avgTtftMs, 2000);
  const m = rep.byModel[0];
  assert.equal(m.promptTokPerSec, 500);
  assert.equal(m.avgTtftMs, 2000);
  assert.equal(m.avgContext, 1000);
});

// ── reprocess (force a full re-parse of historic trajectories) ──────────
test("reprocessTrajectories: clears the parse cache and re-parses everything", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-reproc-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-r");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-r": { identity: { createdAt: 100, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1000, outputTokens: 200, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-r", cwd: "/x" },
    { type: "request/context", data: { provider: "qweno", model: "Qwen3.8-27B-Q6-GGUF" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 0 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  // Cold build: parses the file.
  let rep = buildReport({ dshHome: home });
  assert.equal(rep.sources.trajectories.files, 1);
  assert.ok(rep.sources.trajectories.cache.recomputed >= 1);

  // Warm build: served from the parse cache (no re-parse).
  rep = buildReport({ dshHome: home });
  assert.ok(rep.sources.trajectories.cache.hits >= 1);
  assert.equal(rep.sources.trajectories.cache.recomputed, 0);

  // Reprocess forces a clean re-parse of the historic file, then persists a fresh cache.
  const r = reprocessTrajectories({ dshHome: home });
  assert.equal(r.files, 1);
  assert.equal(r.withUsage, 1);
  assert.ok(r.cache.recomputed >= 1);
  assert.equal(r.cache.hits, 0); // the cache was wiped, so nothing came from cache
  assert.equal(r.defaultModel, null); // no settings.yaml default in this fixture

  // After reprocessing, the report reflects the same data (recomputed cleanly).
  rep = buildReport({ dshHome: home });
  assert.equal(rep.sources.trajectories.files, 1);
  assert.ok(rep.sources.trajectories.cache.hits >= 1); // the fresh cache is now warm
});

test("discoverLocalModels: distinct local models from trajectories, not folded into qwen baseline", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-disc-"));
  const ws = join(home, "sessions", "--tmp--", "s-disc");
  mkdirSync(ws, { recursive: true });
  const traj = [
    { type: "session", id: "s-disc", cwd: "/x" },
    { type: "request/header", seq: 0, data: { header: { config: { provider: "llamaserver", model: "Qwen3.8-27B-Q6-GGUF" } } } },
    { type: "request/header", seq: 1, data: { header: { config: { provider: "llamaserver", model: "Qwen3.8-27B-Q4-GGUF" } } } },
    { type: "request/header", seq: 2, data: { header: { config: { provider: "github-copilot-official", model: "claude-sonnet-4.6" } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));
  const out = discoverLocalModels(home);
  const ids = out.map((m) => m.id);
  // the two local qwen variants are returned separately (not merged), each marked with its provider
  assert.ok(ids.includes("qwen3.8-27b-q6-gguf"));
  assert.ok(ids.includes("qwen3.8-27b-q4-gguf"));
  assert.equal(out.every((m) => m.provider === "llamaserver"), true);
  // the copilot/claude model is NOT a local model -> excluded
  assert.ok(!ids.includes("claude-sonnet-4.6"));
});

test("discoverModelCards: ALL provider/model pairs (local + corp) with kind + resolved cards", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-disc2-"));
  const ws = join(home, "sessions", "--tmp--", "s-disc2");
  mkdirSync(ws, { recursive: true });
  const traj = [
    { type: "session", id: "s-disc2", cwd: "/x" },
    { type: "request/header", seq: 0, data: { header: { config: { provider: "llamaserver", model: "Qwen3.8-27B-Q6-GGUF" } } } },
    { type: "request/header", seq: 1, data: { header: { config: { provider: "github-copilot-official", model: "claude-sonnet-4.6" } } } },
    { type: "request/header", seq: 2, data: { header: { config: { provider: "deepseek-official", model: "deepseek-v4-flash" } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));
  const out = discoverModelCards(home);
  const byId = new Map(out.map((m) => [m.id, m]));
  // local qwen variant: local kind, family-resolved card (metered qwen -> 0 input from seeding)
  const qwen = byId.get("qwen3.8-27b-q6-gguf");
  assert.ok(qwen);
  assert.equal(qwen.local, true);
  assert.equal(qwen.corp, false);
  assert.ok(Number.isFinite(qwen.input));
  // copilot claude: corp, known card
  const claude = byId.get("claude-sonnet-4.6");
  assert.ok(claude);
  assert.equal(claude.local, false);
  assert.equal(claude.corp, true);
  assert.equal(claude.input, 3);
  assert.equal(claude.estimated, false);
  // deepseek API: corp, api card
  const ds = byId.get("deepseek-v4-flash");
  assert.ok(ds);
  assert.equal(ds.corp, true);
  assert.equal(ds.input, 0.44);
});

test("savePricing/loadPricing: baselineModel round-trip + drives the comparison baseline", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-base-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const ws = join(home, "sessions", "--tmp--", "s-base");
  mkdirSync(ws, { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: {
    "s-base": { identity: { createdAt: 100, cwd: "/a" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } },
  }}}));
  const traj = [
    { type: "session", id: "s-base", cwd: "/a" },
    { type: "request/context", data: { provider: "llamaserver", model: "Qwen3.8-27B-Q4-GGUF" } },
    { type: "assistant/chunk", data: { turn: 1, step: 1, chunk: { type: "usage", usage: { inputTokens: 1_000_000 } } } },
  ].map((l) => JSON.stringify(l)).join("\n");
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(traj, "utf8")));

  // Two local rows: q6 first (implied default baseline), q4 second -> user picks q4.
  const models = [
    { id: "qwen3.8-27b-q6-gguf", label: "Q6", input: 0.25, output: 2.5, cacheRead: 0.05, cacheWrite: 0.31, estimated: false, local: true, corp: false, provider: "llamaserver" },
    { id: "qwen3.8-27b-q4-gguf", label: "Q4", input: 0.25, output: 2.5, cacheRead: 0.05, cacheWrite: 0.31, estimated: false, local: true, corp: false, provider: "llamaserver" },
    ...builtinEntries().filter((m) => !m.local),
  ];
  const saved = savePricing(home, { referenceModel: "claude-opus-4.6", baselineModel: "qwen3.8-27b-q4-gguf", models });
  assert.equal(saved.baselineModel, "qwen3.8-27b-q4-gguf");

  // The saved baseline drives the comparison: baselineId = q4, comparison[0] = q4 row.
  const rep = buildReport({ dshHome: home });
  assert.equal(rep.savings.baselineId, "qwen3.8-27b-q4-gguf");
  assert.equal(rep.comparison[0].id, "qwen3.8-27b-q4-gguf");
  assert.equal(rep.comparison[0].baseline, true);

  // Re-load: baselineModel comes back from the file.
  const p = loadPricing(home);
  assert.equal(p.baselineModel, "qwen3.8-27b-q4-gguf");
  assert.equal(p.fromFile, true);

  // Removing the baseline row falls back to the next local row.
  const withoutQ4 = saved.models.filter((m) => m.id !== "qwen3.8-27b-q4-gguf");
  const saved2 = savePricing(home, { referenceModel: "claude-opus-4.6", baselineModel: null, models: withoutQ4 });
  assert.equal(saved2.baselineModel, "qwen3.8-27b-q6-gguf");

  // invalid baseline (not local / not in table) is rejected
  assert.throws(() => savePricing(home, { referenceModel: "claude-opus-4.6", baselineModel: "claude-opus-4.6", models }), /baselineModel must be a local model/);
  assert.throws(() => savePricing(home, { referenceModel: "claude-opus-4.6", baselineModel: "nope", models }), /baselineModel must be one of/);
});


// ── projection-store era split (v0 -> legacy file, v3 -> directory store) ────
// DSH writes a v0 session to the legacy single JSON file and a v3 session as its
// own file under session_projcache/. Both stores are live at once and hold
// DISJOINT session sets, so reading only the more recently modified one silently
// dropped the other era's sessions ("today's entries are missing"). The report
// must merge them, with the directory store winning on a duplicate id.
test("resolvePaths + buildBreakdown: merges BOTH projection stores (v0 file + v3 dir)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-stores-"));
  mkdirSync(join(home, "storages", "session_projcache", "sessions"), { recursive: true });
  mkdirSync(join(home, "sessions", "--x--"), { recursive: true });

  const traj = (id, steps) => {
    const rows = [{ type: "session", version: 3, id, cwd: "/x" }];
    for (let i = 1; i <= steps; i++) {
      rows.push({ type: "step/start", seq: i * 2, time: 1000 + i * 1000, data: { turn: 1, step: i } });
      rows.push({ type: "step/end", seq: i * 2 + 1, time: 1500 + i * 1000, data: { turn: 1, step: i } });
    }
    return Buffer.from(rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
  };
  const dir = join(home, "sessions", "--x--", "session-v3only");
  const dir2 = join(home, "sessions", "--x--", "session-both");
  mkdirSync(dir, { recursive: true });
  mkdirSync(dir2, { recursive: true });
  writeFileSync(join(dir, "session.v3.jsonl.zstd"), zstdCompressSync(traj("session-v3only", 3)));
  writeFileSync(join(dir2, "session.v3.jsonl.zstd"), zstdCompressSync(traj("session-both", 2)));

  const row = (uncached, output) => ({ identity: { createdAt: 1_700_000_000_000, cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: uncached, outputTokens: output, cacheReadTokens: 0, cacheWriteTokens: 0 } } } } });
  // Legacy file: the old session only.
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: { "session-v0old": row(100, 10) } } }));
  // Directory store: the v3 session only, plus a DIFFERENT copy of a shared id.
  writeFileSync(join(home, "storages", "session_projcache", "sessions", "session-v3only.json"), JSON.stringify({ version: 7, record: row(200, 20) }));
  writeFileSync(join(home, "storages", "session_projcache", "sessions", "session-both.json"), JSON.stringify({ version: 7, record: row(300, 30) }));
  writeFileSync(join(home, "storages", "session_projcache", "sessions", "session-shared.json"), JSON.stringify({ version: 7, record: row(900, 90) }));
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions: { "session-v0old": row(100, 10), "session-shared": row(111, 11) } } }));

  const rp = resolvePaths({ dshHome: home });
  assert.equal(rp.storeKind, "dir", "the directory store is the primary");
  assert.ok(rp.otherStorePath && rp.otherStorePath.endsWith("session_projcache.json"), "the legacy file is the merge secondary");

  const pc = readProjcache(rp.storePath);
  assert.ok(!pc.sessions.some((s) => s.id === "session-v0old"), "the legacy file alone misses the legacy-only session");

  const bd = buildBreakdown({ dshHome: home });
  const ids = bd.bySession.map((s) => s.id);
  assert.ok(ids.includes("session-v0old"), "the legacy-only session survives the merge");
  assert.ok(ids.includes("session-v3only"), "the v3-only session (never in the legacy file) now appears");
  assert.equal(ids.filter((i) => i === "session-shared").length, 1, "a shared id is not double-counted");
  const shared = bd.bySession.find((s) => s.id === "session-shared");
  assert.equal(shared.uncachedInputTokens, 900, "the directory store's copy wins on a duplicate");
});
