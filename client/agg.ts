// token-gobbler · client/agg.ts
// Shared session aggregation — the one place the "sum these sessions' stats"
// math lives. Used by the Daily tab (day + range totals), the Combined tab
// (over-time day series + badge math) and the drawers (per-session token
// totals). Pure data functions: no JSX, no hooks.

/** Local calendar-day key for a Date ("YYYY-MM-DD"). */
export const dayStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Per-session token totals: the four buckets + thinking (from the step trees)
 *  + tool-call payloads. */
export const sessionTokens = (s: any) => {
  let tthink = 0;
  for (const t of (s.stepTree || [])) for (const st of (t.steps || [])) tthink += st.thinking || 0;
  let ttools = 0;
  for (const tt of (s.toolTokens || [])) ttools += tt.total || 0;
  return {
    tin: s.uncachedInputTokens || 0,
    tout: s.outputTokens || 0,
    tcache: (s.cacheReadTokens || 0) + (s.cacheWriteTokens || 0),
    tthink, ttools,
    total: s.allTokens || 0,
  };
};

/** Combined stats for a set of sessions (mirrors the tab badge math: tokens
 *  from the buckets, thinking from the step trees, decode/prefill/TTFT from
 *  trajectory timestamps, tools from the payload stats). */
export const aggregateSessions = (rows: any[]) => {
  const list = rows || [];
  let tin = 0, tout = 0, tcache = 0, tthink = 0, ttools = 0, total = 0, cost = 0;
  let steps = 0, turns = 0, decTok = 0, decMs = 0, preTok = 0, preMs = 0, ttftSum = 0, ttftCount = 0;
  for (const s of list) {
    const t = sessionTokens(s);
    tin += t.tin; tout += t.tout; tcache += t.tcache; tthink += t.tthink; ttools += t.ttools;
    total += s.allTokens || 0;
    cost += s.cost || 0;
    steps += (s.events && s.events.steps) || (s.steps ? s.steps.length : 0) || 0;
    turns += (s.events && s.events.turns) || 0;
    for (const t of (s.stepTree || [])) for (const st of (t.steps || [])) {
      decTok += st.out || 0; decMs += st.decodeMs || 0;
      preTok += st.in || 0; preMs += st.ttftMs || 0;
      if (st.ttftMs != null) { ttftSum += st.ttftMs; ttftCount++; }
    }
  }
  return {
    sessions: list.length, steps, turns, tin, tout, tcache, tthink, ttools, total, cost,
    decTok, decMs, preTok, preMs,
    decode: decMs > 0 ? Math.round((decTok / (decMs / 1000)) * 10) / 10 : null,
    prefill: preMs > 0 ? Math.round((preTok / (preMs / 1000)) * 10) / 10 : null,
    ttft: ttftCount > 0 ? Math.round((ttftSum / ttftCount / 1000) * 10) / 10 : null,
  };
};

/** Start (local midnight) of a range window: "3m" / "6m" / "1y" back from
 *  today, or the earliest day present in byDate for "all". NB: byDate's
 *  insertion order follows bySession (newest-first from the projcache), so
 *  "earliest" must be the MIN key, not the first key. */
export const rangeStartFor = (range: string, byDate: Map<string, any[]>, today: Date): Date => {
  if (range === "all") {
    let earliest: string | null = null;
    for (const k of byDate.keys()) if (earliest == null || k < earliest) earliest = k;
    if (earliest != null) return new Date(earliest + "T00:00:00");
    return today;
  }
  const days = range === "3m" ? 92 : range === "6m" ? 184 : 367;
  const t = new Date(today); t.setDate(t.getDate() - days);
  return t;
};

/** Per-day series of the combined stats (for the over-time charts): one row
 *  per local calendar day, sorted ascending, empty days dropped. */
export const daySeries = (bySession: any[]) => {
  const map = new Map<string, any[]>();
  for (const s of bySession || []) {
    const d = s.date || (s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-CA") : "?");
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(s);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, rows]) => {
      const t = aggregateSessions(rows);
      return { date, decode: t.decode, prefill: t.prefill, ttft: t.ttft, in: t.tin, out: t.tout, cache: t.tcache, think: t.tthink, total: t.total };
    })
    .filter((r) => r.in || r.out || r.cache || r.total);
};
