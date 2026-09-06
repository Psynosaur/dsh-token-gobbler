// token-gobbler · projcache.ts
// Reads DSH's session projection store — the authoritative per-session token totals.
//
// Two layouts are supported (the new directory layout is preferred when present):
//
//   NEW (dsh update, 2026-09): <dshHome>/storages/session_projcache/sessions/session-<id>.json
//     { "version": 5, "record": { "identity": {...}, "rows": {...} } }
//
//   OLD: <dshHome>/storages/session_projcache.json
//     { "tables": { "sessions": { "<id>": { "identity": {...}, "rows": {...} } } } }
//
// Per-session rows carry (presence varies by dsh version):
//   tokenUsage { totals {4 buckets}, last }, sessionStats { turns, steps, llmMs, toolMs,
//   ttftMs, ttftSteps, decodeMs, decodeTokens, lastTurn }, title, contextPressure,
//   contextBreakdown, permissions { preset, sandbox, approval }, agentPreset,
//   modelSelection { lastUsed { provider, model } }, goal, plan, todos,
//   sessionListMetadata { lastPromptAt }, turnOutline { turns [ {turn, prompt, response} ] },
//   llmRetry, subagent, subagentTiming, titleInput, sandboxMode, imageLimits ...
// All of these are surfaced as session metadata for the activity modal's session drawers.

import { readFileSync, readdirSync, statSync, type Dirent } from "node:fs";
import { join } from "node:path";
import { emptyBuckets, type TokenBuckets } from "./pricing.js";

const TRUNC = 400; // cap long text fields (turnOutline prompts/responses) in the API payload
const cut = (s: unknown): string => (typeof s === "string" && s.length > TRUNC ? s.slice(0, TRUNC) + "…" : String(s));

/** The per-session record identity block. */
interface ProjIdentity {
  cwd?: string | null;
  createdAt?: number | null;
  isSeeded?: boolean;
  inheritedEventCount?: number;
}

/** One value cell in the rows map (the `.val` is the actual payload). */
interface RowVal { val?: unknown; }

/** A raw projcache entry: { identity, rows }. */
interface ProjEntry {
  identity?: ProjIdentity;
  rows?: Record<string, RowVal>;
}

/** Shaped payload types for the strongly-read row values. */
interface TokenUsageVal { totals?: { uncachedInputTokens?: number; outputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number }; }
interface SessionStatsVal { toolMs?: number; ttftMs?: number; ttftSteps?: number; decodeMs?: number; decodeTokens?: number; lastTurn?: number; turns?: number; steps?: number; llmMs?: number; }
interface PermissionsVal { sandbox?: string | null; approval?: string | null; preset?: string | null; }
interface ContextPressureVal { surfaceTokens?: number; contextWindow?: number; pressureTokens?: number; }
interface ContextBreakdownVal { systemTokens?: number; toolsTokens?: number; messageTokens?: number; }
// Real store shape (verified): modelSelection.lastUsed = { provider, model, reasoningEffort }.
interface ModelSelectionVal { lastUsed?: { provider?: string | null; model?: string | null; reasoningEffort?: unknown } | null; }
interface GoalVal { current?: { id?: string | null; revision?: number | null; objective?: string }; failure?: string | null; }
interface PlanVal { active?: boolean; }
interface ListMetaVal { lastPromptAt?: number | string | null; }
interface TurnOutlineVal { turns?: { turn: number; prompt?: string; response?: string }[]; }
interface SubagentTimingVal { settledMs?: number; }

/** Rich per-session metadata surfaced to the activity drawers. */
export interface SessionMeta {
  toolMs: number; ttftMs: number; ttftSteps: number; decodeMs: number; decodeTokens: number;
  lastTurn: number; sandbox: string | null; approval: string | null; preset: string | null;
  agentPreset: string | null; lastUsedModel: { provider: string | null; model: string | null } | null;
  goal: { id: string | null; revision: number | null; objective: string } | null;
  goalFailure: string | null; planActive: boolean; todos: unknown;
  contextPressure: { surfaceTokens: number; contextWindow: number; pressureTokens: number } | null;
  contextBreakdown: { systemTokens: number; toolsTokens: number; messageTokens: number } | null;
  lastPromptAt: number | string | null;
  subagentCount: number; subagentSettledMs: number; llmRetries: unknown;
  turnOutline: { turn: number; prompt: string; response: string }[] | null;
  isSeeded: boolean; inheritedEventCount: number;
}

/** A report row for one projcache session. */
export interface ProjSession {
  id: string;
  cwd: string | null;
  createdAt: number | null;
  title: string | null;
  turns: number;
  steps: number;
  llmMs: number;
  buckets: TokenBuckets | null;
  allTokens: number;
  meta: SessionMeta;
}

/** Aggregated read result. */
export interface ProjcacheResult {
  sessions: ProjSession[];
  totals: TokenBuckets;
  count: number;
  nonZero: number;
  error?: string;
}

/** Extract one session record ({identity, rows}) into a report row + rich metadata. */
function extractSession(id: string, entry: ProjEntry): ProjSession {
  const identity = entry?.identity || ({} as ProjIdentity);
  const rows = entry?.rows || ({} as Record<string, RowVal>);
  const tu = rows.tokenUsage?.val as TokenUsageVal | undefined;
  const buckets: TokenBuckets | null = tu?.totals ? {
    uncachedInputTokens: tu.totals.uncachedInputTokens || 0,
    outputTokens: tu.totals.outputTokens || 0,
    cacheReadTokens: tu.totals.cacheReadTokens || 0,
    cacheWriteTokens: tu.totals.cacheWriteTokens || 0,
  } : null;
  const all = buckets
    ? buckets.uncachedInputTokens + buckets.outputTokens + buckets.cacheReadTokens + buckets.cacheWriteTokens
    : 0;
  const stats = rows.sessionStats?.val as SessionStatsVal | undefined;
  const perms = rows.permissions?.val as PermissionsVal | undefined;
  const pressure = rows.contextPressure?.val as ContextPressureVal | undefined;
  const breakdown = rows.contextBreakdown?.val as ContextBreakdownVal | undefined;
  const modelSel = rows.modelSelection?.val as ModelSelectionVal | undefined;
  const goal = rows.goal?.val as GoalVal | undefined;
  const plan = rows.plan?.val as PlanVal | undefined;
  const listMeta = rows.sessionListMetadata?.val as ListMetaVal | undefined;
  const outline = rows.turnOutline?.val as TurnOutlineVal | undefined;
  const subTiming = rows.subagentTiming?.val as SubagentTimingVal | undefined;
  const sandboxMode = rows.sandboxMode?.val as string | null | undefined;
  const meta: SessionMeta = {
    toolMs: stats?.toolMs || 0,
    ttftMs: stats?.ttftMs || 0,
    ttftSteps: stats?.ttftSteps || 0,
    decodeMs: stats?.decodeMs || 0,
    decodeTokens: stats?.decodeTokens || 0,
    lastTurn: stats?.lastTurn || 0,
    sandbox: perms?.sandbox || sandboxMode || null,
    approval: perms?.approval || null,
    preset: perms?.preset || null,
    agentPreset: (rows.agentPreset?.val as string | null | undefined) || null,
    lastUsedModel: modelSel?.lastUsed ? { provider: modelSel.lastUsed.provider || null, model: modelSel.lastUsed.model || null } : null,
    goal: goal?.current ? { id: goal.current.id || null, revision: goal.current.revision ?? null, objective: cut(goal.current.objective || "") } : null,
    goalFailure: goal?.failure || null,
    planActive: !!plan?.active,
    todos: rows.todos?.val || null,
    contextPressure: pressure ? { surfaceTokens: pressure.surfaceTokens || 0, contextWindow: pressure.contextWindow || 0, pressureTokens: pressure.pressureTokens || 0 } : null,
    contextBreakdown: breakdown ? { systemTokens: breakdown.systemTokens || 0, toolsTokens: breakdown.toolsTokens || 0, messageTokens: breakdown.messageTokens || 0 } : null,
    lastPromptAt: listMeta?.lastPromptAt || null,
    subagentCount: rows.subagent?.val ? Object.keys(rows.subagent.val as Record<string, unknown>).length : 0,
    subagentSettledMs: subTiming?.settledMs || 0,
    llmRetries: rows.llmRetry?.val || null,
    turnOutline: outline?.turns ? outline.turns.map((t) => ({ turn: t.turn, prompt: cut(t.prompt || ""), response: cut(t.response || "") })) : null,
    isSeeded: !!identity.isSeeded,
    inheritedEventCount: identity.inheritedEventCount || 0,
  };
  return {
    id,
    cwd: identity.cwd || null,
    createdAt: identity.createdAt || null,
    title: (rows.title?.val as string | null | undefined) || null,
    turns: stats?.turns || 0,
    steps: stats?.steps || 0,
    llmMs: stats?.llmMs || 0,
    buckets,
    allTokens: all,
    meta,
  };
}

/** New layout: one JSON file per session under <store>/sessions (fallback <store>). */
function readDirStore(storePath: string): Record<string, ProjEntry> {
  const out: Record<string, ProjEntry> = {};
  for (const dir of [join(storePath, "sessions"), storePath]) {
    let entries: Dirent[];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith(".json")) continue;
      const id = e.name.slice(0, -5);
      if (out[id]) continue;
      try {
        const raw = JSON.parse(readFileSync(join(dir, e.name), "utf8")) as { record?: ProjEntry };
        out[id] = raw?.record || (raw as unknown as ProjEntry);
      } catch { /* skip corrupt file */ }
    }
    if (Object.keys(out).length) break; // found the sessions dir
  }
  return out;
}

/**
 * Read + aggregate the projection store. Accepts either the new directory store or the
 * old single-file store. Never throws on a missing/empty store.
 */
export function readProjcache(storePath: string): ProjcacheResult {
  let entries: Record<string, ProjEntry> = {};
  try {
    if (statSync(storePath).isDirectory()) {
      entries = readDirStore(storePath);
    } else {
      const store = JSON.parse(readFileSync(storePath, "utf8")) as { tables?: { sessions?: Record<string, ProjEntry> } };
      entries = store?.tables?.sessions || {};
    }
  } catch { return { sessions: [], totals: emptyBuckets(), count: 0, nonZero: 0, error: "unreadable" }; }

  const sessions: ProjSession[] = [];
  const totals = emptyBuckets();
  let nonZero = 0;

  for (const [id, entry] of Object.entries(entries)) {
    const s = extractSession(id, entry);
    if (s.allTokens > 0) nonZero++;
    if (s.buckets) for (const k of ["uncachedInputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"] as const) totals[k] += s.buckets[k];
    sessions.push(s);
  }

  sessions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return { sessions, totals, count: sessions.length, nonZero };
}
