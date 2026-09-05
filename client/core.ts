// token-gobbler · client/core.ts
// Shared primitives: constants, formatting, cell/segment helpers, and the small
// presentational pieces (stat cards, event chips, tool table). No React hooks.
export const NS = "token-gobbler";
export const STRINGS: Record<string, string> = { nav: "Token Gobbler" };
export const text = (key: string): string => STRINGS[key] ?? key;
export const API = "/token-gobbler";

export const fmt = (n: unknown): string => (n == null ? "0" : Number(n).toLocaleString("en-US"));
export const fmtC = (n: unknown): string => {
  if (n == null) return "0";
  const x = Number(n);
  if (x < 1000) return String(x);
  if (x < 1e6) return (x / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (x < 1e9) return (x / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  return (x / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
};
export const money = (n: unknown): string => (n == null ? "unpriced" : (Number(n) < 0 ? "-$" : "$") + Math.abs(Number(n)).toFixed(2));
export const fmtMs = (ms: unknown): string => {
  if (ms == null) return "—";
  const x = Number(ms);
  if (x < 1000) return Math.round(x) + "ms";
  if (x < 60000) return (x / 1000).toFixed(1).replace(/\.0$/, "") + "s";
  return Math.floor(x / 60000) + "m " + Math.round((x % 60000) / 1000) + "s";
};

/** Turn a normalized model id into a readable card name: "qwen3.8-27b-q4-gguf" -> "Qwen3.8 27B Q4 GGUF". */
export const humanizeModel = (raw: unknown): string => {
  if (!raw) return raw == null ? "" : String(raw);
  const tokens = String(raw).split(/[-_/]+/).filter(Boolean);
  const upper = new Set(["gguf", "cfg", "ud", "xl", "k"]);
  return tokens.map((tk) => {
    const low = tk.toLowerCase();
    if (upper.has(low)) return tk.toUpperCase();
    if (/^q\d+$/.test(low)) return "Q" + tk.slice(1);
    if (/^\d+(k|m|b)$/i.test(low)) return tk.toUpperCase();
    return tk.charAt(0).toUpperCase() + tk.slice(1);
  }).join(" ");
};

/** HTTP helper against the token-gobbler routes. */
export async function request(path: string, body?: unknown): Promise<any> {
  const opts: any = { headers: { accept: "application/json" } };
  if (body !== undefined) {
    opts.method = "POST";
    opts.headers["content-type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const response = await fetch(API + path, opts);
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.ok) {
    const err = new Error(json.error || ("HTTP " + response.status));
    (err as any).status = response.status; // lets callers tell a missing route (404) from a real failure (500)
    throw err;
  }
  return json.value;
}

// event-category display config (key matches trajectory.EVENT_CAT values)
export const EVENT_META = [
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

// ── scoped CSS (dedicated file for easy editing) ──────────────────────────
import cssText from "./token-gobbler.css";
export const CSS: string = cssText;

// ── cell/segment helpers ──────────────────────────────────────────────────
export const thL = (label: string): any => jsx("th", { className: "tg-th", children: label });
export const thR = (label: string): any => jsx("th", { className: "tg-th tg-th-r", children: label });
export const tdL = (children: any, props?: any): any => jsx("td", Object.assign({ className: "tg-td" }, props || {}, { children }));
export const tdR = (children: any, props?: any): any => jsx("td", Object.assign({ className: "tg-td tg-td-r tg-num" }, props || {}, { children }));

export const segBtn = (tab: string, setTab: (k: string) => void, key: string, label: string): any =>
  jsx("button", { className: "tg-seg-btn" + (tab === key ? " active" : ""), onClick: () => setTab(key), children: label });

// primitive presentational pieces
export const statCard = (label: string, value: any, color: string, isTotal: boolean): any =>
  jsxs("div", {
    className: "tg-card tg-stat" + (isTotal ? " tg-stat-total" : ""),
    children: [
      jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
        jsx("span", { className: "tg-stat-dot", style: { background: color } }),
        jsx("span", { className: "tg-label", style: isTotal ? { color: "#fbbf24" } : undefined, children: label }),
      ]}),
      jsx("div", { className: "tg-stat-value tg-num", children: fmt(value) }),
    ],
  });

export const eventChips = (events: any): any => {
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

export const toolTable = (tools: any[], sticky: boolean): any => {
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

export const numOrEmpty = (v: unknown): string | number => {
  if (v === "" || v == null) return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
};

export const rateInput = (value: unknown, onCommit: (v: string | number) => void): any => jsx("input", {
  className: "tg-input tg-input-num",
  type: "number", min: "0", step: "0.01",
  value: value === "" ? "" : String(value),
  onChange: (e: any) => onCommit(numOrEmpty(e.target.value)),
});
