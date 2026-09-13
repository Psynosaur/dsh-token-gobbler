// token-gobbler · client/sources.tsx
// IMPORTED HOMES, client side. One module-level INDEX is filled from every
// /usage payload (see hooks.ts), so any table or drawer can mark a row with the
// machine it came from WITHOUT threading props through the tabs:
//
//   isImported(row) / sourceBadge(row)     — the "🪟 Sabrent · Ohan" pill
//   sourceIndex() / sourceInfo(id)         — id -> { label, os, path, … }
//   SourceFilterBar({ … })                 — the all/local/<source> chips
//
// A row carries only its source ID (the server keeps the payload small); the OS
// icon and the label come from here, and a row whose source is not in the index
// still renders — it just shows the raw id.
import { fmt, fmtC } from "./core";

/** One home: the local DSH home, or a registered import. */
export interface SourceInfo {
  id: string;
  label: string;
  os: string;
  path: string;
  imported: boolean;
  enabled?: boolean;
  error?: string | null;
  /** Sessions this home contributed to the payload being displayed. */
  sessions?: number;
  tokens?: number;
}

export const LOCAL_ID = "local";
export const OS_ICON: Record<string, string> = { windows: "🪟", macos: "🍎", linux: "🐧", unknown: "💾" };
export const OS_NAME: Record<string, string> = { windows: "Windows", macos: "macOS", linux: "Linux", unknown: "unknown OS" };
export const osIcon = (os: unknown): string => OS_ICON[String(os)] || OS_ICON.unknown;
export const osName = (os: unknown): string => OS_NAME[String(os)] || OS_NAME.unknown;

let INDEX: Record<string, SourceInfo> = {};

/** Replace the index from a report payload's sources block. */
export function setSourceIndex(payload: any): void {
  if (!payload) return;
  const next: Record<string, SourceInfo> = {};
  const local = payload.local;
  if (local) {
    next[local.id || LOCAL_ID] = {
      id: local.id || LOCAL_ID,
      label: local.label || "This machine",
      os: local.os || "unknown",
      path: local.path || "",
      imported: false,
      sessions: local.sessions,
      tokens: local.tokens,
    };
  }
  for (const s of payload.imported || []) {
    if (!s || !s.id) continue;
    next[s.id] = {
      id: s.id,
      label: s.label || s.id,
      os: s.os || "unknown",
      path: s.path || "",
      imported: true,
      enabled: s.enabled !== false,
      error: s.error || null,
      // Prefer the counters of the load being displayed; fall back to the last scan.
      sessions: s.live ? s.live.sessions : (s.scan ? (s.scan.sessions || 0) + (s.scan.legacySessions || 0) : undefined),
      tokens: s.live ? s.live.tokens : (s.scan ? s.scan.tokens : undefined),
    };
  }
  INDEX = next;
}

export const sourceIndex = (): Record<string, SourceInfo> => INDEX;
export const sourceInfo = (id: unknown): SourceInfo | null => (id ? INDEX[String(id)] || null : null);
export const localSource = (): SourceInfo | null => INDEX[LOCAL_ID] || null;
/** The imported homes, in registry order. */
export const importedSources = (): SourceInfo[] => Object.values(INDEX).filter((s) => s.imported);
export const hasImports = (): boolean => importedSources().length > 0;

/** True when the session row came from an imported home. */
export const isImported = (row: any): boolean => !!(row && row.source && row.source !== LOCAL_ID);

/** The label + icon for a row's home ("🪟 Sabrent · Ohan"). */
export function sourceLabel(row: any): string {
  if (!isImported(row)) return "";
  const info = sourceInfo(row.source);
  const icon = osIcon(info ? info.os : "unknown");
  return icon + " " + (info ? info.label : String(row.source));
}

/** The pill that MARKS an imported session wherever a session is named. */
export function sourceBadge(row: any, opts: { short?: boolean } = {}): any {
  if (!isImported(row)) return null;
  const info = sourceInfo(row.source);
  const label = info ? info.label : String(row.source);
  const title = (info ? osName(info.os) + " · " + info.path : "imported source") +
    (info && info.error ? " — " + info.error : "");
  return jsxs("span", {
    className: "tg-src-badge",
    title,
    children: [
      jsx("span", { className: "tg-src-ico", children: osIcon(info ? info.os : "unknown") }, "ico"),
      jsx("span", { children: opts.short ? label.split(/[·(]/)[0].trim() : label }, "lbl"),
    ],
  }, "src");
}

/** How many sessions of the current payload a source holds. */
export const sourceSessionCount = (id: string, rows: any[]): number =>
  (rows || []).reduce((n, r) => n + ((id === LOCAL_ID ? !isImported(r) : r.source === id) ? 1 : 0), 0);

/**
 * The source filter: "All sources", then one chip per home, each with its
 * session count. Rendered only when something is actually imported — a single
 * local home has nothing to filter.
 */
export function SourceFilterBar(props: {
  value: string;
  onChange: (id: string) => void;
  /** Session rows of the current payload (for the counts). */
  rows: any[];
  /** Only the homes that contributed at least one row (the activity view: a
   *  paused or empty home would be a chip that filters to nothing). */
  compact?: boolean;
}): any {
  const all = importedSources();
  if (!all.length) return null;
  const local = localSource();
  const chips: { id: string; label: string; count: number; title: string }[] = [
    { id: "all", label: "All sources", count: (props.rows || []).length, title: "Every home — this machine and every import" },
  ];
  const localCount = sourceSessionCount(LOCAL_ID, props.rows);
  if (!props.compact || localCount > 0) chips.push({
    id: LOCAL_ID,
    label: osIcon(local ? local.os : "linux") + " This machine",
    count: localCount,
    title: (local ? local.path : "the local DSH home") + " — sessions that ran here",
  });
  for (const s of all) {
    const count = sourceSessionCount(s.id, props.rows);
    if (props.compact && count === 0) continue;
    chips.push({
      id: s.id,
      label: osIcon(s.os) + " " + s.label,
      count,
      title: osName(s.os) + " · " + s.path + (s.error ? " — " + s.error : ""),
    });
  }
  const value = chips.some((c) => c.id === props.value) ? props.value : "all";
  return jsx("div", { className: "tg-srcbar", children: chips.map((c) => jsxs("button", {
    className: "tg-srcchip" + (value === c.id ? " active" : "") + (c.id === "all" ? " tg-srcchip-all" : ""),
    title: c.title + " · " + fmt(c.count) + " session" + (c.count === 1 ? "" : "s"),
    onClick: () => props.onChange(c.id),
    children: [
      jsx("span", { className: "tg-srcchip-name", children: c.label }, "n"),
      jsx("span", { className: "tg-srcchip-n tg-num", children: fmt(c.count) }, "c"),
    ],
  }, c.id)) });
}

/** Does a session row belong to the active source filter? */
export const inSourceFilter = (row: any, filter: string): boolean => {
  if (!filter || filter === "all") return true;
  if (filter === LOCAL_ID) return !isImported(row);
  return row && row.source === filter;
};

/**
 * The "imported" line of a summary: which homes are folded in, and how much of
 * the total they are. Null when nothing is imported.
 */
export function importedSummary(payload: any): any {
  const imported = (payload && payload.imported) || [];
  if (!imported.length) return null;
  const sessions = imported.reduce((n: number, s: any) => n + ((s.live ? s.live.sessions : 0) || 0), 0);
  const tokens = imported.reduce((n: number, s: any) => n + ((s.live ? s.live.tokens : 0) || 0), 0);
  const broken = imported.filter((s: any) => s.error).length;
  const off = imported.filter((s: any) => s.enabled === false).length;
  return {
    sources: imported.length,
    sessions,
    tokens,
    broken,
    off,
    text: fmt(imported.length) + " imported home" + (imported.length === 1 ? "" : "s") +
      " · " + fmt(sessions) + " session" + (sessions === 1 ? "" : "s") +
      (tokens ? " · " + fmtC(tokens) + " tokens" : "") +
      (off ? " · " + off + " off" : "") +
      (broken ? " · " + broken + " unreadable" : ""),
  };
}
