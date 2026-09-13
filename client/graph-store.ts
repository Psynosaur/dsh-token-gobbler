// token-gobbler · client/graph-store.ts
// ─────────────────────────────────────────────────────────────────────────────
// The canvas charts (client/graph-canvas.tsx) carry three pieces of UI state
// that are a USER PREFERENCE rather than a property of the data: which context
// windows are toggled off, which metrics are toggled off, and whether the plot
// draws lines, dots (a scatter) or both. Re-opening a drawer used to reset all
// three, so the chart had to be re-configured on every visit.
//
// On top of the per-chart state there is ONE shared record of CHART DEFAULTS
// (loadChartSettings / saveChartSettings), edited in the plugin's settings tab
// (client/chart-settings.tsx): the default plot mode, and every knob of the
// trend (statistic, window, dots, spread band) and heat (rows, ramp, scale,
// binning, strip, labels) renderers. A chart reads them on mount and re-renders
// live when the settings tab writes — a per-chart stored mode still wins over
// the default, so a chart you configured by hand is not overruled.
//
// This module is the whole persistence layer for that state: namespaced,
// versioned localStorage records, parsed defensively — a missing, foreign,
// truncated or hand-edited value falls back to the defaults instead of throwing
// inside a render, and a browser that
// denies storage (private mode, quota, disabled cookies) simply forgets.
// Nothing here touches React or the DOM beyond the storage read/write, so it is
// unit-testable in Node with a stub (test/graph-render.test.js).
// ─────────────────────────────────────────────────────────────────────────────
import { POINT_MODES, trendWindow, type PointMode, type TrendStat, type HeatRows, type HeatRamp, type HeatScale } from "./graph";

// The render-mode vocabulary lives in the engine (client/graph.ts) — re-exported
// here so the settings tab and the chart shell can import it from one place.
export type { PointMode, TrendStat, HeatRows, HeatRamp, HeatScale };

/** Everything the chart remembers between mounts. */
export interface GraphUiState {
  chips: Record<string, boolean>;    // toggled-off context windows / groups
  metrics: Record<string, boolean>;  // toggled-off metrics
  mode: PointMode;                   // lines / both / dots
}

/** Storage key prefix — versioned so a future format change can ignore the old
 *  record instead of mis-reading it. */
export const GRAPH_STORE_KEY = "token-gobbler:graph:v1:";

/** Every plot mode the engine can draw, in toggle order — DERIVED from the
 *  engine's own list so a new mode is accepted by the store the moment it is
 *  added (a hard-coded copy here silently rejected "bars" and reset the user's
 *  choice to Lines on the next load). A corrupted value is still rejected. */
export const POINT_MODE_KEYS: PointMode[] = POINT_MODES.map((m) => m.k);

export const isPointMode = (v: any): v is PointMode => POINT_MODE_KEYS.indexOf(v) >= 0;

const boolMap = (v: any): Record<string, boolean> => {
  const out: Record<string, boolean> = {};
  if (v && typeof v === "object") for (const k of Object.keys(v)) if (v[k] === true) out[k] = true;
  return out;
};

/** The state of a chart that has never been touched. */
export const emptyUi = (mode: PointMode = "line"): GraphUiState => ({ chips: {}, metrics: {}, mode });

/** localStorage when the host actually has one (the browser bundle); null in
 *  Node and inside a browser that throws on access. */
export const graphStorage = (): Storage | null => {
  try { return typeof localStorage !== "undefined" && localStorage ? localStorage : null; }
  catch { return null; }
};

/** Restore a chart's state. "mode" is the caller's default (a chart may prefer
 *  to open as a scatter); anything unrecognised falls back to it. */
export const loadUi = (key: string | undefined, mode: PointMode = "line"): GraphUiState => {
  const base = emptyUi(mode);
  if (!key) return base;
  const s = graphStorage();
  if (!s) return base;
  try {
    const raw = s.getItem(GRAPH_STORE_KEY + key);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return base;
    return {
      chips: boolMap(parsed.chips),
      metrics: boolMap(parsed.metrics),
      mode: isPointMode(parsed.mode) ? parsed.mode : mode,
    };
  } catch { return base; }
};

/** Remember a chart's state. Best-effort by design: a chart must never break
 *  because storage is full or disabled — it just forgets again next time. */
export const saveUi = (key: string | undefined, ui: GraphUiState): void => {
  if (!key) return;
  const s = graphStorage();
  if (!s) return;
  try {
    const k = GRAPH_STORE_KEY + key;
    const next = JSON.stringify({ chips: boolMap(ui.chips), metrics: boolMap(ui.metrics), mode: ui.mode });
    if (s.getItem(k) !== next) s.setItem(k, next);  // no write when nothing changed
  } catch { /* private mode / quota / disabled storage — forget it */ }
};

/** Forget the plot MODE of every chart that was switched by hand (their chip /
 *  metric toggles stay), so the settings tab's default mode applies to them
 *  again. Without this, "default plot mode" could never reach a chart the user
 *  had once clicked. Returns how many records were rewritten. */
export const clearChartModes = (): number => {
  const s = graphStorage();
  if (!s) return 0;
  let n = 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.indexOf(GRAPH_STORE_KEY) === 0) keys.push(k); }
    for (const k of keys) {
      const raw = s.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || parsed.mode == null) continue;
      delete parsed.mode;
      s.setItem(k, JSON.stringify(parsed));
      n++;
    }
  } catch { /* private mode / quota — best effort */ }
  return n;
};

// ── shared chart defaults (the settings tab edits these) ───────────────────
export interface TrendSettings {
  stat: TrendStat;
  window: number;      // steps; 0 = auto (8% of the visible steps, forced odd, 3..21)
  dots: boolean;       // keep the raw steps visible under the trend
  dotsAlpha: number;   // 0.05..0.8 — how faint those dots are
  band: boolean;       // shade the window's p25..p75 behind the trend
}

export interface HeatSettings {
  rows: HeatRows;
  ramp: HeatRamp;
  scale: HeatScale;
  maxCols: number;     // bin steps until the grid is at most this wide (0 = never bin)
  strip: boolean;      // the window-colour strip along the top of the grid
  labels: boolean;     // row names in the left gutter
}

export interface ChartSettings {
  mode: PointMode;     // default plot mode for a chart that has none stored
  trend: TrendSettings;
  heat: HeatSettings;
}

/** The defaults the chart ships with; every one of them is editable in the
 *  settings tab, and this object is what the Reset button restores. */
export const DEFAULT_CHART_SETTINGS: ChartSettings = {
  mode: "line",
  trend: { stat: "median", window: 0, dots: true, dotsAlpha: 0.25, band: false },
  heat: { rows: "metric", ramp: "row", scale: "log", maxCols: 400, strip: true, labels: true },
};

/** The shared record. The per-chart records are "…:graph:v1:<key>". */
export const CHART_SETTINGS_KEY = "token-gobbler:chart:v1";

export const TREND_STATS: { k: TrendStat; name: string; hint: string }[] = [
  { k: "median", name: "Median", hint: "Middle value of the window — ignores single-step spikes" },
  { k: "mean", name: "Mean", hint: "Average of the window — every step pulls on it" },
  { k: "ema", name: "EMA", hint: "Exponential moving average — recent steps weigh more, no window edges" },
];

const oneOf = <T,>(v: any, allowed: readonly T[], fallback: T): T => (allowed.indexOf(v) >= 0 ? (v as T) : fallback);
const bool = (v: any, fallback: boolean): boolean => (typeof v === "boolean" ? v : fallback);
const num = (v: any, lo: number, hi: number, fallback: number): number => {
  const n = Number(v);
  return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback;
};

/** The window a trend would actually use — the engine's rule (an odd 3..51, or
 *  8% of the steps when the setting is 0/"auto"), so the settings tab can show
 *  the same number the chart will draw. */
export const trendWindowSize = (settings: TrendSettings, steps: number): number =>
  trendWindow(steps, settings.window);

/** Merge a stored (or hand-edited) record over the defaults, field by field. */
export const normalizeChartSettings = (raw: any): ChartSettings => {
  const d = DEFAULT_CHART_SETTINGS;
  const r = raw && typeof raw === "object" ? raw : {};
  const t = r.trend && typeof r.trend === "object" ? r.trend : {};
  const h = r.heat && typeof r.heat === "object" ? r.heat : {};
  return {
    mode: oneOf(r.mode, POINT_MODE_KEYS, d.mode),
    trend: {
      stat: oneOf(t.stat, ["median", "mean", "ema"] as const, d.trend.stat),
      window: num(t.window, 0, 51, d.trend.window),
      dots: bool(t.dots, d.trend.dots),
      dotsAlpha: num(t.dotsAlpha, 0.05, 0.8, d.trend.dotsAlpha),
      band: bool(t.band, d.trend.band),
    },
    heat: {
      rows: oneOf(h.rows, ["metric", "series"] as const, d.heat.rows),
      ramp: oneOf(h.ramp, ["row", "shared"] as const, d.heat.ramp),
      scale: oneOf(h.scale, ["log", "linear"] as const, d.heat.scale),
      maxCols: num(h.maxCols, 0, 4000, d.heat.maxCols),
      strip: bool(h.strip, d.heat.strip),
      labels: bool(h.labels, d.heat.labels),
    },
  };
};

const listeners = new Set<() => void>();

/** Live charts subscribe here: the settings tab writes, every open chart repaints. */
export const subscribeChartSettings = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

export const loadChartSettings = (): ChartSettings => {
  const s = graphStorage();
  if (!s) return { ...DEFAULT_CHART_SETTINGS, trend: { ...DEFAULT_CHART_SETTINGS.trend }, heat: { ...DEFAULT_CHART_SETTINGS.heat } };
  try {
    const raw = s.getItem(CHART_SETTINGS_KEY);
    return normalizeChartSettings(raw ? JSON.parse(raw) : null);
  } catch { return normalizeChartSettings(null); }
};

export const saveChartSettings = (next: ChartSettings): ChartSettings => {
  const clean = normalizeChartSettings(next);
  const s = graphStorage();
  if (s) {
    try {
      const body = JSON.stringify(clean);
      if (s.getItem(CHART_SETTINGS_KEY) !== body) s.setItem(CHART_SETTINGS_KEY, body);
    } catch { /* private mode / quota — the charts still follow this session */ }
  }
  for (const fn of Array.from(listeners)) { try { fn(); } catch { /* a broken subscriber must not block the rest */ } }
  return clean;
};

/** Back to the shipped defaults (the settings tab's Reset button). */
export const resetChartSettings = (): ChartSettings => saveChartSettings(DEFAULT_CHART_SETTINGS);
