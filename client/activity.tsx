// token-gobbler · client/activity.tsx
// Settings dashboard section + the wider activity overlay (floating trigger +
// modal) and the surface registration (apply/inject) that the host calls.
import { CSS, NS, text, fmt, fmtC, money, fmtMs, statCard, eventChips, toolTable, segBtn, request, humanizeModel } from "./core";
import { TgTable } from "./table";
import { perfDrawer, tokenTreeDrawer, Collapse } from "./drawers";
import { AmBarChart } from "./amchart";
import { realModelTable, perfModelTable, perfSessionTable, comparisonTable, sessionTable, dayTable, pricingTab, costCard } from "./panels";
import { useGobblerData, activityRef } from "./hooks";

export function TokenGobblerSettings(props: any) {
  const close = props && props.close;
  const { data, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();

  if (loading) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8", fontSize: 14 }, children: "Counting the gobbled tokens…" })] });
  if (error && !data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsxs("div", { style: { padding: 24 }, children: [jsx("div", { style: { fontWeight: 700 }, children: "Couldn't load token usage" }), jsx("div", { style: { color: "#f87171", marginTop: 6, fontSize: 13 }, children: error })] })] });
  if (!data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8" }, children: "No data." })] });

  const t = data.totals;
  const wfh = data.split && data.split.wfh;
  const refLabel = (wfh && wfh.referenceLabel) || "corp";
  const ev = data.events || null;
  const dec = data.decode;
  const byModel = data.byModel || [];
  const fastest = byModel.filter((m: any) => m.tokPerSec != null).sort((a: any, b: any) => b.tokPerSec - a.tokPerSec)[0] || null;
  const sec = (label: string) => jsx("div", { className: "tg-sec", children: label });
  const chip = (label: string, value: any, color: string) => jsxs("div", { className: "tg-chip", children: [
    jsx("span", { className: "tg-stat-dot", style: { background: color } }),
    jsx("span", { className: "tg-chip-label", children: label }),
    jsx("span", { className: "tg-chip-value tg-num", children: value }),
  ]});
  const wfhCard = wfh ? jsxs("div", { className: "tg-card tg-wfh", children: [
    jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
      jsx("div", { className: "tg-label", style: { color: "#34d399" }, children: "🏠 WFH compute — local sessions" }),
      wfh.saved != null && wfh.saved > 0 ? jsx("span", { className: "tg-badge", children: "💰 saved " + money(wfh.saved) + " vs " + refLabel + " rates" }) : null,
    ]}),
    jsx("div", { className: "tg-wfh-value tg-num", children: money(wfh.cost) }),
    jsx("div", { style: { color: "#94a3b8", fontSize: 12, marginTop: 8, lineHeight: 1.5 }, children:
      fmt(wfh.sessions) + " local sessions · " + fmtC(wfh.tokens) + " tokens metered on the home lab" +
      (wfh.corpCost != null ? " — at " + refLabel + " rates that would bill " + money(wfh.corpCost) : "")
    }),
  ]}) : null;
  const openActivity = () => { if (close) close(); if (activityRef.open) activityRef.open("cost"); };

  return jsxs("div", {
    className: "tg-root",
    style: { display: "flex", flexDirection: "column", gap: 16, padding: 2 },
    children: [
      jsx("style", { children: CSS }),
      jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, children: [
        jsxs("div", { children: [
          jsx("div", { style: { fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em" }, children: "🦃 Token Gobbler" }),
          jsx("div", { style: { color: "#94a3b8", marginTop: 3, fontSize: 13 }, children: "Every token you fed the machine — your WFH compute, and what it would've cost the corp." }),
        ]}),
        jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          jsx("button", { className: "tg-ghost", onClick: openActivity, children: "Open activity view" }),
          jsx("button", { className: "tg-refresh", onClick: () => loadData(), disabled: refreshing || loading, children: refreshing ? "Refreshing…" : "↻ Refresh" }),
          jsx("button", { className: "tg-reprocess", onClick: () => reprocess(), disabled: reprocessing || refreshing || loading, children: reprocessing ? "Reprocessing…" : "♻ Reprocess" }),
        ]}),
      ]}),
      reprocessMsg ? jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: -6 }, children: reprocessMsg }) : null,
      jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
        sec("💰 Cost — what it adds up to"),
        jsxs("div", { className: "tg-card tg-hero", children: [
          jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
            jsx("div", { className: "tg-label", children: "What you actually ran" }),
            data.actualSavings > 0 ? jsx("span", { className: "tg-badge", children: "💰 Home lab saved " + money(data.actualSavings) }) : null,
          ]}),
          jsx("div", { className: "tg-hero-value tg-num", style: { color: "#f8fafc" }, children: money(data.actual.cost) }),
          jsx("div", { style: { color: "#94a3b8", fontSize: 12, marginTop: 9, lineHeight: 1.5 }, children: data.actual.note }),
        ]}),
        wfhCard,
      ]}),
      jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
        sec("🪙 Tokens — everything metered"),
        jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
          statCard("Input (uncached)", t.uncachedInputTokens, "#60a5fa", false),
          statCard("Output", t.outputTokens, "#a78bfa", false),
          statCard("Cache read", t.cacheReadTokens, "#2dd4bf", false),
          statCard("Cache write", t.cacheWriteTokens, "#f472b6", false),
          statCard("Total tokens", t.allTokens, "#fbbf24", true),
        ]}),
      ]}),
      (dec && dec.tokPerSec != null) ? jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
        sec("⚡ Speed — how fast it ran"),
        jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }, children: [
          jsxs("div", { className: "tg-card tg-stat", children: [
            jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
              jsx("span", { className: "tg-stat-dot", style: { background: "#fbbf24" } }),
              jsx("span", { className: "tg-label", children: "Average decode speed" }),
            ]}),
            jsx("div", { className: "tg-stat-value tg-num", children: dec.tokPerSec + " tok/s" }),
            jsx("div", { style: { color: "#94a3b8", fontSize: 11, marginTop: 5 }, children:
              fmtC(dec.tokens) + " streamed tokens · " + fmtMs(dec.ms) + " of decode time" +
              (fastest ? " · fastest " + fastest.label + " at " + fastest.tokPerSec + " tok/s" : "") }),
          ]}),
          (data.prefill && data.prefill.tokPerSec != null) ? jsxs("div", { className: "tg-card tg-stat", children: [
            jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
              jsx("span", { className: "tg-stat-dot", style: { background: "#2dd4bf" } }),
              jsx("span", { className: "tg-label", children: "Prompt processing (new ctx)" }),
            ]}),
            jsx("div", { className: "tg-stat-value tg-num", children: data.prefill.tokPerSec + " tok/s" }),
            jsx("div", { style: { color: "#94a3b8", fontSize: 11, marginTop: 5 }, children:
              fmtC(data.prefill.tokens) + " new context tokens · " + fmtMs(data.prefill.ms) + " of TTFT" +
              (data.prefill.avgTtftMs != null ? " · avg TTFT " + fmtMs(data.prefill.avgTtftMs) : "") }),
          ]}) : null,
        ]}),
      ]}) : null,
      ev ? jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
        sec("📊 Activity — what actually happened"),
        jsx("div", { className: "tg-chipgrid", children: [
          chip("Sessions", fmt(data.sources.projcache.sessions), "#60a5fa"),
          chip("LLM steps", fmt(ev.steps || 0), "#60a5fa"),
          chip("Tool calls", fmt((ev.toolCalls || 0) + (ev.toolSubCalls || 0)), "#a78bfa"),
          chip("Your messages", fmt(ev.userMessages || 0), "#34d399"),
          chip("Assistant msgs", fmt(ev.assistantMessages || 0), "#2dd4bf"),
          chip("Turns", fmt(ev.turns || 0), "#fbbf24"),
          chip("Compactions", fmt(ev.compactions || 0), "#f472b6"),
        ]}),
      ]}) : null,
      jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "sources: " + data.sources.projcache.sessions + " sessions (" + data.sources.projcache.nonZero + " with usage) · " + data.sources.trajectories.files + " trajectories (" + data.sources.trajectories.withUsage + " with per-turn usage, " + data.sources.trajectories.withModelTimeline + " with model events" + (data.sources.trajectories.cache ? " · parse cache " + data.sources.trajectories.cache.hits + " hits / " + data.sources.trajectories.cache.recomputed + " recomputed" : "") + ")" }),
    ],
  });
}

export function TokenGobblerModal({ onClose, initialTab }: { onClose: () => void; initialTab?: string }) {
  const { data, breakdown, perf, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();
  const [tab, setTab] = React.useState(initialTab || "events");
  const [openSession, setOpenSession] = React.useState<string | null>(null);
  const [openToken, setOpenToken] = React.useState<string | null>(null);
  const [pageState, setPageState] = React.useState<any>({});
  const pageFor = (k: string) => pageState[k] || 0;
  const setPageFor = (k: string) => (p: number) => setPageState((s: any) => ({ ...s, [k]: p }));
  const [pricingData, setPricingData] = React.useState<any>(null);
  const [draft, setDraft] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState<any>(null);
  const [addRow, setAddRow] = React.useState<any>({ id: "", label: "", input: "", output: "", cacheRead: "", cacheWrite: "", kind: "corp" });
  const [discovering, setDiscovering] = React.useState(false);
  const [discoverMsg, setDiscoverMsg] = React.useState<any>(null);
  const loadPricingData = React.useCallback(async () => {
    try {
      const p = await request("/pricing");
      setPricingData(p);
      setDraft({ referenceModel: p.referenceModel, models: p.models, fromFile: p.fromFile, seeded: p.seeded });
    } catch (e) {
      setSaveMsg({ kind: "err", text: "Couldn't load pricing: " + (e instanceof Error ? e.message : String(e)) });
    }
  }, []);
  React.useEffect(() => { loadPricingData(); }, [loadPricingData]);
  const doSave = React.useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const models = draft.models.map((m: any) => ({ ...m, input: m.input === "" ? 0 : m.input, output: m.output === "" ? 0 : m.output, cacheRead: m.cacheRead === "" ? 0 : m.cacheRead, cacheWrite: m.cacheWrite === "" ? 0 : m.cacheWrite }));
      const saved = await request("/pricing", { referenceModel: draft.referenceModel, models });
      setPricingData(saved);
      setDraft({ referenceModel: saved.referenceModel, models: saved.models, fromFile: true, seeded: false });
      setSaveMsg({ kind: "ok", text: "Saved — all costs re-priced." });
      await loadData();
    } catch (e) {
      setSaveMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }, [draft, loadData]);
  const addModel = React.useCallback(() => {
    const id = addRow.id.trim().toLowerCase();
    if (!id) { setSaveMsg({ kind: "err", text: "New model needs an id." }); return; }
    setDraft((d: any) => {
      if (!d) return d;
      if (d.models.some((m: any) => m.id === id)) { setSaveMsg({ kind: "err", text: "Model id already in the table." }); return d; }
      const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : 0; };
      setSaveMsg(null);
      return { ...d, models: [...d.models, { id, label: addRow.label.trim() || id, input: n(addRow.input), output: n(addRow.output), cacheRead: n(addRow.cacheRead), cacheWrite: n(addRow.cacheWrite), estimated: false, local: addRow.kind === "local", corp: addRow.kind !== "local" }] };
    });
    setAddRow({ id: "", label: "", input: "", output: "", cacheRead: "", cacheWrite: "" });
  }, [addRow]);

  // Scan every processed trajectory and merge the discovered LOCAL models into
  // the draft table — each local provider/model becomes its own row (marked
  // local) instead of being folded into the qwen baseline.
  const discoverLocal = React.useCallback(async () => {
    setDiscovering(true);
    setDiscoverMsg(null);
    try {
      const found = await request("/discover-models");
      const list = Array.isArray(found) ? found : [];
      const known = new Set((draft ? draft.models : []).map((m: any) => m.id));
      const add = list.filter((lp: any) => lp && lp.id && !known.has(lp.id));
      if (add.length) {
        const rows = add.map((lp: any) => ({ id: lp.id, label: humanizeModel(lp.id), provider: lp.provider || null, input: lp.input || 0, output: lp.output || 0, cacheRead: lp.cacheRead || 0, cacheWrite: lp.cacheWrite || 0, estimated: false, local: true, corp: false }));
        setDraft((d: any) => (d ? { ...d, models: [...d.models, ...rows] } : d));
      }
      setDiscoverMsg(add.length ? "Added " + add.length + " local model" + (add.length > 1 ? "s" : "") + " from trajectories." : "No new local models found — all already listed.");
    } catch (e) {
      setDiscoverMsg("Scan failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDiscovering(false);
    }
  }, [draft]);

  React.useEffect(() => {
    const onKey = (e: any) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  let body: any;
  if (loading) body = jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Counting the gobbled tokens…" });
  else if (error && !data) body = jsx("div", { style: { padding: 40, color: "#f87171", textAlign: "center" }, children: error });
  else if (!data) body = jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "No data." });
  else {
    const bySession = (breakdown && breakdown.bySession) || [];
    const byDay = (breakdown && breakdown.byDay) || [];
    const events = data.events || (breakdown && breakdown.events) || null;
    const tools = data.tools || (breakdown && breakdown.tools) || [];
    const eventsTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Activity by event type" }),
        eventChips(events),
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Top tools (what actually ran)" }),
        toolTable(tools, true),
      ]}),
    ]});
    const modelsTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 22 }, children: [
      jsxs("div", { children: [jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "What you actually ran (real mix)" }), realModelTable(data.byModel)] }),
      jsxs("div", { children: [jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "What it would cost the corp" }), comparisonTable(data.comparison)] }),
    ]});
    const sessionsTab = sessionTable(bySession, openSession, setOpenSession);
    const unpriced = (data.byModel || []).filter((m: any) => m.cost == null);
    const pricingTabEl = pricingTab({
      draft, setDraft, saving, saveMsg,
      onSave: doSave,
      addRow, setAddRow, onAdd: addModel,
      unpriced,
      onPrefill: (id, label) => { setAddRow({ id, label: label === id ? "" : label, input: "", output: "", cacheRead: "", cacheWrite: "" }); setSaveMsg(null); },
      pricingPath: pricingData ? pricingData.path : null,
      fromFile: draft ? draft.fromFile : false,
      discovering, discoverMsg, onDiscover: discoverLocal,
    });
    const wfh = (data.split && data.split.wfh) || { sessions: 0, tokens: 0, cost: 0, corpCost: null, saved: null, referenceLabel: null };
    const cop = (data.split && data.split.corp) || { sessions: 0, tokens: 0, cost: 0 };
    const sv = data.savings;
    const refLabel = wfh.referenceLabel || "corp";
    const costTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
      jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }, children: [
        costCard("WFH compute (local)", money(wfh.cost), fmt(wfh.sessions) + " sessions · " + fmtC(wfh.tokens) + " tokens", "#34d399"),
        costCard("Corp (billed)", money(cop.cost), fmt(cop.sessions) + " sessions · " + fmtC(cop.tokens) + " tokens", "#f87171"),
        costCard("Total actual", money(data.actual.cost), "priced from " + data.actual.source, "#fbbf24"),
        costCard("WFH savings", money(wfh.saved != null ? wfh.saved : 0), "local tokens at " + refLabel + " rates vs home lab", "#34d399"),
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "What it would cost the corp (all tokens on one model)" }),
        comparisonTable(data.comparison),
        sv && sv.max > 0 ? jsx("div", { style: { color: "#34d399", fontSize: 13, marginTop: 12, fontWeight: 600 }, children: "💰 You save " + (sv.min > 0 && sv.min < sv.max ? money(sv.min) + "–" + money(sv.max) : money(sv.max)) + " by running local instead of the corp." }) : null,
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by day" }),
        dayTable(byDay),
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by session" }),
        sessionTable(bySession, openSession, setOpenSession),
      ]}),
    ]});
    const performanceTabEl = perf === undefined
      ? jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Counting the gobbled tokens…" })
      : perf === null
        ? jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Performance data unavailable — restart the web server (dsh web) to enable the Performance tab." })
        : perf && perf.__error
          ? jsx("div", { style: { padding: 40, color: "#f87171", textAlign: "center" }, children: "Performance data failed to load: " + perf.__error })
          : jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
          jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }, children: [
            costCard("Decode speed (avg)", perf.totals.decode.tokPerSec != null ? perf.totals.decode.tokPerSec + " tok/s" : "—", fmtC(perf.totals.decode.tokens) + " streamed tokens · " + fmtMs(perf.totals.decode.ms), "#fbbf24"),
            costCard("Prompt processing (avg)", perf.totals.prefill.tokPerSec != null ? perf.totals.prefill.tokPerSec + " tok/s" : "—", fmtC(perf.totals.prefill.tokens) + " new ctx tokens · " + fmtMs(perf.totals.prefill.ms) + " of TTFT" + (perf.totals.prefill.avgTtftMs != null ? " · avg " + fmtMs(perf.totals.prefill.avgTtftMs) : ""), "#2dd4bf"),
          ]}),
          jsxs("div", { children: [
            jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Performance by model" }),
            jsx(AmBarChart, {
              data: (perf.byModel || []).map((m: any) => ({ cat: m.label, decode: m.tokPerSec ?? 0, prefill: m.promptTokPerSec ?? 0 })),
              categoryField: "cat",
              series: [
                { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
                { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 0 },
              ],
              height: 240,
            }),
            jsx(Collapse, { label: "Show model table", children: perfModelTable(perf.byModel) }),
          ]}),
          jsxs("div", { children: [
            jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "All steps — expand a session to see its turn/step tree with tool calls + prefill/decode" }),
            TgTable({
              columns: [
                { key: "date", label: "Date" },
                { key: "title", label: "Session", render: (s: any) => s.title || s.cwd || s.id },
                { key: "modelMix", label: "Models" },
                { key: "turns", label: "Turns", align: "r", render: (s: any) => (s.stepTree || []).length || "—" },
                { key: "steps", label: "Steps", align: "r", render: (s: any) => (s.steps || []).length },
                { key: "tokPerSec", label: "Decode", align: "r", render: (s: any) => s.tokPerSec != null ? s.tokPerSec + " tok/s" : "—" },
                { key: "prefillPerSec", label: "Prefill", align: "r", render: (s: any) => {
                    const steps = s.steps || [];
                    let tok = 0, ms = 0;
                    for (const st of steps) { tok += (st.in || 0); ms += (st.ttftMs || 0); }
                    return ms > 0 ? Math.round((tok / (ms / 1000)) * 10) / 10 + " tok/s" : "—";
                  }, props: (s: any) => ({ title: "prompt processing = new (uncached) input tokens ÷ TTFT across all " + (s.steps || []).length + " step(s)" }) },
              ],
              rows: bySession.filter((s: any) => s.steps && s.steps.length),
              rowKey: (s: any) => s.id,
              expandedId: openSession, onToggle: setOpenSession,
              drawer: perfDrawer,
              page: pageFor("perfTree"), setPage: setPageFor("perfTree"), pageSize: 25,
              empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No per-step timing yet — sessions with per-turn usage will appear here." }),
            }),
          ]}),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children:
            "Decode = streamed output tokens ÷ decode time (first→last chunk). Prefill = new (uncached) input tokens ÷ TTFT (request→first token) — TTFT includes network + queue, so prefill speed is a lower bound on the model's true prompt-processing rate. Cached context is served from the provider's cache and isn't counted as new work. Only sessions with per-turn usage carry timing." }),
        ]});

    // Tokens tab: table rows (run summary) whose drawer expands the CLI turn → step tree.
    const tokensTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Token breakdown — per turn & step" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11 }, children: "Each row is a session; click to expand it. The drawer shows a summary + the breakdown per turn → step — every turn is a collapsible row, each LLM step a row showing the tools it called and the context tokens it moved (in / out / cache)." }),
      ]}),
      TgTable({
        columns: [
          { key: "date", label: "Date" },
          { key: "title", label: "Session", render: (s: any) => s.title || s.cwd || s.id },
          { key: "modelMix", label: "Models", render: (s: any) => s.modelMix },
          { key: "steps", label: "Steps", align: "r", render: (s: any) => s.events ? (s.events.steps || 0) : "—" },
          { key: "allTokens", label: "Total", align: "r", render: (s: any) => fmtC(s.allTokens), props: { style: { fontWeight: 600 } } },
        ],
        rows: bySession.filter((s: any) => s.toolTokens && s.toolTokens.length),
        rowKey: (s: any) => s.id,
        expandedId: openToken, onToggle: setOpenToken,
        drawer: tokenTreeDrawer,
        page: pageFor("tokSess"), setPage: setPageFor("tokSess"), pageSize: 25,
        empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No per-step token data yet — appears once sessions record per-turn usage." }),
      }),
      jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "Tokens = the LLM step's full context attribution for the tools called in that step. Thinking = reasoning tokens (≈ estimated from reasoning text when the provider reports 0)." }),
    ]});
    body = tab === "events" ? eventsTab : tab === "cost" ? costTab : tab === "models" ? modelsTab : tab === "performance" ? performanceTabEl : tab === "tokens" ? tokensTab : tab === "pricing" ? pricingTabEl : sessionsTab;
  }

  return jsxs("div", { className: "tg-modal-overlay", role: "presentation", children: [
    jsx("div", { className: "tg-modal-mask", "aria-hidden": "true", onClick: onClose }),
    jsxs("div", { className: "tg-modal-panel", role: "dialog", "aria-modal": "true", children: [
      jsxs("div", { className: "tg-modal-header", children: [
        jsxs("div", { children: [
          jsx("div", { style: { fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }, children: "🦃 Token Gobbler — activity" }),
          jsx("div", { style: { color: "#94a3b8", marginTop: 2, fontSize: 12 }, children: "Events, tools, models and sessions across your whole DSH home." }),
        ]}),
        jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          jsx("button", { className: "tg-ghost", onClick: () => loadData(), disabled: refreshing, children: refreshing ? "Refreshing…" : "↻ Refresh" }),
          jsx("button", { className: "tg-reprocess", onClick: () => reprocess(), disabled: reprocessing || refreshing, children: reprocessing ? "Reprocessing…" : "♻ Reprocess" }),
          jsx("button", { className: "tg-close", onClick: onClose, "aria-label": "Close", children: "✕" }),
        ]}),
      ]}),
      reprocessMsg ? jsx("div", { className: "tg-faint", style: { fontSize: 11, padding: "0 20px 10px" }, children: reprocessMsg }) : null,
      jsx("div", { className: "tg-seg", style: { margin: "0 20px 16px" }, children: [segBtn(tab, setTab, "events", "Events"), segBtn(tab, setTab, "cost", "Cost"), segBtn(tab, setTab, "models", "Models"), segBtn(tab, setTab, "performance", "Performance"), segBtn(tab, setTab, "tokens", "Tokens"), segBtn(tab, setTab, "sessions", "Sessions"), segBtn(tab, setTab, "pricing", "Pricing")] }),
      jsx("div", { className: "tg-modal-body", children: body }),
    ]}),
  ]});
}

export function TokenGobblerOverlay() {
  const [open, setOpen] = React.useState(false);
  const [openTab, setOpenTab] = React.useState("events");
  React.useEffect(() => {
    activityRef.open = (tab) => { if (tab) setOpenTab(tab); setOpen(true); };
    return () => { activityRef.open = null; };
  }, []);
  // Fragment: no full-frame wrapper div, so the overlay never blocks app clicks.
  return jsxs(React.Fragment, { children: [
    jsx("style", { children: CSS }),
    jsx("button", { className: "tg-fab", onClick: () => { setOpenTab("events"); setOpen(true); }, title: "Token Gobbler — activity", "aria-label": "Open Token Gobbler activity", children: "🦃" }),
    open ? jsx(TokenGobblerModal, { onClose: () => setOpen(false), initialTab: openTab }) : null,
  ]});
}

export const inject = ["slots"];

export function apply(ctx: any) {
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section", id: "token-gobbler", order: 12, locale: NS, label: () => text("nav")
  }, TokenGobblerSettings));
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay", id: "token-gobbler", order: 50, label: () => "Token Gobbler"
  }, TokenGobblerOverlay));
}

/** Bundle entry surface — matches the plugin's module contract. */
export function createSurfaces() {
  return { apply, inject };
}
