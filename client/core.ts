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
  { key: "systemMessages", label: "System msgs", color: "#94a3b8" },
  { key: "turns", label: "Turns", color: "#fbbf24" },
  { key: "userStops", label: "User stops", color: "#f87171" },
  { key: "compactions", label: "Compactions", color: "#f472b6" },
  { key: "retries", label: "LLM retries", color: "#fb923c" },
  { key: "approvals", label: "Approvals", color: "#f87171" },
  { key: "todos", label: "Todo writes", color: "#a3e635" },
  { key: "commands", label: "Commands", color: "#38bdf8" },
];

// ── localStorage point cache ─────────────────────────────────────────────
// The /breakdown payload (the per-step points: ctx size, prefill/decode
// speed, compaction events) is the expensive part of a load — the server
// re-derives it from the trajectories on every call. Once computed, the
// points only change when the trajectories change, so the computed payloads
// are cached in localStorage (gzip via CompressionStream, base64-encoded)
// and served from the cache while a fingerprint — derived from the cheap
// /usage aggregates — is unchanged. While the fingerprint matches, the heavy
// endpoints are skipped entirely: no server-side recompute, instant modal.
export type TgCache = { v: 1; home: string; fp: string; at: number; usage: any; breakdown: any; perf: any };
// Bump CACHE_VERSION whenever the per-step point COMPUTATION changes (parser or
// report math) — the fingerprint only covers trajectory growth, so a changed
// computation would otherwise keep serving stale cached points. The ♻ Reprocess
// button also clears the cache explicitly.
const CACHE_VERSION = 6; // v6: sessions now carry `turnTimeline` (per-turn prompts/outcomes + the session event timeline) — v5 cached breakdowns have no such field
const CACHE_KEY = "tg:cache:v" + CACHE_VERSION;
const PREV_KEYS = ["tg:cache:v1", "tg:cache:v2", "tg:cache:v3", "tg:cache:v4", "tg:cache:v5"]; // superseded cache keys — removed so they stop eating quota
const b64FromBytes = (bytes: Uint8Array): string => {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
  return btoa(bin);
};
const bytesFromB64 = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
/** Serialize + gzip → "gz:<base64>". Falls back to "raw:<json>" when
 *  CompressionStream is unavailable (only for payloads that fit). */
export async function compressPayload(obj: unknown): Promise<string> {
  const json = JSON.stringify(obj);
  const CS = (globalThis as any).CompressionStream;
  if (typeof CS !== "function") return json.length < 4_500_000 ? "raw:" + json : "";
  try {
    const stream = new Blob([json]).stream().pipeThrough(new CS("gzip"));
    const buf = await new Response(stream).arrayBuffer();
    return "gz:" + b64FromBytes(new Uint8Array(buf));
  } catch {
    return json.length < 4_500_000 ? "raw:" + json : "";
  }
}
export async function decompressPayload(s: string): Promise<any> {
  if (s.startsWith("raw:")) return JSON.parse(s.slice(4));
  const DS = (globalThis as any).DecompressionStream;
  if (typeof DS !== "function") throw new Error("unsupported cache format");
  const raw = bytesFromB64(s.slice(3)); // buffer is exactly the byte run (fresh allocation)
  const stream = new Blob([raw.buffer as ArrayBuffer]).stream().pipeThrough(new DS("gzip"));
  return JSON.parse(await new Response(stream).text());
}
export async function readCache(): Promise<TgCache | null> {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    if (!s) return null;
    const c = await decompressPayload(s);
    return c && c.v === 1 ? c : null;
  } catch {
    return null;
  }
}
/** Drop superseded cache keys so an old version stops eating localStorage quota. */
const dropPrevKeys = (): void => {
  try { for (const k of PREV_KEYS) localStorage.removeItem(k); } catch { /* ignore */ }
};
/** Store the cache; on quota overflow retry without the big breakdown, then give up silently. */
export async function writeCache(c: TgCache): Promise<void> {
  for (const a of [c, { ...c, breakdown: null }]) {
    try {
      const body = await compressPayload(a);
      if (!body) return;
      localStorage.setItem(CACHE_KEY, body);
      dropPrevKeys();
      return;
    } catch { /* try next attempt */ }
  }
}
export function clearCache(): void {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
  dropPrevKeys();
}

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

/** Auto-fit grid of costCards — the shared "badges" row used by the Cost,
 *  Combined and Daily tabs (`.tg-badgegrid` in token-gobbler.css). */
export const badgeGrid = (items: any[]): any =>
  jsx("div", { className: "tg-badgegrid", children: items });

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
  // Bounded so the sticky header pins inside THIS table and can never float over
  // the drawer content below it (see the sticky rules in token-gobbler.css).
  return sticky ? jsx("div", { className: "tg-tscroll tg-vscroll", children: table }) : table;
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
