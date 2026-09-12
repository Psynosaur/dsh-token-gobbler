// token-gobbler · client/table.tsx
// THE generic data table: paging, grouping, expandable drawers, sticky header,
// all table CSS (token-gobbler.css `.tg-table*` / `.tg-pager` / `.tg-drawer-*`).
// Every table in the activity tabs renders through this — the per-session
// column sets live in client/session-table.tsx, the aggregation math in
// client/agg.ts. (The old ASCII `CliTree` was removed — the Tokens drawer now
// uses a standard collapsible turn table in drawers.tsx.)
// React is an ambient global injected by the factory (client/index.ts). We
// reach hooks via React.* at call time (render), never at module load, so no
// local react package is bundled and nothing reads React before it's set.
import { thL, thR, tdL, tdR } from "./core";

export const groupRows = (rows: any[], groupBy?: (r: any) => string): { label: string | null; rows: any[] }[] => {
  const out: { label: string | null; rows: any[] }[] = [];
  let cur: { label: string | null; rows: any[] } | null = null;
  for (const r of rows ?? []) {
    const label = groupBy ? groupBy(r) : null;
    if (!cur || cur.label !== label) { cur = { label, rows: [] }; out.push(cur); }
    cur.rows.push(r);
  }
  return out;
};

export interface Column {
  key: string;
  label: string;
  align?: "l" | "r";
  render?: (r: any) => any;
  props?: any | ((r: any) => any);
  fallback?: any;
}

export interface TgTableOpts {
  columns: Column[];
  rows: any[];
  rowKey: (r: any) => string;
  expandedId?: string | null;
  onToggle?: (k: string | null) => void;
  drawer?: (r: any) => any;
  page?: number;
  setPage?: (p: number) => void;
  pageSize?: number;
  groupBy?: (r: any) => string;
  empty?: any;
  compact?: boolean;
  /** Extra CSS class for a row (e.g. dimming archived sessions). */
  rowClass?: (r: any) => string;
}

export const TgTable = (opts: TgTableOpts) => {
  const { columns, rows, rowKey, expandedId, onToggle, drawer, page = 0, setPage, pageSize = 0, groupBy, empty, compact, rowClass } = opts;
  const hasDrawer = !!drawer;
  if (!rows || !rows.length) return empty || jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No data." });
  const total = rows.length;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safePage = page >= totalPages ? totalPages - 1 : Math.max(0, page);
  const pageRows = pageSize > 0 ? rows.slice(safePage * pageSize, (safePage + 1) * pageSize) : rows;
  const colSpan = columns.length + (hasDrawer ? 1 : 0);
  const groups = groupRows(pageRows, groupBy);
  const renderRow = (r: any): any[] => {
    const key = rowKey(r);
    const open = hasDrawer && expandedId === key;
    const rowEl = jsxs("tr", {
      className: "tg-tr" + (hasDrawer ? " tg-row-btn" : "") + (compact ? " tg-compact" : "") + (rowClass && rowClass(r) ? " " + rowClass(r) : ""),
      onClick: hasDrawer ? () => { if (onToggle) onToggle(open ? null : key); } : undefined,
      style: open ? { background: "rgba(251,191,36,0.05)" } : undefined,
      children: [
        hasDrawer ? tdL(jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "▶" }, "chev-" + key)) : null,
        ...columns.map((c) => {
          const v = c.render ? c.render(r) : (r[c.key] ?? c.fallback ?? "—");
          const cellProps = typeof c.props === "function" ? c.props(r) : c.props;
          return c.align === "r" ? tdR(v, cellProps) : tdL(v, cellProps);
        }),
      ],
    }, key);
    if (!open) return [rowEl];
    return [rowEl, jsx("tr", { className: "tg-drawer-row", children: jsx("td", { className: "tg-drawer-cell", colSpan, children: drawer!(r) }) }, key + "-drawer")];
  };
  const openRow = hasDrawer && expandedId != null;
  return jsxs("div", { className: "tg-tscroll" + (openRow ? "" : " tg-vscroll"), children: [
    // Sticky headers only make sense while the list itself scrolls; with a drawer
    // open the row is split by that drawer, so a pinned header would hover over
    // the drawer's content. Drop the sticky class in that state (the container is
    // also no longer height-bounded, so nothing escapes into the modal body).
    jsxs("table", { className: "tg-table" + (openRow ? "" : " tg-sticky"), style: hasDrawer ? { tableLayout: "fixed", width: "100%" } : undefined, children: [
      jsx("tr", { children: [ hasDrawer ? thL("") : null, ...columns.map((c) => c.align === "r" ? thR(c.label) : thL(c.label)) ] }),
      ...groups.flatMap((g) => g.label ? [jsx("tr", { className: "tg-group", children: jsx("td", { colSpan, children: g.label }) }, g.label + "-g")] : []),
      ...pageRows.flatMap(renderRow),
    ]}),
    pageSize > 0 && totalPages > 1 ? jsxs("div", { className: "tg-pager", children: [
      jsx("button", { className: "tg-ghost", disabled: safePage <= 0, onClick: () => setPage && setPage(safePage - 1), children: "‹ Prev" }),
      jsx("span", { className: "tg-faint", style: { fontSize: 12 }, children: (safePage + 1) + " / " + totalPages + " · " + total + " rows" }),
      jsx("button", { className: "tg-ghost", disabled: safePage >= totalPages - 1, onClick: () => setPage && setPage(safePage + 1), children: "Next ›" }),
    ]}) : null,
  ]});
};
