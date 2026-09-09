// token-gobbler · client/daily.tsx
// Daily tab — composes the separated pieces:
//   DailyHeatmap (client/daily-heatmap.tsx)  — calendar heatmap + tooltip + range
//   badgeGrid + costCard                     — day/range overview badges (shared)
//   SessionTable (client/session-table.tsx)  — shared per-session table; expand
//                                             → combinedDrawer with turns collapsed
// All aggregation math lives in client/agg.ts.
import { fmt, fmtC, money, fmtMs, badgeGrid } from "./core";
import { aggregateSessions, dayStr, rangeStartFor } from "./agg";
import { SessionTable } from "./session-table";
import { DailyHeatmap, rangeLabel } from "./daily-heatmap";
import { combinedDrawer } from "./drawers";
import { costCard } from "./panels";

export const DailyTab = ({ bySession, initialDay }: { bySession: any[]; initialDay?: string | null }) => {
  const [range, setRange] = React.useState("6m"); // "3m" | "6m" | "1y" | "all"
  const [selDay, setSelDayRaw] = React.useState<string | null>(initialDay || null);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const overRef = React.useRef<any>(null);

  // Sessions grouped by local calendar day (skip un-dateable rows).
  const byDate = React.useMemo(() => {
    const m = new Map<string, any[]>();
    for (const s of bySession || []) {
      if (!s.date || s.date === "unknown") continue;
      const k = String(s.date);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    }
    return m;
  }, [bySession]);

  const today = React.useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);
  const rangeStart = React.useMemo(() => rangeStartFor(range, byDate, today), [range, byDate, today]);
  const rangeTotals = React.useMemo(() => {
    const rows: any[] = [];
    for (const [k, v] of byDate) if (k >= dayStr(rangeStart) && k <= dayStr(today)) rows.push(...v);
    return aggregateSessions(rows);
  }, [byDate, rangeStart, today]);
  const dayTotals = React.useMemo(
    () => (selDay && byDate.has(selDay) ? aggregateSessions(byDate.get(selDay)!) : null),
    [byDate, selDay],
  );
  const ov = dayTotals || rangeTotals;

  const setSelDay = (d: string | null) => { setSelDayRaw(d); setPage(0); };
  const onRange = (k: string) => { setRange(k); setSelDayRaw(null); };
  const clickDay = (date: string) => {
    const next = selDay === date ? null : date;
    setSelDay(next);
    if (next && overRef.current) overRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Sessions that carry per-step data (the drawer's turn → step table needs it).
  const selRows = React.useMemo(() => {
    const rows = (bySession || []).filter((s) => s.stepTree && s.stepTree.length);
    return selDay ? rows.filter((s) => s.date === selDay) : rows;
  }, [bySession, selDay]);

  return jsxs("div", { className: "tg-day", children: [
    jsx(DailyHeatmap, { byDate, range, onRange, selDay, onDayClick: clickDay, totals: rangeTotals }),

    // ── daily overview (badges + table) ──────────────────────────────────
    jsxs("div", { ref: overRef, className: "tg-day-ov", children: [
      jsxs("div", { className: "tg-day-ov-head", children: [
        jsx("div", { className: "tg-label", style: { fontSize: 12 }, children: dayTotals ? "📅 Day overview — " + selDay : "Overview — " + rangeLabel(range) }),
        dayTotals ? jsx("button", { className: "tg-ghost", onClick: () => setSelDay(null), children: "✕ clear day filter" }) : null,
      ]}),
      jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
        jsx("div", { className: "tg-label", children: "⚡ Speed" }),
        badgeGrid([
          costCard("Decode speed (avg)", ov.decode != null ? ov.decode + " tok/s" : "—", fmtC(ov.decTok) + " streamed · " + fmtMs(ov.decMs), "#fbbf24"),
          costCard("Prompt processing (avg)", ov.prefill != null ? ov.prefill + " tok/s" : "—", fmtC(ov.preTok) + " new ctx · " + fmtMs(ov.preMs) + " TTFT", "#2dd4bf"),
          costCard("Avg TTFT", ov.ttft != null ? ov.ttft + "s" : "—", "request → first token", "#38bdf8"),
          costCard("LLM steps", fmt(ov.steps), ov.turns ? fmt(ov.turns) + " turns" : "turns not recorded", "#60a5fa"),
        ]),
        jsx("div", { className: "tg-label", children: "🪙 Tokens" }),
        badgeGrid([
          costCard("Input (uncached)", fmtC(ov.tin), "total", "#60a5fa"),
          costCard("Output", fmtC(ov.tout), "total", "#a78bfa"),
          costCard("Cache (read+write)", fmtC(ov.tcache), "total", "#2dd4bf"),
          costCard("Thinking", fmtC(ov.tthink), "reasoning tokens", "#c084fc"),
          costCard("Tools (payload)", fmtC(ov.ttools), "tool-call args (chars/4)", "#34d399"),
          costCard("Total tokens", fmtC(ov.total), "all buckets", "#fbbf24"),
          costCard("Cost", money(ov.cost), ov.sessions + " session" + (ov.sessions !== 1 ? "s" : ""), "#fb923c"),
          costCard("Avg tokens / session", ov.sessions > 0 ? fmtC(Math.round(ov.total / ov.sessions)) : "—", ov.sessions + " sessions", "#f472b6"),
        ]),
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Per session — " + (selDay ? selDay + " (" + selRows.length + ")" : "all days, click a day in the heatmap to filter") + " — expand for the unified turn → step table (tokens + speed)" }),
        SessionTable({
          rows: selRows,
          expandedId: expanded, onToggle: setExpanded,
          drawer: (s: any) => combinedDrawer(s, { defaultClosed: true }),
          page, setPage, pageSize: 25,
          columns: { lastActive: true, tin: true, tout: true, tcache: true },
          empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No combined per-step data" + (selDay ? " for " + selDay : " yet") + " — sessions with per-turn usage appear here." }),
        }),
      ]}),
    ]}),
  ]});
};
