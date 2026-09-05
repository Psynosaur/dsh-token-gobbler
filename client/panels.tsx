// token-gobbler · client/panels.tsx
// Table producers (by-model / by-day / by-session / comparison), the editable
// pricing tab, and the small cost card used by the cost/performance panels.
import { fmt, fmtC, money, fmtMs, thL, thR, tdL, tdR, humanizeModel } from "./core";
import { sessionDrawer } from "./drawers";

export const realModelTable = (byModel: any[]) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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

export const perfModelTable = (rows: any[]) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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

export const perfSessionTable = (rows: any[]) => {
  if (!rows || !rows.length) return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No per-step timing recorded yet — only sessions with per-turn usage carry speed data." });
  return jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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

export const comparisonTable = (comparison: any[]) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
  jsx("tr", { children: [thL("Model"), thR("$/M in"), thR("$/M out"), thR("$/M cacheR"), thR("Cost"), thR("You save")] }),
  ...(comparison || []).map((c) => jsxs("tr", {
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
]})});

export const sessionTable = (bySession: any[], openId: string | null, onToggle: (k: string | null) => void) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
  jsx("tr", { children: [thL(""), thL("Date"), thL("Session"), thL("Models used"), thR("Steps"), thR("Tools"), thR("In"), thR("Out"), thR("CacheR"), thR("Total"), thR("Cost")] }),
  ...(bySession || []).flatMap((s: any) => {
    const open = openId === s.id;
    const row = jsxs("tr", {
      className: "tg-tr tg-row-btn",
      style: open ? { background: "rgba(251,191,36,0.05)" } : undefined,
      onClick: () => { onToggle(open ? null : s.id); },
      children: [
        tdL(jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "▶" })),
        tdL(s.date),
        tdL(s.title || s.cwd || s.id, { style: { maxWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }, title: s.title || s.cwd || s.id }),
        tdL(s.modelMix, { style: { maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word", fontSize: 12, color: "#94a3b8" }, title: (s.models || []).map((m: any) => (m.label || m.key) + " ×" + m.steps).join("\n") }),
        tdR(s.events ? String(s.events.steps || 0) : "—"),
        tdR(s.events ? String((s.events.toolCalls || 0) + (s.events.toolSubCalls || 0)) : "—"),
        tdR(fmtC(s.uncachedInputTokens), { title: fmt(s.uncachedInputTokens) }),
        tdR(fmtC(s.outputTokens), { title: fmt(s.outputTokens) }),
        tdR(fmtC(s.cacheReadTokens), { title: fmt(s.cacheReadTokens) }),
        tdR(fmtC(s.allTokens), { style: { fontWeight: 700 }, title: fmt(s.allTokens) }),
        tdR(s.cost != null ? money(s.cost) : "—", { style: { fontWeight: 600, color: "#fde68a" } }),
      ],
    }, s.id);
    if (!open) return [row];
    return [row, jsx("tr", { className: "tg-drawer-row", children: jsx("td", { colSpan: 11, style: { padding: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }, children: sessionDrawer(s) }) }, s.id + "-drawer")];
  }),
]})});

export const dayTable = (byDay: any[]) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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
  const patchModel = (id: string, patch: any) => p.setDraft((x: any) => (x ? { ...x, models: x.models.map((m: any) => (m.id === id ? { ...m, ...patch } : m)) } : x));
  const removeModel = (id: string) => p.setDraft((x: any) => {
    if (!x) return x;
    const models = x.models.filter((m: any) => m.id !== id);
    let referenceModel = x.referenceModel;
    // Only fall back to a corp (non-local) model — the reference must be a billed rate
    // card. If no corp model remains, clear it (the user must pick one) rather than
    // silently landing on a local row.
    if (referenceModel === id) referenceModel = (models.find((m: any) => !m.local) || {}).id || null;
    return { ...x, models, referenceModel };
  });
  const refOptions = d.models.filter((m: any) => !m.local);
  return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    jsxs("div", { className: "tg-card tg-refrow", children: [
      jsx("div", { style: { flex: 1, minWidth: 240 }, children: [
        jsx("div", { className: "tg-label", style: { color: "#fbbf24", marginBottom: 5 }, children: "★ WFH reference model" }),
        jsx("div", { style: { color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }, children: "Local (home-lab) compute is valued against this rate card — the “what the corp would've billed” number behind every WFH savings figure." }),
      ]}),
      jsx("select", {
        className: "tg-input", style: { minWidth: 250, cursor: "pointer" },
        value: d.referenceModel,
        onChange: (e: any) => p.setDraft((x: any) => (x ? { ...x, referenceModel: e.target.value } : x)),
        children: refOptions.map((m: any) => jsx("option", { value: m.id, children: m.label }, m.id)),
      }),
      jsx("button", { className: "tg-refresh", onClick: p.onSave, disabled: p.saving, children: p.saving ? "Saving…" : "💾 Save rates" }),
      p.saveMsg ? jsx("span", { className: p.saveMsg.kind === "ok" ? "tg-flash-ok" : "tg-flash-err", children: p.saveMsg.text }) : null,
    ]}),
    jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", children: "Rate cards — $ per 1M tokens" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "Saved to " + (p.pricingPath || "your DSH home") + " · " + (d.fromFile ? "custom table (file)" : d.seeded ? "seeded from your trajectories (not saved yet)" : "built-in table (not saved yet)") }),
      ]}),
      jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        jsx("button", { className: "tg-reprocess", onClick: p.onDiscover, disabled: p.discovering, children: p.discovering ? "Scanning…" : "🔎 Scan trajectories for local models" }),
        p.discoverMsg ? jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: p.discoverMsg }) : null,
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
