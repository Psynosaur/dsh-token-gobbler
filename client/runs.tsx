// token-gobbler · client/runs.tsx
// Runs tab: group the sessions by MODEL — "similar model runs" — and compare
// those runs against each other over time.
//
// One expandable drawer per model. The head carries the aggregate at a glance
// (sessions, steps, decode/prefill); the body carries the full aggregate stats
// (token PERFORMANCE + token ALLOCATION) and, under them, a per-session speed
// chart with NO axis labels: every bar is the same model, so the category axis
// would only repeat itself. The session id and the speeds live in the tooltip,
// and the bars stay in chronological order so the run's history reads
// left→right.
//
// Why speeds are re-derived per model rather than taken from the session: a
// session can switch models mid-run (a local run continued on the API), and the
// session-wide tokPerSec blends both — that would smear one model's rate across
// another model's bars. Every rate here comes from that model's own
// decodeTokens/decodeMs and prefillTokens/prefillMs rollup, and every aggregate
// is time-weighted (Σtokens ÷ Σtime), never a mean of per-session means.
import { fmt, fmtC, fmtMs, thL, thR, tdL, tdR, badgeGrid } from "./core";
import { costCard } from "./panels";
import { AmBarChart } from "./amchart";
import { Collapse } from "./drawers";

const shortId = (id: string): string => String(id || "").replace(/^session-/, "").slice(0, 8);

/** One model's run inside one session (the per-model rollup, not the session). */
type Run = {
  id: string; date: string; title: string;
  steps: number;
  in: number; out: number; cache: number; think: number; ctx: number;
  dTok: number; dMs: number; pTok: number; pMs: number; pSteps: number;
  decode: number | null; prefill: number | null; ttftMs: number | null; avgCtx: number | null;
  /** Session carried P2P-enablement evidence (see lib/trajectory.ts) — kept as a
   *  marker here so a like-for-like run list still shows WHICH runs had it on. */
  p2p: boolean;
};

/** A model and every session that ran it. */
type Group = {
  key: string; label: string; provider: string | null;
  runs: Run[]; // chronological
  sessions: number; steps: number;
  in: number; out: number; cache: number; think: number; total: number;
  decode: number | null; prefill: number | null; ttftMs: number | null; avgCtx: number | null;
  firstDate: string; lastDate: string;
};

const rate = (tok: number, ms: number): number | null => (ms > 0 ? Math.round((tok / (ms / 1000)) * 10) / 10 : null);

/** The models a session actually ran (non-empty, with at least one step). */
const usedModels = (s: any): any[] => (s.models || []).filter((m: any) => m && m.key && (m.steps || 0) > 0);

/**
 * A session that switched models mid-run cannot be compared like-for-like with a
 * single-model run: its per-model tokens are real, but the session as a whole is
 * a blend, and its costs/speeds answer a different question. Those sessions are
 * excluded from the per-model stats below and collected under "mix" instead.
 */
const isMixed = (s: any): boolean => usedModels(s).length > 1;

/** Build one Run from a session's per-model rollup. */
function makeRun(s: any, m: any): Run {
  const b = m.buckets || {};
  const steps = m.steps || 0;
  const run: Run = {
    id: s.id, date: s.date || "", title: s.title || s.cwd || s.id,
    steps,
    in: b.uncachedInputTokens || 0,
    out: b.outputTokens || 0,
    cache: (b.cacheReadTokens || 0) + (b.cacheWriteTokens || 0),
    think: m.reasoningTokens || 0,
    ctx: m.ctxTokens || 0,
    dTok: m.decodeTokens || 0, dMs: m.decodeMs || 0,
    pTok: m.prefillTokens || 0, pMs: m.prefillMs || 0, pSteps: m.prefillSteps || 0,
    decode: null, prefill: null, ttftMs: null, avgCtx: null,
    p2p: !!s.p2p,
  };
  run.decode = rate(run.dTok, run.dMs);
  run.prefill = rate(run.pTok, run.pMs);
  run.ttftMs = run.pSteps > 0 ? Math.round(run.pMs / run.pSteps) : null;
  run.avgCtx = steps > 0 ? Math.round(run.ctx / steps) : null;
  return run;
}

/** One mixed session: every model it ran, in the order they appear. */
type Mixed = {
  id: string; date: string; title: string; p2p: boolean;
  runs: { run: Run; key: string; provider: string | null }[];
  total: number; steps: number; models: number;
};

function buildMixed(bySession: any[]): Mixed[] {
  return (bySession || [])
    .filter(isMixed)
    .map((s) => {
      const runs = usedModels(s).map((m) => ({ run: makeRun(s, m), key: m.key, provider: m.provider || null }));
      return {
        id: s.id, date: s.date || "", title: s.title || s.cwd || s.id, p2p: !!s.p2p,
        runs,
        total: runs.reduce((n, r) => n + r.run.in + r.run.out + r.run.cache + r.run.think, 0),
        steps: runs.reduce((n, r) => n + r.run.steps, 0),
        models: runs.length,
      };
    })
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
}

function buildGroups(bySession: any[]): Group[] {
  const by = new Map<string, Group>();
  // Only single-model sessions take part in the per-model stats.
  for (const s of (bySession || []).filter((x: any) => !isMixed(x))) {
    for (const m of usedModels(s)) {
      const steps = m.steps || 0;
      let g = by.get(m.key);
      if (!g) {
        g = {
          key: m.key, label: m.key, provider: m.provider || null, runs: [],
          sessions: 0, steps: 0, in: 0, out: 0, cache: 0, think: 0, total: 0,
          decode: null, prefill: null, ttftMs: null, avgCtx: null, firstDate: "", lastDate: "",
        };
        by.set(m.key, g);
      }
      const run = makeRun(s, m);
      g.runs.push(run);
      g.sessions++;
      g.steps += steps;
      g.in += run.in; g.out += run.out; g.cache += run.cache; g.think += run.think;
      g.total += run.in + run.out + run.cache + run.think;
    }
  }
  for (const g of by.values()) {
    g.runs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
    const T = g.runs.reduce((a, r) => ({
      dTok: a.dTok + r.dTok, dMs: a.dMs + r.dMs,
      pTok: a.pTok + r.pTok, pMs: a.pMs + r.pMs, pSteps: a.pSteps + r.pSteps, ctx: a.ctx + r.ctx,
    }), { dTok: 0, dMs: 0, pTok: 0, pMs: 0, pSteps: 0, ctx: 0 });
    g.decode = rate(T.dTok, T.dMs);
    g.prefill = rate(T.pTok, T.pMs);
    g.ttftMs = T.pSteps > 0 ? Math.round(T.pMs / T.pSteps) : null;
    g.avgCtx = g.steps > 0 ? Math.round(T.ctx / g.steps) : null;
    g.firstDate = g.runs.length ? g.runs[0].date : "";
    g.lastDate = g.runs.length ? g.runs[g.runs.length - 1].date : "";
  }
  // Heaviest model first — the one that actually consumed the machine leads.
  return [...by.values()].sort((a, b) => b.total - a.total || b.steps - a.steps);
}

/** A single stacked bar showing how this model's tokens split across buckets. */
const allocBar = (g: Group): any => {
  const segs = [
    { k: "In", v: g.in, c: "#60a5fa" },
    { k: "Out", v: g.out, c: "#a78bfa" },
    { k: "Cache", v: g.cache, c: "#2dd4bf" },
    { k: "Think", v: g.think, c: "#c084fc" },
  ];
  const tot = segs.reduce((n, s) => n + s.v, 0) || 1;
  return jsxs("div", { children: [
    jsx("div", { style: { display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "rgba(148,163,184,0.15)" }, children:
      segs.filter((s) => s.v > 0).map((s) => jsx("div", {
        style: { width: (s.v / tot) * 100 + "%", background: s.c, height: "100%" },
        title: s.k + " · " + fmt(s.v) + " (" + ((s.v / tot) * 100).toFixed(1) + "%)",
      }, s.k)) }),
    jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, fontSize: 11 }, children:
      segs.map((s) => jsxs("span", { style: { display: "flex", alignItems: "center", gap: 5, color: "#94a3b8" }, children: [
        jsx("span", { style: { width: 8, height: 8, borderRadius: 2, background: s.c, display: "inline-block" } }),
        jsx("span", { children: s.k }),
        jsx("span", { className: "tg-num", style: { color: "#e5e7eb", fontWeight: 600 }, children: fmtC(s.v) }),
        jsx("span", { style: { color: "#64748b" }, children: ((s.v / tot) * 100).toFixed(1) + "%" }),
      ]}, s.k)) }),
  ]});
};

/** The per-session speed chart — no axis labels, session id + speeds in the tooltip. */
const runChart = (g: Group): any =>
  jsx(AmBarChart, {
    data: g.runs.map((r) => ({
      cat: shortId(r.id),
      decode: r.decode ?? 0,
      prefill: r.prefill ?? 0,
    })),
    categoryField: "cat",
    hideCategoryLabels: true, // same model on every bar — the axis would only repeat itself
    series: [
      { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
      { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 1 },
    ],
    height: 220,
  });

function groupBody(g: Group): any {
  const perf = jsxs("div", { children: [
    jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "⚡ Performance — this model only" }),
    badgeGrid([
      costCard("Decode (time-weighted)", g.decode != null ? g.decode + " tok/s" : "—", g.runs.length + " runs · " + fmt(g.steps) + " steps", "#38bdf8"),
      costCard("Prefill (time-weighted)", g.prefill != null ? Math.round(g.prefill) + " tok/s" : "—", "new ctx ÷ TTFT (lower bound)", "#2dd4bf"),
      costCard("Avg TTFT", g.ttftMs != null ? fmtMs(g.ttftMs) : "—", "request → first token", "#fbbf24"),
      costCard("Avg context", g.avgCtx != null ? fmtC(g.avgCtx) : "—", "prompt tokens per step", "#a78bfa"),
    ]),
  ]});
  const alloc = jsxs("div", { children: [
    jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 4 }, children: "🪙 Allocation — where this model's tokens went" }),
    jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 10 }, children: fmtC(g.total) + " tokens attributed to this model across " + g.runs.length + " run(s). Think is a subdivision of Out (shown separately, never double-counted); Cache = cache read + write." }),
    allocBar(g),
  ]});
  const table = jsxs("div", { children: [
    jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Runs — oldest → newest" }),
    jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
      jsx("tr", { children: [thL("Date"), thL("Session"), thR("Steps"), thR("Decode"), thR("Prefill"), thR("Avg TTFT"), thR("Avg ctx"), thR("In"), thR("Out"), thR("Cache"), thR("Think")] }),
      ...g.runs.map((r) => jsxs("tr", {
        className: "tg-tr",
        children: [
          tdL(jsxs("span", { style: { whiteSpace: "nowrap" }, children: [
            r.p2p ? jsx("span", { style: { color: "#34d399", marginRight: 5, fontWeight: 700 }, title: "P2P-enablement evidence in this session's trajectory", children: "●" }) : null,
            r.date,
          ] })),
          tdL(jsxs("span", { children: [
            jsx("span", { style: { color: "#64748b", marginRight: 6 }, children: shortId(r.id) }),
            String(r.title).slice(0, 34),
          ] }), { title: r.id + " · " + r.title, style: { maxWidth: 260, whiteSpace: "normal", wordBreak: "break-word" } }),
          tdR(String(r.steps)),
          tdR(r.decode != null ? r.decode + " tok/s" : "—", { style: { fontWeight: 700 }, title: fmt(r.dTok) + " tokens ÷ " + fmtMs(r.dMs) }),
          tdR(r.prefill != null ? Math.round(r.prefill) + " tok/s" : "—", { title: fmt(r.pTok) + " new ctx tokens ÷ " + fmtMs(r.pMs) + " TTFT" }),
          tdR(r.ttftMs != null ? fmtMs(r.ttftMs) : "—"),
          tdR(r.avgCtx != null ? fmtC(r.avgCtx) : "—"),
          tdR(fmtC(r.in), { title: fmt(r.in) }),
          tdR(fmtC(r.out), { title: fmt(r.out) }),
          tdR(fmtC(r.cache), { title: fmt(r.cache) }),
          tdR(r.think > 0 ? fmtC(r.think) : "—", { title: fmt(r.think) + " reasoning tokens" }),
        ],
      }, r.id)),
    ]})}),
  ]});
  return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 22 }, children: [perf, alloc, table] });
}

/** The "mix" drawer: every session that switched models, with its blend spelled out. */
function mixBody(mixed: Mixed[]): any {
  const MODEL_COLORS = ["#38bdf8", "#a78bfa", "#2dd4bf", "#fbbf24", "#f472b6", "#34d399"];
  return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: [
    jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "These " + mixed.length + " session(s) changed model mid-run, so they are kept out of the per-model stats above — a blended session would otherwise fold one model's rate into another's average. Each block below shows the blend: which models ran, how many steps each served, and how the tokens split. Speeds are per model, computed only from that model's own steps." }),
    ...mixed.map((mx) => {
      const tot = mx.total || 1;
      const segs = mx.runs.map((r, i) => ({
        key: r.key,
        v: r.run.in + r.run.out + r.run.cache + r.run.think,
        c: MODEL_COLORS[i % MODEL_COLORS.length],
      }));
      return jsxs("div", { style: { border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8, padding: "12px 14px" }, children: [
        jsxs("div", { style: { display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 10 }, children: [
          mx.p2p ? jsx("span", { style: { color: "#34d399", fontWeight: 700 }, title: "P2P-enablement evidence in this session's trajectory", children: "●" }) : null,
          jsx("span", { style: { color: "#64748b", fontSize: 11 }, children: mx.date }),
          jsx("span", { style: { color: "#64748b", fontSize: 11 }, children: shortId(mx.id) }),
          jsx("span", { style: { fontWeight: 600, maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: mx.title, children: mx.title }),
          jsx("span", { className: "tg-faint", style: { fontSize: 11, marginLeft: "auto", whiteSpace: "nowrap" }, children: mx.models + " models · " + fmt(mx.steps) + " steps · " + fmtC(mx.total) + " tokens" }),
        ]}),
        // blend bar — one segment per model, width = its share of the session's tokens
        jsx("div", { style: { display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "rgba(148,163,184,0.15)", marginBottom: 10 }, children:
          segs.filter((s) => s.v > 0).map((s) => jsx("div", {
            style: { width: (s.v / tot) * 100 + "%", background: s.c, height: "100%" },
            title: s.key + " · " + fmt(s.v) + " (" + ((s.v / tot) * 100).toFixed(1) + "%)",
          }, s.key)) }),
        jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
          jsx("tr", { children: [thL("Model"), thR("Steps"), thR("Decode"), thR("Prefill"), thR("Avg TTFT"), thR("Share"), thR("In"), thR("Out"), thR("Cache"), thR("Think")] }),
          ...mx.runs.map((r, i) => {
            const v = r.run.in + r.run.out + r.run.cache + r.run.think;
            return jsxs("tr", {
              className: "tg-tr",
              children: [
                tdL(jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } , children: [
                  jsx("span", { style: { width: 8, height: 8, borderRadius: 2, background: MODEL_COLORS[i % MODEL_COLORS.length], display: "inline-block", flexShrink: 0 } }),
                  jsx("span", { style: { maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: r.key, children: r.key }),
                ]})),
                tdR(String(r.run.steps)),
                tdR(r.run.decode != null ? r.run.decode + " tok/s" : "—", { style: { fontWeight: 700 }, title: fmt(r.run.dTok) + " tokens ÷ " + fmtMs(r.run.dMs) }),
                tdR(r.run.prefill != null ? Math.round(r.run.prefill) + " tok/s" : "—", { title: fmt(r.run.pTok) + " new ctx tokens ÷ " + fmtMs(r.run.pMs) }),
                tdR(r.run.ttftMs != null ? fmtMs(r.run.ttftMs) : "—"),
                tdR(((v / tot) * 100).toFixed(1) + "%", { title: fmt(v) + " tokens" }),
                tdR(fmtC(r.run.in), { title: fmt(r.run.in) }),
                tdR(fmtC(r.run.out), { title: fmt(r.run.out) }),
                tdR(fmtC(r.run.cache), { title: fmt(r.run.cache) }),
                tdR(r.run.think > 0 ? fmtC(r.run.think) : "—", { title: fmt(r.run.think) + " reasoning tokens" }),
              ],
            }, r.key);
          }),
        ]})}),
      ]}, mx.id);
    }),
  ]});
}

export function RunsTab({ bySession }: { bySession: any[] }) {
  const groups = buildGroups(bySession);
  const mixed = buildMixed(bySession);
  if (!groups.length && !mixed.length) {
    return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No per-model runs yet — appears once sessions record per-turn usage." });
  }
  // The heaviest model opens by default so the tab lands on something useful.
  const [open, setOpen] = React.useState<string | null>(groups.length ? groups[0].key : null);
  const chip = (label: string, value: string, color: string) => jsxs("span", { style: { display: "inline-flex", alignItems: "baseline", gap: 5, background: "rgba(148,163,184,0.10)", borderRadius: 6, padding: "3px 8px", fontSize: 11, whiteSpace: "nowrap" }, children: [
    jsx("span", { style: { width: 6, height: 6, borderRadius: 3, background: color, display: "inline-block", alignSelf: "center" } }),
    jsx("span", { style: { color: "#94a3b8" }, children: label }),
    jsx("span", { className: "tg-num", style: { color: "#e5e7eb", fontWeight: 700 }, children: value }),
  ]});
  const mixTotal = mixed.reduce((n, m) => n + m.total, 0);
  const mixSteps = mixed.reduce((n, m) => n + m.steps, 0);
  return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
    jsxs("div", { children: [
      jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "🏁 Runs by model — like-for-like over time" }),
      jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "Sessions are grouped by the model that served them, so a model is only ever compared against itself. Only single-model sessions are counted here — sessions that switched models are held out in the Mix drawer at the bottom, where a blended rate can't distort a model's average. Expand a model for its aggregate token performance and allocation, and a per-session speed chart — the chart carries no axis labels because every bar is the same model: hover a bar for the session id and its speeds. Leader = most tokens." }),
    ]}),
    ...groups.map((g) => {
      const isOpen = open === g.key;
      const head = jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", width: "100%" }, children: [
        jsx("span", { style: { fontWeight: 700, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: g.key, children: g.label }),
        g.provider ? jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: g.provider }) : null,
        chip("runs", String(g.runs.length), "#60a5fa"),
        chip("steps", fmt(g.steps), "#60a5fa"),
        chip("decode", g.decode != null ? g.decode + " tok/s" : "—", "#38bdf8"),
        chip("prefill", g.prefill != null ? Math.round(g.prefill) + " tok/s" : "—", "#2dd4bf"),
        chip("tokens", fmtC(g.total), "#fbbf24"),
        jsx("span", { className: "tg-faint", style: { fontSize: 11, marginLeft: "auto", whiteSpace: "nowrap" }, children: g.firstDate === g.lastDate ? g.firstDate : g.firstDate + " → " + g.lastDate }),
      ]});
      return jsxs("div", { key: g.key, children: [
        jsx(Collapse, { label: head, defaultOpen: isOpen, onOpenChange: (o: boolean) => setOpen(o ? g.key : null), children: jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 22 }, children: [
          jsxs("div", { children: [
            jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "📈 Speeds per run — same model, oldest → newest" }),
            jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Decode on the left axis, prefill on the right (prefill runs an order of magnitude faster, so they must not share a scale). No category labels: hover any bar to read the session id and its speeds." }),
            runChart(g),
          ]}),
          groupBody(g),
        ]}) }),
      ]}, g.key);
    }),
    mixed.length ? jsxs("div", { children: [
      jsx(Collapse, { label: jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", width: "100%" }, children: [
        jsx("span", { style: { fontWeight: 700 }, children: "🔀 Mix — sessions that switched model" }),
        jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "held out of the stats" }),
        chip("sessions", String(mixed.length), "#f472b6"),
        chip("steps", fmt(mixSteps), "#60a5fa"),
        chip("tokens", fmtC(mixTotal), "#fbbf24"),
        jsx("span", { className: "tg-faint", style: { fontSize: 11, marginLeft: "auto", whiteSpace: "nowrap" }, children: (mixed[0].date === mixed[mixed.length - 1].date) ? mixed[0].date : mixed[0].date + " → " + mixed[mixed.length - 1].date }),
      ]}), children: mixBody(mixed) }),
    ]}) : null,
  ]});
}
