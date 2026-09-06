// token-gobbler · client/drawers.tsx
// Expandable drawer content: the per-step (turn/step) tables, the session drawer
// (metadata + tools + per-step speed), and the Tokens drawer (collapsible turn →
// step table).
import { fmt, fmtC, fmtMs, thL, thR, tdL, tdR, eventChips, toolTable, request } from "./core";
import { sessionTokens } from "./agg";
import { AmBarChart, type AmSeries } from "./amchart";
import { Markdown } from "./markdown";

// Turn → step tree with tool calls + per-step prefill/decode. (server-reported
// timings were removed — all speeds are trajectory timestamps.)
export const stepTree = (s: any) => {
  const tree = s.stepTree || [];
  if (!tree.length) return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No step tree for this session." });
  const stepCell = (st: any) => jsxs("tr", { className: "tg-tr", children: [
    tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
    tdL(jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }, children: [
      ...(st.tools || []).map((t: string) => jsx("span", { className: "tg-chip", style: { fontSize: 10 }, children: t }, t)),
      st.parallel ? jsx("span", { className: "tg-chip", style: { fontSize: 10, color: "#fbbf24" }, children: "parallel" }, "parallel") : null,
    ]}), { title: st.parallel ? "multiple tools called after this step (parallel group)" : "single tool call after this step" }),
    tdR(fmtC(st.in)),
    tdR(fmtC(st.out)),
    tdR(st.thinking ? (st.thinkingEstimated ? "≈" : "") + fmtC(st.thinking) : "—", { style: { color: st.thinking ? "#c084fc" : undefined } }),
    tdR(st.prefillTokPerSec != null ? st.prefillTokPerSec + " tok/s" : "—", { style: { fontWeight: 600 } }),
    tdR(st.decodeTokPerSec != null ? st.decodeTokPerSec + " tok/s" : "—", { style: { fontWeight: 600 } }),
    tdR(st.decodeMs != null ? fmtMs(st.decodeMs) : "—"),
  ]}, st.turn + "-" + st.step);
  return jsxs("div", { children: tree.map((turn: any) => jsxs("div", { style: { marginBottom: 10 }, children: [
    jsx("div", { className: "tg-drawer-sub", children: "Turn " + turn.turn }),
    jsxs("table", { className: "tg-table", style: { fontSize: 12 }, children: [
      jsx("tr", { children: [thL("Step"), thL("Tools"), thR("In"), thR("Out"), thR("Think"), thR("Prefill"), thR("Decode"), thR("Dec time")] }),
      ...turn.steps.map(stepCell),
    ]}),
  ]}, turn.turn)) });
};

// ── Reusable collapse toggle (default collapsed) ──────────────────────────
// `onOpenChange` lets a parent react to the open state (e.g. surface an
// at-a-glance summary only while the table below is expanded).
export const Collapse = ({ label, children, defaultOpen, onOpenChange }: { label: any; children: any; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const toggle = () => { const n = !open; setOpen(n); if (onOpenChange) onOpenChange(n); };
  return jsxs("div", { className: "tg-collapse", children: [
    jsx("button", { className: "tg-collapse-head", onClick: toggle, children: [
      jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "▶" }),
      jsx("span", { children: label }),
    ]}),
    open ? jsx("div", { className: "tg-collapse-body", children }) : null,
  ]});
};

// ── Reusable token-spend series + chart ──────────────────────────────────
// The four token buckets in a fixed order + palette, shared by every
// "at a glance" token chart: the per-step breakdown (stacked area), the
// per-model spend summary on the Tokens tab, and the other tab summaries we
// will port later. `kind` / `stacked` / `height` vary per call site.
export const TOKEN_SERIES: AmSeries[] = [
  { key: "in", label: "In", color: "#60a5fa", unit: "tok" },
  { key: "out", label: "Out", color: "#a78bfa", unit: "tok" },
  { key: "cache", label: "Cache", color: "#2dd4bf", unit: "tok" },
  { key: "think", label: "Think", color: "#c084fc", unit: "tok" },
];

export type TokenSpendRow = { label: string; in: number; out: number; cache: number; think: number };

// Reusable: render token spend (in / out / cache / think) for a set of rows
// as a column chart — one grouped (or stacked) cluster of four bars per row.
// Drop-in for any tab that wants a token-spend summary across its rows.
export const TokenSpendChart = ({ rows, height = 240, stacked = false, rotate = false, horizontal = false, hideCategoryLabels = false }: { rows: TokenSpendRow[]; height?: number; stacked?: boolean; rotate?: boolean; horizontal?: boolean; hideCategoryLabels?: boolean }) =>
  jsx(AmBarChart, {
    data: rows.map((r) => ({ cat: r.label, in: r.in ?? 0, out: r.out ?? 0, cache: r.cache ?? 0, think: r.think ?? 0 })),
    categoryField: "cat",
    kind: "column",
    stacked,
    horizontal,
    hideCategoryLabels,
    rotateCategories: rotate,
    series: TOKEN_SERIES,
    height,
  });

const metaGrid = (meta: [string, any][]): any =>
  jsx("div", { className: "tg-meta-grid", children: meta.map(([k, v]) => (v == null || v === "" ? null : jsxs("div", { className: "tg-meta", children: [
    jsx("div", { className: "tg-meta-k", children: k }),
    jsx("div", { className: "tg-meta-v tg-num", children: v }),
  ]}, k))) });

export const sessionDrawer = (s: any) => {
  const m = s.meta || {};
  const meta: [string, any][] = [
    ["Project", s.cwd],
    ["Turns", s.turns || null],
    ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
    ["Tool time", m.toolMs ? fmtMs(m.toolMs) : null],
    ["TTFT avg", m.ttftSteps ? fmtMs(m.ttftMs / m.ttftSteps) : null],
    ["Decode", m.decodeMs ? fmtMs(m.decodeMs) + " · " + fmtC(m.decodeTokens) + " tok" : null],
    ["Speed", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
    ["Sandbox", m.sandbox],
    ["Approval", m.approval],
    ["Preset", m.preset || m.agentPreset],
    ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " · " + (m.lastUsedModel.provider || "?") : null],
    ["Goal", m.goal ? (m.goal.objective || m.goal.id || "active") : (m.goalFailure ? "failed: " + String(m.goalFailure) : null)],
    ["Plan mode", m.planActive ? "active" : null],
    ["Subagents", m.subagentCount ? String(m.subagentCount) + (m.subagentSettledMs ? " · " + fmtMs(m.subagentSettledMs) : "") : null],
    ["Last prompt", m.lastPromptAt ? new Date(m.lastPromptAt).toLocaleString("en-GB") : null],
    ["Context", m.contextPressure && m.contextPressure.contextWindow ? fmtC(m.contextPressure.surfaceTokens) + " / " + fmtC(m.contextPressure.contextWindow) + " (" + Math.round((100 * m.contextPressure.surfaceTokens) / m.contextPressure.contextWindow) + "%)" : null],
    ["Context mix", m.contextBreakdown ? fmtC(m.contextBreakdown.systemTokens) + " sys · " + fmtC(m.contextBreakdown.toolsTokens) + " tools · " + fmtC(m.contextBreakdown.messageTokens) + " msgs" : null],
    ["Seeded", m.isSeeded ? "yes" : null],
  ];
  const callRows = s.toolCalls || [];
  const codeRows = s.tools || [];
  return jsxs("div", { className: "tg-drawer-inner", children: [
    metaGrid(meta),
    s.events ? jsxs("div", { children: [
      jsx("div", { className: "tg-drawer-sec", children: "Events" }),
      eventChips(s.events),
    ]}) : null,
    (callRows.length || codeRows.length) ? jsxs("div", { children: [
      jsx("div", { className: "tg-drawer-sec", children: "Tools called in this session" }),
      jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
        jsxs("div", { children: [jsx("div", { className: "tg-drawer-sub", children: "Top-level calls" }), toolTable(callRows, false)] }),
        jsxs("div", { children: [jsx("div", { className: "tg-drawer-sub", children: "Code runs (dispatched)" }), toolTable(codeRows, false)] }),
      ]}),
    ]}) : null,
    (s.toolTokens && s.toolTokens.length) ? jsxs("div", { children: [
      jsx("div", { className: "tg-drawer-sec", children: "Tool payload per tool (actual call arguments)" }),
      jsxs("table", { className: "tg-table", style: { fontSize: 12 }, children: [
        jsx("tr", { children: [thL("Tool"), thR("Calls"), thR("Min"), thR("Avg"), thR("Max"), thR("Payload"), thR("Thinking")] }),
        ...s.toolTokens.map((t: any) => jsxs("tr", { className: "tg-tr", children: [
          tdL(t.tool, { style: { fontFamily: "monospace", fontSize: 11 } }),
          tdR(String(t.calls)),
          tdR(fmtC(t.min)), tdR(fmtC(t.avg)), tdR(fmtC(t.max)), tdR(fmtC(t.total), { style: { fontWeight: 600 } }),
          tdR(t.reasoning ? fmtC(t.reasoning) : "—", { style: { color: t.reasoning ? "#c084fc" : undefined } }),
        ]}, t.tool)),
      ]}),
      jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 4 }, children: "Payload = estimated tokens of the actual tool-call arguments the tool received (chars/4), NOT the whole LLM step's context. Thinking = reasoning tokens in the LLM step that invoked it." }),
    ]}) : null,
    (s.steps && s.steps.length) ? jsxs("div", { children: [
      jsx("div", { className: "tg-drawer-sec", children: "Per-step — prefill / decode speed + thinking" }),
      jsx("div", { className: "tg-scrollable", children: jsxs("table", { className: "tg-table", style: { fontSize: 12 }, children: [
        jsx("tr", { children: [thL("Step"), thR("In"), thR("Out"), thR("Thinking"), thR("TTFT"), thR("Prefill"), thR("Dec time"), thR("Dec speed")] }),
        ...s.steps.flatMap((st: any, i: number) => {
          const showTurn = i === 0 || s.steps[i - 1].turn !== st.turn;
          const rows: any[] = [];
          if (showTurn) rows.push(jsx("tr", { className: "tg-group", children: jsx("td", { colSpan: 8, children: "Turn " + st.turn }) }, "grp-" + st.turn));
          rows.push(jsxs("tr", { className: "tg-tr", children: [
            tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
            tdR(fmtC(st.in)),
            tdR(fmtC(st.out)),
            tdR(st.thinking ? (st.thinkingEstimated ? "≈" : "") + fmtC(st.thinking) : "—", { style: { color: st.thinking ? "#c084fc" : undefined }, title: (st.thinkingEstimated ? "≈ estimated from reasoning text (provider reported 0 reasoning tokens)" : "reasoning tokens") + (st.thinkingMs ? " · " + fmtMs(st.thinkingMs) + " thinking time" : "") }),
            tdR(st.ttftMs != null ? fmtMs(st.ttftMs) : "—"),
            tdR(st.prefillTokPerSec != null ? st.prefillTokPerSec + " tok/s" : "—", { style: { fontWeight: 600 }, title: "trajectory prefill = new (uncached) input tokens ÷ TTFT (" + st.in + " prompt tokens). TTFT includes network + queue, so it is a lower bound" }),
            tdR(st.decodeMs != null ? fmtMs(st.decodeMs) : "—"),
            tdR(st.decodeTokPerSec != null ? st.decodeTokPerSec + " tok/s" : "—", { style: { fontWeight: 600 }, title: "trajectory decode = streamed output tokens ÷ decode time (first→last chunk), " + st.out + " output tokens" }),
          ]}, st.turn + "-" + st.step));
          return rows;
        }),
      ]})}),
      jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 4 }, children: "Prefill/decode speeds use the trajectory's own timestamps (TTFT includes network + queue, so prefill is a lower bound). Thinking = reasoning tokens (≈ estimated from the reasoning text when the provider reports 0)." }),
    ]}) : null,
    (m.turnOutline && m.turnOutline.length) ? jsxs("div", { children: [
      jsx("div", { className: "tg-drawer-sec", children: "Turn outline" }),
      m.turnOutline.map((t: any) => jsxs("div", { className: "tg-turn", children: [
        jsx("div", { className: "tg-turn-p", children: "Turn " + t.turn + (t.prompt ? " — " + t.prompt : "") }),
        t.response ? jsx("div", { className: "tg-turn-r", children: t.response }) : null,
      ]}, t.turn)),
    ]}) : null,
  ]});
};

// Per-session drawer: bar chart overview (decode + prefill per step) with the
// detailed step/tool table collapsed below — expand it when you need the numbers.
export const perfDrawer = (s: any) => {
  let i = 0;
  const steps = (s.stepTree || []).flatMap((t: any) => (t.steps || []).map((st: any) => { i += 1; return { ...st, cat: "S" + i, turn: "Turn " + t.turn }; }));
  return jsxs("div", { className: "tg-drawer-inner", children: [
    jsx("div", { className: "tg-drawer-sec", children: "Step performance — decode & prefill speed" }),
    jsx(AmBarChart, {
      data: steps.map((st: any) => ({ cat: st.cat, turn: st.turn, tool: (st.tools || []).slice(0, 3).join(", "), decode: st.decodeTokPerSec ?? 0, prefill: st.prefillTokPerSec ?? 0 })),
      categoryField: "cat",
      groupField: "turn",
      subField: "tool",
      kind: "line",
      smooth: true,
      series: [
        { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
        { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 1 },
      ],
      height: 220,
    }),
    jsx(Collapse, { label: "Show per-step table (tools + tokens + speeds)", children: jsx("div", { className: "tg-scrollable", children: stepTree(s) }) }),
  ]});
};

// Leaf label is replaced by a standard collapsible table: each Turn is a
// collapsible header row; under it, step rows with real columns.
const stepCell = (st: any) => jsxs("tr", { className: "tg-tr", children: [
  tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
  tdL(jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }, children: [
    ...(st.tools || []).map((t: string) => jsx("span", { className: "tg-chip", style: { fontSize: 10 }, children: t }, t)),
    st.parallel ? jsx("span", { className: "tg-chip", style: { fontSize: 10, color: "#fbbf24" }, children: "parallel" }, "parallel") : null,
  ]}), { title: st.parallel ? "multiple tools called after this step (parallel group)" : "single tool call after this step" }),
  tdR(fmtC(st.in)),
  tdR(fmtC(st.out)),
  tdR(st.cache ? fmtC(st.cache) : "—"),
  tdR(st.thinking ? (st.thinkingEstimated ? "≈" : "") + fmtC(st.thinking) : "—", { style: { color: st.thinking ? "#c084fc" : undefined }, title: (st.thinkingEstimated ? "≈ estimated from reasoning text (provider reported 0 reasoning tokens)" : "reasoning tokens") }),
]}, "s" + st.turn + "-" + st.step);

// Collapsible turn table — the standard way to show a turn → step hierarchy:
// one header row per turn (chevron ▸/▾ + "Turn N · X steps"), then indented step
// rows. No ASCII tree glyphs.
const TurnStepTable = ({ steps }: { steps: any[] }) => {
  const [closed, setClosed] = React.useState<Set<number>>(() => new Set());
  const toggle = (turn: number) => setClosed((p) => { const n = new Set(p); if (n.has(turn)) n.delete(turn); else n.add(turn); return n; });
  return jsx("table", { className: "tg-table", style: { fontSize: 12.5 }, children: [
    jsx("tr", { children: [thL("Step"), thL("Tools"), thR("In"), thR("Out"), thR("Cache"), thR("Think")] }),
    ...(steps || []).flatMap((turn: any) => {
      const isClosed = closed.has(turn.turn);
      // Per-turn column totals — shown on the turn header row, next to the step count.
      const tIn = turn.steps.reduce((n: number, st: any) => n + (st.in || 0), 0);
      const tOut = turn.steps.reduce((n: number, st: any) => n + (st.out || 0), 0);
      const tCache = turn.steps.reduce((n: number, st: any) => n + (st.cache || 0), 0);
      const tThink = turn.steps.reduce((n: number, st: any) => n + (st.thinking || 0), 0);
      const header = jsxs("tr", {
        className: "tg-tr tg-row-btn",
        style: { background: "rgba(255,255,255,0.03)" },
        onClick: (e: any) => { if (e && e.stopPropagation) e.stopPropagation(); toggle(turn.turn); },
        children: [
          tdL(jsxs("span", { style: { display: "flex", alignItems: "center", gap: 7, fontWeight: 700 }, children: [
            jsx("span", { className: "tg-chev" + (isClosed ? "" : " open"), children: "▶" }),
            jsx("span", { children: "Turn " + turn.turn }),
          ]})),
          tdL(jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: turn.steps.length + " step" + (turn.steps.length > 1 ? "s" : "") })),
          tdR(fmtC(tIn), { style: { fontWeight: 700 } }),
          tdR(fmtC(tOut), { style: { fontWeight: 700 } }),
          tdR(fmtC(tCache), { style: { fontWeight: 700 } }),
          tdR(tThink ? fmtC(tThink) : "—", { style: { fontWeight: 700, color: tThink ? "#c084fc" : undefined } }),
        ],
      }, "turn" + turn.turn);
      if (isClosed) return [header];
      return [header, ...turn.steps.map(stepCell)];
    }),
  ]});
};

// Estimated fallback (no exact per-turn usage): a simple per-tool payload table.
const estimatedToolTable = (toolTokens: any[]) => jsx("table", { className: "tg-table", style: { fontSize: 12.5 }, children: [
  jsx("tr", { children: [thL("Tool"), thR("Calls"), thR("Payload"), thR("Thinking")] }),
  ...(toolTokens || []).map((t: any) => jsxs("tr", { className: "tg-tr", children: [
    tdL(t.tool, { style: { fontFamily: "monospace", fontSize: 11 } }),
    tdR(String(t.calls)),
    tdR(fmtC(t.total), { style: { fontWeight: 600 } }),
    tdR(t.reasoning ? fmtC(t.reasoning) : "—", { style: { color: t.reasoning ? "#c084fc" : undefined } }),
  ]}, t.tool)),
]});

// One compact stat chip for the "at a glance" strip (colored dot + label + value).
// auto-fit grids stretch these across the widened modal, so they get a bit more
// padding + larger values than the plain stat cards.
const glance = (label: string, value: number, color: string, total = false): any => jsxs("div", { className: "tg-card tg-stat" + (total ? " tg-stat-total" : ""), style: { padding: "14px 16px" }, children: [
  jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
    jsx("span", { className: "tg-stat-dot", style: { background: color } }),
    jsx("span", { className: "tg-label", style: { fontSize: 11.5 }, children: label }),
  ]}),
  jsx("div", { className: "tg-stat-value tg-num", style: { fontSize: total ? 24 : 21, marginTop: 5 }, children: fmtC(value) }),
]});

// The token breakdown cards + graph + collapsible table for the Tokens drawer.
const TokenDrawerBody = ({ s }: { s: any }) => {
  const hasSteps = !!(s.stepTree && s.stepTree.length);
  // Session token breakdown: the four buckets (authoritative) + thinking (from
  // the step tree) + tool-call payloads + the total (shared: client/agg.ts).
  const tot = sessionTokens(s);
  const stepRows = (() => {
    const rows: any[] = [];
    let i = 0;
    for (const t of (s.stepTree || [])) for (const st of (t.steps || [])) {
      i += 1;
      rows.push({ cat: "S" + i, turn: "Turn " + t.turn, tool: (st.tools || []).slice(0, 3).join(", "), in: st.in ?? 0, out: st.out ?? 0, cache: st.cache ?? 0, think: st.thinking ?? 0 });
    }
    return rows;
  })();
  return jsxs("div", { children: [
    jsxs("div", { style: { marginBottom: 14 }, children: [
      jsx("div", { className: "tg-drawer-sec", children: "Token breakdown — this session" }),
      jsx("div", { className: "tg-chipgrid", children: [
        glance("In", tot.tin, "#60a5fa"),
        glance("Out", tot.tout, "#a78bfa"),
        glance("Cache", tot.tcache, "#2dd4bf"),
        glance("Thinking", tot.tthink, "#c084fc"),
        glance("Tools", tot.ttools, "#34d399"),
        glance("Total", tot.total, "#fbbf24", true),
      ]}),
    ]}),
    jsx("div", { className: "tg-drawer-sec", children: "Token overview — per step (in / out / cache / think)" }),
    hasSteps
      ? jsx(AmBarChart, {
          data: stepRows,
          categoryField: "cat",
          groupField: "turn",
          subField: "tool",
          kind: "area",
          stacked: true,
          smooth: true,
          unit: "tok",
          series: TOKEN_SERIES,
          height: 240,
        })
      : null,
    jsx(Collapse, { label: "Show per-turn & step token table", children:
      hasSteps
        ? jsx("div", { className: "tg-scrollable", children: jsx(TurnStepTable, { steps: s.stepTree }) })
        : (s.toolTokens && s.toolTokens.length)
          ? estimatedToolTable(s.toolTokens)
          : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No per-step token data for this session yet." })
    }),
    jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "In/Out/Cache = the LLM context tokens the session moved (cache = read + write). Thinking = reasoning tokens (≈ estimated from reasoning text when the provider reports 0). Tools = estimated tokens of the tool-call arguments (chars/4). Each turn in the table shows its own column totals." }),
  ]});
};

// Tokens-tab drawer: run summary + the graph/collapse body above.
export const tokenTreeDrawer = (s: any) => {
  const m = s.meta || {};
  const stepCount = s.events ? (s.events.steps || 0) : (s.stepTree ? s.stepTree.reduce((n: number, t: any) => n + t.steps.length, 0) : 0);
  const meta: [string, any][] = [
    ["Project", s.cwd],
    ["Turns", s.turns || null],
    ["Steps", stepCount || null],
    ["Models", s.modelMix],
    ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
    ["Speed", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
    ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " · " + (m.lastUsedModel.provider || "?") : null],
  ];
  return jsxs("div", { className: "tg-drawer-inner", children: [
    metaGrid(meta),
    jsx(TokenDrawerBody, { s }),
  ]});
};

// ── Combined temp-tab drawer: merges the Perf drawer (step decode/prefill
// ── speed) with the Tokens drawer (per-turn → step token breakdown). Each
// ── StepTreeEntry already carries BOTH the timing fields (ttftMs, prefillTokPerSec,
// ── decodeMs, decodeTokPerSec) AND the token fields (in, out, cache, thinking), so
// ── ONE unified per-turn → step table surfaces every property of both source tabs.
const toolChips = (st: any) => jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }, children: [
  ...(st.tools || []).map((t: string) => jsx("span", { className: "tg-chip", style: { fontSize: 10 }, children: t }, t)),
  st.parallel ? jsx("span", { className: "tg-chip", style: { fontSize: 10, color: "#fbbf24" }, children: "parallel" }, "parallel") : null,
]});

// Step runtime = TTFT (request→first token) + decode window, in ms. NB: the
// trajectory decodeMs spans first chunk → usage/end chunk, which ALREADY contains
// the thinking phase — adding thinkingMs would double-count it (verified against
// the harness's turn run time, which always sits below the inflated sum).
const stepRuntimeMs = (st: any): number | null => {
  const a = st.ttftMs, b = st.decodeMs;
  if (a == null && b == null) return null;
  return (a || 0) + (b || 0);
};
const fmtRuntime = (st: any): any => { const v = stepRuntimeMs(st); return v != null ? fmtMs(v) : "—"; };

// Context cell: total prompt size at this step (actual uncached+cached when usage
// reports it) against the model's window, with the System/Tools/Messages allocation
// (chars/4 estimate of the trajectory content) in the tooltip.
const ctxPct = (st: any): number | null => (st.ctxTotal != null && st.ctxWindow > 0 ? Math.round((st.ctxTotal / st.ctxWindow) * 100) : null);
const ctxColor = (pct: number | null): any => (pct == null ? undefined : pct > 85 ? "#f87171" : pct > 60 ? "#fbbf24" : "#94a3b8");
const ctxTitle = (st: any): string => {
  const pct = ctxPct(st);
  return "context at this step: ~" + fmtC(st.ctxTotal) + (pct != null ? " / " + fmtC(st.ctxWindow) + " (" + pct + "%)" : "") +
    " — System ~" + fmtC(st.ctxSys) + " · Tools ~" + fmtC(st.ctxTools) + " · Messages ~" + fmtC(st.ctxMsg) +
    ". Total = actual prompt tokens (uncached " + fmtC(st.in) + " + cached " + fmtC(st.cache) + "); the breakdown is a chars/4 estimate of the trajectory content.";
};
// ✂ prefix = a compaction reset the context before this step started (the
// compacted messages no longer count toward its prompt — a new regime).
const ctxCell = (st: any) => tdR(st.ctxTotal != null ? ((st.postCompaction ? "✂ " : "") + fmtC(st.ctxTotal)) : "—", { style: { fontWeight: 600, color: ctxColor(ctxPct(st)) }, title: (st.postCompaction ? "context was compacted (reset) before this step — " : "") + ctxTitle(st) });

const combinedStepCell = (st: any) => jsxs("tr", { className: "tg-tr", children: [
  tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
  tdL(toolChips(st), { title: st.parallel ? "multiple tools called after this step (parallel group)" : "single tool call after this step" }),
  tdR(fmtC(st.in)),
  tdR(fmtC(st.out)),
  tdR(st.cache ? fmtC(st.cache) : "—"),
  tdR(st.thinking ? (st.thinkingEstimated ? "≈" : "") + fmtC(st.thinking) : "—", { style: { color: st.thinking ? "#c084fc" : undefined }, title: (st.thinkingEstimated ? "≈ estimated from reasoning text (provider reported 0 reasoning tokens)" : "reasoning tokens") }),
  tdR(st.prefillTokPerSec != null ? st.prefillTokPerSec + " tok/s" : "—", { style: { fontWeight: 600 }, title: "trajectory prefill = new (uncached) input tokens ÷ TTFT (" + st.in + " prompt tokens). TTFT includes network + queue, so it is a lower bound" }),
  tdR(st.decodeTokPerSec != null ? st.decodeTokPerSec + " tok/s" : "—", { style: { fontWeight: 600 }, title: "trajectory decode = streamed output tokens ÷ decode time (first→last chunk), " + st.out + " output tokens" }),
  tdR(st.ttftMs != null ? fmtMs(st.ttftMs) : "—", { title: "time from request to first token (TTFT) — includes network + queue" }),
  tdR(st.decodeMs != null ? fmtMs(st.decodeMs) : "—"),
  tdR(fmtRuntime(st), { style: { fontWeight: 600 }, title: "step runtime = TTFT + decode time (decode already contains the thinking window)" }),
  ctxCell(st),
]}, st.turn + "-" + st.step);

// ── Compaction detail popup ────────────────────────────────────────────────
// Mirrors the DSH trajectory viewer's COMPACTED record: header (COMPACTED ·
// Between turns), status / duration / tokens meta, and the generated summary
// text. The summary is fetched LAZILY (it can be many KB) via the
// /token-gabbler/compaction route — the banner row only carries the lite fields.
const CompactionModal = ({ session, comp, onClose }: { session: string; comp: any; onClose: () => void }) => {
  // running = compaction in progress (start seen, no end yet) — NOT a failure.
  // The summary doesn't exist yet, so there is nothing to fetch.
  const running = comp.state === "running" || (comp.state == null && !comp.ok && !comp.error);
  const [detail, setDetail] = React.useState<any>(null);
  const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (running) return;
    let live = true;
    request("/compaction?session=" + encodeURIComponent(session) + "&index=" + comp.index)
      .then((d) => { if (live) setDetail(d); })
      .catch((e) => { if (live) setErr(e instanceof Error ? e.message : String(e)); });
    return () => { live = false; };
  }, [session, comp.index, running]);
  // New starting context after the reset = context size at compaction minus the
  // tokens it removed (shadowed). Both come from the summary record, so this is
  // only known for completed (ok) compactions.
  const ctxAfter = !running && comp.contextBefore && comp.shadowedTokens ? comp.contextBefore - comp.shadowedTokens : null;
  const meta: [string, any][] = [
    ["Status", running ? "Running (compacting…)" : comp.ok ? "Completed" : "Failed" + (comp.error ? " — " + comp.error : "")],
    ["Duration", !running && comp.durationMs != null ? fmtMs(comp.durationMs) : null],
    ["Tokens removed", !running && comp.shadowedTokens ? fmtC(comp.shadowedTokens) : null],
    ["Context before", !running && comp.contextBefore ? fmtC(comp.contextBefore) : null],
    ["Context after", ctxAfter && ctxAfter > 0 ? fmtC(ctxAfter) : null],
    ["Summary size", !running && comp.summaryChars ? "≈" + fmtC(Math.ceil(comp.summaryChars / 4)) + " tok" : null],
  ];
  return jsx("div", { className: "tg-modal-overlay", role: "presentation", onClick: (e: any) => { if (e && e.target === e.currentTarget) onClose(); }, children: [
    jsx("div", { className: "tg-modal-mask", "aria-hidden": "true", onClick: onClose }),
    jsxs("div", { className: "tg-modal-panel tg-comp-panel", role: "dialog", "aria-modal": "true", children: [
      jsxs("div", { className: "tg-modal-header", style: { padding: "14px 18px 12px" }, children: [
        jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          jsx("span", { className: "tg-comp-badge" + (running ? " tg-comp-badge-run" : ""), children: running ? "✂ COMPACTING…" : "✂ COMPACTED" }),
          jsx("span", { className: "tg-faint", style: { fontSize: 12 }, children: "Between turns" + (comp.afterTurn != null ? " · after Turn " + comp.afterTurn + (comp.afterStep != null ? " · Step " + comp.afterStep : "") : "") }),
        ]}),
        jsx("button", { className: "tg-close", onClick: onClose, "aria-label": "Close", children: "✕" }),
      ]}),
      // The modal panel is a fixed-height flex column: header + meta grid stay
      // put, and ONLY the summary box scrolls (tg-comp-summary-wrap = flex:1).
      jsx("div", { className: "tg-modal-body", children: jsxs("div", { className: "tg-comp-body", style: { padding: "4px 20px 18px" }, children: [
        metaGrid(meta),
        jsx("div", { className: "tg-drawer-sec", style: { marginTop: 14 }, children: "Summary" }),
        jsx("div", { className: "tg-comp-summary-wrap", children:
          running
            ? jsx("div", { className: "tg-muted", style: { fontSize: 12.5 }, children: "Compacting — the generated summary will appear here once the compaction completes (re-open the row after it finishes)." })
            : err
              ? jsx("div", { className: "tg-muted", style: { fontSize: 12.5 }, children: "Could not load the summary: " + err })
              : detail
                ? jsx("div", { className: "tg-comp-summary", children: detail.summaryText ? jsx(Markdown, { text: detail.summaryText }) : "(no summary text recorded)" })
                : jsx("div", { className: "tg-muted", style: { fontSize: 12.5 }, children: "Loading summary…" })
        }),
      ]})}),
    ]}),
  ]});
};

// One unified per-turn → step table for the combined tab: each Turn is a header
// row (chevron + step count + its own token column totals), each step row shows
// tools, tokens (in/out/cache/think) AND timing (TTFT / prefill / decode).
// `compactions` (CompactionLite[]) inserts an explicit COMPACTED banner row at
// each compaction's "Between turns" position; clicking it opens the detail popup.
const CombinedStepTable = ({ steps, defaultClosed = false, compactions, onCompaction }: { steps: any[]; defaultClosed?: boolean; compactions?: any[]; onCompaction?: (c: any) => void }) => {
  // defaultClosed = every turn starts collapsed (Daily tab view); otherwise all
  // turn rows start expanded (Combined tab).
  const [closed, setClosed] = React.useState<Set<number>>(() => (defaultClosed ? new Set((steps || []).map((t: any) => t.turn)) : new Set()));
  const toggle = (turn: number) => setClosed((p) => { const n = new Set(p); if (n.has(turn)) n.delete(turn); else n.add(turn); return n; });
  // ── COMPACTED banner placement ────────────────────────────────────────────
  // Each compaction gets a banner row at its "Between turns" position: anchored
  // AFTER the last step that ran before it (comp.afterTurn/afterStep). When that
  // turn is collapsed the banner attaches to the turn header row instead, so it
  // stays visible. Compactions whose anchor step isn't in this table (no usage
  // record) fall back to before the first step of their regime, else the end.
  const bannerRow = (comp: any) => {
    // Three states: running (compaction in progress — start seen, no end yet,
    // NOT a failure), ok (summary produced, context replaced), failed (ended
    // with an error, original messages kept in context).
    const running = comp.state === "running" || (comp.state == null && !comp.ok && !comp.error);
    return jsx("tr", {
      className: "tg-tr tg-comp-row" + (running ? " tg-comp-row-run" : comp.ok ? "" : " tg-comp-row-fail"),
      onClick: (e: any) => { if (e && e.stopPropagation) e.stopPropagation(); if (onCompaction) onCompaction(comp); },
      children: [
        jsx("td", { colSpan: 12, children: jsxs("span", { className: "tg-comp-banner", children: [
          jsx("span", { className: "tg-comp-badge", children: running ? "✂ COMPACTING…" : "✂ COMPACTED" }),
          jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "Between turns" + (comp.afterTurn != null ? " · after Turn " + comp.afterTurn + (comp.afterStep != null ? " · Step " + comp.afterStep : "") : "") }),
          jsx("span", { className: "tg-comp-row-meta", children:
            (running ? "Compacting…" : comp.ok ? "Completed" : "Failed" + (comp.error ? " — " + comp.error : "")) +
            (!running && comp.durationMs != null ? " · " + (comp.durationMs / 1000).toFixed(1) + "s" : "") +
            (!running && comp.shadowedTokens ? " · " + fmtC(comp.shadowedTokens) + " tokens removed" : "")
          }),
        ]}) }),
      ],
    }, "comp" + comp.index);
  };
  const allStepKeys = new Set((steps || []).reduce((acc: string[], t: any) => acc.concat((t.steps || []).map((st: any) => t.turn + ":" + st.step)), []));
  const bannerAfter = new Map<string, any[]>(); // "turn:step" -> banners rendered after that step row
  const beforeTurn = new Map<number, any[]>();  // turn -> banners rendered before that turn's header
  const bannerEnd: any[] = [];
  for (const c of (compactions || [])) {
    const k = c.afterTurn != null && c.afterStep != null ? c.afterTurn + ":" + c.afterStep : null;
    if (k && allStepKeys.has(k)) {
      bannerAfter.set(k, [...(bannerAfter.get(k) || []), c]);
      continue;
    }
    const flat = (steps || []).reduce((acc: any[], t: any) => acc.concat(t.steps || []), []);
    const target = flat.find((st: any) => (st.compactionRegime || 0) >= c.index);
    if (target) beforeTurn.set(target.turn, [...(beforeTurn.get(target.turn) || []), c]);
    else bannerEnd.push(c);
  }
  return jsx("table", { className: "tg-table", style: { fontSize: 12.5 }, children: [
    jsx("tr", { children: [thL("Step"), thL("Tools"), thR("In"), thR("Out"), thR("Cache"), thR("Think"), thR("Prefill"), thR("Decode"), thR("TTFT"), thR("Dec time"), thR("Runtime"), thR("Ctx")] }),
    ...(steps || []).flatMap((turn: any) => {
      const isClosed = closed.has(turn.turn);
      const tIn = turn.steps.reduce((n: number, st: any) => n + (st.in || 0), 0);
      const tOut = turn.steps.reduce((n: number, st: any) => n + (st.out || 0), 0);
      const tCache = turn.steps.reduce((n: number, st: any) => n + (st.cache || 0), 0);
      const tThink = turn.steps.reduce((n: number, st: any) => n + (st.thinking || 0), 0);
      // Per-turn timing aggregates. SPEEDS use the same ratio-of-sums math as the
      // session row and the server aggregates (total tokens ÷ total time, steps
      // without timing contribute nothing) so the numbers line up across levels;
      // TIMES (TTFT, decode time) stay plain per-step means.
      const avgOf = (key: string) => {
        const vals = turn.steps.map((st: any) => st[key]).filter((v: any) => v != null && Number.isFinite(v));
        return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : null;
      };
      const ttftMsTot = turn.steps.reduce((n: number, st: any) => (st.ttftMs > 0 ? n + st.ttftMs : n), 0);
      const prefillTokTot = turn.steps.reduce((n: number, st: any) => (st.ttftMs > 0 ? n + (st.in || 0) : n), 0);
      const decMsTot = turn.steps.reduce((n: number, st: any) => (st.decodeMs > 0 ? n + st.decodeMs : n), 0);
      const decTokTot = turn.steps.reduce((n: number, st: any) => (st.decodeMs > 0 ? n + (st.out || 0) : n), 0);
      const avgTtft = avgOf("ttftMs");
      const turnPrefill = ttftMsTot > 0 ? Math.round((prefillTokTot / (ttftMsTot / 1000)) * 10) / 10 : null;
      const avgDecMs = avgOf("decodeMs");
      const turnDec = decMsTot > 0 ? Math.round((decTokTot / (decMsTot / 1000)) * 10) / 10 : null;
      const tRt = turn.steps.reduce((n: number, st: any) => n + (stepRuntimeMs(st) || 0), 0);
      const header = jsxs("tr", {
        className: "tg-tr tg-row-btn",
        style: { background: "rgba(255,255,255,0.03)" },
        onClick: (e: any) => { if (e && e.stopPropagation) e.stopPropagation(); toggle(turn.turn); },
        children: [
          tdL(jsxs("span", { style: { display: "flex", alignItems: "center", gap: 7, fontWeight: 700 }, children: [
            jsx("span", { className: "tg-chev" + (isClosed ? "" : " open"), children: "▶" }),
            jsx("span", { children: "Turn " + turn.turn }),
          ]})),
          tdL(jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: turn.steps.length + " step" + (turn.steps.length > 1 ? "s" : "") })),
          tdR(fmtC(tIn), { style: { fontWeight: 700 } }),
          tdR(fmtC(tOut), { style: { fontWeight: 700 } }),
          tdR(fmtC(tCache), { style: { fontWeight: 700 } }),
          tdR(tThink ? fmtC(tThink) : "—", { style: { fontWeight: 700, color: tThink ? "#c084fc" : undefined } }),
          tdR(turnPrefill != null ? turnPrefill + " tok/s" : "—", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn prefill = new (uncached) input tokens ÷ TTFT across the turn's steps — same ratio-of-sums math as the session row" }),
          tdR(turnDec != null ? turnDec + " tok/s" : "—", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn decode = streamed output tokens ÷ decode time across the turn's steps — same ratio-of-sums math as the session row" }),
          tdR(avgTtft != null ? fmtMs(avgTtft) : "—", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn-average TTFT" }),
          tdR(avgDecMs != null ? fmtMs(avgDecMs) : "—", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn-average decode time" }),
          tdR(tRt > 0 ? fmtMs(tRt) : "—", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn total runtime = sum of (TTFT + decode) across steps — decode already contains the thinking window, so no separate thinking term" }),
          (() => { const last = turn.steps[turn.steps.length - 1]; return last && last.ctxTotal != null
            ? tdR(fmtC(last.ctxTotal) + (last.ctxWindow ? " / " + fmtC(last.ctxWindow) : ""), { style: { fontWeight: 700, color: ctxColor(ctxPct(last)) }, title: "context at the turn's last step: ~" + fmtC(last.ctxTotal) + (last.ctxWindow ? " / " + fmtC(last.ctxWindow) + " (" + ctxPct(last) + "%)" : "") + " — System ~" + fmtC(last.ctxSys) + " · Tools ~" + fmtC(last.ctxTools) + " · Messages ~" + fmtC(last.ctxMsg) })
            : tdR("—"); })(),
        ],
      }, "turn" + turn.turn);
      // Banners anchored to a step of THIS turn: after that step's row when the
      // turn is expanded, attached to the (collapsed) turn header otherwise.
      const turnStepKeys = new Set((turn.steps || []).map((st: any) => turn.turn + ":" + st.step));
      const anchoredHere: any[] = [];
      for (const [k, arr] of bannerAfter) if (turnStepKeys.has(k)) anchoredHere.push(...arr);
      const headBanners = [...(beforeTurn.get(turn.turn) || [])];
      if (isClosed) return [...headBanners, header, ...(anchoredHere.length ? anchoredHere.map(bannerRow) : [])];
      return [
        ...headBanners,
        header,
        ...turn.steps.flatMap((st: any) => [
          combinedStepCell(st),
          ...(bannerAfter.get(turn.turn + ":" + st.step) || []).map(bannerRow),
        ]),
      ];
    }),
    ...bannerEnd.map(bannerRow),
  ]});
};

// The combined step table + its COMPACTED popup state, as a real component:
// combinedDrawer itself is invoked as a plain function by the generic table, so
// any hook state it owns must live in a jsx component (hooks called directly in
// combinedDrawer would leak into the table's hook list and break row switching).
const CompactionTable = ({ s, defaultClosed = false }: { s: any; defaultClosed?: boolean }) => {
  const [compOpen, setCompOpen] = React.useState<any>(null);
  return jsxs("div", { children: [
    jsx("div", { className: "tg-scrollable", children: jsx(CombinedStepTable, { steps: s.stepTree, defaultClosed, compactions: s.compactionEvents, onCompaction: setCompOpen }) }),
    compOpen ? jsx(CompactionModal, { session: s.id, comp: compOpen, onClose: () => setCompOpen(null) }) : null,
  ]});
};

// Combined-tab drawer: at-a-glance token chips + ONE unified per-turn → step table
// covering every property of both source tabs. (The landing tab itself is badges;
// this drawer is the merged detail view.)
export const combinedDrawer = (s: any, opts: { defaultClosed?: boolean } = {}) => {
  const m = s.meta || {};
  const stepCount = s.events ? (s.events.steps || 0) : (s.stepTree ? s.stepTree.reduce((n: number, t: any) => n + t.steps.length, 0) : 0);
  // Peak context across the session's steps + the model's window limit.
  const allSteps = (s.stepTree || []).reduce((acc: any[], t: any) => acc.concat(t.steps), []);
  const ctxWin = allSteps.map((st: any) => st.ctxWindow).find((v: any) => v != null) ?? null;
  const ctxPeak = allSteps.reduce((mx: number, st: any) => Math.max(mx, st.ctxTotal || 0), 0);
  // Compaction existence + impact (from the trajectory's compaction records):
  // how many full compactions ran, how many tokens they removed from the context,
  // plus the smaller targeted prunes.
  const compInfo = (() => {
    const n = s.compactions || 0, err = s.compactionErrors || 0, tok = s.compactedTokens || 0, pr = s.prunes || 0, pt = s.prunedTokens || 0;
    if (!n && !pr) return null;
    let v = n + " compaction" + (n === 1 ? "" : "s");
    if (err) v += " · " + err + " failed";
    if (tok) v += " · " + fmtC(tok) + " tokens removed";
    if (pr) v += " · " + pr + " prune" + (pr === 1 ? "" : "s") + (pt ? " · " + fmtC(pt) : "");
    return v;
  })();
  // Performance-vs-context, ONE UNIFIED CHART across ALL compaction regimes:
  // the ONLY lines are the context filling up — per window, the SAWTOOTH: the
  // line rises step by step as the context fills within the window (left axis
  // = context growth since the window started, linear) and drops back to the
  // next window's start at its ✂ compaction — the session's context sawtooth,
  // each window in its own color. Every window's steps also plot as SCATTER
  // DOTS on the right LOG axis — one color per metric (in / out / thinking /
  // cache in tokens, prefill / decode in tok/s) — with ONE shared multi-line
  // tooltip (hover any dot → that step's full stats in a single box). Plus a
  // vertical ✂ line at each completed compaction's context size (contextBefore)
  // — the context length in flight when that compaction ran. Each context
  // WINDOW (before the first compaction, between two, after the last) gets its
  // own color and a togglable chip: one chip click removes (or restores) the
  // whole window — its dots, its context line, and the ✂ lines it bounds.
  const REGIME_COLORS = ["#e5e7eb", "#f87171", "#fb923c", "#a3e635", "#38bdf8", "#f43f5e", "#d946ef", "#94a3b8"];
  // The scatter metrics: one dot series each, fixed color per metric (the
  // window colors are reserved for the context-fill lines + chips).
  const PERF_METRICS = [
    { key: "in", name: "in", color: "#9ae288", unit: "tok" },
    { key: "out", name: "out", color: "#94a3b8", unit: "tok" },
    { key: "thinking", name: "thinking", color: "#c084fc", unit: "tok",  radius: 2 },
    { key: "cache", name: "cache", color: "#94a3b8", unit: "tok" },
    { key: "pf", name: "prefill", color: "#fbbf24", unit: "tok/s" },
    { key: "dc", name: "decode", color: "#f9fd02", unit: "tok/s" },
  ];
  // Pre-formatted multi-line tooltip text for one step (the single shared box).
  const tipFor = (r: any): string => {
    const tok: string[] = [];
    if (r.in != null) tok.push("in " + fmtC(r.in));
    if (r.out != null) tok.push("out " + fmtC(r.out));
    if (r.cache != null) tok.push("cache " + fmtC(r.cache));
    if (r.thinking != null) tok.push("think" + (r.thinkEst ? "≈" : "") + " " + fmtC(r.thinking));
    const spd: string[] = [];
    if (r.pf != null) spd.push("prefill " + r.pf + " tok/s");
    if (r.dc != null) spd.push("decode " + r.dc + " tok/s");
    const L = [r.label + " · ctx " + fmtC(r.ctx)];
    if (tok.length) L.push(tok.join(" · "));
    if (spd.length) L.push(spd.join(" · "));
    return L.join("\n");
  };
  const regimeRows: Record<number, any[]> = {};
  // Global step index (session time order) - the x-axis. A context SAWTOOTH
  // needs x = time: drawn against x = context size, within a window ctx grows
  // ~linearly, so (ctx, ctx-windowStart) is just a slope-1 diagonal and the
  // windows' diagonals overlap into one (the "broken" look). With x = step,
  // each window's line rises as the context fills and drops at its compaction.
  const stepG: Record<string, number> = {};
  let gIdx = 0;
  for (const st of allSteps) {
    if (st.ctxTotal == null) continue;
    if (st.in == null && st.out == null && st.cache == null && st.thinking == null && st.prefillTokPerSec == null && st.decodeTokPerSec == null) continue;
    const r = st.compactionRegime || 0;
    const row: any = {
      g: gIdx,
      ctx: st.ctxTotal,
      in: st.in ?? null,
      out: st.out ?? null,
      thinking: st.thinking ?? null,
      cache: st.cache ?? null,
      pf: st.prefillTokPerSec ?? null,
      dc: st.decodeTokPerSec ?? null,
      thinkEst: !!st.thinkingEstimated,
      label: "T" + st.turn + "S" + st.step,
    };
    row.tip = tipFor(row);
    stepG[st.turn + ":" + st.step] = gIdx;
    (regimeRows[r] || (regimeRows[r] = [])).push(row);
    gIdx++;
  }
  // Defensive time-sort: a step that ran out of order (e.g. a subagent) would
  // otherwise sit in the wrong place on the x (step) axis.
  for (const k of Object.keys(regimeRows)) regimeRows[Number(k)].sort((a: any, b: any) => a.g - b.g);
  const regimeKeys = Object.keys(regimeRows).map(Number).sort((a, b) => a - b);
  const perfSeries: any[] = [];
  const perfChips: { name: string; color: string; k: number }[] = [];
  regimeKeys.forEach((r, i) => {
    const rows = regimeRows[r];
    if (!rows.length) return;
    const c = REGIME_COLORS[r % REGIME_COLORS.length];
    const name = r === 0 ? "Before compaction" : "After compaction " + r;
    perfChips.push({ name, color: c, k: r });
    // The window's context line: a SAWTOOTH on the step (time) x-axis - the
    // line rises as the context fills (y = absolute context size, left linear
    // axis), then drops at the compaction to the next window's starting
    // context. The drop belongs to the ending window so it hides with it.
    const lineRows = rows.map((x: any) => ({ g: x.g, ctx: x.ctx, label: x.label }));
    const next = regimeKeys[i + 1];
    if (next != null && regimeRows[next].length) {
      const first = regimeRows[next][0];
      lineRows.push({ g: first.g, ctx: first.ctx, label: name + " -> reset" });
    }
    perfSeries.push({ key: "ctx", label: name, color: c, unit: "ctx", axis: 0, regime: r, line: true, data: lineRows });
    // Scatter dots — one series per metric on the right LOG axis, all sharing
    // the window's regime so one chip toggles the whole window (dots + line +
    // its ✂ boundaries).
    for (const m of PERF_METRICS) {
      perfSeries.push({ key: m.key, label: m.name, color: m.color, unit: m.unit, axis: 1, regime: r, bullet: "circle", data: rows, radius: m.radius });
    }
  });
  // Every row (all windows) feeds the single shared multi-line tooltip.
  const perfTipRows = regimeKeys.flatMap((r) => regimeRows[r]);
  // Only completed (ok) compactions carry a contextBefore — failed ones never
  // reset the context, running ones haven't produced their summary yet.
  // `windows` = the two regimes the ✂ line bounds (compaction N ends regime
  // N-1 and starts regime N) — the line hides when either side is hidden.
  const perfRules = (s.compactionEvents || [])
    .filter((c: any) => c.contextBefore != null && c.afterTurn != null && c.afterStep != null && stepG[c.afterTurn + ":" + c.afterStep] != null)
    // .map((c: any) => ({
    //   x: stepG[c.afterTurn + ":" + c.afterStep],
    //   label: "✂ C" + c.index,
    //   tip: "Compaction " + c.index + " · after Turn " + c.afterTurn + " · Step " + c.afterStep + " · context " + fmtC(c.contextBefore) + " tok",
    //   color: "#f472b6",
    //   windows: [c.index - 1, c.index] as [number, number],
    // }));
  const perfHas = perfSeries.length > 0;
  const meta: [string, any][] = [
    ["Project", s.cwd],
    ["Turns", s.turns || null],
    ["Steps", stepCount || null],
    ["Models", s.modelMix],
    ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
    ["Decode", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
    ["Context", ctxPeak > 0 ? fmtC(ctxPeak) + " peak" + (ctxWin ? " / " + fmtC(ctxWin) + " window (" + Math.round((ctxPeak / ctxWin) * 100) + "%)" : "") : null],
    ["Compactions", compInfo],
    ["Archived", s.archived ? "📦 yes" : null],
    ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " · " + (m.lastUsedModel.provider || "?") : null],
  ];
  const tot = sessionTokens(s);
  return jsxs("div", { className: "tg-drawer-inner", children: [
    metaGrid(meta),
    jsxs("div", { style: { marginBottom: 14 }, children: [
      jsx("div", { className: "tg-drawer-sec", children: "Token breakdown — this session" }),
      jsx("div", { className: "tg-chipgrid", children: [
        glance("In", tot.tin, "#60a5fa"),
        glance("Out", tot.tout, "#a78bfa"),
        glance("Cache", tot.tcache, "#2dd4bf"),
        glance("Thinking", tot.tthink, "#c084fc"),
        glance("Tools", tot.ttools, "#34d399"),
        glance("Total", tot.total, "#fbbf24", true),
      ]}),
    ]}),
    perfHas ? jsxs("div", { style: { marginBottom: 14 }, children: [
      jsxs("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }, children: [
        jsx("div", { className: "tg-drawer-sec", style: { marginBottom: 0 }, children: "Performance & context — over steps" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10 }, children: "left = context (linear) · right = log (dots)" }),
      ]}),
      jsx(AmBarChart, {
        data: [], kind: "scatter", xField: "g", labelField: "label", xLabel: "step", xUnit: "",
        xStep: Math.max(1, Math.round(gIdx / 12)),
        series: perfSeries,
        rules: perfRules,
        legendChips: true,
        chips: perfChips,
        metricChips: PERF_METRICS.map((m) => ({ name: m.name + " · " + m.unit, color: m.color, k: m.key })),
        logAxes: [1],
        hideAxisLabels: [1],
        tipField: "tip",
        tipData: perfTipRows,
        tipAxis: 1,
        xMinControl: true,
        xMinLabel: "x min (step)",
        xMinStep: 1,
        height: 400,
      }),
      jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "One chart for every compaction regime — x = step (session time; the shared axis auto-scales to the visible data, or pin its minimum with the x-min input). The only lines are the context filling up: each window's line (left axis = context size) rises step by step as the context fills, then drops at its ✂ compaction to the next window's starting context — the session's context sawtooth, in the window's color. Every step also plots as scatter dots on the right log axis, one color per metric — in / out / thinking / cache (tokens) and prefill / decode (tok/s); hover any dot for that step's full stats in one box. Click a window chip to remove or restore a whole window: its dots, its context line and the ✂ boundary lines it bounds all hide with it, and the x-axis rescales to the remaining windows. Each ✂ line marks a compaction, drawn at the step after which it ran: windows left of ✂ C1 ran before compaction 1, between ✂ C1 and ✂ C2 after it, and so on." }),
    ]}) : null,
    (s.stepTree && s.stepTree.length) ? jsxs("div", { children: [
      jsx("div", { className: "tg-drawer-sec", children: "Per turn & step — tokens + speed (combined)" }),
      jsx(CompactionTable, { s, defaultClosed: !!opts.defaultClosed }),
      jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "Each step row is one LLM step: the tools it called and the context tokens it moved (In/Out/Cache/Think) alongside its timing (TTFT / Prefill / Decode) and its Ctx — the context-window allocation at that step (System / Tools / Messages, chars/4 estimate of the trajectory content) with the total prompt size against the model's window. ✂ COMPACTED rows mark where a compaction ran between turns (✂ COMPACTING… = one still in progress, not a failure) — click one for its status, duration, tokens removed and the generated summary (✂ prefix on a Ctx cell = that step ran after a compaction reset). Turn header shows the turn's token column totals; its speed columns use total tokens ÷ total time (same math as the session row) while TTFT / decode time are per-step averages. Prefill/decode speeds use the trajectory's own timestamps (TTFT includes network + queue, so prefill is a lower bound). Thinking = reasoning tokens (≈ estimated from the reasoning text when the provider reports 0)." }),
    ]}) : null,
  ]});
};
