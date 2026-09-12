// token-gobbler · test/trajectory-v3.test.js
// Covers the DSH v3 trajectory format (nested `assistant/message.data.stream`) and
// the shape-snapshot machinery that exists to DETECT a future format change.
//
//   * v3 nests the stream + carries `data.usage`; the parser must still produce the
//     same per-step buckets/timing as the equivalent v0 session.
//   * the system prompt moved out of `request/header` into `system/message`.
//   * `findTrajectoryFiles` prefers `session.v3.jsonl.zstd` over the legacy file.
//   * shape capture + diff: same format compares equal, a structural change (new
//     record type, new `chunk.type`, new nested stream kind) is reported.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zstdCompressSync } from "node:zlib";

import { findTrajectoryFiles, readTrajectory, parseTrajectoryText, diffShape, mergeShapes, sameShape } from "../lib/trajectory.js";

const jsonl = (records) => Buffer.from(records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");

/** One step's stream entry sequence, exactly as DSH v3 nests it. */
function v3Stream(turn, step, { text, think, out, in: input, cache, reasoning, t0 = 1000, streamMs = 200, thinkMs = 100 }) {
  const stream = [];
  let t = t0;
  if (think) {
    stream.push({ type: "chunk", time: t, chunk: { type: "block-start", index: 0, blockType: "reasoning" } });
    // `dt[i]` is the gap between token i−1 and token i, so Σdt = last − time0:
    // with time0 = t + 1 the last thinking token lands exactly on t + thinkMs.
    stream.push({ type: "reasoning-chunks", time0: t + 1, index: 0, dt: [Math.floor(thinkMs / 4), Math.floor(thinkMs / 4), Math.floor(thinkMs / 4), Math.ceil(thinkMs / 4)], texts: think.split(" ") });
    stream.push({ type: "chunk", time: t + thinkMs, chunk: { type: "block-end", index: 0 } });
    t += thinkMs;
  }
  if (text) {
    stream.push({ type: "chunk", time: t, chunk: { type: "block-start", index: 1, blockType: "text" } });
    stream.push({ type: "text-chunks", time0: t + 1, index: 1, dt: new Array(4).fill(Math.floor(streamMs / 4)), texts: text.split(" ") });
    stream.push({ type: "chunk", time: t + streamMs, chunk: { type: "block-end", index: 1 } });
    t += streamMs;
  }
  stream.push({ type: "chunk", time: t, chunk: { type: "finish", reason: { kind: "tool-calls" } } });
  stream.push({ type: "chunk", time: t, chunk: { type: "usage", usage: { inputTokens: input, outputTokens: out, totalTokens: input + cache + out, cacheReadTokens: cache, reasoningTokens: reasoning } } });
  return stream;
}

/** A v3 trajectory: `session` header + assistant messages carrying nested streams. */
function v3Records({ system, steps }) {
  const records = [
    { type: "session", version: 3, id: "session-v3", createdAt: 100, cwd: "/x", isSeeded: false, delegationDepth: 0, agentPreset: "standard" },
    { type: "request/header", seq: 1, time: 900, data: { header: { config: { provider: "llamacpp", model: "DavidAU-Qwen3.8-27B" }, tools: [{ name: "bash" }] } } },
    { type: "request/context", seq: 2, time: 900, data: { provider: "llamacpp", model: "DavidAU-Qwen3.8-27B", contextWindow: 65536 } },
  ];
  if (system) records.push({ type: "system/message", seq: 3, time: 900, data: { turn: 1, step: 1, message: { id: "sys-1", role: "system", source: { kind: "plugin", plugin: "@deepseek-ai/dsh-system-prompt" }, content: [{ type: "text", text: system }] } }, surfaceOp: "append" });
  let seq = 4;
  for (const st of steps) {
    records.push({ type: "step/start", seq: seq++, time: st.t0 - 500, data: { turn: 1, step: st.step } });
    records.push({
      type: "assistant/message", seq: seq++, time: st.t0 + (st.thinkMs || 0) + (st.streamMs || 200),
      data: {
        turn: 1, step: st.step,
        message: { role: "assistant", content: [st.text ? { type: "text", text: st.text } : { type: "tool-call", id: "c1", name: "bash", arguments: "{}" }], source: { kind: "model", provider: "llamacpp", model: "DavidAU-Qwen3.8-27B" }, id: "m-" + st.step },
        usage: { inputTokens: st.in, outputTokens: st.out, totalTokens: st.in + st.cache + st.out, cacheReadTokens: st.cache, reasoningTokens: st.reasoning || 0 },
        stream: v3Stream(1, st.step, st),
      },
      surfaceOp: "append",
    });
    records.push({ type: "tool/call", seq: seq++, time: st.t0 + 300, data: { turn: 1, step: st.step, callId: "c1", name: "bash", arguments: "{}" } });
    records.push({ type: "step/end", seq: seq++, time: st.t0 + 320, data: { turn: 1, step: st.step } });
  }
  return records;
}

test("parseTrajectoryText: v3 nested stream produces per-step buckets, timing and model", () => {
  const steps = [
    { step: 1, in: 500, cache: 0, out: 100, t0: 2000, streamMs: 200, text: "hello there", reasoning: 0 },
    { step: 2, in: 200, cache: 3000, out: 350, t0: 5000, thinkMs: 400, streamMs: 600, text: "second answer here", think: "thinking about it carefully now", reasoning: 120 },
  ];
  const t = parseTrajectoryText(v3Records({ system: "S".repeat(400), steps }).map((r) => JSON.stringify(r)).join("\n"));

  assert.equal(t.formatVersion, 3);
  assert.equal(t.meta.id, "session-v3");
  assert.equal(t.usage.length, 2, "one usage record per assistant message (no duplicate from the nested usage chunk)");

  const [s1, s2] = t.usage;
  assert.deepEqual(
    { turn: s1.turn, step: s1.step, model: s1.model, provider: s1.provider, out: s1.buckets.outputTokens, in: s1.buckets.uncachedInputTokens, read: s1.buckets.cacheReadTokens },
    { turn: 1, step: 1, model: "DavidAU-Qwen3.8-27B", provider: "llamacpp", out: 100, in: 500, read: 0 },
  );
  // decode = usage time − stream start (the block-start chunk at t0)
  assert.equal(s1.decodeMs, 200);
  // TTFT = stream start − step/start (t0 − (t0 − 500))
  assert.equal(s1.ttftMs, 500);
  assert.equal(s2.decodeMs, 1000, "thinking window + streaming window between first chunk and usage");
  assert.equal(s2.buckets.reasoningTokens, 120);
  assert.ok(s2.thinkingChars > 0, "reasoning text chars are captured from the nested reasoning-chunks entry");
  assert.equal(s2.thinkingMs, 400, "thinking window from time0 through its dt array");

  // session rollups + event counts
  assert.equal(t.decode.tokens, 450);
  assert.equal(t.decode.ms, 1200);
  assert.equal(t.prefill.tokens, 700);
  assert.equal(t.prefill.ms, 1000);
  assert.equal(t.events.steps, 2);
  assert.equal(t.events.assistantMessages, 2);
  assert.equal(t.events.systemMessages, 1);
  assert.equal(t.events.toolCalls, 2);
  // model timeline + tools unchanged from v0 (v3 request/header still carries tools)
  assert.deepEqual(t.modelChanges.map((m) => m.model), ["DavidAU-Qwen3.8-27B", "DavidAU-Qwen3.8-27B"]);
  assert.equal(t.toolsChars > 0, true);
  assert.deepEqual(t.toolCalls, { bash: 2 });
});

test("parseTrajectoryText: v3 system/message replaces request/header.header.system for the prompt size", () => {
  const steps = [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, streamMs: 100, text: "hi", reasoning: 0 }];
  const t = parseTrajectoryText(v3Records({ system: "S".repeat(4321), steps }).map((r) => JSON.stringify(r)).join("\n"));
  assert.equal(t.systemChars, 4321, "system prompt chars come from the system/message record");
});

test("v3 and the equivalent v0 session parse to the same numbers", () => {
  const steps = [
    { step: 1, in: 500, cache: 0, out: 100, t0: 2000, streamMs: 200, text: "hello there", reasoning: 0 },
    { step: 2, in: 200, cache: 3000, out: 350, t0: 5000, thinkMs: 400, streamMs: 600, text: "second answer here", think: "thinking about it carefully now", reasoning: 120 },
  ];
  const v3 = parseTrajectoryText(v3Records({ system: "S".repeat(400), steps }).map((r) => JSON.stringify(r)).join("\n"));

  // The v0 encoding of the same session: stream records at top level, usage/finish
  // as assistant/chunk, and the system prompt in request/header.
  const v0 = [];
  v0.push({ type: "session", version: 0, id: "session-v3", createdAt: 100, cwd: "/x", agentPreset: "standard" });
  v0.push({ type: "request/header", seq: 1, time: 900, data: { header: { config: { provider: "llamacpp", model: "DavidAU-Qwen3.8-27B" }, system: "S".repeat(400), tools: [{ name: "bash" }] } } });
  v0.push({ type: "request/context", seq: 2, time: 900, data: { provider: "llamacpp", model: "DavidAU-Qwen3.8-27B", contextWindow: 65536 } });
  let seq = 4;
  for (const st of steps) {
    v0.push({ type: "step/start", seq: seq++, time: st.t0 - 500, data: { turn: 1, step: st.step } });
    for (const e of v3Stream(1, st.step, st)) {
      if (e.type === "chunk") v0.push({ type: "assistant/chunk", seq: seq++, time: e.time, data: { turn: 1, step: st.step, chunk: e.chunk } });
      else v0.push({ type: e.type, seq0: seq++, time0: e.time0, data: { turn: 1, step: st.step, index: e.index, dt: e.dt, texts: e.texts } });
    }
    v0.push({ type: "assistant/message", seq: seq++, time: st.t0 + (st.thinkMs || 0) + (st.streamMs || 200), data: { turn: 1, step: st.step, message: { role: "assistant", content: [], source: { kind: "model", provider: "llamacpp", model: "DavidAU-Qwen3.8-27B" } } } });
    v0.push({ type: "tool/call", seq: seq++, time: st.t0 + 300, data: { turn: 1, step: st.step, callId: "c1", name: "bash", arguments: "{}" } });
    v0.push({ type: "step/end", seq: seq++, time: st.t0 + 320, data: { turn: 1, step: st.step } });
  }
  const p0 = parseTrajectoryText(v0.map((r) => JSON.stringify(r)).join("\n"));

  assert.equal(p0.formatVersion, 0);
  assert.equal(v3.usage.length, p0.usage.length);
  for (let i = 0; i < v3.usage.length; i++) {
    const a = v3.usage[i], b = p0.usage[i];
    assert.deepEqual(a.buckets, b.buckets, `step ${i + 1} buckets`);
    assert.deepEqual([a.turn, a.step, a.model, a.provider], [b.turn, b.step, b.model, b.provider]);
    assert.equal(a.decodeMs, b.decodeMs, `step ${i + 1} decodeMs`);
    assert.equal(a.ttftMs, b.ttftMs, `step ${i + 1} ttftMs`);
    assert.equal(a.thinkingChars, b.thinkingChars, `step ${i + 1} thinkingChars`);
  }
  assert.deepEqual(v3.decode, p0.decode);
  assert.deepEqual(v3.prefill, p0.prefill);
  assert.equal(v3.systemChars, p0.systemChars);
  assert.equal(v3.toolsChars, p0.toolsChars);
});

test("findTrajectoryFiles: prefers session.v3.jsonl.zstd and skips the legacy sibling", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-v3-files-"));
  const dir = join(home, "sessions", "--x--", "session-abc");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "session.jsonl.zstd"), zstdCompressSync(jsonl([{ type: "session", version: 0, id: "session-abc" }])));
  writeFileSync(join(dir, "session.v3.jsonl.zstd"), zstdCompressSync(jsonl([{ type: "session", version: 3, id: "session-abc" }])));
  const legacyOnly = join(home, "sessions", "--x--", "session-def");
  mkdirSync(legacyOnly, { recursive: true });
  writeFileSync(join(legacyOnly, "session.jsonl.zstd"), zstdCompressSync(jsonl([{ type: "session", version: 0, id: "session-def" }])));

  const files = findTrajectoryFiles(home);
  assert.equal(files.length, 2, "one file per session — the legacy sibling is not double-parsed");
  assert.ok(files.some((f) => f.endsWith("session-abc/session.v3.jsonl.zstd")));
  assert.ok(files.some((f) => f.endsWith("session-def/session.jsonl.zstd")));
  assert.ok(!files.some((f) => f.endsWith("session-abc/session.jsonl.zstd")));
  assert.equal(readTrajectory(files.find((f) => f.includes("session-abc"))).formatVersion, 3);
});

test("readTrajectory: multi-frame zstd v3 file parses (append-only writes)", () => {
  const home = mkdtempSync(join(tmpdir(), "tg-v3-frames-"));
  const dir = join(home, "sessions", "--x--", "session-mf");
  mkdirSync(dir, { recursive: true });
  const steps = [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, streamMs: 100, text: "hi", reasoning: 0 }];
  const records = v3Records({ steps });
  // DSH appends one zstd FRAME per write; node:zlib's one-shot decompress only reads the first.
  const frames = [zstdCompressSync(jsonl(records.slice(0, 3))), zstdCompressSync(jsonl(records.slice(3)))];
  writeFileSync(join(dir, "session.v3.jsonl.zstd"), Buffer.concat(frames));
  const t = readTrajectory(join(dir, "session.v3.jsonl.zstd"));
  assert.equal(t.formatVersion, 3);
  assert.equal(t.usage.length, 1);
  assert.equal(t.usage[0].buckets.outputTokens, 5);
});

test("shape snapshot: captures v3 record types, value sets and nested stream kinds", () => {
  const steps = [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, streamMs: 100, text: "hi", reasoning: 0 }];
  const t = parseTrajectoryText(v3Records({ system: "s", steps }).map((r) => JSON.stringify(r)).join("\n"));
  assert.equal(t.shape.version, 3);
  assert.ok(t.shape.types["session"], "session shape recorded");
  assert.ok(t.shape.types["assistant/message"], "assistant/message shape recorded");
  assert.ok(t.shape.types["system/message"], "system/message (v3-only) shape recorded");
  assert.ok(t.shape.streamKinds["chunk:usage"] >= 1);
  assert.ok(t.shape.streamKinds["reasoning-chunks"] === undefined || typeof t.shape.streamKinds["reasoning-chunks"] === "number");
  assert.ok(t.shape.valueSets.type.includes("assistant/message"));
  assert.deepEqual(t.shape.valueSets.version, [3]);
  assert.equal(t.shape.unparsed, 0);
});

test("diffShape: identical formats differ in nothing; added/removed structure is named", () => {
  const base = parseTrajectoryText(v3Records({ steps: [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, streamMs: 100, text: "hi", reasoning: 0 }] }).map((r) => JSON.stringify(r)).join("\n"));
  const other = parseTrajectoryText(v3Records({ steps: [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, streamMs: 100, text: "hi", reasoning: 0 }] }).map((r) => JSON.stringify(r)).join("\n"));
  assert.deepEqual(diffShape(base.shape, other.shape), [], "same format, no diff");
  assert.ok(sameShape(base.shape, other.shape));

  // A future DSH adds a record type + a new nested chunk kind + a stream field.
  const records = v3Records({ steps: [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, streamMs: 100, text: "hi", reasoning: 0 }] });
  records.push({ type: "cache/stats", seq: 99, time: 999, data: { hits: 1 } });
  records.find((r) => r.type === "assistant/message").data.stream.push({ type: "chunk", time: 9999, chunk: { type: "citation-delta", index: 9 } });
  const changed = parseTrajectoryText(records.map((r) => JSON.stringify(r)).join("\n"));

  const ds = diffShape(base.shape, changed.shape);
  const kinds = ds.map((d) => d.kind);
  assert.ok(kinds.includes("type-added"), "new top-level record type is detected");
  assert.ok(ds.some((d) => d.kind === "type-added" && d.detail === "cache/stats"));
  assert.ok(ds.some((d) => d.kind === "stream-kind-added" && d.detail === "chunk:citation-delta"));
  assert.ok(!sameShape(base.shape, changed.shape));
});

test("mergeShapes: unions types and stream kinds across sessions of one format", () => {
  const a = parseTrajectoryText(v3Records({ steps: [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, streamMs: 100, text: "hi", reasoning: 0 }] }).map((r) => JSON.stringify(r)).join("\n"));
  const b = parseTrajectoryText(v3Records({ system: "sys", steps: [{ step: 1, in: 10, cache: 0, out: 5, t0: 2000, thinkMs: 100, streamMs: 100, text: "yo", think: "hmm", reasoning: 1 }] }).map((r) => JSON.stringify(r)).join("\n"));
  const m = mergeShapes([a.shape, b.shape]);
  assert.equal(m.version, 3);
  assert.ok(m.types["system/message"], "union keeps a type only seen in the second session");
  assert.ok(m.streamKinds["chunk:usage"] >= 2, "counts are summed");
  assert.equal(sameShape(m, mergeShapes([a.shape, b.shape])), true, "deterministic");
});

test("timeline: per-turn prompts/outcomes + the non-step event list", () => {
  const records = [
    { type: "session", version: 3, id: "session-tl", createdAt: 100, cwd: "/x" },
    { type: "turn/start", seq: 1, time: 1000, data: { turn: 1 } },
    { type: "system/message", seq: 2, time: 1000, data: { turn: 1, step: 1, message: { role: "system", content: [{ type: "text", text: "S".repeat(400) }] } } },
    { type: "user/message", seq: 3, time: 1050, data: { turn: 1, content: [{ type: "text", text: "do the thing" }], id: "u1" } },
    { type: "step/start", seq: 4, time: 1100, data: { turn: 1, step: 1 } },
    { type: "assistant/message", seq: 5, time: 1300, data: { turn: 1, step: 1, message: { role: "assistant", content: [{ type: "text", text: "Working on it." }], source: { kind: "model", provider: "p", model: "m" } }, usage: { inputTokens: 10, outputTokens: 5, cacheReadTokens: 0, reasoningTokens: 0 }, stream: [] } },
    { type: "todo/write", seq: 6, time: 1400, data: { turn: 1, todos: [{ content: "a", status: "pending" }, { content: "b", status: "pending" }] } },
    { type: "step/end", seq: 7, time: 1500, data: { turn: 1, step: 1 } },
    { type: "turn/end", seq: 8, time: 1600, data: { turn: 1, reason: { kind: "aborted", reason: { kind: "user" } } } },
    { type: "turn/start", seq: 9, time: 2000, data: { turn: 2 } },
    { type: "user/message", seq: 10, time: 2050, data: { turn: 2, content: [{ type: "text", text: "again" }], id: "u2" } },
    { type: "step/start", seq: 11, time: 2100, data: { turn: 2, step: 1 } },
    { type: "assistant/message", seq: 12, time: 2300, data: { turn: 2, step: 1, message: { role: "assistant", content: [{ type: "tool-call", id: "c", name: "bash", arguments: "{}" }], source: { kind: "model", provider: "p", model: "m" } }, usage: { inputTokens: 12, outputTokens: 6, cacheReadTokens: 0, reasoningTokens: 0 }, stream: [] } },
    { type: "llm/retry", seq: 13, time: 2400, data: { turn: 2, step: 1, retry: 1, maxRetries: 5, delayMs: 500, failure: { code: "TRANSPORT", message: "terminated" } } },
    { type: "step/end", seq: 14, time: 2500, data: { turn: 2, step: 1 } },
    { type: "turn/end", seq: 15, time: 2600, data: { turn: 2, reason: { kind: "completed" } } },
  ];
  const t = parseTrajectoryText(records.map((r) => JSON.stringify(r)).join("\n"));
  const tl = t.timeline;
  assert.equal(tl.turns.length, 2, "one entry per turn");
  const [t1, t2] = tl.turns;
  assert.deepEqual({ turn: t1.turn, prompt: t1.prompt, response: t1.response, status: t1.status, steps: t1.steps }, { turn: 1, prompt: "do the thing", response: "Working on it.", status: "aborted", steps: 1 });
  assert.equal(t1.detail, "stopped by user");
  assert.equal(t2.status, "completed");
  assert.equal(t2.response, "→ bash", "a tool-only step still names its tools");
  assert.equal(t1.startTime, 1000);
  assert.equal(t1.endTime, 1600);

  const kinds = tl.events.map((e) => e.kind);
  for (const k of ["system", "prompt", "todo", "user-stop", "retry"]) assert.ok(kinds.includes(k), "event kind present: " + k);
  const stop = tl.events.find((e) => e.kind === "user-stop");
  assert.equal(stop.turn, 1);
  assert.equal(stop.text, "Turn stopped by user");
  const retry = tl.events.find((e) => e.kind === "retry");
  assert.equal(retry.turn, 2);
  assert.equal(retry.step, 1);
  assert.match(retry.text, /Retry 1\/5 · TRANSPORT/);
  const sys = tl.events.find((e) => e.kind === "system");
  assert.equal(sys.turn, null, "session-level events stay unpositioned");
  // Events are in stream order.
  const seqs = tl.events.map((e) => e.seq);
  assert.deepEqual(seqs, [...seqs].sort((a, b) => a - b));
});

test("timeline: events without a turn field are positioned by seq (v0-style records)", () => {
  const records = [
    { type: "session", version: 0, id: "session-v0tl", createdAt: 100, cwd: "/x" },
    { type: "turn/start", seq: 1, time: 1000, data: { turn: 1 } },
    { type: "step/start", seq: 2, time: 1100, data: { turn: 1, step: 1 } },
    { type: "step/end", seq: 3, time: 1200, data: { turn: 1, step: 1 } },
    { type: "turn/end", seq: 4, time: 1300, data: { turn: 1, reason: { kind: "completed" } } },
    { type: "turn/start", seq: 10, time: 2000, data: { turn: 2 } },
    // No `turn` on this record (v0 shape): it must land in turn 2, after seq 10.
    { type: "todo/write", seq: 12, time: 2100, data: { todos: [{ content: "x", status: "pending" }] } },
    { type: "approval/asked", seq: 13, time: 2150, data: { id: "a", toolName: "bash", reason: "needs write access" } },
    { type: "step/start", seq: 14, time: 2200, data: { turn: 2, step: 1 } },
    { type: "step/end", seq: 15, time: 2300, data: { turn: 2, step: 1 } },
    { type: "turn/end", seq: 16, time: 2400, data: { turn: 2, reason: { kind: "completed" } } },
  ];
  const tl = parseTrajectoryText(records.map((r) => JSON.stringify(r)).join("\n")).timeline;
  const todo = tl.events.find((e) => e.kind === "todo");
  const appr = tl.events.find((e) => e.kind === "approval");
  assert.equal(todo.turn, 2, "todo positioned by seq into the open turn");
  assert.equal(appr.turn, 2, "approval positioned by seq into the open turn");
  assert.match(appr.text, /Approval asked · bash/);
});
