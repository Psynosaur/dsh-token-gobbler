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
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emptyBuckets } from "./pricing.js";
const TRUNC = 400; // cap long text fields (turnOutline prompts/responses) in the API payload
const cut = (s) => (typeof s === "string" && s.length > TRUNC ? s.slice(0, TRUNC) + "…" : String(s));
/** Extract one session record ({identity, rows}) into a report row + rich metadata. */
function extractSession(id, entry, source = "local") {
    const identity = entry?.identity || {};
    const rows = entry?.rows || {};
    const tu = rows.tokenUsage?.val;
    const buckets = tu?.totals ? {
        uncachedInputTokens: tu.totals.uncachedInputTokens || 0,
        outputTokens: tu.totals.outputTokens || 0,
        cacheReadTokens: tu.totals.cacheReadTokens || 0,
        cacheWriteTokens: tu.totals.cacheWriteTokens || 0,
    } : null;
    const all = buckets
        ? buckets.uncachedInputTokens + buckets.outputTokens + buckets.cacheReadTokens + buckets.cacheWriteTokens
        : 0;
    const stats = rows.sessionStats?.val;
    const perms = rows.permissions?.val;
    const pressure = rows.contextPressure?.val;
    const breakdown = rows.contextBreakdown?.val;
    const modelSel = rows.modelSelection?.val;
    const goal = rows.goal?.val;
    const plan = rows.plan?.val;
    const listMeta = rows.sessionListMetadata?.val;
    const outline = rows.turnOutline?.val;
    const subTiming = rows.subagentTiming?.val;
    const sandboxMode = rows.sandboxMode?.val;
    const meta = {
        toolMs: stats?.toolMs || 0,
        ttftMs: stats?.ttftMs || 0,
        ttftSteps: stats?.ttftSteps || 0,
        decodeMs: stats?.decodeMs || 0,
        decodeTokens: stats?.decodeTokens || 0,
        lastTurn: stats?.lastTurn || 0,
        sandbox: perms?.sandbox || sandboxMode || null,
        approval: perms?.approval || null,
        preset: perms?.preset || null,
        agentPreset: rows.agentPreset?.val || null,
        lastUsedModel: modelSel?.lastUsed ? { provider: modelSel.lastUsed.provider || null, model: modelSel.lastUsed.model || null } : null,
        goal: goal?.current ? { id: goal.current.id || null, revision: goal.current.revision ?? null, objective: cut(goal.current.objective || "") } : null,
        goalFailure: goal?.failure || null,
        planActive: !!plan?.active,
        todos: rows.todos?.val || null,
        contextPressure: pressure ? { surfaceTokens: pressure.surfaceTokens || 0, contextWindow: pressure.contextWindow || 0, pressureTokens: pressure.pressureTokens || 0 } : null,
        contextBreakdown: breakdown ? { systemTokens: breakdown.systemTokens || 0, toolsTokens: breakdown.toolsTokens || 0, messageTokens: breakdown.messageTokens || 0 } : null,
        lastPromptAt: listMeta?.lastPromptAt || null,
        subagentCount: rows.subagent?.val ? Object.keys(rows.subagent.val).length : 0,
        subagentSettledMs: subTiming?.settledMs || 0,
        llmRetries: rows.llmRetry?.val || null,
        turnOutline: outline?.turns ? outline.turns.map((t) => ({ turn: t.turn, prompt: cut(t.prompt || ""), response: cut(t.response || "") })) : null,
        isSeeded: !!identity.isSeeded,
        inheritedEventCount: identity.inheritedEventCount || 0,
    };
    return {
        id,
        source,
        cwd: identity.cwd || null,
        createdAt: identity.createdAt || null,
        title: rows.title?.val || null,
        turns: stats?.turns || 0,
        steps: stats?.steps || 0,
        llmMs: stats?.llmMs || 0,
        buckets,
        allTokens: all,
        meta,
    };
}
/** New layout: one JSON file per session under <store>/sessions (fallback <store>). */
function readDirStore(storePath) {
    const out = {};
    for (const dir of [join(storePath, "sessions"), storePath]) {
        let entries;
        try {
            entries = readdirSync(dir, { withFileTypes: true });
        }
        catch {
            continue;
        }
        for (const e of entries) {
            if (!e.isFile() || !e.name.endsWith(".json"))
                continue;
            const id = e.name.slice(0, -5);
            if (out[id])
                continue;
            try {
                const raw = JSON.parse(readFileSync(join(dir, e.name), "utf8"));
                out[id] = raw?.record || raw;
            }
            catch { /* skip corrupt file */ }
        }
        if (Object.keys(out).length)
            break; // found the sessions dir
    }
    return out;
}
/** Read + aggregate the projection store. Accepts either the new directory store or the
 *  old single-file store. Never throws on a missing/empty store. */
export function readProjcache(storePath, source = "local") {
    let entries = {};
    try {
        if (statSync(storePath).isDirectory()) {
            entries = readDirStore(storePath);
        }
        else {
            const store = JSON.parse(readFileSync(storePath, "utf8"));
            entries = store?.tables?.sessions || {};
        }
    }
    catch {
        return { sessions: [], totals: emptyBuckets(), count: 0, nonZero: 0, error: "unreadable" };
    }
    return aggregateEntries(entries, source);
}
/**
 * Read BOTH projection stores and union the sessions by id, the primary store
 * winning on a duplicate. DSH writes a session to whichever store matches the
 * session's on-disk format: a v0 session updates the legacy single JSON file,
 * while a v3 session is written as its own file under `session_projcache/`.
 * They therefore hold DISJOINT sets for the sessions of each era (a v3 session is
 * absent from the legacy file entirely). Reading only the more recently modified
 * store silently drops the other era's sessions — which is how "today's new
 * entries" vanish from the dashboard.
 */
export function readProjcacheMerged(paths, source = "local") {
    const merged = {};
    const from = [];
    for (const p of [paths.primary, paths.secondary]) {
        if (!p)
            continue;
        let entries = null;
        try {
            if (statSync(p).isDirectory())
                entries = readDirStore(p);
            else
                entries = JSON.parse(readFileSync(p, "utf8"))?.tables?.sessions || {};
        }
        catch {
            entries = null;
        }
        if (!entries)
            continue;
        let added = 0;
        for (const [id, entry] of Object.entries(entries)) {
            if (merged[id])
                continue; // the preferred store wins on a duplicate
            merged[id] = entry;
            added++;
        }
        if (added)
            from.push(p);
    }
    return { ...aggregateEntries(merged, source), from };
}
/** Aggregate raw store entries into report rows (shared by both readers). */
function aggregateEntries(entries, source = "local") {
    const sessions = [];
    const totals = emptyBuckets();
    let nonZero = 0;
    for (const [id, entry] of Object.entries(entries)) {
        const s = extractSession(id, entry, source);
        if (s.allTokens > 0)
            nonZero++;
        if (s.buckets)
            for (const k of ["uncachedInputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"])
                totals[k] += s.buckets[k];
        sessions.push(s);
    }
    sessions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { sessions, totals, count: sessions.length, nonZero };
}
