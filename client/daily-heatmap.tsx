// token-gobbler · client/daily-heatmap.tsx
// The Daily tab's calendar heatmap: a GitHub-style grid of days (Sunday-start
// week columns × 7 rows) colored by that day's token intensity, stretching
// across the full modal width. Hover a cell = fixed (unclipped) tooltip with
// that day's combined stats; click a day = select it. The range buttons widen /
// narrow the historical window (3M / 6M / 1Y / All); the grid scrolls
// horizontally once the columns would get thinner than MIN_CELL.
import { fmt, fmtC, money } from "./core";
import { aggregateSessions, dayStr, rangeStartFor } from "./agg";

// GitHub-style intensity scale (empty cell + 4 levels), darkest → brightest.
const LEVEL_COLORS = ["#1a2437", "#2b4a70", "#3d6c9c", "#5b93c9", "#7db7e9"];
const GAP = 4; // px between cells
const MIN_CELL = 12; // px — below this per-column width the grid scrolls instead
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const rangeLabel = (range: string): string =>
  range === "all" ? "All-time" : range === "3m" ? "Last 3 months" : range === "6m" ? "Last 6 months" : "Last year";

export interface DailyHeatmapProps {
  byDate: Map<string, any[]>;      // sessions grouped by local calendar day
  range: string;                   // "3m" | "6m" | "1y" | "all"
  onRange: (k: string) => void;
  selDay: string | null;
  onDayClick: (date: string) => void;
  totals: any;                     // aggregateSessions() over the active range (header line)
}

export const DailyHeatmap = ({ byDate, range, onRange, selDay, onDayClick, totals }: DailyHeatmapProps) => {
  const [tip, setTip] = React.useState<any>(null);
  const today = React.useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);
  const todayStr = dayStr(today);

  const rangeStart = React.useMemo(() => rangeStartFor(range, byDate, today), [range, byDate, today]);

  // Calendar grid: Sunday-start weeks, one column per week, 7 rows.
  const grid = React.useMemo(() => {
    const weekStart = new Date(rangeStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // back to Sunday
    const days = Math.floor((today.getTime() - weekStart.getTime()) / 86400000) + 1;
    const weeks = Math.max(1, Math.ceil(days / 7));
    const out: { date: string; d: Date; stats: any; inRange: boolean; isFuture: boolean }[] = [];
    for (let w = 0; w < weeks; w++) {
      for (let r = 0; r < 7; r++) {
        const d = new Date(weekStart.getTime() + (w * 7 + r) * 86400000);
        if (d > today) { out.push({ date: dayStr(d), d, stats: null, inRange: false, isFuture: true }); continue; }
        const ds = dayStr(d);
        out.push({ date: ds, d, stats: byDate.get(ds) ? aggregateSessions(byDate.get(ds)!) : null, inRange: d >= rangeStart, isFuture: false });
      }
    }
    const maxV = out.reduce((n, c) => (c.stats ? Math.max(n, c.stats.total) : n), 0) || 1;
    return { out, weeks, maxV };
  }, [rangeStart, byDate, today]);

  const lvl = (total: number): number => {
    if (!total) return 0;
    const t = Math.log1p(total) / Math.log1p(grid.maxV);
    return t <= 0.25 ? 1 : t <= 0.5 ? 2 : t <= 0.8 ? 3 : 4;
  };

  // Month labels: one per week column where the month changes (same grid
  // template as the cells, so a label always sits over its own column).
  const monthLabels = React.useMemo(() => {
    const out: { label: string; week: number }[] = [];
    let prev = "";
    for (let w = 0; w < grid.weeks; w++) {
      const d = grid.out[w * 7].d;
      if (d > today) break;
      const label = MONTHS[d.getMonth()];
      if (label !== prev) { out.push({ label, week: w }); prev = label; }
    }
    return out;
  }, [grid, today]);

  // Grid content width: full container, but never below MIN_CELL per week column.
  const gridMinWidth = grid.weeks * MIN_CELL + (grid.weeks - 1) * GAP;

  // Fixed-position tooltip: never clipped by the scroll wrapper or modal body.
  const tipEl = tip ? jsxs("div", {
    className: "tg-tip",
    style: {
      left: tip.x, top: tip.y,
      transform: "translate(-50%, " + (tip.y < 150 ? "16px" : "calc(-100% - 12px)") + ")",
    },
    children: [
      jsx("div", { className: "tg-tip-date", children: tip.stats ? new Date(tip.date + "T00:00:00").toDateString().replace(/^\w+ /, "") : tip.date }),
      tip.stats ? jsx("div", { className: "tg-tip-sub", children:
        tip.stats.sessions + " session" + (tip.stats.sessions !== 1 ? "s" : "") + " · " + fmt(tip.stats.steps) + " LLM step" + (tip.stats.steps !== 1 ? "s" : "") + (tip.stats.turns ? " · " + fmt(tip.stats.turns) + " turn" + (tip.stats.turns !== 1 ? "s" : "") : ""),
      }) : null,
      tip.stats ? jsx("div", { className: "tg-tip-grid", children: [
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "In " }), jsx("b", { children: fmtC(tip.stats.tin) })] }),
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Out " }), jsx("b", { children: fmtC(tip.stats.tout) })] }),
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Cache " }), jsx("b", { children: fmtC(tip.stats.tcache) })] }),
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Think " }), jsx("b", { children: fmtC(tip.stats.tthink) })] }),
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Decode " }), jsx("b", { children: tip.stats.decode != null ? tip.stats.decode + " tok/s" : "—" })] }),
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "TTFT " }), jsx("b", { children: tip.stats.ttft != null ? tip.stats.ttft + "s" : "—" })] }),
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Total " }), jsx("b", { className: "tg-tip-total", children: fmtC(tip.stats.total) })] }),
        jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Priced " }), jsx("b", { children: money(tip.stats.cost) })] }),
      ]}) : null,
      jsx("div", { className: "tg-faint tg-tip-foot", children: tip.stats ? "Click to open this day's overview + sessions" : "No sessions this day" }),
    ],
  }, "tip-" + tip.date) : null;

  return jsxs("div", { children: [
    jsxs("div", { className: "tg-heat-head", children: [
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", children: "📅 Sessions over time — " + rangeLabel(range) }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children:
          fmtC(totals.total) + " tokens · in " + fmtC(totals.tin) + " · cache " + fmtC(totals.tcache) + " · out " + fmtC(totals.tout) +
          " · " + fmt(totals.sessions) + " session" + (totals.sessions !== 1 ? "s" : "") + " · " + fmt(totals.steps) + " LLM step" + (totals.steps !== 1 ? "s" : "") }),
      ]}),
      jsxs("div", { className: "tg-heat-ranges", children: [
        jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "Range:" }),
        ["3m", "6m", "1y", "all"].map((k) => jsx("button", {
          className: "tg-ghost" + (range === k ? " active" : ""),
          onClick: () => onRange(k),
          children: k === "all" ? "All" : k.toUpperCase(),
        }, "range-" + k)),
      ]}),
    ]}),
    jsx("div", { className: "tg-heat-scroll", onMouseLeave: () => setTip(null), children: [
      jsxs("div", { style: { width: "100%", minWidth: gridMinWidth }, children: [
        // month labels — same column template as the cells so they line up
        jsx("div", { className: "tg-heat-months", style: { display: "grid", gridTemplateColumns: "repeat(" + grid.weeks + ", 1fr)", columnGap: GAP }, children: monthLabels.map((m) => jsx("span", {
          className: "tg-heat-month",
          style: { gridColumnStart: m.week + 1 },
          children: m.label,
        }, m.label + m.week)) }),
        // the cells — 1fr columns + 1fr rows so the grid spans the full width
        jsx("div", { className: "tg-heat-cells", style: { minWidth: gridMinWidth }, children: grid.out.map((c) => {
          if (c.isFuture) return null;
          const selected = selDay === c.date;
          const isToday = c.date === todayStr;
          return jsx("div", {
            key: c.date,
            className: "tg-heat-cell" + (c.stats ? " clickable" : "") + (c.inRange ? "" : " out") + (isToday ? " today" : "") + (selected ? " selected" : ""),
            style: { background: LEVEL_COLORS[c.stats ? lvl(c.stats.total) : 0] },
            onMouseMove: (e: any) => setTip({ date: c.date, x: e.clientX, y: e.clientY, stats: c.stats }),
            onMouseLeave: () => setTip(null),
            onClick: c.stats ? () => onDayClick(c.date) : undefined,
          }, "cell-" + c.date);
        }) }),
      ]}),
    ]}),
    jsxs("div", { className: "tg-heat-legend", children: [
      jsx("span", { className: "tg-faint", style: { fontSize: 10 }, children: "Less" }),
      LEVEL_COLORS.map((c2) => jsx("span", { className: "tg-heat-sw", style: { background: c2 }, key: c2 })),
      jsx("span", { className: "tg-faint", style: { fontSize: 10 }, children: "More" }),
    ]}),
    // fixed tooltip — rendered wherever; position:fixed anchors it to the
    // cursor and nothing (scroll wrapper, modal body) can clip it
    tipEl,
  ]});
};
