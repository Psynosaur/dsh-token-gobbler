// token-gobbler · client/activity.tsx
// Settings dashboard section + the wider activity overlay (floating trigger +
// modal) and the surface registration (apply/inject) that the host calls.
import { CSS, NS, text, fmt, fmtC, money, fmtMs, statCard, eventChips, toolTable, segBtn, request, humanizeModel, badgeGrid, thL, thR, tdL, tdR } from "./core";
import { SessionTable } from "./session-table";
import { aggregateSessions, daySeries as buildDaySeries, dayStr } from "./agg";
import { Collapse, combinedDrawer } from "./drawers";
import { POINT_MODES } from "./graph";
import { loadChartSettings, subscribeChartSettings } from "./graph-store";
import { GraphCanvas } from "./graph-canvas";
import { comparisonTable, sessionTable, dayTable, dayChart, sessionChart, pricingTab, costCard, costModelTable } from "./panels";
import { DailyTab } from "./daily";
import { RunsTab } from "./runs";
import { LlamaMetricsTab } from "./llama-metrics";
import { useGobblerData, activityRef } from "./hooks";
import { ChartDefaultsCard } from "./chart-settings";
import { ImportSourcesCard } from "./import-sources";
import { SourceFilterBar, hasImports, inSourceFilter, importedSummary, importedSources } from "./sources";

export function TokenGobblerSettings(props: any) {
  const close = props && props.close;
  const { data, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();
  // The "Chart defaults" drawer head names the plot mode every canvas chart opens
  // with, so it follows the same store the card writes to. Declared BEFORE the
  // early returns below — a hook may never be called conditionally.
  const [chartMode, setChartMode] = React.useState<string>(() => loadChartSettings().mode);
  React.useEffect(() => subscribeChartSettings(() => setChartMode(loadChartSettings().mode)), []);

  if (loading) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8", fontSize: 14 }, children: "Counting the gobbled tokens…" })] });
  if (error && !data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsxs("div", { style: { padding: 24 }, children: [jsx("div", { style: { fontWeight: 700 }, children: "Couldn't load token usage" }), jsx("div", { style: { color: "#f87171", marginTop: 6, fontSize: 13 }, children: error })] })] });
  if (!data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8" }, children: "No data." })] });

  const t = data.totals;
  const wfh = data.split && data.split.wfh;
  const refLabel = (wfh && wfh.referenceLabel) || "corp";
  const ev = data.events || null;
  const imp = importedSummary(data.sources);
  const dec = data.decode;
  const byModel = data.byModel || [];
  const fastest = byModel.filter((m: any) => m.tokPerSec != null).sort((a: any, b: any) => b.tokPerSec - a.tokPerSec)[0] || null;
  // Every group of settings is one collapsible drawer: the head carries the
  // at-a-glance number (so a closed drawer still says what is inside) and the
  // cards unfold below it. The imported homes get the LAST drawer on purpose —
  // this machine's numbers lead, other machines are opt-in reading.
  const setChip = (label: string, value: any, color: string) => jsxs("span", { className: "tg-set-chip", children: [
    jsx("span", { className: "tg-stat-dot", style: { background: color } }),
    jsx("span", { className: "tg-set-chip-l", children: label }),
    jsx("span", { className: "tg-set-chip-v tg-num", children: value }),
  ]});
  const drawer = (title: string, chips: any[], body: any, open = false) => jsx(Collapse, {
    defaultOpen: open,
    label: jsxs("span", { className: "tg-set-head", children: [
      jsx("span", { className: "tg-set-head-t", children: title }),
      ...chips,
    ]}),
    children: jsx("div", { className: "tg-set-body", children: body }),
  });
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
      // Imported homes are folded into every number on this page — say so, and
      // which ones, right under the header instead of burying it in a settings card.
      imp ? jsxs("div", { className: "tg-importline", children: [
        jsx("span", { className: "tg-importline-ico", children: "🔌" }),
        jsx("span", { children: imp.text + " folded in — imported sessions carry their home's badge and can be filtered in the activity view." }),
      ]}) : null,
      jsxs("div", { className: "tg-set-drawers", children: [
      drawer("💰 Cost — what it adds up to", [
        setChip("actually ran", money(data.actual.cost), "#fbbf24"),
        ...(data.actualSavings > 0 ? [setChip("saved", money(data.actualSavings), "#34d399")] : []),
      ], [
        jsxs("div", { className: "tg-card tg-hero", children: [
          jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
            jsx("div", { className: "tg-label", children: "What you actually ran" }),
            data.actualSavings > 0 ? jsx("span", { className: "tg-badge", children: "💰 Home lab saved " + money(data.actualSavings) }) : null,
          ]}),
          jsx("div", { className: "tg-hero-value tg-num", style: { color: "#f8fafc" }, children: money(data.actual.cost) }),
          jsx("div", { style: { color: "#94a3b8", fontSize: 12, marginTop: 9, lineHeight: 1.5 }, children: data.actual.note }),
        ]}),
        wfhCard,
      ], true),
      drawer("🪙 Tokens — everything metered", [setChip("total", fmtC(t.allTokens), "#fbbf24")], [
        jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
          statCard("Input (uncached)", t.uncachedInputTokens, "#60a5fa", false),
          statCard("Output", t.outputTokens, "#a78bfa", false),
          statCard("Cache read", t.cacheReadTokens, "#2dd4bf", false),
          statCard("Cache write", t.cacheWriteTokens, "#f472b6", false),
          statCard("Total tokens", t.allTokens, "#fbbf24", true),
        ]}),
      ]),
      (dec && dec.tokPerSec != null) ? drawer("⚡ Speed — how fast it ran", [
        setChip("decode", dec.tokPerSec + " tok/s", "#fbbf24"),
        ...(data.prefill && data.prefill.tokPerSec != null ? [setChip("prefill", data.prefill.tokPerSec + " tok/s", "#2dd4bf")] : []),
      ], [
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
      ]) : null,
      ev ? drawer("📊 Activity — what actually happened", [
        setChip("sessions", fmt(data.sources.projcache.sessions), "#60a5fa"),
        setChip("LLM steps", fmt(ev.steps || 0), "#60a5fa"),
      ], [
        jsx("div", { className: "tg-chipgrid", children: [
          chip("Sessions", fmt(data.sources.projcache.sessions), "#60a5fa"),
          chip("LLM steps", fmt(ev.steps || 0), "#60a5fa"),
          chip("Tool calls", fmt((ev.toolCalls || 0) + (ev.toolSubCalls || 0)), "#a78bfa"),
          chip("Your messages", fmt(ev.userMessages || 0), "#34d399"),
          chip("Assistant msgs", fmt(ev.assistantMessages || 0), "#2dd4bf"),
          chip("Turns", fmt(ev.turns || 0), "#fbbf24"),
          chip("Compactions", fmt(ev.compactions || 0), "#f472b6"),
        ]}),
      ]) : null,
      // The chart knobs live here rather than in the charts: one place to set
      // what every canvas chart opens with (see client/chart-settings.tsx).
      drawer("📈 Chart defaults — trend & heat", [
        setChip("opens as", (POINT_MODES.find((m) => m.k === chartMode) || { name: String(chartMode) }).name, "#38bdf8"),
      ], [
        jsx(ChartDefaultsCard, {}),
      ]),
      // Imported DSH homes: add / pause / resync / remove (client/import-sources.tsx).
      drawer("🔌 Imported sources — other machines & OSes", [
        setChip(importedSources().length === 1 ? "home" : "homes", String(importedSources().length), "#34d399"),
      ], [
        jsx(ImportSourcesCard, { onChanged: loadData }),
      ]),
      ]}),
      jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "sources: " + data.sources.projcache.sessions + " sessions (" + data.sources.projcache.nonZero + " with usage) · " + data.sources.trajectories.files + " trajectories (" + data.sources.trajectories.withUsage + " with per-turn usage, " + data.sources.trajectories.withModelTimeline + " with model events" + (data.sources.trajectories.cache ? " · parse cache " + data.sources.trajectories.cache.hits + " hits / " + data.sources.trajectories.cache.recomputed + " recomputed" : "") + ")" }),
    ],
  });
}

export function TokenGobblerModal({ onClose, initialTab, initialDay }: { onClose: () => void; initialTab?: string; initialDay?: string | null }) {
  const { data, breakdown, perf, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();
  const [tab, setTab] = React.useState(initialTab || "events");
  // Which home the tables below are showing: "all" | "local" | <imported id>.
  const [srcFilter, setSrcFilter] = React.useState("all");
  const [openSession, setOpenSession] = React.useState<string | null>(null);
  const [openToken, setOpenToken] = React.useState<string | null>(null);
  const [pageState, setPageState] = React.useState<any>({});
  const pageFor = (k: string) => pageState[k] || 0;
  const setPageFor = (k: string) => (p: number) => setPageState((s: any) => ({ ...s, [k]: p }));
  // Sort state for the performance tab session table (persisted to localStorage)
  const [sortState, setSortState] = React.useState<any>(() => {
    try {
      const s = localStorage.getItem("tg:sort:perf-sessions");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const handleSort = React.useCallback((col: any) => {
    setSortState(col);
    try {
      localStorage.setItem("tg:sort:perf-sessions", JSON.stringify(col));
    } catch {
      // ignore quota errors
    }
  }, []);
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
    // Every session row, then the same rows narrowed to the active source filter.
    const allSessions = (breakdown && breakdown.bySession) || [];
    const bySession = srcFilter === "all" ? allSessions : allSessions.filter((s: any) => inSourceFilter(s, srcFilter));
    const byDay = (breakdown && breakdown.byDay) || [];
    const events = data.events || (breakdown && breakdown.events) || null;
    const tools = data.tools || (breakdown && breakdown.tools) || [];
    const wfh = (data.split && data.split.wfh) || { sessions: 0, tokens: 0, cost: 0, corpCost: null, saved: null, referenceLabel: null };
    const cop = (data.split && data.split.corp) || { sessions: 0, tokens: 0, cost: 0 };
    const sv = data.savings;
    const refLabel = wfh.referenceLabel || "corp";
    // Overview tab (replaces Events): event chips, top tools, cost summary cards, recent activity
    const recentSessions = [...bySession].sort((a, b) => {
      const ta = a.meta?.lastPromptAt ?? a.createdAt ?? 0;
      const tb = b.meta?.lastPromptAt ?? b.createdAt ?? 0;
      return (typeof tb === "string" ? Date.parse(tb) : tb) - (typeof ta === "string" ? Date.parse(ta) : ta);
    }).slice(0, 5);
    const eventsTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
      badgeGrid([
        costCard("WFH compute (local)", money(wfh.cost), fmt(wfh.sessions) + " sessions · " + fmtC(wfh.tokens) + " tokens", "#34d399"),
        costCard("Corp (billed)", money(cop.cost), fmt(cop.sessions) + " sessions · " + fmtC(cop.tokens) + " tokens", "#f87171"),
        costCard("Total actual", money(data.actual.cost), "priced from " + data.actual.source, "#fbbf24"),
        costCard("WFH savings", money(wfh.saved != null ? wfh.saved : 0), "local tokens at " + refLabel + " rates vs home lab", "#34d399"),
      ]),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Activity by event type" }),
        eventChips(events),
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Top tools (what actually ran)" }),
        toolTable(tools, true),
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Recent sessions" }),
        recentSessions.length > 0
          ? SessionTable({
              rows: recentSessions,
              expandedId: openSession, onToggle: setOpenSession,
              drawer: combinedDrawer,
              page: pageFor("overviewSess"), setPage: setPageFor("overviewSess"), pageSize: 5,
              columns: { turns: false, decode: false, prefill: false, runtime: false, total: true, lastActive: true },
            })
          : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No recent sessions." }),
      ]}),
    ]});
    // Models tab merged into Cost tab (Phase 2)
    // The Cost tab already has costModelTable (more detailed) and comparisonTable
    // Sessions tab removed (Phase 3) - per-session tables live in Cost, Performance, Daily tabs
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
    const costTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
      jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }, children: [
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by day" }),
          dayChart(byDay),
        ]}),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by session" }),
          sessionChart(bySession),
        ]}),
      ]}),
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
    ]});
    // Shared variables for the merged Performance tab (over-time charts + badges)
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
    // The canvas engine plots a NUMERIC x, so a day series gets an ordinal and
    // the tick label carries the date (client/graph.ts xTickFormat).
    const dayRows = daySeries.map((r: any, i: number) => ({ ...r, n: i }));
    const dayTick = (v: number) => { const r = dayRows[Math.round(v)]; return r && r.date ? r.date : ""; };
    const overTime = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: [
      jsxs("div", { children: [
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily totals of the token badges (In / Out / Cache / Think / Total) across every session — log axis, since a day's cache reads in millions and a day's thinking in thousands." }),
        jsx(GraphCanvas, {
          data: dayRows,
          xField: "n", xLabel: "day", xTickFormat: dayTick,
          series: [
            { key: "in", label: "In", tipName: "in", color: "#60a5fa", unit: "tok", axis: 0, line: true },
            { key: "out", label: "Out", tipName: "out", color: "#a78bfa", unit: "tok", axis: 0, line: true },
            { key: "cache", label: "Cache", tipName: "cache", color: "#2dd4bf", unit: "tok", axis: 0, line: true },
            { key: "think", label: "Think", tipName: "think", color: "#c084fc", unit: "tok", axis: 0, line: true },
            { key: "total", label: "Total", tipName: "total", color: "#fbbf24", unit: "tok", axis: 0, line: true, width: 2 },
          ],
          axes: [{ log: true, unit: "tok" }],
          legendChips: true, legendUnit: "tok",
          modeChips: true, persistKey: "day-tokens",
          height: 220,
        }),
      ]}),
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 8 }, children: "📈 Over time — speed" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily decode & prefill speed (tok/s) on the left axis; average TTFT (seconds) shares the right log axis, whose labels are dropped — the tooltip carries its value." }),
        jsx(GraphCanvas, {
          data: dayRows,
          xField: "n", xLabel: "day", xTickFormat: dayTick,
          series: [
            { key: "decode", label: "Decode", tipName: "decode", color: "#38bdf8", unit: "tok/s", axis: 0, line: true, fill: true },
            { key: "prefill", label: "Prefill", tipName: "prefill", color: "#2dd4bf", unit: "tok/s", axis: 0, line: true },
            { key: "ttft", label: "Avg TTFT", tipName: "TTFT", color: "#fbbf24", unit: "s", axis: 1, line: true },
          ],
          axes: [{ unit: "tok/s" }, { log: true, hideLabels: true, unit: "s" }],
          legendChips: true,
          modeChips: true, persistKey: "day-speed",
          height: 190,
        }),
      ]}),
    ]});

    // Merged Performance tab: over-time charts + speed/token badges + unified per-session table
    // (replaces separate Performance, Tokens, and Combined tabs)
    const performanceTabEl = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
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
          sort: sortState, onSort: handleSort, sortKey: "perf-sessions",
          empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No combined per-step data yet — appears once sessions record per-turn usage." }),
        }),
      ]}),
    ]});

    const runsTab = jsx(RunsTab, { bySession });
    const llamaTab = jsx(LlamaMetricsTab, {});
    body = tab === "events" ? eventsTab : tab === "cost" ? costTab : tab === "performance" ? performanceTabEl : tab === "runs" ? runsTab : tab === "daily" ? jsx(DailyTab, { bySession, initialDay }) : tab === "llama" ? llamaTab : pricingTabEl;
  }

  return jsxs("div", { className: "tg-modal-overlay", role: "presentation", children: [
    jsx("div", { className: "tg-modal-mask", "aria-hidden": "true", onClick: onClose }),
    jsxs("div", { className: "tg-modal-panel", role: "dialog", "aria-modal": "true", children: [
      jsxs("div", { className: "tg-modal-header", children: [
        jsxs("div", { children: [
          jsx("div", { style: { fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }, children: "🦃 Token Gobbler — activity" }),
          jsx("div", { style: { color: "#94a3b8", marginTop: 2, fontSize: 12 }, children: "Events, tools, models and sessions across your whole DSH home."
            + (importedSummary(data && data.sources) ? " · " + (importedSummary(data && data.sources) as any).text : "") }),
        ]}),
        jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          jsx("button", { className: "tg-ghost", onClick: () => loadData(), disabled: refreshing, children: refreshing ? "Refreshing…" : "↻ Refresh" }),
          jsx("button", { className: "tg-reprocess", onClick: () => reprocess(), disabled: reprocessing || refreshing, children: reprocessing ? "Reprocessing…" : "♻ Reprocess" }),
          jsx("button", { className: "tg-close", onClick: onClose, "aria-label": "Close", children: "✕" }),
        ]}),
      ]}),
      reprocessMsg ? jsx("div", { className: "tg-faint", style: { fontSize: 11, padding: "0 20px 10px" }, children: reprocessMsg }) : null,
      jsx("div", { className: "tg-seg", style: { margin: "0 20px 16px" }, children: [segBtn(tab, setTab, "events", "Overview"), segBtn(tab, setTab, "cost", "Cost"), segBtn(tab, setTab, "performance", "Performance"), segBtn(tab, setTab, "runs", "Runs"), segBtn(tab, setTab, "daily", "Daily"), segBtn(tab, setTab, "llama", "Llama Metrics"), segBtn(tab, setTab, "pricing", "Settings")] }),
      // One chip per home — only shown once something is actually imported.
      hasImports() ? jsx("div", { style: { margin: "0 20px 12px" }, children: jsx(SourceFilterBar, {
        value: srcFilter,
        onChange: setSrcFilter,
        rows: (breakdown && breakdown.bySession) || [],
        compact: true,
      }) }) : null,
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
