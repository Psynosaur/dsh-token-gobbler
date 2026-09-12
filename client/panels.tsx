// token-gobbler · client/panels.tsx
// Table producers (by-model / by-day / by-session / comparison), the editable
// pricing tab, and the small cost card used by the cost/performance panels.
// All tables render through the shared TgTable (client/table.tsx); the
// per-session column sets live in client/session-table.tsx.
import { fmt, fmtC, money, fmtMs, thL, thR, tdL, tdR, humanizeModel } from "./core";
import { TgTable } from "./table";
import { sessionCostColumns } from "./session-table";
import { sessionDrawer } from "./drawers";
import { AmBarChart } from "./amchart";

export const realModelTable = (byModel: any[]) => jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
  jsx("tr", { children: [thL("Model"), thL("Kind"), thR("Sessions"), thR("In"), thR("Out"), thR("CacheR"), thR("Speed"), thR("Cost")] }),
  ...(byModel || []).map((m) => jsxs("tr", {
    className: "tg-tr",
    children: [
      tdL(m.label, { style: { maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
      tdL(jsx("span", { className: "tg-kind", style: { color: m.kind === "corp" ? "#f87171" : "#34d399" }, children: m.kind === "corp" ? "corp" : "local" })),
      tdR(String(m.sessions)),
      tdR(fmtC(m.uncachedInputTokens), { title: fmt(m.uncachedInputTokens) }),
      tdR(fmtC(m.outputTokens), { title: fmt(m.outputTokens) }),
      tdR(fmtC(m.cacheReadTokens), { title: fmt(m.cacheReadTokens) }),
      tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "—", { title: "streamed output tokens per second of decode time (trajectory chunk timestamps)" }),
      tdR(m.cost != null ? money(m.cost) : "unpriced", { style: { fontWeight: 700, color: m.cost != null ? "#f8fafc" : "#fbbf24" } }),
    ],
  }, m.model)),
]})});

export const perfModelTable = (rows: any[]) => jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
  jsx("tr", { children: [thL("Model"), thL("Kind"), thR("Steps"), thR("Streamed"), thR("Decode"), thR("New ctx"), thR("Prefill"), thR("Avg TTFT"), thR("Avg context")] }),
  ...(rows || []).map((m) => jsxs("tr", {
    className: "tg-tr",
    children: [
      tdL(m.label, { style: { maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
      tdL(jsx("span", { className: "tg-kind", style: { color: m.kind === "corp" ? "#f87171" : "#34d399" }, children: m.kind === "corp" ? "corp" : "local" })),
      tdR(String(m.steps)),
      tdR(fmtC(m.decodeTokens), { title: fmt(m.decodeTokens) + " streamed output tokens" }),
      tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "—", { style: { fontWeight: 700 }, title: "streamed output tokens ÷ decode time (first→last chunk)" }),
      tdR(fmtC(m.prefillTokens), { title: fmt(m.prefillTokens) + " new (uncached) input tokens" }),
      tdR(m.promptTokPerSec != null ? m.promptTokPerSec + " tok/s" : "—", { style: { fontWeight: 700 }, title: "new (uncached) input tokens ÷ TTFT (request→first token). TTFT includes network + queue, so this is a lower bound on true prefill speed." }),
      tdR(m.avgTtftMs != null ? fmtMs(m.avgTtftMs) : "—", { title: "average time from request to first token" }),
      tdR(m.avgContext != null ? fmtC(m.avgContext) : "—", { title: "average full prompt size per step (uncached + cached)" }),
    ],
  }, m.model)),
]})});

// Cost-by-model breakdown: one row per model carrying the usage buckets (in /
// out / think / cache), the money cost, and the speed columns (decode, prefill,
// avg TTFT) — the cost-side counterpart of performance's "Show model table".
// Ends with a Total row (weighted speeds: totals ÷ total time).
export const costModelTable = (rows: any[]) => {
  const R = rows || [];
  const tot = R.reduce((a: any, m: any) => {
    a.sessions += m.sessions || 0;
    a.steps += m.steps || 0;
    a.in += m.uncachedInputTokens || 0;
    a.out += m.outputTokens || 0;
    a.think += m.reasoningTokens || 0;
    a.cache += m.cacheReadTokens || 0;
    a.cost += m.cost != null ? m.cost : 0;
    a.decodeMs += m.decodeMs || 0;
    a.decodeTokens += m.decodeTokens || 0;
    a.prefillMs += m.prefillMs || 0;
    a.prefillTokens += m.prefillTokens || 0;
    a.prefillSteps += m.prefillSteps || 0;
    return a;
  }, { sessions: 0, steps: 0, in: 0, out: 0, think: 0, cache: 0, cost: 0, decodeMs: 0, decodeTokens: 0, prefillMs: 0, prefillTokens: 0, prefillSteps: 0 });
  const allPriced = R.length > 0 && R.every((m: any) => m.cost != null);
  const decTps = tot.decodeMs > 0 ? Math.round((tot.decodeTokens / (tot.decodeMs / 1000)) * 10) / 10 : null;
  const preTps = tot.prefillMs > 0 ? Math.round((tot.prefillTokens / (tot.prefillMs / 1000)) * 10) / 10 : null;
  const avgTtft = tot.prefillSteps > 0 ? Math.round(tot.prefillMs / tot.prefillSteps) : null;
  const rt = (tot.decodeMs + tot.prefillMs) > 0 ? (tot.decodeMs + tot.prefillMs) : null;
  const cstyle: any = { fontWeight: 700, color: "#f8fafc" };
  return jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [
      thL("Model"), thL("Kind"), thR("Sessions · Steps"), thR("In"), thR("Out"), thR("Think"), thR("Cache"), thR("Cost"), thR("Run time"), thR("Decode"), thR("Prefill"), thR("Avg TTFT"),
    ] }),
    ...R.map((m: any) => jsxs("tr", {
      className: "tg-tr",
      children: [
        tdL(m.label, { style: { maxWidth: 210, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
        tdL(jsx("span", { className: "tg-kind", style: { color: m.kind === "corp" ? "#f87171" : "#34d399" }, children: m.kind === "corp" ? "corp" : "local" })),
        tdR(m.sessions + " · " + m.steps, { style: { fontWeight: 600 }, title: m.sessions + " session(s) · " + m.steps + " LLM steps" }),
        tdR(fmtC(m.uncachedInputTokens), { title: fmt(m.uncachedInputTokens) + " new (uncached) input tokens" }),
        tdR(fmtC(m.outputTokens), { title: fmt(m.outputTokens) + " output tokens" }),
        tdR(m.reasoningTokens > 0 ? fmtC(m.reasoningTokens) : "—", { title: fmt(m.reasoningTokens) + " reasoning / thinking tokens (a subdivision of Out)" }),
        tdR(fmtC(m.cacheReadTokens), { title: fmt(m.cacheReadTokens) + " cache read · " + fmt(m.cacheWriteTokens) + " cache write tokens" }),
        tdR(m.cost != null ? money(m.cost) : "unpriced", { style: { fontWeight: 700, color: m.cost != null ? "#f8fafc" : "#fbbf24" } }),
        tdR((m.decodeMs || 0) + (m.prefillMs || 0) > 0 ? fmtMs((m.decodeMs || 0) + (m.prefillMs || 0)) : "—", { title: "total runtime = sum of (TTFT + decode) across this model's steps — decode already contains the thinking window" }),
        tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "—", { style: { fontWeight: 700 }, title: "decode speed — streamed output tokens ÷ decode time (first→last chunk)" }),
        tdR(m.promptTokPerSec != null ? m.promptTokPerSec + " tok/s" : "—", { style: { fontWeight: 700 }, title: "prefill speed — new (uncached) input tokens ÷ TTFT. TTFT includes network + queue, so this is a lower bound on true prefill rate." }),
        tdR(m.avgTtftMs != null ? fmtMs(m.avgTtftMs) : "—", { title: "average time from request to first token" }),
      ],
    }, m.model)),
    R.length ? jsx("tr", {
      className: "tg-tr tg-total",
      children: [
        tdL("Total", { style: { fontWeight: 800, color: "#fbbf24" } }),
        tdL(jsx("span", { className: "tg-faint", children: "—" })),
        tdR(tot.sessions + " · " + tot.steps, { style: cstyle }),
        tdR(fmtC(tot.in), { style: cstyle }),
        tdR(fmtC(tot.out), { style: cstyle }),
        tdR(fmtC(tot.think), { style: cstyle }),
        tdR(fmtC(tot.cache), { style: cstyle }),
        tdR(allPriced ? money(tot.cost) : "unpriced", { style: { fontWeight: 800, color: allPriced ? "#fde68a" : "#fbbf24" } }),
        tdR(rt != null ? fmtMs(rt) : "—", { style: cstyle }),
        tdR(decTps != null ? decTps + " tok/s" : "—", { style: cstyle }),
        tdR(preTps != null ? preTps + " tok/s" : "—", { style: cstyle }),
        tdR(avgTtft != null ? fmtMs(avgTtft) : "—", { style: cstyle }),
      ],
    }) : null,
  ]})});
};

export const perfSessionTable = (rows: any[]) => {
  if (!rows || !rows.length) return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No per-step timing recorded yet — only sessions with per-turn usage carry speed data." });
  return jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [thL("Date"), thL("Session"), thL("Model"), thL("Kind"), thR("Steps"), thR("Decode"), thR("Prefill"), thR("Avg TTFT")] }),
    ...rows.flatMap((s: any) => s.models.map((m: any) => jsxs("tr", {
      className: "tg-tr",
      children: [
        tdL(s.date, { style: { fontWeight: 600 } }),
        tdL(jsxs("div", { style: { maxWidth: 300, whiteSpace: "normal", wordBreak: "break-word" }, children: [
          jsx("div", { style: { fontWeight: 600 }, children: s.title || s.cwd }),
          jsxs("div", { className: "tg-faint", style: { fontSize: 11, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }, children: [
            s.cwd,
            s.modelCount > 1 ? jsx("span", { style: { color: "#fbbf24", fontWeight: 700, marginLeft: 8 }, children: "⇄ " + s.modelCount + " models" }, s.id + ":sw") : null,
          ]}),
        ]})),
        tdL(m.label, { style: { maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
        tdL(jsx("span", { className: "tg-kind", style: { color: m.kind === "corp" ? "#f87171" : "#34d399" }, children: m.kind === "corp" ? "corp" : "local" })),
        tdR(String(m.steps)),
        tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "—", { title: "streamed output tokens ÷ decode time" }),
        tdR(m.promptTokPerSec != null ? m.promptTokPerSec + " tok/s" : "—", { title: "new (uncached) input tokens ÷ TTFT" }),
        tdR(m.avgTtftMs != null ? fmtMs(m.avgTtftMs) : "—"),
      ],
    }, s.id + ":" + m.model)))
  ]})});
};

export const comparisonTable = (comparison: any[]) => {
  // Sort by cost descending, show top 10 most expensive (baseline always shown)
  const rows = comparison || [];
  const baseline = rows.find((c) => c.baseline);
  const others = rows.filter((c) => !c.baseline);
  others.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
  const shown = baseline ? [baseline, ...others.slice(0, 9)] : others.slice(0, 10);
  return jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [thL("Model"), thR("$/M in"), thR("$/M out"), thR("$/M cacheR"), thR("Cost"), thR("You save")] }),
    ...shown.map((c) => jsxs("tr", {
      className: "tg-tr",
      style: c.baseline ? { background: "rgba(16,185,129,0.06)" } : undefined,
      children: [
        tdL(c.label + (c.estimated ? " (est.)" : ""), { style: { maxWidth: 240, whiteSpace: "normal", wordBreak: "break-word", fontWeight: c.baseline ? 700 : 600, color: c.baseline ? "#34d399" : undefined } }),
        tdR(c.pricing ? String(c.pricing.input) : "—"),
        tdR(c.pricing ? String(c.pricing.output) : "—"),
        tdR(c.pricing ? String(c.pricing.cacheRead) : "—"),
        tdR(c.priced ? money(c.cost) : "unpriced", { style: { fontWeight: 700, color: c.priced ? "#f8fafc" : "#fbbf24" } }),
        tdR(c.baseline ? "baseline" : (c.savings != null ? money(c.savings) : "—"), { style: { fontWeight: 700, color: c.baseline ? "#64748b" : "#34d399" } }),
      ],
    }, c.id)),
  ]}) });
};

// Sessions / Cost-by-session table: the shared session columns (buckets + cost)
// on the generic TgTable — paging off, expand → sessionDrawer.
export const sessionTable = (bySession: any[], openId: string | null, onToggle: (k: string | null) => void) => TgTable({
  columns: sessionCostColumns,
  rows: bySession || [],
  rowKey: (s: any) => s.id,
  expandedId: openId, onToggle,
  drawer: sessionDrawer,
  empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No sessions recorded yet." }),
  rowClass: (s: any) => (s.archived ? "tg-archived" : ""),
});

export const dayTable = (byDay: any[]) => jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
  jsx("tr", { children: [thL("Day"), thR("Sessions"), thR("Input"), thR("Output"), thR("Cache read"), thR("Cache write"), thR("Total"), thR("Cost")] }),
  ...(byDay || []).map((d) => jsxs("tr", { className: "tg-tr", children: [
    tdL(d.date, { style: { fontWeight: 600 } }),
    tdR(String(d.sessions)),
    tdR(fmtC(d.uncachedInputTokens), { title: fmt(d.uncachedInputTokens) }),
    tdR(fmtC(d.outputTokens), { title: fmt(d.outputTokens) }),
    tdR(fmtC(d.cacheReadTokens), { title: fmt(d.cacheReadTokens) }),
    tdR(fmtC(d.cacheWriteTokens), { title: fmt(d.cacheWriteTokens) }),
    tdR(fmtC(d.allTokens), { style: { fontWeight: 700 }, title: fmt(d.allTokens) }),
    tdR(d.cost != null ? money(d.cost) : "—", { style: { fontWeight: 600, color: "#fde68a" } }),
  ] }, d.date)),
]})});

export const dayChart = (byDay: any[]) => {
  // Sort by date descending (most recent first)
  const sorted = [...(byDay || [])].sort((a, b) => b.date.localeCompare(a.date));
  return jsx(AmBarChart, {
    data: sorted,
    categoryField: "date",
    kind: "column",
    unit: "USD",
    series: [{ key: "cost", label: "Cost", color: "#fbbf24", unit: "USD" }],
    height: 200,
  });
};

// The session's activity timestamp (ms): last prompt when it is later than the
// creation time, else the creation time — the same anchor lib/report.ts uses to
// bucket a session onto a calendar day.
const sessionTime = (s: any): number | null => {
  const rawLast = s.meta && s.meta.lastPromptAt != null ? s.meta.lastPromptAt : null;
  const last = typeof rawLast === "string" ? Date.parse(rawLast) : rawLast;
  const created = typeof s.createdAt === "number" ? s.createdAt : null;
  const ms = last != null && created != null && last > created ? last : (created != null ? created : last);
  return ms != null && isFinite(ms) ? ms : null;
};
// "MM-DD HH:MM" — the date plus its hour slot. The minute keeps every session
// bar on its own category slot (amCharts collapses duplicate categories, which
// would overlap two sessions started in the same hour).
const slotLabel = (s: any): string => {
  const ms = sessionTime(s);
  if (ms == null) return s.date || "unknown";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
};

export const sessionChart = (bySession: any[]) => {
  // Newest → oldest so the LATEST activity sits at the LEFT edge of the plot,
  // matching the Cost-by-day chart beside it; sessions with no timestamp fall
  // back to their date string.
  const rows = (bySession || [])
    .map((s: any) => ({ s, ms: sessionTime(s) }))
    .sort((a: any, b: any) => {
      if (a.ms != null && b.ms != null) return b.ms - a.ms;
      return String(b.s.date || "").localeCompare(String(a.s.date || ""));
    });
  // Sum any sessions sharing the exact same slot label so the bars never collide.
  const bySlot = new Map<string, { label: string; cost: number }>();
  for (const r of rows) {
    const label = slotLabel(r.s);
    const e = bySlot.get(label);
    if (e) e.cost += r.s.cost ?? 0;
    else bySlot.set(label, { label, cost: r.s.cost ?? 0 });
  }
  const data = [...bySlot.values()];
  return jsx(AmBarChart, {
    data: data,
    categoryField: "label",
    kind: "column",
    unit: "USD",
    columnWidth: 42,
    series: [{ key: "cost", label: "Cost", color: "#fbbf24", unit: "USD" }],
    height: 200,
  });
};

export const costCard = (label: string, value: any, sub: any, color: string) => jsxs("div", { className: "tg-card tg-stat", children: [
  jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
    jsx("span", { className: "tg-stat-dot", style: { background: color } }),
    jsx("span", { className: "tg-label", children: label }),
  ]}),
  jsx("div", { className: "tg-stat-value tg-num", children: value }),
  sub ? jsx("div", { style: { color: "#94a3b8", fontSize: 11, marginTop: 5 }, children: sub }) : null,
]});

export interface PricingProps {
  draft: any;
  setDraft: (updater: any) => void;
  saving: boolean;
  saveMsg: any;
  onSave: () => void;
  addRow: any;
  setAddRow: (updater: any) => void;
  onAdd: () => void;
  unpriced: any[];
  onPrefill: (id: string, label: string) => void;
  pricingPath: string | null;
  fromFile: boolean;
  discovering: boolean;
  discoverMsg: any;
  onDiscover: () => void;
}

// one editable rate field (label + decimal input). Uses a text input with
// inputMode=decimal and keeps the RAW string while typing — coercing on every
// keystroke (the old type=number + numOrEmpty path) ate the "." so you could
// never enter 0.25. We parse + clamp to >= 0 on blur; the server re-coerces on save.
const rateField = (label: string, value: any, onCommit: (v: any) => void) =>
  jsxs("div", { className: "tg-rate-field", children: [
    jsx("span", { className: "tg-faint", style: { fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }, children: label }),
    jsx("input", {
      className: "tg-input tg-input-num",
      type: "text", inputMode: "decimal", placeholder: "0", autoComplete: "off",
      value: value === "" ? "" : String(value),
      onChange: (e: any) => onCommit(e.target.value),
      onBlur: (e: any) => { const x = Number(e.target.value); onCommit(e.target.value === "" || !Number.isFinite(x) ? "" : Math.max(0, x)); },
    }),
  ]});

const modelCard = (m: any, patch: (id: string, p: any) => void, remove: (id: string) => void, isRef: boolean, canRemove: boolean) =>
  jsxs("div", {
    className: "tg-card",
    style: { padding: "13px 15px", display: "flex", flexDirection: "column", gap: 11, minWidth: 0, border: isRef ? "1px solid rgba(251,191,36,0.5)" : undefined, background: isRef ? "linear-gradient(180deg,rgba(251,191,36,0.08),rgba(255,255,255,0.02))" : undefined },
    children: [
      jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }, children: [
        jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          // The model's own name is the card title (derived from its id).
          jsx("div", { style: { fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.25, wordBreak: "break-word" }, children: humanizeModel(m.id || m.label) }),
          jsxs("input", { className: "tg-input tg-input-label", value: m.label, onChange: (e: any) => patch(m.id, { label: e.target.value }), placeholder: "custom display name", style: { marginTop: 3, fontSize: 11.5, color: "#94a3b8" } }),
          jsxs("div", { style: { marginTop: 5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
            isRef ? jsx("span", { className: "tg-kind-badge", style: { background: "rgba(251,191,36,0.14)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }, children: "★ reference" }) : null,
            jsx("span", { style: { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 10.5, color: "#64748b", wordBreak: "break-all" }, children: m.id }),
            m.provider ? jsx("span", { className: "tg-kind-badge", style: { background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)", color: "#2dd4bf" }, children: m.provider }) : null,
          ]}),
        ]}),
        jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          jsxs("select", { className: "tg-input", style: { minWidth: 78, cursor: "pointer", fontWeight: 600 }, title: "corp = billed at this rate; local = home lab — priced at its configured rates, kept in the performance analysis",
            value: m.local ? "local" : "corp",
            onChange: (e: any) => patch(m.id, e.target.value === "local" ? { local: true, corp: false } : { local: false, corp: true }),
            children: [
              jsx("option", { value: "local", children: "local" }),
              jsx("option", { value: "corp", children: "corp" }),
            ] }),
          canRemove ? jsx("button", { className: "tg-del", title: "Remove " + m.id, onClick: () => remove(m.id), children: "✕" }) : null,
        ]}),
      ]}),
      jsxs("div", { className: "tg-rate-grid", children: [
        rateField("$/M in", m.input, (v) => patch(m.id, { input: v })),
        rateField("$/M out", m.output, (v) => patch(m.id, { output: v })),
        rateField("$/M cacheR", m.cacheRead, (v) => patch(m.id, { cacheRead: v })),
        rateField("$/M cacheW", m.cacheWrite, (v) => patch(m.id, { cacheWrite: v })),
      ]}),
      jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 11 }, children: [
        jsx("input", { type: "checkbox", checked: !!m.estimated, onChange: (e: any) => patch(m.id, { estimated: e.target.checked }), style: { accentColor: "#fbbf24", cursor: "pointer" } }),
        jsx("span", { children: "estimated" }),
      ]}),
    ],
  }, m.id);

export const pricingTab = (p: PricingProps) => {
  const d = p.draft;
  if (!d) return jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Loading pricing table…" });
  // A valid baseline id: the user's choice when it's still a local row, else the
  // first local row. Keeps the selector + save always consistent.
  const effectiveBaseline = (x: any) => {
    const models = (x && x.models) || [];
    const has = models.some((m: any) => m.id === x.baselineModel && m.local && m.id !== "local-free");
    return has ? x.baselineModel : ((models.find((m: any) => m.local && m.id !== "local-free") || {}).id || null);
  };
  const patchModel = (id: string, patch: any) => p.setDraft((x: any) => {
    if (!x) return x;
    const models = x.models.map((m: any) => (m.id === id ? { ...m, ...patch } : m));
    // A model that stops being local can no longer be the baseline.
    const baselineModel = id === x.baselineModel && !models.find((m: any) => m.id === id && m.local)
      ? ((models.find((m: any) => m.local && m.id !== "local-free") || {}).id || null)
      : x.baselineModel;
    return { ...x, models, baselineModel };
  });
  const removeModel = (id: string) => p.setDraft((x: any) => {
    if (!x) return x;
    const models = x.models.filter((m: any) => m.id !== id);
    let referenceModel = x.referenceModel;
    // Only fall back to a corp (non-local) model — the reference must be a billed rate
    // card. If no corp model remains, clear it (the user must pick one) rather than
    // silently landing on a local row.
    if (referenceModel === id) referenceModel = (models.find((m: any) => !m.local) || {}).id || null;
    const baselineModel = id === x.baselineModel
      ? ((models.find((m: any) => m.local && m.id !== "local-free") || {}).id || null)
      : x.baselineModel;
    return { ...x, models, referenceModel, baselineModel };
  });
  const refOptions = d.models.filter((m: any) => !m.local);
  const baseOptions = d.models.filter((m: any) => m.local && m.id !== "local-free");
  const baseValue = effectiveBaseline(d);
  return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    jsxs("div", { className: "tg-card tg-refrow", children: [
      jsxs("div", { style: { flex: 1, minWidth: 240 }, children: [
        jsx("div", { className: "tg-label", style: { color: "#fbbf24", marginBottom: 5 }, children: "★ WFH reference model" }),
        jsx("div", { style: { color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }, children: "Local (home-lab) compute is valued against this rate card — the “what the corp would've billed” number behind every WFH savings figure." }),
      ]}),
      jsx("select", {
        className: "tg-input", style: { minWidth: 250, cursor: "pointer" },
        value: d.referenceModel,
        onChange: (e: any) => p.setDraft((x: any) => (x ? { ...x, referenceModel: e.target.value } : x)),
        children: refOptions.map((m: any) => jsx("option", { value: m.id, children: m.label }, m.id)),
      }),
      jsx("div", { style: { width: "100%", height: 1, background: "rgba(255,255,255,0.07)" } }),
      jsxs("div", { style: { flex: 1, minWidth: 240 }, children: [
        jsx("div", { className: "tg-label", style: { color: "#34d399", marginBottom: 5 }, children: "★ Local baseline model" }),
        jsx("div", { style: { color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }, children: "The home-lab model the comparison table marks as “baseline” — every “You save” figure is how much cheaper local runs than the paid cards. Pick the model your local compute actually metered." }),
      ]}),
      jsx("select", {
        className: "tg-input", style: { minWidth: 250, cursor: "pointer" },
        value: baseValue || "",
        onChange: (e: any) => p.setDraft((x: any) => (x ? { ...x, baselineModel: e.target.value || null } : x)),
        children: baseOptions.length
          ? baseOptions.map((m: any) => jsx("option", { value: m.id, children: m.label }, m.id))
          : [jsx("option", { value: "", children: "— no local model —" })],
      }),
    ]}),
    jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", children: "Rate cards — $ per 1M tokens" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "Saved to " + (p.pricingPath || "your DSH home") + " · " + (d.fromFile ? "custom table (file)" : d.seeded ? "seeded from your trajectories (not saved yet)" : "built-in table (not saved yet)") }),
      ]}),
      jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
        jsx("button", { className: "tg-reprocess", onClick: p.onDiscover, disabled: p.discovering, children: p.discovering ? "Scanning…" : "🔎 Scan trajectories for all models" }),
        p.discoverMsg ? jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: p.discoverMsg }) : null,
        jsx("button", { className: "tg-refresh", onClick: p.onSave, disabled: p.saving, children: p.saving ? "Saving…" : "💾 Save rates" }),
        p.saveMsg ? jsx("span", { className: p.saveMsg.kind === "ok" ? "tg-flash-ok" : "tg-flash-err", children: p.saveMsg.text }) : null,
      ]}),
    ]}),
    d.models.length ? jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 12 }, children: d.models.map((m: any) => modelCard(m, patchModel, removeModel, d.referenceModel === m.id, true)) }) : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No rate cards yet — scan trajectories or add a model." }),
    jsxs("div", { className: "tg-card", style: { padding: "14px 16px" }, children: [
      jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Add a model (any model without a rate card yet — e.g. a new Copilot or API model)" }),
      jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
        jsx("input", { className: "tg-input tg-input-id", style: { width: 190 }, placeholder: "model id (claude-sonnet-5)", value: p.addRow.id, onChange: (e: any) => p.setAddRow((r: any) => ({ ...r, id: e.target.value })) }),
        jsx("input", { className: "tg-input", style: { width: 150 }, placeholder: "Label", value: p.addRow.label, onChange: (e: any) => p.setAddRow((r: any) => ({ ...r, label: e.target.value })) }),
        jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "in", autoComplete: "off", value: p.addRow.input, onChange: (e: any) => p.setAddRow((r: any) => ({ ...r, input: e.target.value })) }),
        jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "out", autoComplete: "off", value: p.addRow.output, onChange: (e: any) => p.setAddRow((r: any) => ({ ...r, output: e.target.value })) }),
        jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "cacheR", autoComplete: "off", value: p.addRow.cacheRead, onChange: (e: any) => p.setAddRow((r: any) => ({ ...r, cacheRead: e.target.value })) }),
        jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "cacheW", autoComplete: "off", value: p.addRow.cacheWrite, onChange: (e: any) => p.setAddRow((r: any) => ({ ...r, cacheWrite: e.target.value })) }),
        jsx("select", { className: "tg-input", style: { minWidth: 80, cursor: "pointer" }, value: p.addRow.kind || "corp", onChange: (e: any) => p.setAddRow((r: any) => ({ ...r, kind: e.target.value })), children: [ jsx("option", { value: "corp", children: "corp" }), jsx("option", { value: "local", children: "local" }) ] }),
        jsx("button", { className: "tg-ghost", onClick: p.onAdd, children: "+ Add model" }),
      ]}),
    ]}),
    p.unpriced.length ? jsxs("div", { children: [
      jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Models in your usage with no rate card (click to add)" }),
      jsx("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: p.unpriced.map((m: any) => jsxs("span", {
        className: "tg-chip", style: { cursor: "pointer" },
        onClick: () => p.onPrefill(m.model, m.label),
        children: [
          jsx("span", { className: "tg-chip-label", children: m.label + " · " + m.model }),
          jsx("span", { className: "tg-chip-value", style: { color: "#fbbf24" }, children: "+ add" }),
        ],
      }, m.model)) }),
    ]}) : null,
  ]});
};
