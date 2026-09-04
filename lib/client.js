// token-gobbler · client
// Settings-modal dashboard + a WIDER standalone activity modal (shell.overlay).
// No build step: loads via window.__ModuleLoader__, uses the React automatic
// runtime (jsx/jsxs) + a scoped <style> tag for hover/transitions/scrollbars.
//
// Surfaces:
//   settings.section -> TokenGobblerSettings  (modern dashboard in the settings panel)
//   shell.overlay    -> TokenGobblerOverlay   (floating trigger + full-frame activity modal)
// The overlay entry returns a Fragment (no full-frame wrapper div) so it never
// blocks app clicks — only the trigger and the open modal are interactive.
window.__ModuleLoader__.load({
  id: "token-gobbler",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");
    const { jsx, jsxs } = require("react/jsx-runtime");
    const { useEffect, useState, useCallback } = React;

    const API = "/token-gobbler";
    const NS = "token-gobbler";
    const STRINGS = { nav: "Token Gobbler" };
    const text = (key) => STRINGS[key] ?? key;

    async function request(path, body) {
      const opts = { headers: { accept: "application/json" } };
      if (body !== undefined) {
        opts.method = "POST";
        opts.headers["content-type"] = "application/json";
        opts.body = JSON.stringify(body);
      }
      const response = await fetch(API + path, opts);
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) throw new Error(json.error || ("HTTP " + response.status));
      return json.value;
    }

    const fmt = (n) => (n == null ? "0" : Number(n).toLocaleString("en-US"));
    const fmtC = (n) => {
      if (n == null) return "0";
      n = Number(n);
      if (n < 1000) return String(n);
      if (n < 1e6) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
      if (n < 1e9) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
      return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
    };
    const money = (n) => (n == null ? "unpriced" : (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2));
    const fmtMs = (ms) => {
      if (ms == null) return "—";
      if (ms < 1000) return Math.round(ms) + "ms";
      if (ms < 60000) return (ms / 1000).toFixed(1).replace(/\.0$/, "") + "s";
      return Math.floor(ms / 60000) + "m " + Math.round((ms % 60000) / 1000) + "s";
    };

    // event-category display config (key matches trajectory.EVENT_CAT values)
    const EVENT_META = [
      { key: "steps", label: "LLM steps", color: "#60a5fa" },
      { key: "toolCalls", label: "Tool calls", color: "#a78bfa" },
      { key: "toolSubCalls", label: "Tool runs", color: "#c084fc" },
      { key: "userMessages", label: "Your messages", color: "#34d399" },
      { key: "assistantMessages", label: "Assistant msgs", color: "#2dd4bf" },
      { key: "turns", label: "Turns", color: "#fbbf24" },
      { key: "compactions", label: "Compactions", color: "#f472b6" },
      { key: "retries", label: "LLM retries", color: "#fb923c" },
      { key: "approvals", label: "Approvals", color: "#f87171" },
      { key: "todos", label: "Todo writes", color: "#a3e635" },
      { key: "commands", label: "Commands", color: "#38bdf8" },
    ];

    // ── scoped CSS ────────────────────────────────────────────────────────
    const CSS = [
      ".tg-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;line-height:1.45}",
      ".tg-root *{box-sizing:border-box}",
      ".tg-num{font-variant-numeric:tabular-nums;font-feature-settings:'tnum'}",
      ".tg-card{background:linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:14px}",
      ".tg-label{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8}",
      ".tg-faint{color:#64748b}",
      ".tg-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b}",
      ".tg-muted{color:#94a3b8}",
      ".tg-stat{padding:14px 16px;transition:border-color .15s ease,transform .15s ease}",
      ".tg-stat:hover{border-color:rgba(255,255,255,0.2);transform:translateY(-2px)}",
      ".tg-stat-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}",
      ".tg-stat-value{font-size:22px;font-weight:700;margin-top:7px;letter-spacing:-0.01em}",
      ".tg-stat-total{border-color:rgba(251,191,36,0.35);background:linear-gradient(180deg,rgba(251,191,36,0.10),rgba(255,255,255,0.02))}",
      ".tg-stat-total .tg-stat-value{color:#fbbf24;font-size:24px}",
      ".tg-hero{padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.1)}",
      ".tg-hero-value{font-size:34px;font-weight:800;letter-spacing:-0.02em;margin-top:2px}",
      ".tg-wfh{padding:18px 20px;background:linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02));border:1px solid rgba(16,185,129,0.32)}",
      ".tg-wfh-value{font-size:28px;font-weight:800;letter-spacing:-0.02em;margin-top:2px;color:#34d399}",
      ".tg-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px;background:rgba(16,185,129,0.16);border:1px solid rgba(16,185,129,0.35);color:#34d399;white-space:nowrap}",
      ".tg-seg{display:inline-flex;gap:3px;padding:3px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px}",
      ".tg-seg-btn{font-size:12px;font-weight:600;padding:5px 13px;border-radius:7px;border:none;cursor:pointer;color:#94a3b8;background:transparent;transition:background .15s ease,color .15s ease}",
      ".tg-seg-btn:hover{color:#e5e7eb}",
      ".tg-seg-btn.active{background:rgba(251,191,36,0.16);color:#fde68a}",
      ".tg-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px}",
      ".tg-th{text-align:left;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#94a3b8;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.12);white-space:nowrap}",
      ".tg-sticky .tg-th{position:sticky;top:0;z-index:2;background:#0d1524}",
      ".tg-th-r{text-align:right}",
      ".tg-td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#e5e7eb;white-space:nowrap}",
      ".tg-td-r{text-align:right}",
      ".tg-tr{transition:background .12s ease}",
      ".tg-tr:hover{background:rgba(255,255,255,0.03)}",
      ".tg-tr:last-child .tg-td{border-bottom:none}",
      ".tg-kind{font-size:12px;font-weight:600}",
      ".tg-scroll{overflow-x:auto}",
      ".tg-scroll::-webkit-scrollbar{height:8px}",
      ".tg-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}",
      ".tg-scroll::-webkit-scrollbar-track{background:transparent}",
      ".tg-tscroll{overflow:auto;max-height:620px}",
      ".tg-tscroll::-webkit-scrollbar{width:10px;height:10px}",
      ".tg-tscroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:5px}",
      ".tg-tscroll::-webkit-scrollbar-track{background:transparent}",
      ".tg-refresh{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid rgba(251,191,36,0.4);background:rgba(251,191,36,0.12);color:#fde68a;transition:background .15s ease,transform .1s ease,border-color .15s ease;white-space:nowrap}",
      ".tg-refresh:hover{background:rgba(251,191,36,0.2);border-color:rgba(251,191,36,0.6)}",
      ".tg-refresh:active{transform:scale(0.97)}",
      ".tg-refresh:disabled{opacity:0.55;cursor:default}",
      ".tg-ghost{font-size:12px;font-weight:600;padding:7px 12px;border-radius:9px;cursor:pointer;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;transition:background .15s ease,border-color .15s ease;white-space:nowrap}",
      ".tg-ghost:hover{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.24)}",
      ".tg-ghost:disabled{opacity:0.55;cursor:default}",
      ".tg-fab{position:fixed;bottom:22px;right:22px;z-index:1;width:46px;height:46px;border-radius:50%;border:1px solid rgba(251,191,36,0.45);background:rgba(20,16,8,0.82);backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.45);cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;transition:transform .12s ease,background .15s ease,border-color .15s ease}",
      ".tg-fab:hover{transform:scale(1.06);background:rgba(40,30,12,0.9);border-color:rgba(251,191,36,0.7)}",
      ".tg-fab:active{transform:scale(0.97)}",
      ".tg-modal-overlay{position:fixed;inset:0;z-index:2;display:flex;align-items:center;justify-content:center}",
      ".tg-modal-mask{position:absolute;inset:0;background:rgba(2,6,12,0.62);backdrop-filter:blur(3px)}",
      ".tg-modal-panel{position:relative;z-index:1;width:min(1180px,calc(100vw - 48px));height:min(860px,calc(100vh - 48px));background:linear-gradient(180deg,#0e1626,#0b111d);border:1px solid rgba(255,255,255,0.1);border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,0.6);display:flex;flex-direction:column;overflow:hidden;color:#e5e7eb}",
      ".tg-modal-header{flex:none;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.07)}",
      ".tg-close{cursor:pointer;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s ease,border-color .15s ease,color .15s ease}",
      ".tg-close:hover{background:rgba(248,113,113,0.18);border-color:rgba(248,113,113,0.4);color:#fca5a5}",
      ".tg-modal-body{flex:1;min-height:0;overflow-y:auto;padding:20px}",
      ".tg-modal-body::-webkit-scrollbar{width:10px}",
      ".tg-modal-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:5px}",
      ".tg-chipgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}",
      ".tg-chip{display:flex;align-items:center;gap:8px;padding:11px 13px;background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:12px}",
      ".tg-chip-label{font-size:12px;color:#94a3b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".tg-chip-value{font-size:16px;font-weight:700;color:#f1f5f9}",
      ".tg-bar{height:8px;border-radius:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24);min-width:2px}",
      ".tg-row-btn{cursor:pointer}",
      ".tg-chev{display:inline-block;width:14px;font-size:10px;color:#64748b;transition:transform .15s ease}",
      ".tg-chev.open{transform:rotate(90deg);color:#fbbf24}",
      ".tg-drawer-row{background:rgba(255,255,255,0.02)}",
      ".tg-drawer-inner{padding:16px 18px 18px 42px;display:flex;flex-direction:column;gap:16px}",
      ".tg-meta-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}",
      ".tg-meta{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:8px 10px;min-width:0}",
      ".tg-meta-k{font-size:10px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#64748b}",
      ".tg-meta-v{font-size:12.5px;color:#e5e7eb;margin-top:3px;word-break:break-word}",
      ".tg-drawer-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px}",
      ".tg-drawer-sub{font-size:11px;font-weight:600;color:#64748b;margin-bottom:6px}",
      ".tg-turn{border-left:2px solid rgba(251,191,36,0.45);padding:6px 12px;margin-bottom:8px;background:rgba(255,255,255,0.02);border-radius:0 8px 8px 0}",
      ".tg-turn-p{font-size:12.5px;color:#e5e7eb;font-weight:600;word-break:break-word}",
      ".tg-turn-r{font-size:12px;color:#94a3b8;margin-top:4px;line-height:1.5;word-break:break-word}",
      ".tg-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:7px;color:#e5e7eb;font-size:12.5px;padding:6px 8px;font-variant-numeric:tabular-nums;min-width:0}",
      ".tg-input:focus{outline:none;border-color:rgba(251,191,36,0.55)}",
      ".tg-input-num{width:84px;text-align:right}",
      ".tg-input-label{width:100%}",
      ".tg-input-id{width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#94a3b8}",
      ".tg-del{cursor:pointer;color:#64748b;font-size:13px;line-height:1;padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:transparent;transition:color .12s ease,border-color .12s ease,background .12s ease}",
      ".tg-del:hover{color:#fca5a5;border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.10)}",
      ".tg-flash-ok{color:#34d399;font-size:12.5px;font-weight:600}",
      ".tg-flash-err{color:#f87171;font-size:12.5px;font-weight:600}",
      ".tg-refrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 16px}",
      ".tg-kind-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap}",
    ].join("\n");

    // ── cell helpers ──────────────────────────────────────────────────────
    const thL = (label) => jsx("th", { className: "tg-th", children: label });
    const thR = (label) => jsx("th", { className: "tg-th tg-th-r", children: label });
    const tdL = (children, props) => jsx("td", Object.assign({ className: "tg-td" }, props || {}, { children }));
    const tdR = (children, props) => jsx("td", Object.assign({ className: "tg-td tg-td-r tg-num" }, props || {}, { children }));

    // shared open-ref (settings dashboard -> modal)
    const activityRef = { open: null };

    // ── shared data hook (fetches /usage + /breakdown) ────────────────────
    function useGobblerData() {
      const [data, setData] = useState();
      const [breakdown, setBreakdown] = useState();
      const [perf, setPerf] = useState(); // undefined = loading, null = unavailable (route missing)
      const [error, setError] = useState();
      const [loading, setLoading] = useState(true);
      const [refreshing, setRefreshing] = useState(false);
      const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
          const [u, b, p] = await Promise.all([request("/usage"), request("/breakdown").catch(() => null), request("/performance").catch(() => null)]);
          setData(u); setBreakdown(b); setPerf(p); setError(null);
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e));
        } finally {
          setLoading(false); setRefreshing(false);
        }
      }, []);
      useEffect(() => { loadData(); }, [loadData]);
      return { data, breakdown, perf, error, loading, refreshing, loadData };
    }

    // ── shared presentational pieces ──────────────────────────────────────
    const statCard = (label, value, color, isTotal) => jsxs("div", {
      className: "tg-card tg-stat" + (isTotal ? " tg-stat-total" : ""),
      children: [
        jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
          jsx("span", { className: "tg-stat-dot", style: { background: color } }),
          jsx("span", { className: "tg-label", style: isTotal ? { color: "#fbbf24" } : undefined, children: label }),
        ]}),
        jsx("div", { className: "tg-stat-value tg-num", children: fmt(value) }),
      ],
    });

    const eventChips = (events) => {
      if (!events) return jsx("div", { className: "tg-muted", style: { fontSize: 13 }, children: "No activity events recorded." });
      return jsx("div", { className: "tg-chipgrid", children: EVENT_META.map((m) => jsxs("div", {
        className: "tg-chip",
        children: [
          jsx("span", { className: "tg-stat-dot", style: { background: m.color } }),
          jsx("span", { className: "tg-chip-label", children: m.label }),
          jsx("span", { className: "tg-chip-value tg-num", children: fmt(events[m.key] || 0) }),
        ],
      }, m.key)) });
    };

    const toolTable = (tools, sticky) => {
      if (!tools || !tools.length) return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No tool invocations recorded." });
      const max = tools[0].count || 1;
      const table = jsxs("table", { className: "tg-table" + (sticky ? " tg-sticky" : ""), children: [
        jsx("tr", { children: [thL("Tool"), thR("Runs"), thL("Share")] }),
        ...tools.map((t) => jsxs("tr", {
          className: "tg-tr",
          children: [
            tdL(t.name, { style: { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 12, maxWidth: 280, whiteSpace: "normal", wordBreak: "break-all" } }),
            tdR(String(t.count), { style: { fontWeight: 600 } }),
            tdL(jsx("div", { className: "tg-bar", style: { width: Math.max(2, Math.round((t.count / max) * 100)) + "%" } })),
          ],
        }, t.name)),
      ]});
      return sticky ? jsx("div", { className: "tg-tscroll", children: table }) : table;
    };

    const realModelTable = (byModel) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
      jsx("tr", { children: [thL("Model"), thL("Kind"), thR("Sessions"), thR("In"), thR("Out"), thR("CacheR"), thR("Speed"), thR("Cost")] }),
      ...(byModel || []).map((m) => jsxs("tr", {
        className: "tg-tr",
        children: [
          tdL(m.label, { style: { maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
          tdL(jsx("span", { className: "tg-kind", style: { color: m.copilot ? "#f87171" : "#34d399" }, children: m.copilot ? "Copilot" : "local" })),
          tdR(String(m.sessions)),
          tdR(fmtC(m.uncachedInputTokens), { title: fmt(m.uncachedInputTokens) }),
          tdR(fmtC(m.outputTokens), { title: fmt(m.outputTokens) }),
          tdR(fmtC(m.cacheReadTokens), { title: fmt(m.cacheReadTokens) }),
          tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "—", { title: "streamed output tokens per second of decode time (trajectory chunk timestamps)" }),
          tdR(m.cost != null ? money(m.cost) : "unpriced", { style: { fontWeight: 700, color: m.cost != null ? "#f8fafc" : "#fbbf24" } }),
        ],
      }, m.model)),
    ]})});

    // ── performance tables (decode + prompt-processing speed) ─────────────
    const perfModelTable = (rows) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
      jsx("tr", { children: [thL("Model"), thL("Kind"), thR("Steps"), thR("Streamed"), thR("Decode"), thR("New ctx"), thR("Prefill"), thR("Avg TTFT"), thR("Avg context")] }),
      ...(rows || []).map((m) => jsxs("tr", {
        className: "tg-tr",
        children: [
          tdL(m.label, { style: { maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
          tdL(jsx("span", { className: "tg-kind", style: { color: m.copilot ? "#f87171" : "#34d399" }, children: m.copilot ? "Copilot" : "local" })),
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

    const perfSessionTable = (rows) => {
      if (!rows || !rows.length) return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No per-step timing recorded yet — only sessions with per-turn usage carry speed data." });
      return jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
        jsx("tr", { children: [thL("Date"), thL("Session"), thL("Model"), thL("Kind"), thR("Steps"), thR("Decode"), thR("Prefill"), thR("Avg TTFT")] }),
        ...rows.flatMap((s) => s.models.map((m) => jsxs("tr", {
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
            tdL(jsx("span", { className: "tg-kind", style: { color: m.copilot ? "#f87171" : "#34d399" }, children: m.copilot ? "Copilot" : "local" })),
            tdR(String(m.steps)),
            tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "—", { title: "streamed output tokens ÷ decode time" }),
            tdR(m.promptTokPerSec != null ? m.promptTokPerSec + " tok/s" : "—", { title: "new (uncached) input tokens ÷ TTFT" }),
            tdR(m.avgTtftMs != null ? fmtMs(m.avgTtftMs) : "—"),
          ],
        }, s.id + ":" + m.model)))
      ]})});
    };

    const comparisonTable = (comparison) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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

    const sessionDrawer = (s) => {
      const m = s.meta || {};
      const meta = [
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
        jsx("div", { className: "tg-meta-grid", children: meta.map(([k, v]) => (v == null || v === "" ? null : jsxs("div", { className: "tg-meta", children: [
          jsx("div", { className: "tg-meta-k", children: k }),
          jsx("div", { className: "tg-meta-v tg-num", children: v }),
        ]}, k))) }),
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
        (m.turnOutline && m.turnOutline.length) ? jsxs("div", { children: [
          jsx("div", { className: "tg-drawer-sec", children: "Turn outline" }),
          m.turnOutline.map((t) => jsxs("div", { className: "tg-turn", children: [
            jsx("div", { className: "tg-turn-p", children: "Turn " + t.turn + (t.prompt ? " — " + t.prompt : "") }),
            t.response ? jsx("div", { className: "tg-turn-r", children: t.response }) : null,
          ]}, t.turn)),
        ]}) : null,
      ]});
    };

    const sessionTable = (bySession, openId, onToggle) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
      jsx("tr", { children: [thL(""), thL("Date"), thL("Session"), thL("Models used"), thR("Steps"), thR("Tools"), thR("In"), thR("Out"), thR("CacheR"), thR("Total"), thR("Cost")] }),
      ...(bySession || []).flatMap((s) => {
        const open = openId === s.id;
        const row = jsxs("tr", {
          className: "tg-tr tg-row-btn",
          style: open ? { background: "rgba(251,191,36,0.05)" } : undefined,
          onClick: () => { if (onToggle) onToggle(open ? null : s.id); },
          children: [
            tdL(jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "▶" })),
            tdL(s.date),
            tdL(s.title || s.cwd || s.id, { style: { maxWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }, title: s.title || s.cwd || s.id }),
            tdL(s.modelMix, { style: { maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word", fontSize: 12, color: "#94a3b8" }, title: (s.models || []).map((m) => (m.label || m.key) + " ×" + m.steps).join("\n") }),
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

    const dayTable = (byDay) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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

    const segBtn = (tab, setTab, key, label) => jsx("button", { className: "tg-seg-btn" + (tab === key ? " active" : ""), onClick: () => setTab(key), children: label });

    // ── PRICING TAB (editable rate cards + WFH reference model) ───────────
    const numOrEmpty = (v) => {
      if (v === "" || v == null) return "";
      const n = Number(v);
      return Number.isFinite(n) ? n : "";
    };
    const rateInput = (value, onCommit) => jsx("input", {
      className: "tg-input tg-input-num",
      type: "number", min: "0", step: "0.01",
      value: value === "" ? "" : String(value),
      onChange: (e) => onCommit(numOrEmpty(e.target.value)),
    });

    const pricingTab = (p) => {
      const d = p.draft;
      if (!d) return jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Loading pricing table…" });
      const patchModel = (id, patch) => p.setDraft((x) => (x ? { ...x, models: x.models.map((m) => (m.id === id ? { ...m, ...patch } : m)) } : x));
      const removeModel = (id) => p.setDraft((x) => {
        if (!x) return x;
        const models = x.models.filter((m) => m.id !== id);
        let referenceModel = x.referenceModel;
        if (referenceModel === id) referenceModel = ((models.find((m) => !m.local) || models[0]) || {}).id || null;
        return { ...x, models, referenceModel };
      });
      const refOptions = d.models.filter((m) => !m.local);
      return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: [
        jsxs("div", { className: "tg-card tg-refrow", children: [
          jsx("div", { style: { flex: 1, minWidth: 240 }, children: [
            jsx("div", { className: "tg-label", style: { color: "#fbbf24", marginBottom: 5 }, children: "★ WFH reference model" }),
            jsx("div", { style: { color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }, children: "Local (home-lab) compute is valued against this rate card — the “what the corp would've billed” number behind every WFH savings figure." }),
          ]}),
          jsx("select", {
            className: "tg-input", style: { minWidth: 250, cursor: "pointer" },
            value: d.referenceModel,
            onChange: (e) => p.setDraft((x) => (x ? { ...x, referenceModel: e.target.value } : x)),
            children: refOptions.map((m) => jsx("option", { value: m.id, children: m.label }, m.id)),
          }),
          jsx("button", { className: "tg-refresh", onClick: p.onSave, disabled: p.saving, children: p.saving ? "Saving…" : "💾 Save rates" }),
          p.saveMsg ? jsx("span", { className: p.saveMsg.kind === "ok" ? "tg-flash-ok" : "tg-flash-err", children: p.saveMsg.text }) : null,
        ]}),
        jsx("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
          jsx("div", { className: "tg-label", children: "Rate cards — $ per 1M tokens (edit, add or remove; saved to " + (p.pricingPath || "your DSH home") + ")" }),
          jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: d.fromFile ? "custom table (file)" : "built-in table (not saved yet)" }),
        ]}),
        jsx("div", { className: "tg-card tg-tscroll", style: { padding: "4px 10px" }, children: jsxs("table", { className: "tg-table tg-sticky", children: [
          jsx("tr", { children: [thL("Model"), thL("Kind"), thR("$/M in"), thR("$/M out"), thR("$/M cacheR"), thR("$/M cacheW"), thL("Est."), thL("")] }),
          ...d.models.map((m) => jsxs("tr", {
            className: "tg-tr",
            style: d.referenceModel === m.id ? { background: "rgba(251,191,36,0.05)" } : undefined,
            children: [
              tdL(jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 3, minWidth: 190, maxWidth: 320 }, children: [
                jsx("input", { className: "tg-input tg-input-label", value: m.label, onChange: (e) => patchModel(m.id, { label: e.target.value }) }),
                jsxs("span", { style: { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 11, color: "#64748b" }, children: [m.id, d.referenceModel === m.id ? "  ★ reference" : ""] }),
              ]})),
              tdL(jsx("span", {
                className: "tg-kind-badge",
                style: m.local
                  ? { color: "#34d399", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)" }
                  : { color: "#fbbf24", background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.30)" },
                children: m.local ? "local" : "paid",
              })),
              tdR(rateInput(m.input, (v) => patchModel(m.id, { input: v }))),
              tdR(rateInput(m.output, (v) => patchModel(m.id, { output: v }))),
              tdR(rateInput(m.cacheRead, (v) => patchModel(m.id, { cacheRead: v }))),
              tdR(rateInput(m.cacheWrite, (v) => patchModel(m.id, { cacheWrite: v }))),
              tdL(jsx("input", { type: "checkbox", checked: !!m.estimated, onChange: (e) => patchModel(m.id, { estimated: e.target.checked }), style: { accentColor: "#fbbf24", cursor: "pointer" } })),
              tdL(m.local ? null : jsx("button", { className: "tg-del", title: "Remove " + m.id, onClick: () => removeModel(m.id), children: "✕" })),
            ],
          }, m.id)),
        ]})}),
        jsxs("div", { className: "tg-card", style: { padding: "14px 16px" }, children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Add a model (any model without a rate card yet — e.g. a new Copilot model)" }),
          jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
            jsx("input", { className: "tg-input tg-input-id", style: { width: 190 }, placeholder: "model id (claude-sonnet-5)", value: p.addRow.id, onChange: (e) => p.setAddRow((r) => ({ ...r, id: e.target.value })) }),
            jsx("input", { className: "tg-input", style: { width: 150 }, placeholder: "Label", value: p.addRow.label, onChange: (e) => p.setAddRow((r) => ({ ...r, label: e.target.value })) }),
            jsx("input", { className: "tg-input tg-input-num", type: "number", min: "0", step: "0.01", placeholder: "in", value: p.addRow.input, onChange: (e) => p.setAddRow((r) => ({ ...r, input: e.target.value })) }),
            jsx("input", { className: "tg-input tg-input-num", type: "number", min: "0", step: "0.01", placeholder: "out", value: p.addRow.output, onChange: (e) => p.setAddRow((r) => ({ ...r, output: e.target.value })) }),
            jsx("input", { className: "tg-input tg-input-num", type: "number", min: "0", step: "0.01", placeholder: "cacheR", value: p.addRow.cacheRead, onChange: (e) => p.setAddRow((r) => ({ ...r, cacheRead: e.target.value })) }),
            jsx("input", { className: "tg-input tg-input-num", type: "number", min: "0", step: "0.01", placeholder: "cacheW", value: p.addRow.cacheWrite, onChange: (e) => p.setAddRow((r) => ({ ...r, cacheWrite: e.target.value })) }),
            jsx("button", { className: "tg-ghost", onClick: p.onAdd, children: "+ Add model" }),
          ]}),
        ]}),
        p.unpriced.length ? jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Models in your usage with no rate card (click to add)" }),
          jsx("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: p.unpriced.map((m) => jsxs("span", {
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

    // ── SETTINGS DASHBOARD (settings.section) ─────────────────────────────
    function TokenGobblerSettings(props) {
      const close = props && props.close;
      const { data, error, loading, refreshing, loadData } = useGobblerData();

      if (loading) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8", fontSize: 14 }, children: "Counting the gobbled tokens…" })] });
      if (error && !data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsxs("div", { style: { padding: 24 }, children: [jsx("div", { style: { fontWeight: 700 }, children: "Couldn't load token usage" }), jsx("div", { style: { color: "#f87171", marginTop: 6, fontSize: 13 }, children: error })] })] });
      if (!data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8" }, children: "No data." })] });

      const t = data.totals;
      const wfh = data.split && data.split.wfh;
      const refLabel = (wfh && wfh.referenceLabel) || "Copilot";
      const ev = data.events || null;
      const dec = data.decode;
      const byModel = data.byModel || [];
      const fastest = byModel.filter((m) => m.tokPerSec != null).sort((a, b) => b.tokPerSec - a.tokPerSec)[0] || null;
      const sec = (label) => jsx("div", { className: "tg-sec", children: label });
      const chip = (label, value, color) => jsxs("div", { className: "tg-chip", children: [
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
            ]}),
          ]}),
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

    // ── WIDER ACTIVITY MODAL (shell.overlay) ──────────────────────────────
    function TokenGobblerModal({ onClose, initialTab }) {
      const { data, breakdown, perf, error, loading, refreshing, loadData } = useGobblerData();
      const [tab, setTab] = useState(initialTab || "events");
      const [openSession, setOpenSession] = useState(null);
      // Pricing tab state: the saved table + an editable draft.
      const [pricingData, setPricingData] = useState(null);
      const [draft, setDraft] = useState(null);
      const [saving, setSaving] = useState(false);
      const [saveMsg, setSaveMsg] = useState(null);
      const [addRow, setAddRow] = useState({ id: "", label: "", input: "", output: "", cacheRead: "", cacheWrite: "" });
      const loadPricingData = useCallback(async () => {
        try {
          const p = await request("/pricing");
          setPricingData(p);
          setDraft({ referenceModel: p.referenceModel, models: p.models, fromFile: p.fromFile });
        } catch (e) {
          setSaveMsg({ kind: "err", text: "Couldn't load pricing: " + (e instanceof Error ? e.message : String(e)) });
        }
      }, []);
      useEffect(() => { loadPricingData(); }, [loadPricingData]);
      const doSave = useCallback(async () => {
        if (!draft) return;
        setSaving(true);
        setSaveMsg(null);
        try {
          const models = draft.models.map((m) => ({ ...m, input: m.input === "" ? 0 : m.input, output: m.output === "" ? 0 : m.output, cacheRead: m.cacheRead === "" ? 0 : m.cacheRead, cacheWrite: m.cacheWrite === "" ? 0 : m.cacheWrite }));
          const saved = await request("/pricing", { referenceModel: draft.referenceModel, models });
          setPricingData(saved);
          setDraft({ referenceModel: saved.referenceModel, models: saved.models, fromFile: true });
          setSaveMsg({ kind: "ok", text: "Saved — all costs re-priced." });
          await loadData();
        } catch (e) {
          setSaveMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
        } finally {
          setSaving(false);
        }
      }, [draft, loadData]);
      const addModel = useCallback(() => {
        const id = addRow.id.trim().toLowerCase();
        if (!id) { setSaveMsg({ kind: "err", text: "New model needs an id." }); return; }
        setDraft((d) => {
          if (!d) return d;
          if (d.models.some((m) => m.id === id)) { setSaveMsg({ kind: "err", text: "Model id already in the table." }); return d; }
          const n = (v) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : 0; };
          setSaveMsg(null);
          return { ...d, models: [...d.models, { id, label: addRow.label.trim() || id, input: n(addRow.input), output: n(addRow.output), cacheRead: n(addRow.cacheRead), cacheWrite: n(addRow.cacheWrite), estimated: false, local: false }] };
        });
        setAddRow({ id: "", label: "", input: "", output: "", cacheRead: "", cacheWrite: "" });
      }, [addRow]);

      useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, [onClose]);

      let body;
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
        const unpriced = (data.byModel || []).filter((m) => m.cost == null);
        const pricingTabEl = pricingTab({
          draft, setDraft, saving, saveMsg,
          onSave: doSave,
          addRow, setAddRow, onAdd: addModel,
          unpriced,
          onPrefill: (id, label) => { setAddRow({ id, label: label === id ? "" : label, input: "", output: "", cacheRead: "", cacheWrite: "" }); setSaveMsg(null); },
          pricingPath: pricingData ? pricingData.path : null,
          fromFile: draft ? draft.fromFile : false,
        });
        const wfh = (data.split && data.split.wfh) || { sessions: 0, tokens: 0, cost: 0, corpCost: null, saved: null, referenceLabel: null };
        const cop = (data.split && data.split.copilot) || { sessions: 0, tokens: 0, cost: 0 };
        const sv = data.savings;
        const refLabel = wfh.referenceLabel || "Copilot";
        const costCard = (label, value, sub, color) => jsxs("div", { className: "tg-card tg-stat", children: [
          jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
            jsx("span", { className: "tg-stat-dot", style: { background: color } }),
            jsx("span", { className: "tg-label", children: label }),
          ]}),
          jsx("div", { className: "tg-stat-value tg-num", children: value }),
          sub ? jsx("div", { style: { color: "#94a3b8", fontSize: 11, marginTop: 5 }, children: sub }) : null,
        ]});
        const costTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
          jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }, children: [
            costCard("WFH compute (local)", money(wfh.cost), fmt(wfh.sessions) + " sessions · " + fmtC(wfh.tokens) + " tokens", "#34d399"),
            costCard("Copilot (corp)", money(cop.cost), fmt(cop.sessions) + " sessions · " + fmtC(cop.tokens) + " tokens", "#f87171"),
            costCard("Total actual", money(data.actual.cost), "priced from " + data.actual.source, "#fbbf24"),
            costCard("WFH savings", money(wfh.saved != null ? wfh.saved : 0), "local tokens at " + refLabel + " rates vs home lab", "#34d399"),
          ]}),
          jsxs("div", { children: [
            jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "What it would cost the corp (all tokens on one model)" }),
            comparisonTable(data.comparison),
            sv && sv.max > 0 ? jsx("div", { style: { color: "#34d399", fontSize: 13, marginTop: 12, fontWeight: 600 }, children: "💰 You save " + (sv.min > 0 && sv.min < sv.max ? money(sv.min) + "–" + money(sv.max) : money(sv.max)) + " by running local instead of Copilot." }) : null,
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
            : jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
              jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }, children: [
                costCard("Decode speed (avg)", perf.totals.decode.tokPerSec != null ? perf.totals.decode.tokPerSec + " tok/s" : "—", fmtC(perf.totals.decode.tokens) + " streamed tokens · " + fmtMs(perf.totals.decode.ms), "#fbbf24"),
                costCard("Prompt processing (avg)", perf.totals.prefill.tokPerSec != null ? perf.totals.prefill.tokPerSec + " tok/s" : "—", fmtC(perf.totals.prefill.tokens) + " new ctx tokens · " + fmtMs(perf.totals.prefill.ms) + " of TTFT" + (perf.totals.prefill.avgTtftMs != null ? " · avg " + fmtMs(perf.totals.prefill.avgTtftMs) : ""), "#2dd4bf"),
              ]}),
              jsxs("div", { children: [
                jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Performance by model" }),
                perfModelTable(perf.byModel),
              ]}),
              jsxs("div", { children: [
                jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Performance by session — one row per model, ⇄ marks a model switch mid-session" }),
                perfSessionTable(perf.sessions),
              ]}),
              jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children:
                "Decode = streamed output tokens ÷ decode time (first→last chunk). Prefill = new (uncached) input tokens ÷ TTFT (request→first token) — TTFT includes network + queue, so prefill speed is a lower bound on the model's true prompt-processing rate. Cached context is served from the provider's cache and isn't counted as new work. Only sessions with per-turn usage carry timing." }),
            ]});
        body = tab === "events" ? eventsTab : tab === "cost" ? costTab : tab === "models" ? modelsTab : tab === "performance" ? performanceTabEl : tab === "pricing" ? pricingTabEl : sessionsTab;
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
              jsx("button", { className: "tg-close", onClick: onClose, "aria-label": "Close", children: "✕" }),
            ]}),
          ]}),
          jsx("div", { className: "tg-seg", style: { margin: "0 20px 16px" }, children: [segBtn(tab, setTab, "events", "Events"), segBtn(tab, setTab, "cost", "Cost"), segBtn(tab, setTab, "models", "Models"), segBtn(tab, setTab, "performance", "Performance"), segBtn(tab, setTab, "sessions", "Sessions"), segBtn(tab, setTab, "pricing", "Pricing")] }),
          jsx("div", { className: "tg-modal-body", children: body }),
        ]}),
      ]});
    }

    function TokenGobblerOverlay() {
      const [open, setOpen] = useState(false);
      const [openTab, setOpenTab] = useState("events");
      useEffect(() => {
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

    const inject = ["slots"];
    function apply(ctx) {
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section", id: "token-gobbler", order: 12, locale: NS, label: () => text("nav")
      }, TokenGobblerSettings));
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay", id: "token-gobbler", order: 50, label: () => "Token Gobbler"
      }, TokenGobblerOverlay));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
