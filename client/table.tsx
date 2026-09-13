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
  sortKey?: string;
  align?: "l" | "r";
  render?: (r: any) => any;
  props?: any | ((r: any) => any);
  fallback?: any;
}

export interface SortState {
  key: string;
  dir: "asc" | "desc";
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
  /** Current sort state (key + direction). When set, headers become clickable. */
  sort?: SortState;
  /** Callback when a column header is clicked for sorting. */
  onSort?: (col: SortState) => void;
  /** Unique key for persisting sort state to localStorage. */
  sortKey?: string;
}

// Sort rows by a column key. Numeric values sort numerically;
// strings sort alphabetically; nulls/undefined sort to the end.
const sortRows = (rows: any[], sort: SortState): any[] => {
  const key = sort.key;
  const dir = sort.dir;
  const multiplier = dir === "asc" ? 1 : -1;
  return rows.slice().sort(function(a, b) {
    let va = a[key];
    let vb = b[key];
    // Handle nested paths like "meta.lastPromptAt"
    if (key.indexOf(".") >= 0) {
      const parts = key.split(".");
      va = parts.reduce(function(o, p) { return o && o[p] != null ? o[p] : null; }, a);
      vb = parts.reduce(function(o, p) { return o && o[p] != null ? o[p] : null; }, b);
    }
    // Normalize nulls to sort to the end
    if (va == null && vb == null) return 0;
    if (va == null) return 1 * multiplier;
    if (vb == null) return -1 * multiplier;
    // Numeric comparison
    if (typeof va === "number" && typeof vb === "number") {
      return (va - vb) * multiplier;
    }
    // String comparison
    return String(va).localeCompare(String(vb)) * multiplier;
  });
};

export const TgTable = (opts: TgTableOpts) => {
  const columns = opts.columns;
  const rows = opts.rows;
  const rowKey = opts.rowKey;
  const expandedId = opts.expandedId;
  const onToggle = opts.onToggle;
  const drawer = opts.drawer;
  const page = opts.page != null ? opts.page : 0;
  const setPage = opts.setPage;
  const pageSize = opts.pageSize != null ? opts.pageSize : 0;
  const groupBy = opts.groupBy;
  const empty = opts.empty;
  const compact = opts.compact;
  const rowClass = opts.rowClass;
  const sort = opts.sort;
  const onSort = opts.onSort;
  const sortKey = opts.sortKey;
  const hasDrawer = !!drawer;
  const hasSort = !!onSort;
  if (!rows || !rows.length) return empty || jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No data." });
  // Apply sorting before paging
  const sortedRows = sort ? sortRows(rows, sort) : rows;
  const total = sortedRows.length;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safePage = page >= totalPages ? totalPages - 1 : Math.max(0, page);
  const pageRows = pageSize > 0 ? sortedRows.slice(safePage * pageSize, (safePage + 1) * pageSize) : sortedRows;
  const colSpan = columns.length + (hasDrawer ? 1 : 0);
  const groups = groupRows(pageRows, groupBy);
  const renderRow = (r: any): any[] => {
    const key = rowKey(r);
    const open = hasDrawer && expandedId === key;
    const rowEl = jsxs("tr", {
      className: "tg-tr" + (hasDrawer ? " tg-row-btn" : "") + (compact ? " tg-compact" : "") + (rowClass && rowClass(r) ? " " + rowClass(r) : ""),
      onClick: hasDrawer ? function() { if (onToggle) onToggle(open ? null : key); } : undefined,
      style: open ? { background: "rgba(251,191,36,0.05)" } : undefined,
      children: [
        hasDrawer ? tdL(jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "▶" }, "chev-" + key)) : null,
        ...columns.map(function(c) {
          const v = c.render ? c.render(r) : (r[c.key] != null ? r[c.key] : (c.fallback != null ? c.fallback : "—"));
          const cellProps = typeof c.props === "function" ? c.props(r) : c.props;
          return c.align === "r" ? tdR(v, cellProps) : tdL(v, cellProps);
        }),
      ],
    }, key);
    if (!open) return [rowEl];
    return [rowEl, jsx("tr", { className: "tg-drawer-row", children: jsx("td", { className: "tg-drawer-cell", colSpan: colSpan, children: drawer(r) }) }, key + "-drawer")];
  };
  const openRow = hasDrawer && expandedId != null;
  // Build sortable headers
  const headerCells = columns.map(function(c) {
    const isSorted = hasSort && sort != null && sort.key === (c.sortKey || c.key);
    const dirIcon = isSorted ? (sort.dir === "asc" ? " ▲" : " ▼") : "";
    if (hasSort) {
      const alignClass = c.align === "r" ? " tg-th-r" : "";
      const thProps = {
        className: "tg-th tg-sortable" + alignClass + (isSorted ? " tg-sorted" : ""),
        onClick: function() {
          if (onSort) {
            const newDir = isSorted && sort.dir === "asc" ? "desc" : "asc";
            onSort({ key: c.sortKey || c.key, dir: newDir });
          }
        },
      };
      return jsx("th", Object.assign({}, thProps, { children: c.label + dirIcon }));
    }
    // No sorting — use the original helpers
    return c.align === "r" ? thR(c.label) : thL(c.label);
  });
  return jsxs("div", { className: "tg-tscroll" + (openRow ? "" : " tg-vscroll"), children: [
    jsxs("table", { className: "tg-table" + (openRow ? "" : " tg-sticky"), style: hasDrawer ? { tableLayout: "fixed", width: "100%" } : undefined, children: [
      jsx("tr", { children: [ hasDrawer ? thL("") : null, ...headerCells ] }),
      ...groups.flatMap(function(g) { return g.label ? [jsx("tr", { className: "tg-group", children: jsx("td", { colSpan: colSpan, children: g.label }) }, g.label + "-g")] : []; }),
      ...pageRows.flatMap(renderRow),
    ]}),
    pageSize > 0 && totalPages > 1 ? jsxs("div", { className: "tg-pager", children: [
      jsx("button", { className: "tg-ghost", disabled: safePage <= 0, onClick: function() { if (setPage) setPage(safePage - 1); }, children: "‹ Prev" }),
      jsx("span", { className: "tg-faint", style: { fontSize: 12 }, children: (safePage + 1) + " / " + totalPages + " · " + total + " rows" }),
      jsx("button", { className: "tg-ghost", disabled: safePage >= totalPages - 1, onClick: function() { if (setPage) setPage(safePage + 1); }, children: "Next ›" }),
    ]}) : null,
  ]});
};
