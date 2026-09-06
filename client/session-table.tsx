// token-gobbler · client/session-table.tsx
// The shared per-session table: one column set (Date | Session | Models |
// Steps | [Turns] | [Decode] | [Prefill] | [Runtime] | [Total]) + the shared
// speed math, rendered through the generic TgTable (paging, expand, drawer and
// all table CSS live in table.tsx). Every session-backed tab — Performance,
// Tokens, Combined, Daily, Sessions, Cost — builds its table from this instead
// of hand-rolling rows, chevrons and drawer rows.
import { fmt, fmtC, fmtMs, money } from "./core";
import { TgTable, type Column } from "./table";

/** Session prefill speed = new (uncached) input tokens ÷ TTFT across all steps
 *  that carry timing (ratio of sums — same math as the server aggregates, so a
 *  step without timestamps contributes nothing). TTFT includes network + queue,
 *  so this is a lower bound on true prefill. */
export const sessionPrefill = (s: any): string => {
  const steps = s.steps || [];
  let tok = 0, ms = 0;
  for (const st of steps) { if (st.ttftMs > 0) { tok += (st.in || 0); ms += st.ttftMs; } }
  return ms > 0 ? Math.round((tok / (ms / 1000)) * 10) / 10 + " tok/s" : "—";
};

/** Session runtime = sum of (TTFT + decode time) across all steps. The decode
 *  window already contains the thinking phase, so nothing is added twice. */
export const sessionRuntime = (s: any): string => {
  const steps = s.steps || [];
  let ms = 0, has = false;
  for (const st of steps) { const v = (st.ttftMs || 0) + (st.decodeMs || 0); if (v > 0) has = true; ms += v; }
  return has ? fmtMs(ms) : "—";
};

export interface SessionColumnsOpts {
  turns?: boolean;   // extra "Turns" column (Performance tab)
  decode?: boolean;  // "Decode" tok/s
  prefill?: boolean; // "Prefill" tok/s
  runtime?: boolean; // "Runtime" (TTFT + decode)
  total?: boolean;   // "Total" tokens
}

/** Session title cell — archived sessions (archived in the DSH GUI) get a 📦 marker. */
const sessionTitle = (s: any) => s.archived
  ? jsxs("span", { title: "archived in DSH", children: [jsx("span", { className: "tg-archived-badge" }, "📦"), " ", s.title || s.cwd || s.id] })
  : (s.title || s.cwd || s.id);

/** The shared session column set. Default = the Daily/Combined shape:
 *  Date | Session | Models | Steps | Decode | Prefill | Runtime | Total. */
export const sessionColumns = (o: SessionColumnsOpts = {}): Column[] => {
  const { turns = false, decode = true, prefill = true, runtime = true, total = true } = o;
  return [
    { key: "date", label: "Date" },
    { key: "title", label: "Session", render: sessionTitle },
    { key: "modelMix", label: "Models", render: (s: any) => s.modelMix },
    turns ? { key: "turns", label: "Turns", align: "r" as const, render: (s: any) => (s.stepTree || []).length || "—" } : null,
    { key: "steps", label: "Steps", align: "r" as const, render: (s: any) => s.events ? (s.events.steps || 0) : "—" },
    decode ? { key: "tokPerSec", label: "Decode", align: "r" as const, render: (s: any) => s.tokPerSec != null ? s.tokPerSec + " tok/s" : "—" } : null,
    prefill ? { key: "prefillPerSec", label: "Prefill", align: "r" as const, render: sessionPrefill, props: (s: any) => ({ title: "prompt processing = new (uncached) input tokens ÷ TTFT across all " + (s.steps || []).length + " step(s)" }) } : null,
    runtime ? { key: "runtime", label: "Runtime", align: "r" as const, render: sessionRuntime, props: { title: "session runtime = sum of (TTFT + decode time) across all steps — decode already contains the thinking window, so it is not added again" } } : null,
    total ? { key: "allTokens", label: "Total", align: "r" as const, render: (s: any) => fmtC(s.allTokens), props: { style: { fontWeight: 600 } } } : null,
  ].filter(Boolean) as Column[];
};

/** Session column set for the Sessions / Cost tabs: the token buckets + cost
 *  instead of the speed columns. */
export const sessionCostColumns: Column[] = [
  { key: "date", label: "Date" },
  { key: "title", label: "Session", render: sessionTitle, props: (s: any) => ({ style: { maxWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }, title: (s.archived ? "archived in DSH — " : "") + (s.title || s.cwd || s.id) }) },
  { key: "modelMix", label: "Models used", render: (s: any) => s.modelMix, props: (s: any) => ({ style: { maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word", fontSize: 12, color: "#94a3b8" }, title: (s.models || []).map((m: any) => (m.label || m.key) + " ×" + m.steps).join("\n") }) },
  { key: "steps", label: "Steps", align: "r", render: (s: any) => s.events ? String(s.events.steps || 0) : "—" },
  { key: "tools", label: "Tools", align: "r", render: (s: any) => s.events ? String((s.events.toolCalls || 0) + (s.events.toolSubCalls || 0)) : "—" },
  { key: "tin", label: "In", align: "r", render: (s: any) => fmtC(s.uncachedInputTokens), props: (s: any) => ({ title: fmt(s.uncachedInputTokens) }) },
  { key: "tout", label: "Out", align: "r", render: (s: any) => fmtC(s.outputTokens), props: (s: any) => ({ title: fmt(s.outputTokens) }) },
  { key: "tcache", label: "CacheR", align: "r", render: (s: any) => fmtC(s.cacheReadTokens), props: (s: any) => ({ title: fmt(s.cacheReadTokens) }) },
  { key: "allTokens", label: "Total", align: "r", render: (s: any) => fmtC(s.allTokens), props: (s: any) => ({ style: { fontWeight: 700 }, title: fmt(s.allTokens) }) },
  { key: "cost", label: "Cost", align: "r", render: (s: any) => s.cost != null ? money(s.cost) : "—", props: { style: { fontWeight: 600, color: "#fde68a" } } },
];

export interface SessionTableOpts {
  rows: any[];
  expandedId?: string | null;
  onToggle?: (k: string | null) => void;
  drawer?: (r: any) => any;
  page?: number;
  setPage?: (p: number) => void;
  pageSize?: number;
  empty?: any;
  /** Column-set switches for sessionColumns (default = Daily/Combined shape). */
  columns?: SessionColumnsOpts;
}

/** The per-session table on the shared column set — TgTable + sessionColumns.
 *  Paging, row expand, the drawer row and all table styling come from TgTable. */
export const SessionTable = (o: SessionTableOpts) =>
  TgTable({
    columns: sessionColumns(o.columns),
    rows: o.rows,
    rowKey: (s: any) => s.id,
    expandedId: o.expandedId, onToggle: o.onToggle,
    drawer: o.drawer,
    page: o.page, setPage: o.setPage, pageSize: o.pageSize,
    empty: o.empty,
    rowClass: (s: any) => (s.archived ? "tg-archived" : ""),
  });
