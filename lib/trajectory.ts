// token-gobbler · trajectory.ts
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
// The model timeline lets report.ts attribute a session's REAL token totals (from the
// projcache, which has no model) across the models actually used, by splitting on the
// number of steps each model was active for. See report.attributeSession().
//
// NOTE: aux calls (session/title-llm-request, etc.) are NOT in the timeline — they are
// not part of the agent step loop and their tokens are negligible.

import { zstdDecompressSync } from "node:zlib";
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import type { TokenBuckets } from "./pricing.js";

/** A usage chunk's token report (projection-sourced, mirrored on streamed chunks). */
interface UsageInfo {
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  reasoningTokens?: number;
}

/** An assistant/chunk payload (usage / finish / reasoning-delta). */
interface UsageChunk {
  type?: string;
  usage?: UsageInfo;
  text?: string;
  replayState?: { response?: { model?: string; provider?: string } };
}

/** The `data` field of a trajectory record (varies by record type). */
interface Data {
  turn?: number;
  step?: number;
  name?: string;
  arguments?: unknown;
  model?: string;
  provider?: string;
  contextWindow?: number;
  texts?: unknown[];
  text?: string;
  id?: string | null;
  content?: unknown;
  inserted?: unknown[];
  message?: any;
  header?: { config?: { model?: string; provider?: string }; system?: string; tools?: unknown[] };
  chunk?: UsageChunk;
  // compaction records:
  compactionId?: string;
  summary?: unknown[];
  shadowedTokenCount?: number;
  usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; cacheReadTokens?: number };
  error?: string;
  // turn/end reason: { kind: "completed" | "aborted" | "blocked" | "error" | "max-tokens" | "interrupted", ... }
  reason?: { kind?: string; reason?: { kind?: string }; error?: unknown };
}

/** A parsed JSONL trajectory record (shaped from the unstructured JSON). */
interface JsonRecord {
  type?: string;
  seq?: number;
  time?: number;
  time0?: number;
  id?: string | null;
  cwd?: string | null;
  createdAt?: string | null;
  agentPreset?: string | null;
  name?: string;
  arguments?: unknown;
  data?: Data;
}

/** Activity-category counters (the event breakdown). */
export interface EventCounts {
  steps: number; toolCalls: number; toolSubCalls: number; userMessages: number;
  assistantMessages: number; turns: number; compactions: number; retries: number;
  approvals: number; todos: number; commands: number; userStops: number;
}

/** A model-timeline change point (which provider+model became active). */
export interface ModelChange {
  seq: number | null;
  provider: string | null;
  model: string;
}

/**
 * One compaction event, grouped by compactionId across its compaction/start,
 * compaction/summary and compaction/end records. Captures both the EXISTENCE of
 * the compaction (seq/time/duration) and its IMPACT on the context: how many
 * tokens were shadowed out of the context, the prompt size in flight when it ran,
 * and the size of the summary that replaced the compacted messages.
 */
export interface CompactionEvent {
  seq: number | null;          // seq of compaction/start (or end, when no start was recorded)
  endSeq: number | null;       // seq of compaction/end — the compaction's completion point
  time: number | null;         // start time (ms epoch)
  endTime: number | null;      // end time (ms epoch)
  durationMs: number | null;   // end − start (null when either is missing)
  compactionId: string | null;
  hasSummary: boolean;         // a compaction/summary record was recorded
  summaryChars: number;        // chars of the generated summary text
  summaryText: string;         // the full generated summary text (detail popup)
  shadowedTokens: number;      // tokens removed from the context (shadowedTokenCount)
  contextBefore: number | null; // prompt tokens in flight at compaction (usage.inputTokens + usage.cacheReadTokens)
  afterTurn: number | null;    // last LLM step (turn) that started before this compaction ended —
  afterStep: number | null;    // ...and its step: the "Between turns" banner anchor in the UI
  error: string | null;        // error carried by compaction/end (e.g. "Request was aborted")
}

/** Per-turn exact usage (from usage/finish chunks). */
export interface UsageRecord {
  turn: number | null;
  step: number | null;
  model: string | null;
  provider: string | null;
  buckets: TokenBuckets;
  decodeMs: number | null;
  ttftMs: number | null;
  thinkingMs: number | null;
  thinkingChars: number;
}

/** Session meta from the `session` record. */
export interface TrajectoryMeta {
  id: string | null;
  cwd: string | null;
  createdAt: string | null;
  agentPreset: string | null;
}

/** A decode/prefill timing rollup. */
export interface TimingRollup {
  tokens: number;
  ms: number;
  steps: number;
}

/** The fully parsed trajectory (everything callers need). */
export interface ParsedTrajectory {
  meta: TrajectoryMeta | null;
  usage: UsageRecord[];
  modelCounts: Record<string, number>;
  modelChanges: ModelChange[];
  stepSeqs: number[];
  events: EventCounts;
  tools: Record<string, number>;
  toolCalls: Record<string, number>;
  toolCallArgs: Record<string, number>;
  stepTools: Record<string, string[]>;
  stepToolArgs: Record<string, Record<string, number>>;
  decode: TimingRollup;
  prefill: TimingRollup;
  /** System-prompt chars of the LAST request/header seen (chars, not tokens). */
  systemChars: number;
  /** Tools-definition JSON chars of the LAST request/header seen. */
  toolsChars: number;
  /** Model context-window limit (tokens) from request/context, when present. */
  contextWindow: number | null;
  /** Per-step context allocation at the step's request time, in CHARS (callers
   *  estimate tokens as chars/4, the project convention): "turn:step" -> the
   *  system prompt, tools definitions and conversation messages (user + assistant
   *  text/reasoning/tool-calls + tool results) that were in the prompt for that step. */
  stepContext: Record<string, { sys: number; tools: number; msg: number }>;
  /** Compaction events (existence + impact) grouped by compactionId. */
  compactions: CompactionEvent[];
  /** Count of compaction/prune records (small targeted context removals, not full compactions). */
  prunes: number;
  /** Total tokens removed by prunes (sum of their shadowedTokenCount). */
  prunedTokens: number;
  /** "turn:step" keys of steps that STARTED after a compaction reset the context
    *  (the compacted messages no longer count toward their prompt), mapped to the
    *  REGIME INDEX: how many successful compactions ended before the step started
    *  (1 = after the 1st compaction, 2 = after the 2nd, …). Failed compactions
    *  leave the original messages in the context, so they do not advance it. */
  postCompaction: Record<string, number>;
}

/** Recursively find *.zstd trajectory files under a root. */
export function findTrajectoryFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
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
export const EVENT_CAT: Record<string, keyof EventCounts> = {
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
export const emptyEvents = (): EventCounts => ({ steps: 0, toolCalls: 0, toolSubCalls: 0, userMessages: 0, assistantMessages: 0, turns: 0, compactions: 0, retries: 0, approvals: 0, todos: 0, commands: 0, userStops: 0 });

export function parseTrajectoryText(text: string): ParsedTrajectory {
  const lines = String(text).split("\n").filter(Boolean);
  const out: ParsedTrajectory = { meta: null, usage: [], modelCounts: {}, modelChanges: [], stepSeqs: [], events: emptyEvents(), tools: {}, toolCalls: {}, toolCallArgs: {}, stepTools: {}, stepToolArgs: {}, decode: { tokens: 0, ms: 0, steps: 0 }, prefill: { tokens: 0, ms: 0, steps: 0 }, systemChars: 0, toolsChars: 0, contextWindow: null, stepContext: {}, compactions: [], prunes: 0, prunedTokens: 0, postCompaction: {} };
  let curModel: string | null = null;
  let curProvider: string | null = null;
  // First assistant/chunk time per (turn, step) — the stream start. The usage chunk
  // arrives when the stream ends, so usage.time - firstChunkTime = pure decode time
  // (excludes TTFT). Every trajectory line carries a millisecond time.
  const firstChunkTime = new Map<string, number>();
  // TTFT (time to first token), per (turn, step). Primary source: the step/start
  // event fires when the step's LLM call is dispatched, so firstChunkTime -
  // stepStartTime = TTFT (includes serialization + network + queue + prefill) for
  // EVERY step. Fallback (older trajectories without step/start): the last request
  // event (request/header, request/context) before the step's stream. New (uncached)
  // input tokens over TTFT = the prompt-processing speed for that step.
  const ttftByKey = new Map<string, number>();
  const stepStartTime = new Map<string, number>();
  // Thinking (reasoning) generation window per (turn, step). Thinking is streamed
  // as `reasoning-chunks` (fine-grained, time0) and `assistant/chunk` reasoning-delta
  // (coarser). We merge both to get the overall [first,last] thinking timestamp per
  // step; last-first = the time spent generating thinking. The authoritative thinking
  // TOKEN count comes from usage.reasoningTokens (see recordUsage).
  const thinkingTimeByKey = new Map<string, { first: number; last: number }>(); // "turn:step" -> { first, last }
  // Total thinking (reasoning) text chars per (turn, step), from the fine-grained
  // `reasoning-chunks` stream. Used to ESTIMATE thinking tokens when the provider
  // streams thinking but reports reasoningTokens=0 (common). chars/4 tracks the
  // authoritative reasoningTokens within ~15% (calibrated).
  const reasoningCharsByKey = new Map<string, number>(); // "turn:step" -> chars (from reasoning-chunks .texts)
  // Complete thinking text is streamed token-by-token as `assistant/chunk`
  // reasoning-delta (.chunk.text) - the authoritative, full text. `reasoning-chunks`
  // .texts is only a fragmentary subsample that under-counts (often 0). We tally
  // BOTH per step and use the LARGER, since they are two fragmentations of the same
  // thinking (not additive; summing double-counts).
  const reasoningDeltaCharsByKey = new Map<string, number>(); // "turn:step" -> chars (from reasoning-delta .text)
  // "turn:step" keys that already produced a usage record. Guards against a step that
  // emits BOTH a usage chunk and a finish chunk carrying usage (recordUsage would
  // otherwise push the step twice → per-model buckets, step tree and timing double-counted).
  const usageRecordedByKey = new Set<string>();
  const noteThinking = (stepKey: string, t: number | undefined): void => {
    if (typeof t !== "number") return;
    const e = thinkingTimeByKey.get(stepKey);
    if (!e) thinkingTimeByKey.set(stepKey, { first: t, last: t });
    else { if (t < e.first) e.first = t; if (t > e.last) e.last = t; }
  };
  let lastRequestTime: number | null = null;
  let lastEndedStep: string | null = null; // "turn:step" key of the most recently completed step (for tool attribution)
  // ── context-window reconstruction ──────────────────────────────────────────
  // Rebuild, for each step, what was in its prompt: the system prompt + tools
  // definitions (from request/header, constant per session in practice) and the
  // conversation messages up to that step. Message chars are accumulated in stream
  // order; a compaction resets the running total (the compacted summary text is not
  // recorded, so post-compaction message chars are a lower bound — but the removed
  // pre-compaction messages are correctly excluded).
  let systemChars = 0;
  let toolsChars = 0;
  let contextWindow: number | null = null;
  let msgCharsRunning = 0; // assistant+tool-result chars since the last compaction
  let openStep: string | null = null; // "turn:step" of the step currently streaming (null between steps)
  const msgCharsAtStart = new Map<string, number>(); // stepKey -> running msg chars at step start
  const sysAtStart = new Map<string, number>();
  const toolsAtStart = new Map<string, number>();
  const stepStartSeq = new Map<string, number>(); // stepKey -> seq of its step/start
  const stepOrder: string[] = []; // stepKeys in stream order
  const compactionSeqs: number[] = [];
  // ── compaction events (existence + impact) ─────────────────────────────────
  // Grouped by compactionId across compaction/start → compaction/summary →
  // compaction/end. The summary record carries the impact: shadowedTokenCount
  // (tokens removed from the context) and usage.inputTokens (the prompt size in
  // flight when the compaction ran). compaction/prune is a smaller, targeted
  // removal — counted separately (prunes / prunedTokens).
  const compactionBy = new Map<string, CompactionEvent>();
  const newCompaction = (seq: number | null, time: number | null, id: string | null): CompactionEvent => {
    const ev: CompactionEvent = { seq, endSeq: null, time, endTime: null, durationMs: null, compactionId: id, hasSummary: false, summaryChars: 0, summaryText: "", shadowedTokens: 0, contextBefore: null, afterTurn: null, afterStep: null, error: null };
    const key = id || ("(noid-" + (seq ?? compactionBy.size));
    compactionBy.set(key, ev);
    return ev;
  };
  // User messages (the turn's input). Recorded as user/message AND spliced into the
  // conversation as agent/inbox/spliced — deduped by message id below. entry = the
  // step whose prompt contains it (the step open when recorded; null = recorded
  // between steps, resolved to the next step that opens).
  const userMsgs: { id: string | null; seq: number; chars: number; entry: string | null }[] = [];
  const sumTextBlocks = (content: unknown): number => {
    if (!Array.isArray(content)) return 0;
    let n = 0;
    for (const c of content) if (c && typeof c === "object" && (c as any).type === "text" && typeof (c as any).text === "string") n += (c as any).text.length;
    return n;
  };
  const assistantMsgChars = (msg: any): number => {
    let n = 0;
    for (const c of (msg?.content || [])) {
      if (!c || typeof c !== "object") continue;
      if (c.type === "reasoning" || c.type === "text") n += typeof c.text === "string" ? c.text.length : 0;
      else if (c.type === "tool-call") n += (typeof c.name === "string" ? c.name.length : 0) + (typeof c.arguments === "string" ? c.arguments.length : 0);
    }
    return n;
  };
  const toolResultChars = (msg: any): number => {
    let n = 0;
    for (const c of (msg?.content || [])) if (c && typeof c === "object" && c.type === "tool-result") n += sumTextBlocks(c.content);
    return n;
  };
  const addUserMsg = (id: unknown, seq: number, content: unknown): void => {
    const chars = sumTextBlocks(content);
    if (!chars) return;
    userMsgs.push({ id: typeof id === "string" ? id : null, seq, chars, entry: openStep });
  };

  const addModelChange = (seq: number | undefined, provider: string | null | undefined, model: string): void => {
    if (!model) return;
    out.modelChanges.push({ seq: typeof seq === "number" ? seq : null, provider: provider ?? null, model });
  };

  const recordUsage = (data: Data | undefined, chunk: UsageChunk, time: number | undefined): void => {
    const u = chunk.usage;
    if (!u) return;
    const buckets: TokenBuckets = {
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
    let r: JsonRecord;
    try { r = JSON.parse(ln) as JsonRecord; } catch { continue; }
    if (!r || typeof r !== "object") continue;
    const cat = r.type ? EVENT_CAT[r.type] : undefined;
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
      const hdr = r.data?.header;
      if (typeof hdr?.system === "string") systemChars = hdr.system.length;
      if (Array.isArray(hdr?.tools)) toolsChars = JSON.stringify(hdr.tools).length;
      const cfg = hdr?.config;
      if (cfg?.model) { curModel = cfg.model; curProvider = cfg.provider ?? curProvider; addModelChange(r.seq, cfg.provider, cfg.model); }
    } else if (r.type === "request/context") {
      if (typeof r.time === "number") lastRequestTime = r.time;
      if (typeof r.data?.contextWindow === "number") contextWindow = r.data.contextWindow;
      if (r.data?.model) { curModel = r.data.model; curProvider = r.data.provider ?? curProvider; addModelChange(r.seq, r.data.provider, r.data.model); }
    } else if (r.type === "step/start") {
      if (typeof r.time === "number" && r.data?.turn != null && r.data?.step != null) stepStartTime.set(r.data.turn + ":" + r.data.step, r.time);
      if (r.data?.turn != null && r.data?.step != null) {
        const k = r.data.turn + ":" + r.data.step;
        openStep = k;
        msgCharsAtStart.set(k, msgCharsRunning);
        sysAtStart.set(k, systemChars);
        toolsAtStart.set(k, toolsChars);
        if (typeof r.seq === "number") stepStartSeq.set(k, r.seq);
        stepOrder.push(k);
      }
    } else if (r.type === "step/end") {
      if (typeof r.seq === "number") out.stepSeqs.push(r.seq);
      if (r.data?.turn != null && r.data?.step != null) lastEndedStep = r.data.turn + ":" + r.data.step;
      openStep = null; // steps complete in order
    } else if (r.type === "turn/end") {
      // A USER STOP is a turn aborted by the user (the stop button / Ctrl+C):
      // reason.kind === "aborted" with reason.reason.kind === "user". Other
      // aborts (parent, hook, disposed) are not user-initiated, and "interrupted"
      // is a crash-orphan marker (the loop never emits it). We keep the generic
      // "turns" counter above and add this as an explicit event category so the
      // dashboard can show how often the user cut a turn short.
      const rs = r.data?.reason;
      if (rs && rs.kind === "aborted" && rs.reason && rs.reason.kind === "user") out.events.userStops++;
    } else if (r.type === "compaction/start") {
      newCompaction(typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, typeof r.data?.compactionId === "string" ? r.data.compactionId : null);
    } else if (r.type === "compaction/summary") {
      const cid = typeof r.data?.compactionId === "string" ? r.data.compactionId : null;
      let ev = cid ? compactionBy.get(cid) : undefined;
      if (!ev) ev = newCompaction(typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, cid);
      ev.hasSummary = true;
      ev.summaryChars = sumTextBlocks(r.data?.summary);
      // Full summary text (the text blocks, in order) — shown in the detail popup.
      const summaryBlocks = Array.isArray(r.data?.summary)
        ? (r.data.summary as any[]).filter((b) => b && typeof b === "object" && b.type === "text" && typeof b.text === "string").map((b) => b.text)
        : [];
      ev.summaryText = summaryBlocks.join("\n\n");
      if (typeof r.data?.shadowedTokenCount === "number") ev.shadowedTokens = r.data.shadowedTokenCount;
      // Context size at compaction = the summarization request's TOTAL prompt
      // (new + cached input tokens). usage.inputTokens alone is only the
      // uncached slice (a few hundred tokens — the summary prompt itself).
      const cu = r.data?.usage;
      if (cu && (typeof cu.inputTokens === "number" || typeof cu.cacheReadTokens === "number")) {
        ev.contextBefore = (typeof cu.inputTokens === "number" ? cu.inputTokens : 0) + (typeof cu.cacheReadTokens === "number" ? cu.cacheReadTokens : 0);
      }
    } else if (r.type === "compaction/prune") {
      out.prunes++;
      if (typeof r.data?.shadowedTokenCount === "number") out.prunedTokens += r.data.shadowedTokenCount;
    } else if (r.type === "compaction/end") {
      const cid = typeof r.data?.compactionId === "string" ? r.data.compactionId : null;
      let ev = cid ? compactionBy.get(cid) : undefined;
      if (!ev) ev = newCompaction(null, null, cid);
      if (ev.seq == null && typeof r.seq === "number") ev.seq = r.seq;
      if (typeof r.seq === "number") ev.endSeq = r.seq;
      if (ev.time == null && typeof r.time === "number") ev.time = r.time;
      if (typeof r.time === "number") ev.endTime = r.time;
      if (typeof r.data?.error === "string") ev.error = r.data.error;
      if (ev.endTime != null && ev.time != null && ev.endTime > ev.time) ev.durationMs = ev.endTime - ev.time;
      // Only a SUCCESSFUL compaction (one that produced a summary) actually
      // replaced the conversation. Failed ones (aborted / terminated /
      // context-exceeded — carried as error on this record) leave the original
      // messages in the context, so the running message chars keep accumulating.
      if (ev.hasSummary) {
        if (typeof r.seq === "number") compactionSeqs.push(r.seq);
        msgCharsRunning = 0; // the conversation was replaced by a summary — old messages leave the context
      }
    } else if (r.type === "user/message") {
      addUserMsg(r.data?.id, typeof r.seq === "number" ? r.seq : 0, r.data?.content);
    } else if (r.type === "agent/inbox/spliced") {
      for (const m of (r.data?.inserted || [])) addUserMsg((m as any)?.id, typeof r.seq === "number" ? r.seq : 0, (m as any)?.content);
    } else if (r.type === "assistant/message") {
      msgCharsRunning += assistantMsgChars(r.data?.message);
    } else if (r.type === "tool/result") {
      msgCharsRunning += toolResultChars(r.data?.message);
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

  // ── per-step context allocation ────────────────────────────────────────────
  // Resolve user messages recorded between steps to the next step that opens
  // (their prompt is the one that contains them), then dedupe by message id
  // (spliced inbox copies duplicate the user/message records).
  for (const um of userMsgs) {
    if (um.entry) continue;
    um.entry = stepOrder.find((k) => (stepStartSeq.get(k) || 0) > um.seq) || stepOrder[stepOrder.length - 1] || null;
  }
  const seenMsgIds = new Set<string>();
  const uniqueUserMsgs = userMsgs.filter((um) => {
    if (!um.id) return true;
    if (seenMsgIds.has(um.id)) return false;
    seenMsgIds.add(um.id);
    return true;
  });
  // For each step (in stream order): message chars = assistant/tool content after
  // the last compaction before the step, plus user messages that entered at or
  // before this step and survived that compaction.
  stepOrder.forEach((k, i) => {
    const startSeq = stepStartSeq.get(k) || 0;
    let compSeq = 0;
    for (const c of compactionSeqs) if (c < startSeq) compSeq = Math.max(compSeq, c);
    let userChars = 0;
    for (const um of uniqueUserMsgs) {
      if (!um.entry || um.seq <= compSeq) continue;
      const eIdx = stepOrder.indexOf(um.entry);
      if (eIdx !== -1 && eIdx <= i) userChars += um.chars;
    }
    out.stepContext[k] = {
      sys: sysAtStart.get(k) || 0,
      tools: toolsAtStart.get(k) || 0,
      msg: (msgCharsAtStart.get(k) || 0) + userChars,
    };
    // This step started after a compaction reset the context — the compacted
    // messages no longer count toward its prompt (a distinct performance regime).
    // Regime index = how many successful compactions ended before this step.
    const regime = compactionSeqs.reduce((n, c) => (c < startSeq ? n + 1 : n), 0);
    if (regime > 0) out.postCompaction[k] = regime;
  });
  // Anchor each compaction (successful OR failed) to the last LLM step that
  // started before it ended — the "Between turns" position where the COMPACTED
  // banner goes in the UI. (Regime advancement stays success-only: a failed
  // compaction leaves the original messages in the context.)
  for (const ev of compactionBy.values()) {
    const endSeq = ev.endSeq ?? ev.seq;
    if (endSeq == null) continue;
    let anchor: string | null = null;
    for (const k of stepOrder) if ((stepStartSeq.get(k) || 0) < endSeq) anchor = k;
    if (anchor) { const parts = anchor.split(":"); ev.afterTurn = Number(parts[0]); ev.afterStep = Number(parts[1]); }
  }
  out.systemChars = systemChars;
  out.toolsChars = toolsChars;
  out.contextWindow = contextWindow;
  out.compactions = [...compactionBy.values()].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
  return out;
}

/**
 * Decompress a (possibly multi-frame) zstd buffer. DSH appends trajectories as separate
 * zstd frames (one per write), but node:zlib's one-shot AND streaming decompress both
 * return only the FIRST frame. So we locate every frame start (zstd magic 28 B5 2F FD)
 * and decompress each slice — zstdDecompressSync stops at the first frame end, so each
 * slice yields exactly one frame. Concatenating them reconstructs the full JSONL.
 */
export function zstdMultiFrameDecompress(buf: Buffer): Buffer {
  const starts: number[] = [];
  for (let i = 0; i + 4 <= buf.length; i++) {
    if (buf[i] === 0x28 && buf[i + 1] === 0xb5 && buf[i + 2] === 0x2f && buf[i + 3] === 0xfd) starts.push(i);
  }
  const out: Buffer[] = [];
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
interface ParseCacheEntry { mtimeMs: number; size: number; hash: string; parsed: ParsedTrajectory; }
const parseCache = new Map<string, ParseCacheEntry>();
const parseStats = { cacheHits: 0, recomputed: 0 };

/** Cumulative cache counters (how much re-parse was avoided this process). */
export function parseStatsSnapshot(): { cacheHits: number; recomputed: number } {
  return { cacheHits: parseStats.cacheHits, recomputed: parseStats.recomputed };
}

/** Read + parse one trajectory file (cached by file stat + content hash). */
export function readTrajectory(filePath: string): ParsedTrajectory | null {
  let st: ReturnType<typeof statSync>;
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
const CACHE_VERSION = 12; // bumped: EventCounts now includes userStops (turn/end aborted-by-user)
let _diskCachePath: string | null = null;
let _diskCacheLoaded = false;

/** Where the disk cache lives (alongside pricing.json). */
export function trajectoryCachePath(dshHome: string): string {
  return join(dshHome, "token-gobbler", "trajectory-cache.json");
}

/**
 * Load the disk-backed parse cache into the in-memory Map.
 * Call once before the first readTrajectory batch (e.g. at the top of loadSources).
 * Safe to call multiple times — only the first call does I/O.
 */
export function loadDiskCache(dshHome: string): { loaded: number } {
  if (_diskCacheLoaded) return { loaded: 0 };
  _diskCacheLoaded = true;
  _diskCachePath = trajectoryCachePath(dshHome);

  let data: { version?: number; entries?: Record<string, ParseCacheEntry> } | null;
  try { data = JSON.parse(readFileSync(_diskCachePath, "utf8")) as { version?: number; entries?: Record<string, ParseCacheEntry> }; } catch { return { loaded: 0 }; }
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
export function saveDiskCache(dshHome: string): { saved: number } {
  if (!_diskCachePath && dshHome) _diskCachePath = trajectoryCachePath(dshHome);
  if (!_diskCachePath) return { saved: 0 };

  const entries: Record<string, ParseCacheEntry> = {};
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
export function clearDiskCache(dshHome?: string): void {
  _diskCacheLoaded = false;
  _diskCachePath = null;
  parseCache.clear();
  parseStats.cacheHits = 0;
  parseStats.recomputed = 0;
  if (dshHome) {
    try { const p = trajectoryCachePath(dshHome); if (existsSync(p)) renameSync(p, p + ".old"); } catch { /* ok */ }
  }
}
