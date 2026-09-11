// token-gobbler · client/activity.tsx
// Settings dashboard section + the wider activity overlay (floating trigger +
// modal) and the surface registration (apply/inject) that the host calls.
import { CSS, NS, text, fmt, fmtC, money, fmtMs, statCard, eventChips, toolTable, segBtn, request, humanizeModel, badgeGrid, thL, thR, tdL, tdR } from "./core";
import { SessionTable } from "./session-table";
import { aggregateSessions, daySeries as buildDaySeries, dayStr } from "./agg";
import { perfDrawer, tokenTreeDrawer, combinedDrawer, Collapse, TokenSpendChart } from "./drawers";
import { AmBarChart } from "./amchart";
import { realModelTable, perfModelTable, perfSessionTable, comparisonTable, sessionTable, dayTable, pricingTab, costCard, costModelTable } from "./panels";
import { DailyTab } from "./daily";
import { RunsTab } from "./runs";
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

export function TokenGobblerModal({ onClose, initialTab, initialDay }: { onClose: () => void; initialTab?: string; initialDay?: string | null }) {
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
      setDraft({ referenceModel: p.referenceModel, baselineModel: p.baselineModel, models: p.models, fromFile: p.fromFile, seeded: p.seeded });
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
      const saved = await request("/pricing", { referenceModel: draft.referenceModel, baselineModel: draft.baselineModel, models });
      setPricingData(saved);
      setDraft({ referenceModel: saved.referenceModel, baselineModel: saved.baselineModel, models: saved.models, fromFile: true, seeded: false });
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

  // Scan every processed trajectory and merge the discovered provider/model pairs
  // (local AND corp) into the draft table — so a user can onboard every provider/
  // model they ran (mark corp/local, set rates) instead of only the local ones.
  const discoverLocal = React.useCallback(async () => {
    setDiscovering(true);
    setDiscoverMsg(null);
    try {
      const found = await request("/discover-models");
      const list = Array.isArray(found) ? found : [];
      const known = new Set((draft ? draft.models : []).map((m: any) => m.id));
      const add = list.filter((lp: any) => lp && lp.id && !known.has(lp.id));
      if (add.length) {
        const rows = add.map((lp: any) => ({ id: lp.id, label: lp.label || humanizeModel(lp.id), provider: lp.provider || null, input: lp.input || 0, output: lp.output || 0, cacheRead: lp.cacheRead || 0, cacheWrite: lp.cacheWrite || 0, estimated: !!lp.estimated, local: !!lp.local, corp: !lp.local }));
        setDraft((d: any) => (d ? { ...d, models: [...d.models, ...rows] } : d));
      }
      setDiscoverMsg(add.length ? "Added " + add.length + " provider/model" + (add.length > 1 ? "s" : "") + " from trajectories — set their kind & rates, then save." : "No new models found — all already listed.");
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
      badgeGrid([
        costCard("WFH compute (local)", money(wfh.cost), fmt(wfh.sessions) + " sessions · " + fmtC(wfh.tokens) + " tokens", "#34d399"),
        costCard("Corp (billed)", money(cop.cost), fmt(cop.sessions) + " sessions · " + fmtC(cop.tokens) + " tokens", "#f87171"),
        costCard("Total actual", money(data.actual.cost), "priced from " + data.actual.source, "#fbbf24"),
        costCard("WFH savings", money(wfh.saved != null ? wfh.saved : 0), "local tokens at " + refLabel + " rates vs home lab", "#34d399"),
      ]),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Cost breakdown by model" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Every model you ran, with its token mix (in / out / think / cache), what it cost, how long it ran (TTFT + decode), and how fast it decoded / pre-filled. Think = reasoning tokens (authoritative, else ≈ chars/4 of the reasoning text). Cache = cache-read tokens (cache write in the tooltip). Decode & prefill are tok/s; TTFT is the average time to the first token." }),
        costModelTable(data.byModel),
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
          badgeGrid([
            costCard("Decode speed (avg)", perf.totals.decode.tokPerSec != null ? perf.totals.decode.tokPerSec + " tok/s" : "—", fmtC(perf.totals.decode.tokens) + " streamed tokens · " + fmtMs(perf.totals.decode.ms), "#fbbf24"),
            costCard("Prompt processing (avg)", perf.totals.prefill.tokPerSec != null ? perf.totals.prefill.tokPerSec + " tok/s" : "—", fmtC(perf.totals.prefill.tokens) + " new ctx tokens · " + fmtMs(perf.totals.prefill.ms) + " of TTFT" + (perf.totals.prefill.avgTtftMs != null ? " · avg " + fmtMs(perf.totals.prefill.avgTtftMs) : ""), "#2dd4bf"),
          ]),
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
            SessionTable({
              columns: { turns: true, runtime: false, total: false },
              rows: bySession.filter((s: any) => s.steps && s.steps.length),
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
    // Top-10 models by total tokens (byModel is already sorted desc by allTokens).
    const tokenModelRows = (data.byModel || []).slice(0, 10).map((m: any) => ({
      label: m.label,
      in: m.uncachedInputTokens ?? 0,
      out: m.outputTokens ?? 0,
      cache: (m.cacheReadTokens ?? 0) + (m.cacheWriteTokens ?? 0),
      think: m.reasoningTokens ?? 0,
    }));
    const tokensTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
      tokenModelRows.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Token spend by model — top 10 (all sessions)" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Top 10 models by total tokens. Each model's in / out / cache / thinking summed across every session. Thinking = reasoning tokens (exact-usage sessions only); it is a subdivision of Out, shown separately for insight." }),
        jsx(TokenSpendChart, { rows: tokenModelRows, horizontal: true, hideCategoryLabels: true, height: Math.min(440, 150 + tokenModelRows.length * 22) }),
      ]}) : null,
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Token breakdown — per turn & step" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11 }, children: "Each row is a session; click to expand it. The drawer shows a summary + the breakdown per turn → step — every turn is a collapsible row, each LLM step a row showing the tools it called and the context tokens it moved (in / out / cache)." }),
      ]}),
      SessionTable({
        columns: { decode: false, prefill: false, runtime: false },
        rows: bySession.filter((s: any) => s.toolTokens && s.toolTokens.length),
        expandedId: openToken, onToggle: setOpenToken,
        drawer: tokenTreeDrawer,
        page: pageFor("tokSess"), setPage: setPageFor("tokSess"), pageSize: 25,
        empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No per-step token data yet — appears once sessions record per-turn usage." }),
      }),
      jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "Tokens = the LLM step's full context attribution for the tools called in that step. Thinking = reasoning tokens (≈ estimated from reasoning text when the provider reports 0)." }),
    ]});
    // ── TEMP Combined tab: merges Performance (speed) + Tokens (usage) ──
    // The landing is BADGES of speed + token totals/averages (not a chart). Below,
    // a per-session table expands into the unified per-turn → step drawer that
    // surfaces every property of both source tabs.
    const combined = (() => {
      const mSec = data.sources && data.sources.projcache ? data.sources.projcache.sessions : (breakdown && breakdown.bySession ? breakdown.bySession.length : 0);
      const evC = data.events || null;
      const stepsN = (evC && evC.steps) || 0;
      const turnsN = (evC && evC.turns) || 0;
      const T = data.totals || {};
      const tin = T.uncachedInputTokens || 0;
      const tout = T.outputTokens || 0;
      const tc = (T.cacheReadTokens || 0) + (T.cacheWriteTokens || 0);
      const tAll = T.allTokens || (tin + tout + tc);
      const mRows = data.byModel || [];
      // Thinking total: sum the step trees' thinking (authoritative reasoningTokens + the
      // chars/4 estimate when the provider reports 0) so the summary badge matches the
      // per-session drawer. byModel.reasoningTokens only carries exact-usage reasoning.
      const tThink = aggregateSessions(bySession).tthink;
      const toolAgg = (breakdown && breakdown.toolTokensAggregate) || [];
      const tTools = toolAgg.reduce((n: number, t: any) => n + (t.total || 0), 0);
      const dec = data.decode || {};
      const pre = data.prefill || {};
      const fastest = mRows.filter((m: any) => m.tokPerSec != null).sort((a: any, b: any) => b.tokPerSec - a.tokPerSec)[0] || null;
      const avg = (tot: number, denom: number) => (denom > 0 ? Math.round(tot / denom) : null);
      // Per-day series for the over-time charts — shared aggregation (client/agg.ts).
      const daySeries = buildDaySeries(bySession);
      const overTime = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: [
        jsxs("div", { children: [
          // jsx("div", { className: "tg-label", style: { marginBottom: 8 }, children: "📈 Over time — token usage" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily totals of the token badges (In / Out / Cache / Think / Total) across every session." }),
          jsx(AmBarChart, {
            data: daySeries,
            categoryField: "date",
            kind: "line",
            smooth: true,
            log: true,
            unit: "tok",
            series: [
              { key: "in", label: "In", color: "#60a5fa", unit: "tok", axis: 0 },
              { key: "out", label: "Out", color: "#a78bfa", unit: "tok", axis: 0 },
              { key: "cache", label: "Cache", color: "#2dd4bf", unit: "tok", axis: 0 },
              { key: "think", label: "Think", color: "#c084fc", unit: "tok", axis: 0 },
              { key: "total", label: "Total", color: "#fbbf24", unit: "tok", axis: 0 },
            ],
            height: 220,
          }),
        ]}),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 8 }, children: "📈 Over time — speed" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily decode & prefill speed (tok/s) and average TTFT (seconds)." }),
          jsx(AmBarChart, {
            data: daySeries,
            categoryField: "date",
            kind: "line",
            smooth: true,
            unit: "tok/s",
            series: [
              { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
              { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 0 },
              { key: "ttft", label: "Avg TTFT", color: "#fbbf24", unit: "s", axis: 1 },
            ],
            height: 190,
          }),
        ]}),
      ]});
      return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
        overTime,
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "⚡ Speed — totals & averages" }),
          badgeGrid([
            costCard("Decode speed (avg)", dec.tokPerSec != null ? dec.tokPerSec + " tok/s" : "—", fmtC(dec.tokens) + " streamed · " + fmtMs(dec.ms), "#fbbf24"),
            costCard("Prompt processing (avg)", pre.tokPerSec != null ? pre.tokPerSec + " tok/s" : "—", fmtC(pre.tokens) + " new ctx · " + fmtMs(pre.ms) + " TTFT", "#2dd4bf"),
            costCard("Avg TTFT", pre.avgTtftMs != null ? fmtMs(pre.avgTtftMs) : "—", "request → first token", "#38bdf8"),
            costCard("Fastest model", fastest ? fastest.label + " · " + fastest.tokPerSec + " tok/s" : "—", fastest ? "best decode rate" : "no timing yet", "#a78bfa"),
            costCard("Streamed tokens", fmtC(dec.tokens), "outputs · " + (dec.steps || 0) + " decode steps", "#60a5fa"),
            costCard("New context tokens", fmtC(pre.tokens), "uncached input · " + (pre.steps || 0) + " prefill steps", "#34d399"),
          ]),
        ]}),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "🪙 Tokens — totals & averages" }),
          badgeGrid([
            costCard("Input (uncached)", fmtC(tin), "total", "#60a5fa"),
            costCard("Output", fmtC(tout), "total", "#a78bfa"),
            costCard("Cache (read+write)", fmtC(tc), "total", "#2dd4bf"),
            costCard("Thinking", fmtC(tThink), "reasoning tokens", "#c084fc"),
            costCard("Tools (payload)", fmtC(tTools), "tool-call args (chars/4)", "#34d399"),
            costCard("Total tokens", fmtC(tAll), "all buckets", "#fbbf24"),
            costCard("Avg tokens / session", avg(tAll, mSec) != null ? fmtC(avg(tAll, mSec)) : "—", mSec + " sessions", "#fbbf24"),
            costCard("Avg tokens / step", avg(tAll, stepsN) != null ? fmtC(avg(tAll, stepsN)) : "—", stepsN + " LLM steps", "#fb923c"),
            costCard("Avg tokens / turn", avg(tAll, turnsN) != null ? fmtC(avg(tAll, turnsN)) : "—", turnsN + " turns", "#f472b6"),
          ]),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 10, lineHeight: 1.6 }, children: "Averages = grand total ÷ that granularity (session / LLM step / turn). Thinking = reasoning tokens (exact-usage sessions only; a chars/4 estimate otherwise). Tools = estimated tokens of the actual tool-call arguments (chars/4), NOT the whole step context. Speed badges come from /usage; the per-session detail below comes from /breakdown." }),
        ]}),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Per session — expand for the unified turn → step table (tokens + speed)" }),
          SessionTable({
            rows: bySession.filter((s: any) => ((s.stepTree && s.stepTree.length) || (s.toolTokens && s.toolTokens.length))),
            expandedId: openToken, onToggle: setOpenToken,
            drawer: combinedDrawer,
            page: pageFor("combSess"), setPage: setPageFor("combSess"), pageSize: 25,
            empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No combined per-step data yet — appears once sessions record per-turn usage." }),
          }),
        ]}),
      ]});
    })();
    const runsTab = jsx(RunsTab, { bySession });
    body = tab === "events" ? eventsTab : tab === "cost" ? costTab : tab === "models" ? modelsTab : tab === "performance" ? performanceTabEl : tab === "tokens" ? tokensTab : tab === "combined" ? combined : tab === "runs" ? runsTab : tab === "daily" ? jsx(DailyTab, { bySession, initialDay }) : tab === "pricing" ? pricingTabEl : sessionsTab;
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
      jsx("div", { className: "tg-seg", style: { margin: "0 20px 16px" }, children: [segBtn(tab, setTab, "events", "Events"), segBtn(tab, setTab, "cost", "Cost"), segBtn(tab, setTab, "models", "Models"), segBtn(tab, setTab, "performance", "Performance"), segBtn(tab, setTab, "tokens", "Tokens"), segBtn(tab, setTab, "combined", "Combined (wip)"), segBtn(tab, setTab, "runs", "Runs"), segBtn(tab, setTab, "daily", "Daily"), segBtn(tab, setTab, "sessions", "Sessions"), segBtn(tab, setTab, "pricing", "Pricing")] }),
      jsx("div", { className: "tg-modal-body", children: body }),
    ]}),
  ]});
}

export function TokenGobblerOverlay() {
  const [open, setOpen] = React.useState(false);
  const [openTab, setOpenTab] = React.useState("events");
  const [openDay, setOpenDay] = React.useState<string | null>(null);
  React.useEffect(() => {
    activityRef.open = (tab) => { if (tab) setOpenTab(tab); setOpenDay(null); setOpen(true); };
    return () => { activityRef.open = null; };
  }, []);
  // Fragment: no full-frame wrapper div, so the overlay never blocks app clicks.
  return jsxs(React.Fragment, { children: [
    jsx("style", { children: CSS }),
    jsx("button", { className: "tg-fab", onClick: () => { setOpenDay(dayStr(new Date())); setOpenTab("daily"); setOpen(true); }, title: "Token Gobbler — today's daily entry", "aria-label": "Open today's daily entry", children: "🦃" }),
    open ? jsx(TokenGobblerModal, { onClose: () => setOpen(false), initialTab: openTab, initialDay: openDay }) : null,
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
