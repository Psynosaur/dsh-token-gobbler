// token-gobbler · trajectory.js
// Reads DSH session trajectory files (~/.dsh/sessions/<ws>/<sid>/session.jsonl.zstd).
// zstd-decompresses + parses the JSONL records.
//
// Two kinds of signal are extracted:
//
//   1. PER-TURN USAGE (rare — most trajectories are header-only / compacted):
//        { type:"assistant/chunk", data:{ turn, step, chunk:{ type:"usage", usage:{...} } } }
//        { type:"assistant/chunk", data:{ turn, step, chunk:{ type:"finish", replayState:{ response:{ provider, model } } } } }
//      When present these carry EXACT per-step token buckets + the model.
//
//   2. THE MODEL TIMELINE (always present): which provider+model was active at each
//      point in the session, plus the global seq of every completed step (one LLM call).
//        { type:"request/header",  seq, data:{ header:{ config:{ provider, model } } } }  // config marker
//        { type:"request/context", seq, data:{ provider, model, contextWindow } }          // context marker
//        { type:"step/end",        seq, data:{ turn, step } }                              // one LLM step
//
// The model timeline lets report.js attribute a session's REAL token totals (from the
// projcache, which has no model) across the models actually used, by splitting on the
// number of steps each model was active for. See report.attributeSession().
//
// NOTE: aux calls (session/title-llm-request, etc.) are NOT in the timeline — they are
// not part of the agent step loop and their tokens are negligible.

import { zstdDecompressSync } from "node:zlib";
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";

/** Recursively find *.zstd trajectory files under a root. */
export function findTrajectoryFiles(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".git") continue;
        walk(full);
      } else if (e.isFile() && e.name.endsWith(".zstd")) {
        out.push(full);
      }
    }
  };
  try { if (statSync(root).isDirectory()) walk(root); } catch { /* missing root */ }
  return out;
}

/**
 * Parse trajectory text (JSONL). Returns:
 *   meta         { id, cwd, createdAt, agentPreset }
 *   usage[]      { turn, step, model, provider, buckets, decodeMs, ttftMs }  (exact, when present)
 *   decode       { tokens, ms, steps }  (streamed output tokens / pure decode time, from chunk timestamps)
 *   prefill      { tokens, ms, steps }  (new uncached input tokens / TTFT time — prompt processing)
 *   modelCounts  { [model]: stepCount }                     (from usage)
 *   modelChanges [{ seq, provider, model }]                 (unsorted; from request/header + request/context)
 *   stepSeqs     [number]                                   (seq of every step/end = one LLM call)
 */
/** Map a harness event type to its activity category (for the event breakdown). */
export const EVENT_CAT = {
  "step/end": "steps",
  "tool/call": "toolCalls",
  "tool/code-dispatch": "toolSubCalls",
  "user/message": "userMessages",
  "assistant/message": "assistantMessages",
  "turn/end": "turns",
  "compaction/end": "compactions",
  "llm/retry": "retries",
  "approval/asked": "approvals",
  "todo/write": "todos",
  "command/done": "commands",
};
/** Zeroed activity-category counters. */
export const emptyEvents = () => ({ steps: 0, toolCalls: 0, toolSubCalls: 0, userMessages: 0, assistantMessages: 0, turns: 0, compactions: 0, retries: 0, approvals: 0, todos: 0, commands: 0 });

export function parseTrajectoryText(text) {
  const lines = String(text).split("\n").filter(Boolean);
  const out = { meta: null, usage: [], modelCounts: {}, modelChanges: [], stepSeqs: [], events: emptyEvents(), tools: {}, toolCalls: {}, toolCallArgs: {}, stepTools: {}, stepToolArgs: {}, decode: { tokens: 0, ms: 0, steps: 0 }, prefill: { tokens: 0, ms: 0, steps: 0 } };
  let curModel = null;
  let curProvider = null;
  // First assistant/chunk time per (turn, step) — the stream start. The usage chunk
  // arrives when the stream ends, so usage.time - firstChunkTime = pure decode time
  // (excludes TTFT). Every trajectory line carries a millisecond time.
  const firstChunkTime = new Map();
  // TTFT (time to first token), per (turn, step). Primary source: the step/start
  // event fires when the step's LLM call is dispatched, so firstChunkTime -
  // stepStartTime = TTFT (includes serialization + network + queue + prefill) for
  // EVERY step. Fallback (older trajectories without step/start): the last request
  // event (request/header, request/context) before the step's stream. New (uncached)
  // input tokens over TTFT = the prompt-processing speed for that step.
  const ttftByKey = new Map();
  const stepStartTime = new Map();
  // Thinking (reasoning) generation window per (turn, step). Thinking is streamed
  // as `reasoning-chunks` (fine-grained, time0) and `assistant/chunk` reasoning-delta
  // (coarser). We merge both to get the overall [first,last] thinking timestamp per
  // step; last-first = the time spent generating thinking. The authoritative thinking
  // TOKEN count comes from usage.reasoningTokens (see recordUsage).
  const thinkingTimeByKey = new Map(); // "turn:step" -> { first, last }
  // Total thinking (reasoning) text chars per (turn, step), from the fine-grained
  // `reasoning-chunks` stream. Used to ESTIMATE thinking tokens when the provider
  // streams thinking but reports reasoningTokens=0 (common). chars/4 tracks the
  // authoritative reasoningTokens within ~15% (calibrated).
  const reasoningCharsByKey = new Map(); // "turn:step" -> chars (from reasoning-chunks .texts)
  // Complete thinking text is streamed token-by-token as `assistant/chunk`
  // reasoning-delta (.chunk.text) - the authoritative, full text. `reasoning-chunks`
  // .texts is only a fragmentary subsample that under-counts (often 0). We tally
  // BOTH per step and use the LARGER, since they are two fragmentations of the same
  // thinking (not additive; summing double-counts).
  const reasoningDeltaCharsByKey = new Map(); // "turn:step" -> chars (from reasoning-delta .text)
  // "turn:step" keys that already produced a usage record. Guards against a step that
  // emits BOTH a usage chunk and a finish chunk carrying usage (recordUsage would
  // otherwise push the step twice → per-model buckets, step tree and timing double-counted).
  const usageRecordedByKey = new Set();
  const noteThinking = (stepKey, t) => {
    if (typeof t !== "number") return;
    const e = thinkingTimeByKey.get(stepKey);
    if (!e) thinkingTimeByKey.set(stepKey, { first: t, last: t });
    else { if (t < e.first) e.first = t; if (t > e.last) e.last = t; }
  };
  let lastRequestTime = null;
  let lastEndedStep = null; // "turn:step" key of the most recently completed step (for tool attribution)

  const addModelChange = (seq, provider, model) => {
    if (!model) return;
    out.modelChanges.push({ seq: typeof seq === "number" ? seq : null, provider: provider ?? null, model });
  };

  const recordUsage = (data, chunk, time) => {
    const u = chunk.usage;
    if (!u) return;
    const buckets = {
      uncachedInputTokens: u.inputTokens ?? 0,
      outputTokens: u.outputTokens ?? 0,
      cacheReadTokens: u.cacheReadTokens ?? 0,
      cacheWriteTokens: u.cacheWriteTokens ?? 0,
      reasoningTokens: u.reasoningTokens ?? 0, // subdivision of output — tracked, never double-counted
    };
    const stepKey = (data?.turn ?? "?") + ":" + (data?.step ?? "?");
    if (usageRecordedByKey.has(stepKey)) return; // dedup: a step that emits both a usage chunk and a
    usageRecordedByKey.add(stepKey);              // finish-with-usage chunk would otherwise be recorded twice
    const first = firstChunkTime.get(stepKey);
    const decodeMs = (typeof time === "number" && typeof first === "number" && time > first) ? time - first : null;
    const ttftMs = ttftByKey.get(stepKey) ?? null;
    const thinking = thinkingTimeByKey.get(stepKey);
    const thinkingMs = (thinking && thinking.last > thinking.first) ? thinking.last - thinking.first : null;
    const thinkingChars = Math.max(reasoningCharsByKey.get(stepKey) || 0, reasoningDeltaCharsByKey.get(stepKey) || 0);
    out.usage.push({ turn: data?.turn ?? null, step: data?.step ?? null, model: curModel, provider: curProvider, buckets, decodeMs, ttftMs, thinkingMs, thinkingChars });
    if (decodeMs != null) {
      out.decode.tokens += buckets.outputTokens || 0; // streamed tokens (reasoning included in output)
      out.decode.ms += decodeMs;
      out.decode.steps++;
    }
    if (ttftMs != null) {
      out.prefill.tokens += buckets.uncachedInputTokens || 0; // new context only — cached reads are the fast path
      out.prefill.ms += ttftMs;
      out.prefill.steps++;
    }
    const key = curModel || "(unknown)";
    out.modelCounts[key] = (out.modelCounts[key] || 0) + 1;
  };

  for (const ln of lines) {
    let r;
    try { r = JSON.parse(ln); } catch { continue; }
    if (!r || typeof r !== "object") continue;
    const cat = EVENT_CAT[r.type];
    if (cat) out.events[cat]++;
    if (r.type === "tool/code-dispatch" && r.data?.name) out.tools[r.data.name] = (out.tools[r.data.name] || 0) + 1;
    if (r.type === "tool/call" && r.data?.name) {
      out.toolCalls[r.data.name] = (out.toolCalls[r.data.name] || 0) + 1;
      const argsChars = typeof r.data.arguments === "string" ? r.data.arguments.length : 0;
      if (argsChars) out.toolCallArgs[r.data.name] = (out.toolCallArgs[r.data.name] || 0) + argsChars;
      if (lastEndedStep) {
        (out.stepTools[lastEndedStep] ||= []).push(r.data.name);
        if (argsChars) {
          out.stepToolArgs[lastEndedStep] ||= {};
          out.stepToolArgs[lastEndedStep][r.data.name] = (out.stepToolArgs[lastEndedStep][r.data.name] || 0) + argsChars;
        }
      }
    }
    if (r.type === "session") {
      out.meta = { id: r.id ?? null, cwd: r.cwd ?? null, createdAt: r.createdAt ?? null, agentPreset: r.agentPreset ?? null };
    } else if (r.type === "request/header") {
      if (typeof r.time === "number") lastRequestTime = r.time; // request sent -> TTFT clock starts
      const cfg = r.data?.header?.config;
      if (cfg?.model) { curModel = cfg.model; curProvider = cfg.provider ?? curProvider; addModelChange(r.seq, cfg.provider, cfg.model); }
    } else if (r.type === "request/context") {
      if (typeof r.time === "number") lastRequestTime = r.time;
      if (r.data?.model) { curModel = r.data.model; curProvider = r.data.provider ?? curProvider; addModelChange(r.seq, r.data.provider, r.data.model); }
    } else if (r.type === "step/start") {
      if (typeof r.time === "number" && r.data?.turn != null && r.data?.step != null) stepStartTime.set(r.data.turn + ":" + r.data.step, r.time);
    } else if (r.type === "step/end") {
      if (typeof r.seq === "number") out.stepSeqs.push(r.seq);
      if (r.data?.turn != null && r.data?.step != null) lastEndedStep = r.data.turn + ":" + r.data.step;
    } else if (r.type === "reasoning-chunks") {
      if (r.data?.turn != null && r.data?.step != null) {
        const k = r.data.turn + ":" + r.data.step;
        noteThinking(k, typeof r.time0 === "number" ? r.time0 : r.time);
        for (const t of (r.data.texts || [])) if (typeof t === "string") reasoningCharsByKey.set(k, (reasoningCharsByKey.get(k) || 0) + t.length);
      }
    } else if (r.type === "assistant/chunk") {
      const chunk = r.data?.chunk;
      if (!chunk) continue;
      const stepKey = (r.data?.turn ?? "?") + ":" + (r.data?.step ?? "?");
      if (typeof r.time === "number" && !firstChunkTime.has(stepKey)) {
        firstChunkTime.set(stepKey, r.time);
        const stepStart = stepStartTime.get(stepKey);
        if (typeof stepStart === "number" && r.time > stepStart) ttftByKey.set(stepKey, r.time - stepStart);
        else if (typeof lastRequestTime === "number" && r.time > lastRequestTime) ttftByKey.set(stepKey, r.time - lastRequestTime);
        lastRequestTime = null; // consumed by this step's stream
      }
      if (chunk.type === "reasoning-delta") {
        noteThinking(stepKey, r.time); // coarser thinking stream — merged with reasoning-chunks
        if (typeof chunk.text === "string" && chunk.text) reasoningDeltaCharsByKey.set(stepKey, (reasoningDeltaCharsByKey.get(stepKey) || 0) + chunk.text.length);
      }
      if (chunk.type === "usage") recordUsage(r.data, chunk, r.time);
      else if (chunk.type === "finish") {
        const resp = chunk.replayState?.response;
        if (resp?.model) { curModel = resp.model; curProvider = resp.provider ?? curProvider; }
        if (chunk.usage) recordUsage(r.data, chunk, r.time); // some shapes carry usage on the finish chunk
      }
    }
  }
  return out;
}

/**
 * Decompress a (possibly multi-frame) zstd buffer. DSH appends trajectories as separate
 * zstd frames (one per write), but node:zlib's one-shot AND streaming decompress both
 * return only the FIRST frame. So we locate every frame start (zstd magic 28 B5 2F FD)
 * and decompress each slice — zstdDecompressSync stops at the first frame end, so each
 * slice yields exactly one frame. Concatenating them reconstructs the full JSONL.
 */
export function zstdMultiFrameDecompress(buf) {
  const starts = [];
  for (let i = 0; i + 4 <= buf.length; i++) {
    if (buf[i] === 0x28 && buf[i + 1] === 0xb5 && buf[i + 2] === 0x2f && buf[i + 3] === 0xfd) starts.push(i);
  }
  const out = [];
  for (const s of starts) {
    try { out.push(zstdDecompressSync(buf.subarray(s))); } catch { /* skip malformed frame */ }
  }
  return Buffer.concat(out);
}

// ── parse cache ──────────────────────────────────────────────────────────
// Trajectories are append-only and, once a session is done, effectively static.
// The expensive part is the multi-frame zstd decompress + JSONL parse, so we cache
// the parsed result per file. A file whose (mtimeMs, size) is unchanged is served
// from cache with NO read at all; a file whose stat changed is re-read and only
// re-parsed if its content hash actually changed (handles mtime-preserving rewrites).
const parseCache = new Map(); // filePath -> { mtimeMs, size, hash, parsed }
const parseStats = { cacheHits: 0, recomputed: 0 };

/** Cumulative cache counters (how much re-parse was avoided this process). */
export function parseStatsSnapshot() {
  return { cacheHits: parseStats.cacheHits, recomputed: parseStats.recomputed };
}

/** Read + parse one trajectory file (cached by file stat + content hash). */
export function readTrajectory(filePath) {
  let st;
  try { st = statSync(filePath); } catch { return null; } // file vanished
  const stat = { mtimeMs: st.mtimeMs, size: st.size };

  const hit = parseCache.get(filePath);
  if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) {
    parseStats.cacheHits++;
    return hit.parsed; // unchanged — no read, no decompress, no parse
  }

  const buf = readFileSync(filePath);
  const hash = createHash("sha256").update(buf).digest("hex");
  if (hit && hit.hash === hash) {
    parseCache.set(filePath, { ...stat, hash, parsed: hit.parsed }); // stat drifted, content same
    parseStats.cacheHits++;
    return hit.parsed;
  }

  const parsed = parseTrajectoryText(zstdMultiFrameDecompress(buf).toString("utf8"));
  parseCache.set(filePath, { ...stat, hash, parsed });
  parseStats.recomputed++;
  return parsed;
}

// ── disk-backed parse cache ────────────────────────────────────────────────
// Survives harness restarts. On startup, loadDiskCache() hydrates the in-memory
// Map so unchanged trajectories are served from the persisted parse without
// re-reading, re-decompressing, or re-parsing. After a load batch that recomputed
// any entries, saveDiskCache() flushes the updated Map back to disk.
const CACHE_VERSION = 5; // bumped: thinking estimate now uses reasoning-delta .text (max with reasoning-chunks .texts) — parsed thinkingChars changed
let _diskCachePath = null;
let _diskCacheLoaded = false;

/** Where the disk cache lives (alongside pricing.json). */
export function trajectoryCachePath(dshHome) {
  return join(dshHome, "token-gobbler", "trajectory-cache.json");
}

/**
 * Load the disk-backed parse cache into the in-memory Map.
 * Call once before the first readTrajectory batch (e.g. at the top of loadSources).
 * Safe to call multiple times — only the first call does I/O.
 */
export function loadDiskCache(dshHome) {
  if (_diskCacheLoaded) return { loaded: 0 };
  _diskCacheLoaded = true;
  _diskCachePath = trajectoryCachePath(dshHome);

  let data;
  try { data = JSON.parse(readFileSync(_diskCachePath, "utf8")); } catch { return { loaded: 0 }; }
  if (!data || data.version !== CACHE_VERSION) return { loaded: 0 };

  let count = 0;
  for (const [filePath, entry] of Object.entries(data.entries || {})) {
    if (entry && typeof entry.mtimeMs === "number" && typeof entry.size === "number" && entry.parsed) {
      parseCache.set(filePath, entry);
      count++;
    }
  }
  return { loaded: count };
}

/**
 * Persist the in-memory parse cache to disk (atomic write via temp+rename).
 * Call after a load batch that may have recomputed entries.
 * Prunes entries whose files no longer exist to keep the cache file small.
 */
export function saveDiskCache(dshHome) {
  if (!_diskCachePath && dshHome) _diskCachePath = trajectoryCachePath(dshHome);
  if (!_diskCachePath) return { saved: 0 };

  const entries = {};
  let count = 0;
  for (const [filePath, entry] of parseCache) {
    // Prune: skip entries whose file no longer exists
    try { statSync(filePath); } catch { continue; }
    entries[filePath] = entry;
    count++;
  }

  const tmp = _diskCachePath + ".tmp";
  try {
    mkdirSync(dirname(_diskCachePath), { recursive: true });
    writeFileSync(tmp, JSON.stringify({ version: CACHE_VERSION, entries }));
    renameSync(tmp, _diskCachePath);
  } catch { /* best-effort — cache is an optimization, not critical data */ }
  return { saved: count };
}

/** Invalidate the disk cache (e.g. after a parse-format change). */
export function clearDiskCache(dshHome) {
  _diskCacheLoaded = false;
  _diskCachePath = null;
  parseCache.clear();
  parseStats.cacheHits = 0;
  parseStats.recomputed = 0;
  if (dshHome) {
    try { const p = trajectoryCachePath(dshHome); if (existsSync(p)) renameSync(p, p + ".old"); } catch { /* ok */ }
  }
}
