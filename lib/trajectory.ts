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
//
// ── FORMAT VERSIONS ─────────────────────────────────────────────────────────
// DSH has shipped two on-disk trajectory shapes. Both are JSONL over multi-frame
// zstd; the difference is where the streaming/usage signal lives and what the
// `session` header says.
//
//   version 0 — file `session.jsonl.zstd` (older sessions; kept on disk)
//     · stream records are TOP-LEVEL records, one per chunk:
//         { type:"assistant/chunk", time, data:{ turn, step, chunk:{ type:"usage"|"finish"|… } } }
//         { type:"text-chunks",      time0, data:{ turn, step, index, dt, texts } }
//         { type:"tool-call-chunks", time0, data:{ turn, step, index, dt, args } }
//         { type:"reasoning-chunks", time0, data:{ turn, step, index, dt, texts } }
//     · per-step usage+timing comes from those records; per-step tokens live in
//       `chunk.usage`; `chunk.finish` carries `replayState.response.{provider,model}`.
//
//   version 3 — file `session.v3.jsonl.zstd` (current; written since 2026-09-11)
//     · the same stream is NESTED inside each assistant message, flattened one level:
//         { type:"assistant/message", time, data:{ turn, step, message,
//             usage:{ inputTokens, outputTokens, totalTokens, cacheReadTokens, reasoningTokens },
//             stream:[ { type:"chunk", time, chunk:{ type:"block-start"|"usage"|"finish", … } },
//                      { type:"text-chunks",      time0, index, dt, texts },
//                      { type:"tool-call-chunks", time0, index, dt, id, name, args },
//                      { type:"reasoning-chunks", time0, index, dt, texts } ] } }
//     · NO top-level `assistant/chunk` / `*-chunks` records exist any more.
//     · `data.usage` mirrors the stream's usage chunk — the authoritative per-step
//       token source (and the only one, since `finish` has no replayState in v3).
//     · the system prompt moved out of `request/header.header.system` into a
//       `system/message` record (v3 `request/header` carries `header.tools` only).
//     · new record type `system/message`; header `version:3` + `isSeeded`.
//
// Version 0 and version 3 are parsed by ONE pass: record handlers below dispatch on
// type, and the v3 nested stream is replayed through the same chunk handlers the v0
// top-level records use (see processStream). A session directory may hold BOTH
// files (DSH re-encodes a live v0 session as v3 without deleting the old one);
// findTrajectoryFiles prefers the v3 file when both exist.
//
// The SHAPE of whatever we actually read is captured on every parse (see
// ParsedTrajectory.shape / shape.ts) so a future format change is detectable by
// diffing snapshots (npm run report:shape) instead of silently zeroing the numbers.

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
  // v3 nested stream + its authoritative per-step usage (see FORMAT VERSIONS).
  // `usage` is shared with compaction/summary records.
  stream?: unknown[];
  // compaction records:
  compactionId?: string;
  summary?: unknown[];
  shadowedTokenCount?: number;
  usage?: UsageInfo & { totalTokens?: number };
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
  /** Session header: on-disk format version (0 legacy, 3 current) + seed flag (v3). */
  version?: number;
  isSeeded?: boolean;
  name?: string;
  arguments?: unknown;
  data?: Data;
}

/** Activity-category counters (the event breakdown). */
export interface EventCounts {
  steps: number; toolCalls: number; toolSubCalls: number; userMessages: number;
  assistantMessages: number; systemMessages: number; turns: number; compactions: number;
  retries: number; approvals: number; todos: number; commands: number; userStops: number;
}

// ── trajectory SHAPE (format-change detection) ──────────────────────────────
// Every parse also produces a compact, deterministic description of the records
// it saw: which event types exist, the structure of each (keys + value types), and
// the small closed value sets the parser depends on (chunk.type, reason.kind, …).
// Snapshots of this shape are diffable, so when DSH changes the trajectory format
// again the diff names the changed record instead of the numbers just going to 0.
// See lib/shape-diff.ts for the comparison and scripts/trajectory-shape.js for the CLI.

/** A structural description of one value. Objects list their keys (sorted); arrays are `[element]`. */
export type ShapeNode = string | ShapeNode[] | { [key: string]: ShapeNode };

/** The observed shape of one trajectory file. */
export interface TrajectoryShape {
  /** Format version from the `session` header (0 = legacy on-disk format, 3 = current). */
  version: number | null;
  /** Record type -> its observed shape (`{ keys:…, data:…, stream:… }`). */
  types: Record<string, ShapeNode>;
  /** Record type -> count of records of that type. */
  counts: Record<string, number>;
  /** `"parent.path.field"` -> sorted distinct scalar values (capped, for closed sets like chunk.type). */
  valueSets: Record<string, (string | number)[]>;
  /** Nested `assistant/message.data.stream[]` entry kinds (`"chunk:usage"`) -> count. */
  streamKinds: Record<string, number>;
  /** JSONL lines that did not parse as JSON (should be 0 — a signal in itself). */
  unparsed: number;
}

/** Fields whose distinct values are worth tracking (closed vocabulary the parser keys on). */
const VALUE_SET_PATHS = new Set([
  "type", "version", "role", "blockType", "surfaceOp",
  "chunk.type", "reason.kind", "reason.reason.kind", "message.source.kind", "source.kind",
]);
/** Upper bound on a value set (a record's `type` vocabulary is the widest at ~35). */
const VALUE_SET_CAP = 64;

/** A model-timeline change point (which provider+model became active). */
export interface ModelChange {
  seq: number | null;
  provider: string | null;
  model: string;
}

// ── per-turn timeline (the dashboard's "what happened, in order") ───────────
// The trajectory is the only place that records the NON-token activity: the
// user's prompt, how each turn ended, retries, approvals, compactions, commands,
// interruptions. This projects those records into a compact per-turn + session
// event list, so a session drawer can show the same timeline on every tab.
/** How a turn ended (from turn/end). */
export type TurnStatus = "open" | "completed" | "aborted" | "blocked" | "error" | "max-tokens" | "interrupted";
/** Event categories shown on the timeline (declaration order = display order). */
export type TimelineKind =
  | "session" | "prompt" | "system" | "error" | "user-stop" | "retry" | "approval"
  | "compaction" | "prune" | "todo" | "command" | "title" | "model" | "deliverable" | "info";
/** One non-step event, positioned by turn/step (null = session-level, before turn 1). */
export interface TimelineEvent {
  turn: number | null;
  step: number | null;
  seq: number | null;
  time: number | null;
  kind: TimelineKind;
  text: string;
}
/** One turn's prompt/response and outcome. */
export interface TurnDetail {
  turn: number;
  seq: number | null;
  startTime: number | null;
  endTime: number | null;
  status: TurnStatus;
  /** turn/end detail (the abort reason, the error text) when it did not simply complete. */
  detail: string | null;
  prompt: string;
  response: string;
  steps: number;
}
/** The assembled per-turn + session activity of one trajectory. */
export interface TurnTimeline {
  turns: TurnDetail[];
  events: TimelineEvent[];
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
  /** Whether this session had P2P (GPU peer-to-peer) communication ENABLED —
   *  i.e. the trajectory carries affirmative evidence of P2P being switched on
   *  ("P2P access enabled", "enable P2P", "P2P support", a driver patched for
   *  P2P, …), not merely a passing mention of the topic. */
  p2p: boolean;
  /** How many times "p2p" appears anywhere in the trajectory (mention volume). */
  p2pMentions: number;
  /** Observed on-disk format version (0 legacy, 3 current) — null when no session header. */
  formatVersion: number | null;
  /** Observed record shape (format-change detection; see TrajectoryShape). */
  shape: TrajectoryShape;
  /** Per-turn prompt/response/outcome + the session's non-step event timeline. */
  timeline: TurnTimeline;
}

/** Recursively find *.zstd trajectory files under a root. */
export function findTrajectoryFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    // A session directory can hold BOTH the legacy `session.jsonl.zstd` and the
    // current `session.v3.jsonl.zstd` (DSH re-encodes a live session as v3 without
    // deleting the old file). They describe the SAME session, so parse the v3 file
    // and skip the legacy one — otherwise the session is parsed twice and the stale
    // legacy copy (which stops growing) can win on ordering.
    const names = new Set(entries.map((e) => e.name));
    const hasV3 = names.has("session.v3.jsonl.zstd");
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".git") continue;
        walk(full);
      } else if (e.isFile() && e.name.endsWith(".zstd")) {
        if (hasV3 && e.name === "session.jsonl.zstd") continue;
        out.push(full);
      }
    }
  };
  try { if (statSync(root).isDirectory()) walk(root); } catch { /* missing root */ }
  return out;
}

/** Human name for an on-disk trajectory format version (see FORMAT VERSIONS). */
export function formatVersionName(v: number | null): string {
  if (v === null) return "unknown";
  if (v === 0) return "v0 (legacy: top-level chunk records)";
  if (v === 3) return "v3 (nested assistant/message stream)";
  return "v" + v + " (unrecognized)";
}

// ── shape diff (format-change detection) ────────────────────────────────────
/**
 * Flatten a shape tree into sorted structural PATHS, each with the leaf type:
 * `"data.turn:number"`, `"data.message.content:[object]"`, `"data:object"`.
 * Depth truncation (`{…}`) is not structural, so it is normalized away — the path
 * list is a canonical, order-independent description of a record's structure.
 */
export function shapePaths(node: ShapeNode, prefix = "", out: string[] = []): string[] {
  if (typeof node === "string") {
    // "null"/primitive, "undefined" slots, or a truncated branch ({…}/[…]) — the
    // truncated forms carry no structure beyond their parent already recorded.
    if (node === "undefined" || node === "{…}") return out;
    out.push(prefix + ":" + node);
    return out;
  }
  if (Array.isArray(node)) {
    const inner = node.length ? node[0] : "";
    if (inner === "{…}") { out.push(prefix + ":[object]"); return out; }
    return shapePaths(inner, prefix + "[]", out);
  }
  const keys = Object.keys(node).filter((k) => k !== "keys");
  if (!keys.length) { out.push(prefix + ":object"); return out; }
  for (const k of keys) shapePaths((node as { [k: string]: ShapeNode })[k], prefix ? prefix + "." + k : k, out);
  return out;
}

/** Canonical structural (field-path) description of one record type's shape. */
export function canonicalShape(node: ShapeNode): string[] {
  return [...new Set(shapePaths(node))].sort();
}

/** One difference between two snapshots of the same trajectory format. */
export interface ShapeDiff {
  kind: "version" | "type-added" | "type-removed" | "field-added" | "field-removed" | "values-added" | "values-removed" | "stream-kind-added" | "stream-kind-removed";
  detail: string;
}
/** The structural part of a shape: record structures + value vocabularies + stream kinds. */
const shapeSemantics = (s: TrajectoryShape): string => JSON.stringify({
  version: s.version,
  types: Object.fromEntries(Object.entries(s.types).sort((a, b) => a[0].localeCompare(b[0])).map(([t, n]) => [t, canonicalShape(n).join("|")])),
  valueSets: s.valueSets,
  streamKinds: Object.keys(s.streamKinds).sort(),
});

/**
 * Compare two snapshots of the same format. Counts and per-session record volumes
 * are deliberately ignored — only what the PARSER keys on differs: the format
 * version, which record types exist, their structure, the closed value sets
 * (chunk.type, reason.kind, …) and which nested stream entry kinds appear.
 * An empty diff means the format did not change in any way that can break parsing.
 */
export function diffShape(a: TrajectoryShape, b: TrajectoryShape): ShapeDiff[] {
  const diffs: ShapeDiff[] = [];
  if (a.version !== b.version) diffs.push({ kind: "version", detail: `format version ${a.version} -> ${b.version}` });
  for (const t of Object.keys(b.types)) if (!(t in a.types)) diffs.push({ kind: "type-added", detail: t });
  for (const t of Object.keys(a.types)) if (!(t in b.types)) diffs.push({ kind: "type-removed", detail: t });
  for (const t of Object.keys(a.types)) {
    if (!(t in b.types)) continue;
    const av = canonicalShape(a.types[t]);
    const bv = canonicalShape(b.types[t]);
    const added = bv.filter((p) => !av.includes(p));
    const removed = av.filter((p) => !bv.includes(p));
    if (added.length) diffs.push({ kind: "field-added", detail: `${t}: +${added.join(", +")}` });
    if (removed.length) diffs.push({ kind: "field-removed", detail: `${t}: -${removed.join(", -")}` });
  }
  for (const p of new Set([...Object.keys(a.valueSets), ...Object.keys(b.valueSets)])) {
    const av = (a.valueSets[p] || []).map(String);
    const bv = (b.valueSets[p] || []).map(String);
    const added = bv.filter((v) => !av.includes(v));
    const removed = av.filter((v) => !bv.includes(v));
    if (added.length) diffs.push({ kind: "values-added", detail: `${p}: +${added.join(", ")}` });
    if (removed.length) diffs.push({ kind: "values-removed", detail: `${p}: -${removed.join(", ")}` });
  }
  for (const k of Object.keys(b.streamKinds)) if (!(k in a.streamKinds)) diffs.push({ kind: "stream-kind-added", detail: k });
  for (const k of Object.keys(a.streamKinds)) if (!(k in b.streamKinds)) diffs.push({ kind: "stream-kind-removed", detail: k });
  return diffs;
}

/**
 * Fold many session shapes of the SAME format into one representative shape.
 * Types/value-sets are unioned (a record type absent from one session still
 * exists in the format), counts are summed, and `shapeSemantics` of the result is
 * what a snapshot pins. `formatVersion` is taken from the majority of inputs.
 */
export function mergeShapes(shapes: TrajectoryShape[]): TrajectoryShape {
  const merged: TrajectoryShape = { version: null, types: {}, counts: {}, valueSets: {}, streamKinds: {}, unparsed: 0 };
  // For each record type keep the MOST complete example seen: a live session can
  // catch a record mid-shape (a field not yet written), and the representative
  // must describe the fullest form. Ties break lexicographically on the canonical
  // path list so the merge is deterministic.
  const betterTypes = new Map<string, { shape: ShapeNode; key: string }>();
  const votes = new Map<number | null, number>();
  for (const s of shapes) {
    if (s.version !== null) votes.set(s.version, (votes.get(s.version) || 0) + 1);
    for (const [t, node] of Object.entries(s.types)) {
      const canon = canonicalShape(node).join("|");
      const prior = betterTypes.get(t);
      if (!prior || canon.length > prior.key.length || (canon.length === prior.key.length && canon > prior.key)) betterTypes.set(t, { shape: node, key: canon });
    }
    for (const [t, n] of Object.entries(s.counts)) merged.counts[t] = (merged.counts[t] || 0) + n;
    for (const [p, vals] of Object.entries(s.valueSets)) {
      const set = (merged.valueSets[p] ||= []);
      for (const v of vals) if (set.length < VALUE_SET_CAP && !set.some((x) => x === v)) set.push(v);
      set.sort((a, b) => String(a).localeCompare(String(b)));
    }
    for (const [k, n] of Object.entries(s.streamKinds)) merged.streamKinds[k] = (merged.streamKinds[k] || 0) + n;
    merged.unparsed += s.unparsed;
  }
  merged.types = Object.fromEntries([...betterTypes.entries()].map(([t, v]) => [t, v.shape]));
  let best: number | null = null; let bestN = -1;
  for (const [v, n] of votes) if (n > bestN) { best = v; bestN = n; }
  merged.version = best;
  const sortKeys = <T>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(o).sort((a, b) => a[0].localeCompare(b[0])));
  merged.types = sortKeys(merged.types);
  merged.counts = sortKeys(merged.counts);
  merged.valueSets = sortKeys(merged.valueSets);
  merged.streamKinds = sortKeys(merged.streamKinds);
  return merged;
}

/** True when two shapes describe the same format in every way the parser depends on. */
export function sameShape(a: TrajectoryShape, b: TrajectoryShape): boolean {
  return shapeSemantics(a) === shapeSemantics(b);
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
  "system/message": "systemMessages",
  "turn/end": "turns",
  "compaction/end": "compactions",
  "llm/retry": "retries",
  "approval/asked": "approvals",
  "todo/write": "todos",
  "command/done": "commands",
};
/** Zeroed activity-category counters. */
export const emptyEvents = (): EventCounts => ({ steps: 0, toolCalls: 0, toolSubCalls: 0, userMessages: 0, assistantMessages: 0, systemMessages: 0, turns: 0, compactions: 0, retries: 0, approvals: 0, todos: 0, commands: 0, userStops: 0 });

export function parseTrajectoryText(text: string): ParsedTrajectory {
  const lines = String(text).split("\n").filter(Boolean);
  const out: ParsedTrajectory = { meta: null, usage: [], modelCounts: {}, modelChanges: [], stepSeqs: [], events: emptyEvents(), tools: {}, toolCalls: {}, toolCallArgs: {}, stepTools: {}, stepToolArgs: {}, decode: { tokens: 0, ms: 0, steps: 0 }, prefill: { tokens: 0, ms: 0, steps: 0 }, systemChars: 0, toolsChars: 0, contextWindow: null, stepContext: {}, compactions: [], prunes: 0, prunedTokens: 0, postCompaction: {}, p2p: false, p2pMentions: 0, formatVersion: null, shape: { version: null, types: {}, counts: {}, valueSets: {}, streamKinds: {}, unparsed: 0 }, timeline: { turns: [], events: [] } };
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
  const thinkingTimeByKey = new Map<string, { first: number; last: number }>(); // "turn:step" -> { first, last }  // Total thinking (reasoning) text chars per (turn, step), from the fine-grained
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
  /**
   * Extend the thinking window for a step. A batch `reasoning-chunks` record
   * covers a whole window at once — pass its last token time (time0 + Σdt) as
   * `end`; per-chunk reasoning deltas pass only their own timestamp.
   */
  const noteThinking = (stepKey: string, t: number | undefined, end?: number): void => {
    if (typeof t !== "number") return;
    const last = typeof end === "number" && end > t ? end : t;
    const e = thinkingTimeByKey.get(stepKey);
    if (!e) thinkingTimeByKey.set(stepKey, { first: t, last });
    else { if (t < e.first) e.first = t; if (last > e.last) e.last = last; }
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

  // ── per-turn + event timeline (see TurnTimeline) ───────────────────────────
  // Built in stream order: a turn opens on turn/start, collects its prompt (the
  // user message recorded against it), its response (assistant text), and its
  // outcome (turn/end). `eventOf` records one timeline row; unpositioned records
  // can be resolved to the turn that follows (like userMsgs.entry).
  const TRUNC_PROMPT = 240;
  const TRUNC_RESPONSE = 240;
  const turnMap = new Map<number, TurnDetail>();
  // (events are positioned after the parse: see the finalize pass)
  const oneLine = (s: string, cap: number): string => {
    const t = s.replace(/\s+/g, " ").trim();
    return t.length > cap ? t.slice(0, cap - 1) + "…" : t;
  };
  /** Concatenated text blocks of a message (the human-readable part). */
  const textOf = (content: unknown): string => {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    const parts: string[] = [];
    for (const c of content) if (c && typeof c === "object" && (c as any).type === "text" && typeof (c as any).text === "string") parts.push((c as any).text);
    return parts.join(" ");
  };
  const turnStartSeq = new Map<number, number>();
  const turnOrder: number[] = [];
  let activeTurn: number | null = null; // the turn currently open (last started, not yet ended)
  const ensureTurn = (turn: number, seq: number | null, time: number | null): TurnDetail => {
    let t = turnMap.get(turn);
    if (!t) {
      t = { turn, seq, startTime: time, endTime: null, status: "open", detail: null, prompt: "", response: "", steps: 0 };
      turnMap.set(turn, t);
      turnStartSeq.set(turn, seq ?? 0);
      turnOrder.push(turn);
      if (activeTurn == null || turn >= activeTurn) activeTurn = turn;
    }
    return t;
  };
  const eventOf = (e: TimelineEvent): void => { out.timeline.events.push(e); };
  /** The turn a seq falls in: the latest turn that had started by then. */
  const turnForSeq = (seq: number): number | null => {
    let best: number | null = null;
    for (const [turn, s] of turnStartSeq) if (s <= seq && (best === null || s > (turnStartSeq.get(best) ?? -1))) best = turn;
    return best;
  };
  /**
   * Observe an event. `pos` is the turn/step the record itself carries — which
   * most v0 records and some v3 ones do NOT, so a missing turn is resolved later
   * (after the loop) from its seq against the turn boundaries.
   */
  const timelineEvent = (pos: { turn?: number | null; step?: number | null }, seq: number | null, time: number | null, kind: TimelineKind, text: string): void => {
    eventOf({ turn: pos.turn ?? null, step: pos.step ?? null, seq, time, kind, text });
  };
  /** Add a user prompt to the turn it was sent in (data.turn in v3, else by seq). */
  const notePrompt = (turnOpt: number | null, seq: number, content: unknown): void => {
    const text = oneLine(textOf(content), TRUNC_PROMPT);
    if (!text) return;
    const turn = turnOpt ?? turnForSeq(seq) ?? activeTurn;
    if (turn == null) return;
    const t = ensureTurn(turn, seq, null);
    if (!t.prompt) t.prompt = text;
    timelineEvent({ turn }, seq, null, "prompt", text);
  };
  const noteResponse = (turnOpt: number | null, content: unknown): void => {
    // A step often emits only tool calls (no prose). Fall back to naming them, so
    // a tool-heavy turn still shows what it did rather than an empty row.
    let text = oneLine(textOf(content), TRUNC_RESPONSE);
    if (!text) {
      const names: string[] = [];
      for (const c of (Array.isArray(content) ? content : [])) {
        if (c && typeof c === "object" && (c as any).type === "tool-call" && typeof (c as any).name === "string") names.push(String((c as any).name));
      }
      if (names.length) text = oneLine("→ " + [...new Set(names)].join(", "), TRUNC_RESPONSE);
    }
    if (!text) return;
    const fromStep: number | null = lastEndedStep ? Number(lastEndedStep.split(":")[0]) : null;
    // v0 assistant/message carries no turn: fall back to the step just finished,
    // then the turn that was opening around it (`activeTurn`), then the last turn.
    const turn: number | null = turnOpt ?? fromStep ?? activeTurn ?? turnOrder[turnOrder.length - 1] ?? null;
    if (turn == null) return;
    const t = ensureTurn(turn, null, null);
    if (!t.response) t.response = text; // the turn's opening text (the outline's one-liner)
  };
  const TURN_STATUS = new Set<string>(["completed", "aborted", "blocked", "error", "max-tokens", "interrupted"]);

  const addModelChange = (seq: number | undefined, provider: string | null | undefined, model: string): void => {
    if (!model) return;
    out.modelChanges.push({ seq: typeof seq === "number" ? seq : null, provider: provider ?? null, model });
  };

  const recordUsage = (data: Data | undefined, chunk: UsageChunk, time: number | undefined, usageOverride?: UsageInfo): void => {
    const u = usageOverride ?? chunk.usage;
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

  // Steps already recorded when a prompt-config record arrives: the request
  // metadata (system prompt, tools definitions) is written AFTER the step/start of
  // the step whose request it belongs to, so those steps would otherwise keep the
  // zeroed values captured at step/start. Backfill them (both v0 and v3).
  const backfillPromptConfig = (): void => {
    for (const k of stepOrder) {
      if (!sysAtStart.get(k)) sysAtStart.set(k, systemChars);
      if (!toolsAtStart.get(k)) toolsAtStart.set(k, toolsChars);
    }
  };

  // ── streaming chunks (shared by v0 top-level records and the v3 nested stream) ──
  // v0 puts one chunk per top-level record; v3 nests the identical records inside
  // assistant/message.data.stream. Both feed processStream, so the timing/usage
  // extraction has exactly ONE implementation. `entry` is the flattened v3 shape
  // (`chunk` plus a top-level `time`); for v0 it is the record itself.
  interface StreamEntry { type?: string; time?: number; time0?: number; chunk?: UsageChunk; turn?: number; step?: number; texts?: unknown[]; dt?: unknown[]; index?: number; id?: string; name?: string; args?: unknown[]; }
  // "turn:step" keys whose stream produced at least one `chunk` entry — i.e. the
  // authoritative stream start has already been seen for that step.
  const sawChunkByKey = new Set<string>();
  const stepKeyOf = (turn: number | undefined, step: number | undefined): string => (turn ?? "?") + ":" + (step ?? "?");
  /**
   * Record the step's stream start (the TTFT/decode clock) the first time any
   * timed signal for the step is seen. TTFT = stream start − step/start (the step
   * being dispatched), or − the last request event on trajectories without
   * step/start. Returns true when this time became the clock.
   */
  const noteStreamStart = (stepKey: string, time: number, requestTime: number | null): boolean => {
    const had = firstChunkTime.has(stepKey);
    if (!had) firstChunkTime.set(stepKey, time);
    if (!ttftByKey.has(stepKey)) {
      const stepStart = stepStartTime.get(stepKey);
      if (typeof stepStart === "number" && time > stepStart) ttftByKey.set(stepKey, time - stepStart);
      else if (typeof requestTime === "number" && time > requestTime) ttftByKey.set(stepKey, time - requestTime);
    }
    return !had;
  };
  const processStream = (entry: StreamEntry, stepKey: string, requestTime: number | null, turn?: number, step?: number): void => {
    const chunk = entry.chunk;
    if (chunk) {
      sawChunkByKey.add(stepKey);
      if (typeof entry.time === "number") noteStreamStart(stepKey, entry.time, requestTime);
      if (chunk.type === "reasoning-delta") {
        // v0 streams thinking as bare reasoning-delta chunks; v3 streams it as
        // reasoning-chunks entries instead, so this is normally a no-op there.
        noteThinking(stepKey, entry.time);
        if (typeof chunk.text === "string" && chunk.text) reasoningDeltaCharsByKey.set(stepKey, (reasoningDeltaCharsByKey.get(stepKey) || 0) + chunk.text.length);
      }
      // turn/step come from the parent record: v0 chunks carry them in data, v3
      // stream entries do NOT (the containing assistant/message does).
      const ref = { turn: entry.turn ?? turn, step: entry.step ?? step };
      if (chunk.type === "usage") recordUsage(ref, chunk, entry.time);
      else if (chunk.type === "finish") {
        const resp = chunk.replayState?.response; // v0: the serving model; v3 carries no replayState (see message.source)
        if (resp?.model) { curModel = resp.model; curProvider = resp.provider ?? curProvider; }
        if (chunk.usage) recordUsage(ref, chunk, entry.time); // some shapes carry usage on the finish chunk
      }
      return;
    }
    // Flattened batch records: text-chunks / tool-call-chunks / reasoning-chunks.
    // `time0` is the first token's time and `dt[i]` the gap before token i, so
    // time0 + Σdt is the LAST token's time — an exact per-segment window (used for
    // thinking duration) without depending on the surrounding record times. It is
    // also the earliest first-token evidence, so it can start the stream clock —
    // but ONLY when this step emitted no block-start chunk: by the time a `chunk`
    // entry has been seen, the authoritative stream start is already recorded, and
    // a batch record that arrives afterwards must not move the clock.
    if (typeof entry.time0 === "number") {
      const texts = Array.isArray(entry.texts) ? entry.texts : [];
      if (entry.type === "reasoning-chunks" && texts.length) {
        // time0 + Σdt = the last thinking token's time — the window's end.
        let sum = 0;
        if (Array.isArray(entry.dt)) for (const d of entry.dt) if (typeof d === "number") sum += d;
        noteThinking(stepKey, entry.time0, entry.time0 + sum);
        let n = 0;
        for (const t of texts) if (typeof t === "string") n += t.length;
        if (n) reasoningCharsByKey.set(stepKey, (reasoningCharsByKey.get(stepKey) || 0) + n);
      }
      if (!sawChunkByKey.has(stepKey)) noteStreamStart(stepKey, entry.time0, requestTime);
    }
  };

  // ── out.shape accumulation (see the FORMAT/SHAPE sections at the top) ──────
  const shape = out.shape;
  const shapeOf = (v: unknown, depth: number): ShapeNode => {
    if (v === null) return "null";
    if (Array.isArray(v)) return "[" + (v.length ? String(shapeOf(v[0], depth + 1)) : "") + "]";
    const t = typeof v;
    if (t !== "object") return t;
    if (depth >= 3) return "{…}";
    const o = v as Record<string, unknown>;
    const keys = Object.keys(o).sort();
    const built: { [k: string]: ShapeNode } = {};
    for (const k of keys) {
      const s = shapeOf(o[k], depth + 1);
      if (s !== "undefined") built[k] = s;
    }
    return keys.length ? { keys: keys.join(","), ...built } : { keys: "" };
  };
  const recordValueSets = (v: unknown, path: string): void => {
    if (VALUE_SET_PATHS.has(path) && v != null && typeof v !== "object") {
      const set = (shape.valueSets[path] ||= []);
      if (set.length < VALUE_SET_CAP && !set.some((x) => x === (v as string | number))) {
        set.push(v as string | number);
        set.sort((a, b) => String(a).localeCompare(String(b)));
      }
    }
    if (v !== null && typeof v === "object") {
      for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
        if (path === "data" && k === "stream") continue; // the v3 stream is summarized via streamKinds, not per-entry
        recordValueSets(child, path ? path + "." + k : k);
      }
    }
  };
  const noteRecord = (r: JsonRecord): void => {
    const type = r.type || "(no type)";
    shape.counts[type] = (shape.counts[type] || 0) + 1;
    if (!shape.types[type]) shape.types[type] = shapeOf(r, 0);
    for (const [k, v] of Object.entries(r)) recordValueSets(v, k);
    if (Array.isArray(r.data?.stream)) noteStream(r.data.stream); // v3 nested stream
  };
  const noteStream = (stream: unknown): void => {
    if (!Array.isArray(stream)) return;
    for (const e of stream) {
      if (!e || typeof e !== "object") continue;
      const entry = e as Record<string, unknown>;
      const chunk = entry.chunk as { type?: unknown } | undefined;
      const kind = String(entry.type ?? "?") + (chunk && chunk.type != null ? ":" + String(chunk.type) : "");
      shape.streamKinds[kind] = (shape.streamKinds[kind] || 0) + 1;
      for (const [k, v] of Object.entries(entry)) recordValueSets(v, "stream." + k);
    }
  };

  for (const ln of lines) {
    let r: JsonRecord;
    try { r = JSON.parse(ln) as JsonRecord; } catch { shape.unparsed++; continue; }
    if (!r || typeof r !== "object") { shape.unparsed++; continue; }
    noteRecord(r);
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
      if (typeof r.version === "number") out.formatVersion = r.version;
    } else if (r.type === "request/header") {
      if (typeof r.time === "number") lastRequestTime = r.time; // request sent -> TTFT clock starts
      const hdr = r.data?.header;
      // v0 keeps the system prompt here; v3 moved it to a system/message record
      // (its request/header still carries the tools definitions).
      if (typeof hdr?.system === "string") systemChars = hdr.system.length;
      if (Array.isArray(hdr?.tools)) toolsChars = JSON.stringify(hdr.tools).length;
      const cfg = hdr?.config;
      if (cfg?.model) { curModel = cfg.model; curProvider = cfg.provider ?? curProvider; addModelChange(r.seq, cfg.provider, cfg.model); }
      if (systemChars || toolsChars) backfillPromptConfig();
    } else if (r.type === "request/context") {
      if (typeof r.time === "number") lastRequestTime = r.time;
      if (typeof r.data?.contextWindow === "number") contextWindow = r.data.contextWindow;
      if (r.data?.model) { curModel = r.data.model; curProvider = r.data.provider ?? curProvider; addModelChange(r.seq, r.data.provider, r.data.model); }
    } else if (r.type === "turn/start") {
      const turnNo = r.data?.turn;
      if (turnNo != null) {
        const t = ensureTurn(turnNo, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null);
        if (t.startTime == null && typeof r.time === "number") t.startTime = r.time;
      }
    } else if (r.type === "step/start") {
      if (r.data?.turn != null) ensureTurn(r.data.turn, typeof r.seq === "number" ? r.seq : null, null).steps++;
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
      const turnNo = r.data?.turn ?? null;
      const isUserStop = !!(rs && rs.kind === "aborted" && rs.reason && rs.reason.kind === "user");
      if (isUserStop) out.events.userStops++;
      const kind = rs?.kind;
      const detail = isUserStop
        ? "stopped by user"
        : (typeof (rs as any)?.error === "string" ? (rs as any).error
          : (rs?.reason && typeof (rs.reason as any)?.kind === "string" ? String((rs.reason as any).kind) : null));
      if (turnNo != null) {
        const t = ensureTurn(turnNo, typeof r.seq === "number" ? r.seq : null, null);
        t.endTime = typeof r.time === "number" ? r.time : t.endTime;
        t.status = (kind && TURN_STATUS.has(kind) ? kind : "completed") as TurnStatus;
        t.detail = detail;
      }
      const evKind: TimelineKind = isUserStop ? "user-stop" : (kind === "completed" ? "info" : "error");
      if (evKind !== "info" || detail) {
        timelineEvent({ turn: turnNo }, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, evKind, isUserStop ? "Turn stopped by user" : oneLine((kind || "ended") + (detail ? " — " + detail : ""), 200));
      }
    } else if (r.type === "llm/retry") {
      const d = r.data as any;
      const fail = d?.failure;
      const txt = "Retry " + (d?.retry ?? "?") + "/" + (d?.maxRetries ?? "?")
        + (fail?.code ? " · " + fail.code : "")
        + (fail?.message ? ": " + oneLine(String(fail.message), 80) : "")
        + (d?.delayMs ? " (after " + Math.round(d.delayMs) + "ms)" : "");
      timelineEvent(d ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "retry", txt);
    } else if (r.type === "approval/asked") {
      const d = r.data as any;
      const txt = "Approval asked · " + (d?.toolName || "tool") + (d?.reason ? " — " + oneLine(String(d.reason), 140) : "");
      timelineEvent(d ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "approval", txt);
    } else if (r.type === "approval/decided") {
      const d = r.data as any;
      timelineEvent(d ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "approval", "Approval " + (d?.outcome || "decided"));
    } else if (r.type === "todo/write") {
      const list = (r.data as any)?.todos;
      const txt = Array.isArray(list) ? "Todo list written — " + list.length + " item" + (list.length === 1 ? "" : "s") : "Todo list written";
      timelineEvent(r.data ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "todo", txt);
    } else if (r.type === "command/done") {
      const d = r.data as any;
      const txt = "Command " + (d?.kind || "done") + (d?.text ? ": " + oneLine(String(d.text), 120) : "");
      timelineEvent(d ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "command", txt);
    } else if (r.type === "model/selection") {
      const d = r.data as any;
      const txt = "Model → " + (d?.model || "?") + (d?.provider ? " · " + d.provider : "") + (d?.reasoningEffort ? " · " + d.reasoningEffort : "");
      timelineEvent(d ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "model", txt);
    } else if (r.type === "agent-preset/selected") {
      const d = r.data as any;
      timelineEvent({}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "info", "Agent preset: " + (d?.agentPreset || "?"));
    } else if (r.type === "deliverables/presented") {
      const files = (r.data as any)?.files;
      const txt = "Deliverables presented — " + (Array.isArray(files) ? files.length + " file" + (files.length === 1 ? "" : "s") : "files");
      timelineEvent(r.data ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "deliverable", txt);
    } else if (r.type === "session/title") {
      const d = r.data as any;
      const title = typeof d?.title === "string" ? d.title : "";
      if (title) timelineEvent({}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "title", "Session title: " + oneLine(title, 120) + (d?.source?.kind ? " (" + d.source.kind + ")" : ""));
    } else if (r.type === "compaction/start") {
      const turnNo = (r.data as any)?.turn ?? null;
      newCompaction(typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, typeof r.data?.compactionId === "string" ? r.data.compactionId : null);
      timelineEvent({ turn: turnNo }, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "compaction", "Compaction started");
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
      timelineEvent(r.data ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "compaction",
         oneLine("Compaction summary" + (ev.shadowedTokens ? " — " + ev.shadowedTokens + " tokens shadowed" : "") + " (" + ev.summaryChars + " chars)", 200));
    } else if (r.type === "compaction/prune") {
      out.prunes++;
      if (typeof r.data?.shadowedTokenCount === "number") out.prunedTokens += r.data.shadowedTokenCount;
      timelineEvent(r.data ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "prune",
         oneLine("Pruned " + (typeof r.data?.shadowedTokenCount === "number" ? r.data.shadowedTokenCount + " tokens" : "context"), 120));
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
      // A FAILED compaction carries an error here (aborted / terminated /
      // context-exceeded) — surface it on the timeline; successful ones were
      // already reported by the compaction/summary row.
      if (ev.error) timelineEvent(r.data ?? {}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "error",
        oneLine("Compaction failed — " + ev.error, 160));
      // Only a SUCCESSFUL compaction (one that produced a summary) actually
      // replaced the conversation. Failed ones (aborted / terminated /
      // context-exceeded — carried as error on this record) leave the original
      // messages in the context, so the running message chars keep accumulating.
      if (ev.hasSummary) {
        if (typeof r.seq === "number") compactionSeqs.push(r.seq);
        msgCharsRunning = 0; // the conversation was replaced by a summary — old messages leave the context
      }
    } else if (r.type === "user/message") {
      const seq = typeof r.seq === "number" ? r.seq : 0;
      addUserMsg(r.data?.id, seq, r.data?.content);
      notePrompt(r.data?.turn ?? null, seq, r.data?.content);
    } else if (r.type === "system/message") {
      // v3: the system prompt is a record, not request/header.header.system.
      // One timeline row (never per step): it opens the session's context.
      if (!out.timeline.events.some((e) => e.kind === "system")) {
        const chars = sumTextBlocks((r.data?.message as any)?.content);
        timelineEvent({}, typeof r.seq === "number" ? r.seq : null, typeof r.time === "number" ? r.time : null, "system",
          "System prompt — " + chars + " chars" + (typeof r.data?.turn === "number" ? " · first sent in turn " + r.data.turn : ""));
      }
      const content = (r.data?.message as any)?.content;
      if (Array.isArray(content)) {
        let n = 0;
        for (const c of content) if (c && typeof c === "object" && c.type === "text" && typeof c.text === "string") n += c.text.length;
        if (n) { systemChars = n; backfillPromptConfig(); }
      }
    } else if (r.type === "agent/inbox/spliced") {
      for (const m of (r.data?.inserted || [])) {
        addUserMsg((m as any)?.id, typeof r.seq === "number" ? r.seq : 0, (m as any)?.content);
        notePrompt((m as any)?.turn ?? null, typeof r.seq === "number" ? r.seq : 0, (m as any)?.content);
      }
    } else if (r.type === "assistant/message") {
      msgCharsRunning += assistantMsgChars(r.data?.message);
      noteResponse(r.data?.turn ?? null, (r.data?.message as any)?.content);
      // v3: the whole stream + the authoritative per-step usage are nested here.
      // (Replayed through processStream, the same handlers the v0 top-level
      // assistant/chunk records use.) Consume the pending request time first so a
      // stream whose records carry no time can still be timed from the request.
      const reqTime = lastRequestTime;
      if (typeof r.data?.turn === "number" || typeof r.data?.step === "number") {
        const k = stepKeyOf(r.data?.turn, r.data?.step);
        if (Array.isArray(r.data?.stream)) for (const e of r.data.stream) processStream(e as unknown as StreamEntry, k, reqTime, r.data.turn, r.data.step);
        // The message's serving model (v0 got this from chunk.finish.replayState).
        const src = (r.data?.message as any)?.source;
        if (src?.kind === "model" && src.model) { curModel = src.model; curProvider = src.provider ?? curProvider; }
        // Fallback usage source: v3 mirrors the stream's usage chunk on data.usage.
        // recordUsage de-dupes by step, so this only fires when the stream had none.
        if (r.data?.usage && !usageRecordedByKey.has(k)) {
          if (!firstChunkTime.has(k) && typeof r.time === "number") firstChunkTime.set(k, r.time);
          recordUsage(r.data, { usage: r.data.usage } as UsageChunk, r.time, r.data.usage as UsageInfo);
        }
      }
      lastRequestTime = null; // consumed by this step's stream
    } else if (r.type === "tool/result") {
      msgCharsRunning += toolResultChars(r.data?.message);
    } else if (r.type === "reasoning-chunks") {
      // v0 fine-grained thinking stream (v3 nests the same entry in data.stream).
      if (r.data?.turn != null && r.data?.step != null) {
        processStream({ type: r.type, time0: r.time0, texts: r.data.texts } as StreamEntry, stepKeyOf(r.data.turn, r.data.step), lastRequestTime);
      }
    } else if (r.type === "assistant/chunk") {
      if (!r.data?.chunk) continue;
      processStream({ ...r.data, chunk: r.data.chunk, time: r.time } as StreamEntry, stepKeyOf(r.data.turn, r.data.step), lastRequestTime);
      lastRequestTime = null; // consumed by this step's stream
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
  // ── P2P (GPU peer-to-peer) evidence ────────────────────────────────────────
  // A session is credited with P2P when its trajectory carries AFFIRMATIVE
  // evidence that peer-to-peer was switched on — not merely because the topic was
  // discussed (a session that only asks about P2P, or writes a report about it,
  // must not count). The signals below are the enablement phrasings that show up
  // in nvidia-smi/llama-server output and driver-patch work.
  const p2pText = text.toLowerCase();
  const P2P_EVIDENCE: RegExp[] = [
    /p2p\s+(?:access\s+)?(?:is\s+|was\s+|now\s+)?enabled/i,   // "P2P access enabled", "P2P is enabled"
    /enabl\w*\s+(?:the\s+)?p2p/i,                              // "enable P2P", "enabling p2p"
    /p2p\s*[:=]\s*(?:on|true|yes|ok|enabled)/i,                // "P2P: on" / "P2P=true"
    /(?:driver|kernel)[^.\n]{0,40}p2p/i,                       // a driver/kernel patched FOR p2p
    /p2p\s+(?:patch|patched|workaround)/i,                     // "p2p patch"
    /nvlink[^.\n]{0,30}p2p|p2p[^.\n]{0,30}nvlink/i,            // nvlink ↔ p2p
  ];
  out.p2pMentions = (p2pText.match(/p2p/g) || []).length + (p2pText.match(/peer-to-peer|peer to peer/g) || []).length;
  out.p2p = P2P_EVIDENCE.some((re) => re.test(text));
  // Deterministic shape: insertion order follows first-seen stream order, which is
  // stable for a given file, but sort the maps so two snapshots of the same format
  // are byte-identical regardless of the session.
  shape.types = Object.fromEntries(Object.entries(shape.types).sort((a, b) => a[0].localeCompare(b[0])));
  shape.counts = Object.fromEntries(Object.entries(shape.counts).sort((a, b) => a[0].localeCompare(b[0])));
  shape.valueSets = Object.fromEntries(Object.entries(shape.valueSets).sort((a, b) => a[0].localeCompare(b[0])));
  shape.streamKinds = Object.fromEntries(Object.entries(shape.streamKinds).sort((a, b) => a[0].localeCompare(b[0])));
  shape.version = out.formatVersion;

  // ── finalize the per-turn / event timeline ─────────────────────────────────
  // Most v0 records (approvals, todos, retries, compactions, commands) carry NO
  // turn field, so an event with `turn === null` is placed by its seq against the
  // turn boundaries — unless it is a session-level record (system prompt, title,
  // preset), which genuinely belongs before turn 1.
  const SESSION_LEVEL_EVENTS = new Set<TimelineKind>(["system", "title", "info", "session"]);
  for (const e of out.timeline.events) {
    if (e.turn != null || SESSION_LEVEL_EVENTS.has(e.kind)) continue;
    e.turn = (e.seq != null ? turnForSeq(e.seq) : null) ?? (turnOrder[0] ?? null);
  }
  out.timeline.turns = [...turnMap.values()];
  // Stable display order: seq when known (stream order), else time, else turn.
  out.timeline.events.sort((a, b) => {
    const as = a.seq ?? Number.MAX_SAFE_INTEGER, bs = b.seq ?? Number.MAX_SAFE_INTEGER;
    if (as !== bs) return as - bs;
    return (a.time ?? 0) - (b.time ?? 0);
  });
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
const CACHE_VERSION = 15; // bumped: ParsedTrajectory.timeline (per-turn prompts/outcomes + session event timeline) (usage now read from assistant/message.data.stream + data.usage) and ParsedTrajectory gained formatVersion/shape
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
    if (isDropped(filePath)) continue; // an import that was removed/resynced since the cache was written
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
    if (isDropped(filePath)) { parseCache.delete(filePath); continue; } // an import that was removed/resynced
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

/**
 * Prefixes whose cached parses were dropped. Kept so the DROP survives the disk
 * cache too: a removed import must not come back from trajectory-cache.json on
 * the next load, and a resynced one must really be re-read.
 */
const droppedPrefixes = new Set<string>();
const isDropped = (filePath: string): boolean => {
  for (const prefix of droppedPrefixes) if (filePath.startsWith(prefix)) return true;
  return false;
};

/**
 * Drop the cached parses of every trajectory under `prefix` so the next read
 * re-reads and re-parses those files — in memory AND in the persisted cache.
 * Used by an imported source's RESYNC (re-read only that home; the rest of the
 * dashboard keeps its warm cache) and by REMOVE (forget the files entirely).
 * Returns how many in-memory entries were dropped.
 */
export function invalidateTrajectoryCache(prefix: string): number {
  if (!prefix) return 0;
  const root = prefix.endsWith("/") ? prefix : prefix + "/";
  droppedPrefixes.add(root);
  let dropped = 0;
  for (const key of [...parseCache.keys()]) {
    if (key === prefix || key.startsWith(root)) { parseCache.delete(key); dropped++; }
  }
  return dropped;
}

/** Invalidate the disk cache (e.g. after a parse-format change). */
export function clearDiskCache(dshHome?: string): void {
  _diskCacheLoaded = false;
  _diskCachePath = null;
  droppedPrefixes.clear();
  parseCache.clear();
  parseStats.cacheHits = 0;
  parseStats.recomputed = 0;
  if (dshHome) {
    try { const p = trajectoryCachePath(dshHome); if (existsSync(p)) renameSync(p, p + ".old"); } catch { /* ok */ }
  }
}
