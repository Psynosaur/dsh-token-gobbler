// token-gobbler · client/drawers.tsx
// Expandable drawer content: the per-step (turn/step) tables, the session drawer
// (metadata + tools + per-step speed), and the Tokens drawer (collapsible turn →
// step table).
import { fmt, fmtC, fmtMs, thL, thR, tdL, tdR, eventChips, toolTable } from "./core";
import { AmBarChart } from "./amchart";

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
export const Collapse = ({ label, children, defaultOpen }: { label: any; children: any; defaultOpen?: boolean }) => {
  const [open, setOpen] = React.useState(!!defaultOpen);
  return jsxs("div", { className: "tg-collapse", children: [
    jsx("button", { className: "tg-collapse-head", onClick: () => setOpen((o: boolean) => !o), children: [
      jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "▶" }),
      jsx("span", { children: label }),
    ]}),
    open ? jsx("div", { className: "tg-collapse-body", children }) : null,
  ]});
};

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
          tdR(""), tdR(""), tdR(""), tdR(""),
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

// Tokens-tab drawer: run summary + a collapsible turn → step table.
export const tokenTreeDrawer = (s: any) => {
  const m = s.meta || {};
  const stepCount = s.events ? (s.events.steps || 0) : (s.stepTree ? s.stepTree.reduce((n: number, t: any) => n + t.steps.length, 0) : 0);
  const meta: [string, any][] = [
    ["Project", s.cwd],
    ["Turns", s.turns || null],
    ["Steps", stepCount || null],
    ["Models", s.modelMix],
    ["Total", s.allTokens ? fmtC(s.allTokens) + " tokens" : null],
    ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
    ["Speed", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
    ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " · " + (m.lastUsedModel.provider || "?") : null],
  ];
  return jsxs("div", { className: "tg-drawer-inner", children: [
    metaGrid(meta),
    jsxs("div", { children: [
      jsx("div", { className: "tg-drawer-sec", children: "Token overview — per step (in / out / cache / think)" }),
      (s.stepTree && s.stepTree.length)
        ? jsx(AmBarChart, {
            data: (() => {
              const rows: any[] = [];
              let i = 0;
              for (const t of (s.stepTree as any[])) for (const st of (t.steps || [])) {
                i += 1;
                rows.push({ cat: "S" + i, turn: "Turn " + t.turn, tool: (st.tools || []).slice(0, 3).join(", "), vIn: st.in ?? 0, vOut: st.out ?? 0, cache: st.cache ?? 0, think: st.thinking ?? 0 });
              }
              return rows;
            })(),
            categoryField: "cat",
            groupField: "turn",
            subField: "tool",
            kind: "area",
            stacked: true,
            smooth: true,
            unit: "tok",
            series: [
              { key: "vIn", label: "In", color: "#60a5fa", unit: "tok" },
              { key: "vOut", label: "Out", color: "#a78bfa", unit: "tok" },
              { key: "cache", label: "Cache", color: "#2dd4bf", unit: "tok" },
              { key: "think", label: "Think", color: "#c084fc", unit: "tok" },
            ],
            height: 240,
          })
        : null,
      jsx(Collapse, { label: "Show per-turn & step token table", children:
        (s.stepTree && s.stepTree.length)
          ? jsx("div", { className: "tg-scrollable", children: jsx(TurnStepTable, { steps: s.stepTree }) })
          : (s.toolTokens && s.toolTokens.length)
            ? estimatedToolTable(s.toolTokens)
            : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No per-step token data for this session yet." })
      }),
      jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "Each turn expands to its steps. In/Out/Cache = the context tokens the LLM step moved. Think = reasoning tokens (≈ estimated from reasoning text when the provider reports 0)." }),
    ]}),
  ]});
};
