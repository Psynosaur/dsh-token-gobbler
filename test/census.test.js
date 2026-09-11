// token-gobbler · test/census.test.js
// Covers the shared core of the corpus-analysis CLIs (scripts/census.js) on a
// SYNTHETIC corpus, so the semantics hold without depending on ~/.dsh:
//   * a session that switched models is held out of a single-model comparison
//   * a mixed session's rollup-only fallback is flagged, never silently measured
//   * rates are time-weighted (a slow step must outvote a fast one)
//   * the session-clustered bootstrap refuses to report a CI it cannot support
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zstdCompressSync } from "node:zlib";

import { collect, isMixed, usedModels, rollup, wDecode, fastShare, bootstrapDelta, quantile } from "../scripts/census.js";

const MODEL = "DavidAU-Qwen3.8-27B-FCFusion-Q6-MTP-GGUF";
const CLOUD = "deepseek-v4-flash";

/**
 * Build a fake DSH home with N sessions. Each session is a real trajectory with
 * per-step usage chunks (block-start at t0, usage at t1 → decodeMs = t1 - t0), so
 * the whole collect() path is exercised rather than a stub.
 */
function fakeHome(sessions) {
  const home = mkdtempSync(join(tmpdir(), "tg-census-"));
  mkdirSync(join(home, "storages"), { recursive: true });
  const store = { tables: { sessions: {} } };
  for (const s of sessions) {
    // buildBreakdown only surfaces a session with allTokens > 0, so the projcache
    // totals have to be real — they are also what the UI head shows.
    const uncached = s.uncached ?? s.steps.reduce((n, st) => n + (st.in ?? 0), 0);
    const output = s.output ?? s.steps.reduce((n, st) => n + st.out, 0);
    store.tables.sessions[s.id] = {
      identity: { createdAt: s.createdAt, cwd: "/tmp" },
      rows: { tokenUsage: { val: { totals: { uncachedInputTokens: uncached, outputTokens: output, cacheReadTokens: 0, cacheWriteTokens: 0 } } } },
    };
    const ws = join(home, "sessions", "--tmp--", s.id);
    mkdirSync(ws, { recursive: true });
    const lines = [{ type: "session", id: s.id, createdAt: s.createdAt, cwd: "/tmp" }];
    let t = 1_000_000;
    s.steps.forEach((st, i) => {
      lines.push({ type: "request/context", seq: i, time: t, data: { provider: "llamacpp", model: st.model } });
      lines.push({ type: "assistant/chunk", time: t, data: { turn: 1, step: i + 1, chunk: { type: "block-start", index: 0, blockType: "text" } } });
      lines.push({
        type: "assistant/chunk", time: t + st.ms,
        data: { turn: 1, step: i + 1, chunk: { type: "usage", usage: { inputTokens: st.in ?? 0, outputTokens: st.out, cacheReadTokens: st.cache ?? 0, reasoningTokens: st.think ?? 0 } } },
      });
      t += st.ms + 1000;
    });
    writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf8")));
  }
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify(store));
  return home;
}

// ── mixed-model sessions ────────────────────────────────────────────────────
test("collect: a session that switched models is held out of a single-model comparison", () => {
  const home = fakeHome([
    { id: "session-pure", createdAt: Date.parse("2026-09-10T08:00:00"), steps: [
      { model: MODEL, out: 100, ms: 2000, in: 500 },
      { model: MODEL, out: 100, ms: 2000, in: 500 },
    ] },
    { id: "session-mixed", createdAt: Date.parse("2026-09-10T09:00:00"), steps: [
      { model: MODEL, out: 100, ms: 2000, in: 500 },
      { model: CLOUD, out: 100, ms: 2000, in: 500 },
    ] },
  ]);

  const held = collect({ model: "davidau", dshHome: home, approx: false });
  assert.equal(held.steps.length, 2, "only the pure session's steps survive");
  assert.equal(held.meta.sessions, 1);
  assert.equal(held.meta.skipped.mixed, 1);
  assert.equal(held.meta.skipped.mixedSteps, 1, "the mixed session's davidau steps are counted as held out");
  assert.deepEqual(held.meta.skipped.mixedDays, [held.steps[0].day]);

  const kept = collect({ model: "davidau", dshHome: home, approx: false, includeMixed: true });
  assert.equal(kept.steps.length, 3, "--include-mixed keeps the matching steps of both");
  assert.equal(kept.meta.skipped.mixed, 0);

  // with --all there is no "the model" to have been switched away from
  const everything = collect({ model: "davidau", all: true, dshHome: home, approx: false });
  assert.equal(everything.steps.length, 4);
  assert.equal(everything.meta.skipped.mixed, 0);
});

test("usedModels/isMixed: a model with zero steps does not make a session mixed", () => {
  assert.deepEqual(usedModels({ models: [{ key: "a", steps: 3 }, { key: "b", steps: 0 }] }).map((m) => m.key), ["a"]);
  assert.equal(isMixed({ models: [{ key: "a", steps: 3 }, { key: "b", steps: 0 }] }), false);
  assert.equal(isMixed({ models: [{ key: "a", steps: 3 }, { key: "b", steps: 1 }] }), true);
  assert.equal(isMixed({ models: [] }), false);
});

test("collect: a session with timings but no per-step turn is folded in and FLAGGED", () => {
  // Some providers stream usage without turn/step numbers. buildBreakdown then has
  // per-model timing but no step rows — collect() must still see the session, and
  // must mark it `approx` so it never reads as a measured step.
  const home = fakeHome([{ id: "session-noturn", createdAt: Date.parse("2026-09-10T10:00:00"), steps: [], uncached: 500, output: 200 }]);
  const ws = join(home, "sessions", "--tmp--", "session-noturn");
  const lines = [
    { type: "session", id: "session-noturn", createdAt: Date.parse("2026-09-10T10:00:00"), cwd: "/tmp" },
    { type: "request/context", data: { provider: "llamacpp", model: MODEL } },
    { type: "assistant/chunk", time: 1000, data: { chunk: { type: "block-start", index: 0, blockType: "text" } } },
    { type: "assistant/chunk", time: 3000, data: { chunk: { type: "usage", usage: { inputTokens: 500, outputTokens: 200, cacheReadTokens: 0 } } } },
  ];
  writeFileSync(join(ws, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf8")));

  const got = collect({ model: "davidau", dshHome: home, approx: true });
  assert.equal(got.steps.length, 1);
  assert.equal(got.steps[0].approx, true, "marked as a rollup-derived pseudo-step");
  assert.equal(got.meta.approxSessions, 1);
  assert.ok(got.steps[0].dec > 0);

  const without = collect({ model: "davidau", dshHome: home, approx: false });
  assert.equal(without.steps.length, 0, "--no-approx drops it entirely");
});

// ── aggregation semantics ───────────────────────────────────────────────────
test("wDecode: time-weighted, so one slow step outvotes one fast step", () => {
  const rows = [
    { out: 100, dec: 100, decMs: 1000 },  // 100 tok/s over 1 s
    { out: 10, dec: 5, decMs: 2000 },     // 5 tok/s over 2 s
  ];
  assert.equal(wDecode(rows), 110 / 3);   // NOT (100 + 5) / 2 = 52.5
  assert.ok(Math.abs(wDecode(rows) - 36.666) < 0.001);
  assert.equal(wDecode([{ out: 0, dec: null, decMs: null }]), null);
});

test("rollup: counts sessions, and fastShare is a share of measurable steps only", () => {
  const rows = [
    { sid: "a", out: 100, dec: 100, decMs: 1000, ttft: 500, in: 100, cache: 900, think: 50, ctx: 1000, day: "d" },
    { sid: "a", out: 100, dec: 10, decMs: 10000, ttft: 500, in: 100, cache: 900, think: 50, ctx: 1000, day: "d" },
    { sid: "b", out: 0, dec: null, decMs: null, ttft: 0, in: 0, cache: 0, think: 0, ctx: 1000, day: "d" },
  ];
  const s = rollup(rows, { fast: 50 });
  assert.equal(s.steps, 3);
  assert.equal(s.sessions, 2);
  assert.equal(s.fastShare, 0.5, "1 of 2 measurable steps, the untimed step is not counted");
  assert.equal(fastShare(rows, 0), 1);
  assert.equal(s.thinkPct, 50);   // 100 of 200 output tokens
  assert.equal(s.cachePct, 90);   // 1800 of 2000 prompt tokens
  assert.equal(s.outPerStep, 200 / 3);
});

// ── the confidence interval ─────────────────────────────────────────────────
test("bootstrapDelta: refuses a CI it cannot support, and is deterministic otherwise", () => {
  const mk = (sid, dec, n) => Array.from({ length: n }, () => ({ sid, out: 100, dec, decMs: (100 / dec) * 1000, ctx: 1000 }));
  const focus = [...mk("f1", 60, 5), ...mk("f2", 62, 5), ...mk("f3", 58, 5)];
  const rest = [...mk("r1", 40, 5), ...mk("r2", 42, 5), ...mk("r3", 38, 5)];

  const a = bootstrapDelta(focus, rest, wDecode, { B: 200, seed: 7 });
  const b = bootstrapDelta(focus, rest, wDecode, { B: 200, seed: 7 });
  assert.deepEqual(a, b, "same seed, same CI");
  assert.ok(a.value > 40, "observed delta is a large positive percentage");
  assert.ok(a.lo > 0 && a.hi > a.lo, "CI excludes zero for two clearly separated groups");
  assert.equal(a.mode, "rel");

  // two sessions per side is below the cluster threshold — no CI, but a value
  const thin = bootstrapDelta(mk("f1", 60, 5), mk("r1", 40, 5), wDecode, { B: 50 });
  assert.equal(thin.lo, null);
  assert.equal(thin.reason, "too few sessions");
});

test("bootstrapDelta: 'pp' mode reports percentage POINTS, not a ratio", () => {
  // One row per step; dec 90 tok/s counts as "fast" at a 60 tok/s threshold.
  const fastRow = (sid) => ({ sid, out: 100, dec: 90, decMs: (100 / 90) * 1000 });
  const slowRow = (sid) => ({ sid, out: 100, dec: 10, decMs: (100 / 10) * 1000 });
  const focus = ["f1", "f2", "f3"].flatMap((sid) => Array.from({ length: 10 }, () => fastRow(sid)));
  // rest: 9 slow + 1 fast per session = a 10 % fast share (a non-zero base, so the
  // relative change is defined)
  const rest = ["r1", "r2", "r3"].flatMap((sid) => [...Array.from({ length: 9 }, () => slowRow(sid)), fastRow(sid)]);
  const share = (R) => fastShare(R, 60) * 100;
  assert.equal(share(focus), 100);
  assert.equal(Math.round(share(rest)), 10);

  const rel = bootstrapDelta(focus, rest, share, { B: 100 });
  const pp = bootstrapDelta(focus, rest, share, { B: 100, mode: "pp" });
  assert.equal(rel.value, 900, "100 % vs 10 % is +900 % in relative terms");
  assert.equal(pp.value, 90, "…but +90 percentage points in pp terms");
  assert.equal(pp.mode, "pp");

  // A zero base has no meaningful relative change — the guard returns null, which
  // is precisely why pp mode exists for shares.
  const noneFast = ["z1", "z2", "z3"].flatMap((sid) => Array.from({ length: 10 }, () => slowRow(sid)));
  assert.equal(bootstrapDelta(focus, noneFast, share, { B: 50 }).value, null);
  assert.equal(bootstrapDelta(focus, noneFast, share, { B: 50, mode: "pp" }).value, 100);
});

test("quantile: interpolates and ignores junk", () => {
  assert.equal(quantile([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(quantile([1, null, undefined, NaN, 3], 0.5), 2);
  assert.equal(quantile([], 0.5), null);
});
