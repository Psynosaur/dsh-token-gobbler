// token-gobbler · client/graph.ts
// ─────────────────────────────────────────────────────────────────────────────
// A tiny, dependency-free CANVAS graph core — the plugin's ONLY chart engine
// since the vendored amCharts bundle (and its 11 MB of vendor JS) was removed.
// Nothing here touches the
// DOM, React or the network: it is scales + ticks + layout + drawing against a
// CanvasRenderingContext2D-shaped object, so the whole engine can be unit-tested
// in Node with a recording context stub (test/graph-render.test.js).
//
// client/graph-canvas.tsx is the thin React shell around it (measure, HiDPI,
// chips, hover tooltip). The chart SPEC (GraphProps) is deliberately close to
// the old AmChartProps so callers can be swapped one chart at a time:
//
//   data / xField / xLabel / xStep   — the shared x (numeric, e.g. step index)
//   series[]                         — one entry per drawn line / area / dot set
//   smooth / tension                 — monotone-cubic curves instead of polylines
//   mode ("line"/"both"/"dots")      — lines, a scatter of dots, or both
//   axes[]                           — one entry per value axis (0 = left, 1 = right)
//   rules[], chips[], metricChips[]  — ✂ annotation lines + togglable legends
//   tipField / tipData               — one shared multi-line hover tooltip
//   persistKey                       — remember the toggles (client/graph-store.ts)
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphRow { [key: string]: any }

/** How the data is drawn: connected `line`s (default), a dot per point
 *  (`dots` — a scatter), both at once, a `trend` line through the dots, a
 *  `bars` column per point (discrete sums, not a continuous signal), or a
 *  `heat` grid (metric rows × step columns, shaded by value). A user toggle. */
export type PointMode = "line" | "both" | "dots" | "trend" | "bars" | "heat";

/** How a trend line is computed from the raw per-step points. */
export type TrendStat = "median" | "mean" | "ema";
/** Heat rows: one per metric key, or one per series (i.e. per window × metric). */
export type HeatRows = "metric" | "series";
/** Heat colours: every row in its own hue, or one shared ramp. */
export type HeatRamp = "row" | "shared";
/** Heat shading: within-row log or linear normalisation. */
export type HeatScale = "log" | "linear";

/** The plot modes in toggle order, with the label + tooltip the shell shows. */
export const POINT_MODES: { k: PointMode; name: string; title: string }[] = [
  { k: "line", name: "Lines", title: "Connect the points with lines" },
  { k: "both", name: "Both", title: "Lines, plus a dot on every point" },
  { k: "dots", name: "Dots", title: "Scatter plot — a dot per point, no connecting lines" },
  { k: "trend", name: "Trend", title: "A rolling median/mean/EMA through the dots — the signal, not every spike" },
  { k: "bars", name: "Bars", title: "One bar per point, grown from the axis floor — for discrete values (a day's cost, one run) rather than a continuous signal" },
  { k: "heat", name: "Heat", title: "One row per metric, one column per step, shaded by value" },
];

/** One drawn data set. Rows come from `data` (shared) or the series' own
 *  `data` (per-regime subsets), whichever is set. */
export interface GraphSeries {
  key: string;              // numeric field on the row
  label: string;            // legend chip name
  tipName?: string;         // tooltip row name (defaults to label — e.g. one "ctx" row per window)
  color: string;
  unit?: string;            // appended to tooltip values
  axis?: number;            // value axis index (default 0 = left)
  data?: GraphRow[];        // per-series rows; falls back to props.data
  line?: boolean;           // connect the points (default true when radius is 0)
  fill?: boolean;           // translucent area under the line
  smooth?: boolean;         // draw the line as a smooth curve (monotone cubic; default = props.smooth)
  tension?: number;         // smoothing strength 0..1 (default 0.5) — lower = flatter between points
  dash?: number[];          // stroke dash pattern
  radius?: number;          // dot radius in px (0/undefined = no dots; the scatter modes pick a visible default)
  width?: number;           // stroke width (default 1.5)
  regime?: number | string; // chip identity: one toggle hides every series sharing it
  hidden?: boolean;         // start hidden
}

/** A vertical annotation line (e.g. a ✂ compaction boundary). */
export interface GraphRule {
  x: number;
  label?: string;
  color?: string;
  dash?: number[];
  windows?: (number | string)[]; // regimes this rule bounds — hidden when either is hidden
}

/** Per value-axis options. */
export interface GraphAxis {
  log?: boolean;
  hideLabels?: boolean;    // scale the axis but draw no ticks/labels (tooltip carries values)
  unit?: string;
  min?: number;            // forced domain floor (default 0 on a linear axis)
  max?: number;            // forced domain ceiling
  baseline?: number;       // fill baseline for a non-zero-based axis
  format?: (v: number) => string;
}

export interface Chip { name: string; color: string; k: number | string }

/** The chart spec — see the header for the field-by-field contract. */
export interface GraphProps {
  data?: GraphRow[];
  xField: string;
  xLabel?: string;
  xUnit?: string;
  xStep?: number;          // tick step on the x axis (default: auto)
  xTickFormat?: (v: number) => string; // x tick LABEL derived from the value — how a
                           // numeric index axis reads as dates or other categories
                           // (the hover tooltip's x value is formatted the same way)
  series: GraphSeries[];
  smooth?: boolean;        // smooth every series (a per-series smooth flag wins)
  pointMode?: PointMode;   // plot mode the chart opens with (default: the saved chart settings)
  modeChips?: boolean;     // show the Lines / Both / Dots switch above the plot
  persistKey?: string;     // remember chips + metrics + plot mode under this key
  height?: number;
  axes?: GraphAxis[];
  rules?: GraphRule[];
  legendChips?: boolean;
  legendUnit?: string;
  chips?: Chip[];          // explicit togglable chips (one per context window / group)
  metricChips?: Chip[];    // togglable chips that hide a metric across every group
  tipField?: string;       // pre-formatted multi-line tooltip text on the row (wins over the per-series rows)
  tipHeadField?: string;   // row field used as the tooltip TITLE (e.g. "T4S8"), x value appended
  tipData?: GraphRow[];    // rows the shared tooltip hit-tests against
  empty?: any;             // rendered instead of nothing when there is no data
}

/** Which chip groups are currently toggled off. */
export interface Hidden { chips: Record<string, boolean>; metrics: Record<string, boolean> }
export const noHidden = (): Hidden => ({ chips: {}, metrics: {} });

/** Hidden = its metric chip is off, or the window/regime chip it belongs to is off. */
export const seriesVisible = (s: GraphSeries, h: Hidden): boolean => {
  if (s.hidden) return false;
  if (s.regime != null && h.chips[String(s.regime)]) return false;
  if (h.metrics[s.key]) return false;
  return true;
};

/** Dot radius of a series under a plot mode. In `line` mode only a series that
 *  asks for dots (an explicit radius, or `line: false`) draws any; both scatter
 *  modes dot EVERY series and pick a visible default, so the points still read
 *  once the connecting line is gone. */
export const dotRadius = (s: GraphSeries, mode: PointMode = "line"): number => {
  if (s.radius != null) return s.radius;
  if (mode === "bars") return 0; // the bar IS the mark — a dot on its cap adds nothing
  if (mode === "dots") return 2.4;
  if (mode === "both") return 2;
  return s.line === false ? 2 : 0;
};

// ── scales ───────────────────────────────────────────────────────────────
export interface Scale {
  (v: number): number;
  invert(px: number): number;
  domain: [number, number];
  range: [number, number];
  log: boolean;
}

/** Map a value domain onto a pixel range. Log scales clamp to the floor so a
 *  zero/negative value lands on the axis instead of at -Infinity. */
export const makeScale = (domain: [number, number], range: [number, number], log = false): Scale => {
  let [d0, d1] = domain;
  if (!isFinite(d0)) d0 = 0;
  if (!isFinite(d1)) d1 = d0 + 1;
  if (log) { d0 = d0 > 0 ? d0 : 1e-9; d1 = d1 > d0 ? d1 : d0 * 10; }
  else if (d1 === d0) d1 = d0 + 1;
  const [r0, r1] = range;
  const l0 = log ? Math.log10(d0) : d0;
  const l1 = log ? Math.log10(d1) : d1;
  const span = (l1 - l0) || 1;
  const sc = ((v: number): number => {
    const lv = log ? Math.log10(v > d0 ? v : d0) : v;
    return r0 + ((lv - l0) / span) * (r1 - r0);
  }) as Scale;
  sc.invert = (px: number): number => {
    const lv = l0 + ((px - r0) / ((r1 - r0) || 1)) * span;
    return log ? Math.pow(10, lv) : lv;
  };
  sc.domain = [d0, d1];
  sc.range = [r0, r1];
  sc.log = log;
  return sc;
};

export interface Tick { v: number; px: number; label: string }

/** The 1/2/5×10ⁿ step closest to (but not below) `raw`. */
export const niceStep = (raw: number): number => {
  if (!(raw > 0) || !isFinite(raw)) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
};

/** Headroom left above the largest value on a value axis: the ceiling is
 *  max × (1 + AXIS_HEADROOM) — data-driven, so nothing is ever clipped and no
 *  chart is stuck on a fixed/rounded maximum. */
export const AXIS_HEADROOM = 0.1;

/** Smallest 1/2/2.5/5×10ⁿ value ≥ v — kept for callers that want a rounded
 *  ceiling; the frame builder itself scales to the data (see AXIS_HEADROOM). */
export const niceCeil = (v: number): number => {
  if (!(v > 0) || !isFinite(v)) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return m * mag;
};

const round6 = (v: number): number => Math.round(v * 1e6) / 1e6;

/** Tick values inside [min, max] on a 1/2/5×10ⁿ step (≈ count of them). */
export const linearTicks = (min: number, max: number, count = 5): number[] => {
  if (!isFinite(min) || !isFinite(max) || max <= min) return [min];
  const step = niceStep((max - min) / Math.max(1, count));
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(round6(v));
  return out.length ? out : [min, max];
};

/** Powers of ten inside [min, max]; when that yields fewer than three ticks the
 *  2×/3×/5× helpers of the decades are added so a one-decade axis still reads. */
export const logTicks = (min: number, max: number): number[] => {
  const lo = Math.floor(Math.log10(min > 0 ? min : 1));
  const hi = Math.ceil(Math.log10(max > min ? max : min * 10));
  const out: number[] = [];
  for (let e = lo; e <= hi; e++) {
    const p = Math.pow(10, e);
    if (p >= min * 0.999 && p <= max * 1.001) out.push(p);
  }
  if (out.length >= 3) return out;
  const dense: number[] = [];
  for (let e = lo; e <= hi; e++) {
    for (const m of [1, 2, 3, 5]) {
      const v = m * Math.pow(10, e);
      if (v >= min * 0.999 && v <= max * 1.001) dense.push(v);
    }
  }
  return dense.length ? dense : out;
};

const trim1 = (x: number): string => { const s = (Math.round(x * 10) / 10).toFixed(1); return s.endsWith(".0") ? s.slice(0, -2) : s; };

/** Compact axis/tooltip number, same thresholds as core.fmtC: 950 → "950",
 *  1500 → "1.5K", 45000 → "45K", 1.2e6 → "1.2M". */
export const fmtValue = (v: number): string => {
  if (!isFinite(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e9) return trim1(v / 1e9) + "B";
  if (a >= 1e6) return trim1(v / 1e6) + "M";
  if (a >= 1000) return trim1(v / 1e3) + "K";
  if (a >= 1) return String(Math.round(v * 100) / 100);
  if (a === 0) return "0";
  return String(Math.round(v * 1000) / 1000);
};

// ── frame (pure layout: what to draw where) ──────────────────────────────
export interface Pad { l: number; r: number; t: number; b: number }
export interface Plot { x: number; y: number; w: number; h: number }
export interface GraphPoint { px: number; py: number; v: number; ok: boolean; row: GraphRow }
export interface GraphLine { series: GraphSeries; axis: number; points: GraphPoint[]; smooth: boolean }
export interface GraphRulePos { px: number; label: string; color: string; dash: number[] }
export interface GraphAxisFrame {
  log: boolean; hideLabels: boolean; unit: string;
  scale: Scale; ticks: Tick[]; domain: [number, number];
}
export interface GraphTip { px: number; row: GraphRow }
export interface GraphFrame {
  width: number; height: number; plot: Plot; pad: Pad;
  x: Scale; xDomain: [number, number]; xTicks: Tick[]; xLabel: string;
  columns: GraphAxisFrame[];
  lines: GraphLine[];
  rules: GraphRulePos[];
  tips: GraphTip[];
  heat: HeatFrame | null;   // the lattice, only built in "heat" mode
}

const rowsOf = (p: GraphProps, s: GraphSeries): GraphRow[] => s.data || p.data || [];

const minMax = (rows: GraphRow[], field: string, positiveOnly: boolean): [number, number] | null => {
  let lo = Infinity, hi = -Infinity;
  for (const r of rows) {
    const v = Number(r[field]);
    if (r[field] == null || !isFinite(v)) continue;
    if (positiveOnly && v <= 0) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return lo === Infinity ? null : [lo, hi];
};

// ── heat (a metric × step lattice) ───────────────────────────────────────
/** One shaded cell: a run of steps binned together, normalised within its row. */
export interface HeatCell { x: number; w: number; t: number; v: number }
export interface HeatRow { key: string; label: string; color: string; lo: number; hi: number; cells: HeatCell[] }
export interface HeatStrip { x: number; w: number; color: string }
export interface HeatFrame { rows: HeatRow[]; strip: HeatStrip[]; cellW: number; stripH: number }

export interface HeatOptions {
  rows?: HeatRows;      // "metric" (one row per metric key) | "series"
  ramp?: HeatRamp;      // "row" (each row in its own hue) | "shared"
  scale?: HeatScale;    // "log" (default) | "linear"
  maxCols?: number;     // bin steps until the grid is at most this wide (0 = never)
  strip?: boolean;      // window-colour strip along the top
  labels?: boolean;     // row names in the left gutter
}

/** Height of the window-colour strip at the top of the grid. */
export const HEAT_STRIP_H = 6;

/** The ramp used when every row shares one colour scale (dark → amber, readable
 *  on the plugin's dark panel). Row-hue mode uses the series colours instead. */
export const SHARED_RAMP = ["#0b1220", "#1e3a8a", "#0e7490", "#22c55e", "#facc15"];

const hex2rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16),
];

/** Sample a multi-stop colour ramp at t ∈ [0,1]. */
export const sampleRamp = (stops: string[], t: number): string => {
  const n = Math.max(2, stops.length);
  const u = Math.max(0, Math.min(1, t)) * (n - 1);
  const i = Math.min(n - 2, Math.floor(u));
  const f = u - i;
  const a = hex2rgb(stops[i]), b = hex2rgb(stops[i + 1]);
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
};

/** Lay the visible series out as a grid: one ROW per metric (or per series) and
 *  one COLUMN per step, each cell shaded by its value normalised inside its own
 *  row — the token metrics, the context size and the tok/s speeds share no scale,
 *  so a single global range would flatten five rows into the panel colour.
 *
 *  Why a lattice and not a density map: this chart has exactly one value per
 *  metric per step, so an x=step / y=value grid would hold a single point per
 *  column and carry no density at all. Rows are the dimension that actually has
 *  more than one thing in it.
 *
 *  Holes (a step with no value for that metric — e.g. thinking when the provider
 *  reports none) leave the cell EMPTY: "no data" must never look like "low". */
export const heatLayout = (p: GraphProps, f: GraphFrame, o: HeatOptions = {}): HeatFrame => {
  const rowsMode: HeatRows = o.rows || "metric";
  const ramp: HeatRamp = o.ramp || "row";
  const scale: HeatScale = o.scale || "log";
  const stripOn = o.strip !== false;
  const cols = f.tips;
  const n = cols.length;
  const stripH = stripOn ? HEAT_STRIP_H : 0;
  // Cell edges sit halfway between neighbouring steps, so the grid spans the
  // whole plot no matter what the x scale is (the axis rescales with the chips).
  const edge = (i: number): number =>
    i < 0 ? f.plot.x
      : i >= n - 1 ? f.plot.x + f.plot.w
      : (cols[i].px + cols[i + 1].px) / 2;

  const defs: { key: string; label: string; color: string; lines: GraphLine[] }[] = [];
  const byKey: Record<string, number> = {};
  for (const ln of f.lines) {
    const s = ln.series;
    if (rowsMode === "series") {
      // a series row is named by the SERIES (the window), a metric row by the
      // metric — which is why the two row modes produce different labels
      defs.push({ key: s.key + "@" + String(s.regime != null ? s.regime : defs.length), label: s.label, color: s.color, lines: [ln] });
    } else if (byKey[s.key] == null) {
      byKey[s.key] = defs.length;
      defs.push({ key: s.key, label: s.tipName || s.label, color: s.color, lines: [ln] });
    } else defs[byKey[s.key]].lines.push(ln);
  }
  // two windows both called "ctx" would be two identical row names — number them
  const seen: Record<string, number> = {};
  for (const d of defs) seen[d.label] = (seen[d.label] || 0) + 1;
  for (const d of defs) {
    if (seen[d.label] > 1) {
      const r = d.lines[0].series.regime;
      d.label = d.label + (r != null ? " " + r : " " + defs.indexOf(d));
    }
  }

  // Columns are matched by STEP VALUE, never by row identity: a caller may hand
  // a series its own copy of the rows (the perf panel's context line does, to
  // append the compaction reset step), and an identity lookup would silently
  // drop that whole row from the grid.
  const colOf = new Map<number, number>();
  cols.forEach((tip, i) => colOf.set(Number(tip.row[p.xField]), i));
  const colAt = (row: GraphRow): number | undefined => colOf.get(Number(row[p.xField]));
  const maxCols = o.maxCols && o.maxCols > 0 ? Math.max(1, Math.round(o.maxCols)) : n;
  const bin = Math.max(1, Math.ceil(n / Math.max(1, maxCols)));

  const out: HeatRow[] = [];
  for (const d of defs) {
    const vals: (number | null)[] = new Array(n).fill(null);
    for (const ln of d.lines) {
      for (const pt of ln.points) {
        if (!pt.ok) continue;
        const i = colAt(pt.row);
        if (i == null || i < 0 || i >= n) continue;
        const cur = vals[i];
        vals[i] = cur == null ? pt.v : Math.max(cur, pt.v);
      }
    }
    // bin: a cell shows the LARGEST step it covers, so a one-step spike survives
    // the binning instead of being averaged away
    const cells: HeatCell[] = [];
    for (let i = 0; i < n; i += bin) {
      const j = Math.min(n, i + bin) - 1;
      let best: number | null = null;
      for (let k = i; k <= j; k++) { const v = vals[k]; if (v != null && (best == null || v > best)) best = v; }
      if (best == null) continue;
      cells.push({ x: edge(i - 1), w: Math.max(0.6, edge(j) - edge(i - 1)), v: best, t: 0 });
    }
    let lo = Infinity, hi = -Infinity;
    for (const c of cells) { if (c.v < lo) lo = c.v; if (c.v > hi) hi = c.v; }
    const useLog = scale === "log" && lo > 0;
    const l0 = useLog ? Math.log10(lo) : lo;
    const l1 = useLog ? Math.log10(hi) : hi;
    const span = l1 - l0;
    for (const c of cells) {
      const lv = useLog ? Math.log10(c.v) : c.v;
      c.t = span > 0 ? Math.max(0, Math.min(1, (lv - l0) / span)) : 0.5;
    }
    if (cells.length) out.push({ key: d.key, label: d.label, color: d.color, lo, hi, cells });
  }

  const strip: HeatStrip[] = [];
  if (stripOn) {
    const chipColor: Record<string, string> = {};
    for (const c of p.chips || []) chipColor[String(c.k)] = c.color;
    const at: (string | null)[] = new Array(n).fill(null);
    for (const ln of f.lines) {
      const s = ln.series;
      if (s.regime == null) continue;
      const col = chipColor[String(s.regime)] || s.color;
      for (const pt of ln.points) { const i = colAt(pt.row); if (i != null && i >= 0 && i < n && at[i] == null) at[i] = col; }
    }
    for (let i = 0; i < n; i++) {
      const col = at[i];
      if (!col) continue;
      const x0 = edge(i - 1), x1 = edge(i);
      const last = strip[strip.length - 1];
      if (last && last.color === col && Math.abs(last.x + last.w - x0) < 0.6) last.w = x1 - last.x;
      else strip.push({ x: x0, w: x1 - x0, color: col });
    }
  }

  return { rows: out, strip, cellW: f.plot.w / Math.max(1, n), stripH };
};

/** Lay the chart out for a pixel size: domains (x + one per value axis), ticks
 *  and one point list per visible series. `hidden` is the chip state.
 *
 *  `opts.mode` only changes the FRAME for "heat": its rows are categorical, so
 *  the value axes stop labelling themselves and the left gutter becomes the row
 *  names. Every other mode shares one frame — switching Line/Both/Dots/Trend
 *  moves no axis (the trend is drawn in the very same scales). */
export const buildFrame = (
  p: GraphProps, hidden: Hidden, size: { width: number; height: number },
  opts: { mode?: PointMode; heat?: HeatOptions } = {},
): GraphFrame => {
  const width = Math.max(1, Math.round(size.width || 0));
  const height = Math.max(1, Math.round(size.height || 0));
  const axes = p.axes || [];
  const nAxes = Math.max(1, axes.length || 1);
  const mode = opts.mode || "line";
  const pad: Pad = { l: 8, r: 10, t: 10, b: 22 };
  if (mode === "heat") pad.l = (opts.heat && opts.heat.labels === false) ? 12 : 62;
  else {
    if (nAxes > 0 && !axes[0]?.hideLabels) pad.l = 48;
    if (nAxes > 1 && !axes[1]?.hideLabels) pad.r = 48;
  }
  const plot: Plot = {
    x: pad.l, y: pad.t,
    w: Math.max(1, width - pad.l - pad.r),
    h: Math.max(1, height - pad.t - pad.b),
  };

  const visible = (p.series || []).filter((s) => seriesVisible(s, hidden));

  // x domain — ONLY the rows that are actually drawn. Hiding a chip (a context
  // window, a metric) therefore rescales the axis to what is left: the first
  // step of the remaining span becomes the axis minimum and the rows outside it
  // fall out of the tooltip hit-test below.
  const xRows: GraphRow[] = [];
  for (const s of visible) xRows.push(...rowsOf(p, s));
  const xmm = minMax(xRows, p.xField, false)
    || minMax(p.tipData || [], p.xField, false)
    || minMax(p.data || [], p.xField, false)
    || [0, 1];
  const xDomain: [number, number] = xmm[1] > xmm[0] ? [xmm[0], xmm[1]] : [xmm[0], xmm[0] + 1];
  const x = makeScale(xDomain, [plot.x, plot.x + plot.w], false);

  // One value axis frame per axis index: domain from the visible series on it.
  const columns: GraphAxisFrame[] = [];
  for (let c = 0; c < nAxes; c++) {
    const def = axes[c] || {};
    const vals: number[] = [];
    for (const s of visible) {
      if ((s.axis || 0) !== c) continue;
      for (const r of rowsOf(p, s)) {
        const v = Number(r[s.key]);
        if (r[s.key] == null || !isFinite(v)) continue;
        if (def.log && v <= 0) continue;
        vals.push(v);
      }
    }
    // Domains are DATA-DRIVEN: the ceiling is the largest value on the axis plus
    // AXIS_HEADROOM (10%), never a fixed or rounded-up "nice" max — so a chart
    // always fills its panel and a bigger number in the data always shows.
    let domain: [number, number];
    if (def.log) {
      let lo = Infinity, hi = -Infinity;
      for (const v of vals) { if (!(v > 0)) continue; if (v < lo) lo = v; if (v > hi) hi = v; }
      if (!isFinite(hi)) domain = [1, 10];
      else {
        const floor = def.min != null && def.min > 0 ? def.min : Math.pow(10, Math.floor(Math.log10(lo)));
        // The headroom is applied in LOG space: max × 1.1 is only 0.04 of a
        // decade, which would pin the peak to the top of the frame — here the
        // peak lands at 1/1.1 of the panel height on a log axis too, so both
        // axis types read the same.
        const hiDec = Math.log10(hi), loDec = Math.log10(floor);
        const ceil = def.max != null ? def.max : Math.pow(10, hiDec + AXIS_HEADROOM * (hiDec - loDec));
        domain = [floor, ceil > floor ? ceil : floor * 10];
      }
    } else {
      const floor = def.min != null ? def.min : (def.baseline != null ? Math.min(def.baseline, 0) : 0);
      let top = -Infinity;
      for (const v of vals) if (v > top) top = v;
      const ceil = def.max != null ? def.max : (isFinite(top) ? top * (1 + AXIS_HEADROOM) : floor + 1);
      domain = [floor, ceil > floor ? ceil : floor + 1];
    }
    const scale = makeScale(domain, [plot.y + plot.h, plot.y], !!def.log);
    const tickVals = def.log ? logTicks(domain[0], domain[1]) : linearTicks(domain[0], domain[1], 5);
    const fmt = def.format || fmtValue;
    columns.push({
      log: !!def.log, hideLabels: !!def.hideLabels, unit: def.unit || "",
      scale, domain,
      ticks: tickVals.map((v) => ({ v, px: scale(v), label: fmt(v) })),
    });
  }

  // x ticks: multiples of xStep (auto-stepped to ~10 labels).
  const span = xDomain[1] - xDomain[0];
  const step = p.xStep && p.xStep > 0 ? p.xStep : niceStep(span / 10);
  const xTicks: Tick[] = [];
  for (let v = Math.ceil(xDomain[0] / step) * step; v <= xDomain[1] + step * 1e-6; v += step) {
    const val = round6(v);
    xTicks.push({ v: val, px: x(val), label: p.xTickFormat ? String(p.xTickFormat(val)) : fmtValue(val) });
  }

  // Series geometry. A point with no value is kept (ok: false) so the renderer
  // breaks the line instead of drawing through the gap to the next value.
  const lines: GraphLine[] = [];
  for (const s of visible) {
    const axis = s.axis || 0;
    const sc = (columns[axis] || columns[0]).scale;
    const log = !!(axes[axis] && axes[axis].log);
    const points: GraphPoint[] = rowsOf(p, s).map((row) => {
      const raw = row[s.key];
      const v = Number(raw);
      const ok = raw != null && isFinite(v) && !(log && v <= 0);
      const xv = Number(row[p.xField]);
      return { px: x(isFinite(xv) ? xv : xDomain[0]), py: ok ? sc(v) : plot.y + plot.h, v: ok ? v : NaN, ok, row };
    });
    lines.push({ series: s, axis, points, smooth: s.smooth != null ? !!s.smooth : !!p.smooth });
  }

  // ✂ rules — dropped when a chip hides one of the windows the rule bounds
  // (and when a rule sits outside the visible x range).
  const rules: GraphRulePos[] = (p.rules || [])
    .filter((r) => !(r.windows || []).some((w) => hidden.chips[String(w)]) && isFinite(Number(r.x)))
    .map((r) => ({ px: x(Number(r.x)), label: r.label || "", color: r.color || "#f472b6", dash: r.dash || [3, 3] }))
    .filter((r) => r.px >= plot.x - 0.5 && r.px <= plot.x + plot.w + 0.5);

  const tips: GraphTip[] = (p.tipData || p.data || [])
    .map((row) => { const xv = Number(row[p.xField]); return { px: x(isFinite(xv) ? xv : xDomain[0]), row }; })
    .filter((t) => t.px >= plot.x - 1 && t.px <= plot.x + plot.w + 1)
    .sort((a, b) => a.px - b.px);

  const frame: GraphFrame = {
    width, height, plot, pad,
    x, xDomain, xTicks, xLabel: p.xLabel || p.xField,
    columns, lines, rules, tips, heat: null,
  };
  if (mode === "heat") frame.heat = heatLayout(p, frame, opts.heat);
  return frame;
};

/** The tooltip row nearest a canvas-space x (null when nothing is in range). */
export const hitTest = (f: GraphFrame, px: number, maxDist = 26): GraphTip | null => {
  let best: GraphTip | null = null, bestD = Infinity;
  for (const t of f.tips) {
    const d = Math.abs(t.px - px);
    if (d < bestD) { bestD = d; best = t; }
  }
  return best && bestD <= maxDist ? best : null;
};

// ── rendering (canvas 2D) ────────────────────────────────────────────────
/** The slice of CanvasRenderingContext2D this engine uses — declared
 *  structurally so a recording stub can stand in for it in tests. */
export interface GraphCtx {
  save(): void; restore(): void;
  beginPath(): void; closePath(): void; moveTo(x: number, y: number): void; lineTo(x: number, y: number): void;
  arc(x: number, y: number, r: number, a0: number, a1: number): void;
  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  clip(): void; stroke(): void; fill(): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  setLineDash(d: number[]): void;
  measureText?(text: string): { width: number };
  fillStyle: any; strokeStyle: any; lineWidth: number; font: string;
  textAlign: any; textBaseline: any; globalAlpha: number;
}

export interface GraphTheme {
  bg: string; grid: string; axis: string; text: string; dim: string; font: string;
  crosshair: string; ring: string; ruleText: string; chipBg: string;
}

/** The plugin's dark palette (mirrors client/token-gobbler.css). */
export const GRAPH_THEME: GraphTheme = {
  bg: "rgba(255,255,255,0.015)",
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.14)",
  text: "#94a3b8",
  dim: "#64748b",
  font: "10px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  crosshair: "rgba(255,255,255,0.30)",
  ring: "#fbbf24",
  ruleText: "#f9a8d4",
  chipBg: "rgba(244,114,182,0.16)",
};

// ── trend (a rolling statistic through the dots) ─────────────────────────
/** The window a trend is computed over: an explicit size, or 0 = "auto" — 8% of
 *  the steps. Always ODD (a median needs a middle value) and clamped to 3..51. */
export const trendWindow = (steps: number, window = 0): number => {
  const w = window > 0 ? Math.round(window) : Math.round(steps * 0.08);
  const odd = w % 2 === 0 ? w + 1 : w;
  return Math.max(3, Math.min(51, odd));
};

export interface TrendOptions {
  stat?: TrendStat;
  window?: number;      // 0/undefined = auto (8% of the steps)
  dots?: boolean;       // keep the raw steps visible under the trend (default true)
  dotsAlpha?: number;   // how faint those raw steps are (default 0.25)
  band?: boolean;       // shade the window's p25..p75 behind the trend
}
export interface TrendValue { py: number; lo: number; hi: number }

/** The trend value for every point, in PIXEL space (null = not enough data).
 *  Working in pixels is deliberate: py is a linear function of the value on a
 *  linear axis and of its LOGARITHM on a log axis, so a rolling average in
 *  pixels is an average in the axis' own space — the cache trend then follows
 *  log-space growth instead of being dragged about by a 36 tok/s prefill step.
 *  (A median is invariant under that transform anyway.)
 *
 *  Coverage: a window needs at least half of its steps (and never fewer than
 *  two) to hold a value, else the trend BREAKS there — a gap in the data must
 *  never be smoothed over. The EMA is recursive by definition, so it carries
 *  across a hole and stays continuous. */
export const trendOf = (points: GraphPoint[], o: TrendOptions = {}): (TrendValue | null)[] => {
  const n = points.length;
  const stat: TrendStat = o.stat || "median";
  const win = trendWindow(n, o.window || 0);
  const out: (TrendValue | null)[] = new Array(n).fill(null);
  if (stat === "ema") {
    const a = 2 / (win + 1);
    let prev: number | null = null;
    for (let i = 0; i < n; i++) {
      const pt = points[i];
      if (pt.ok) prev = prev == null ? pt.py : prev + a * (pt.py - prev);
      out[i] = prev == null ? null : { py: prev, lo: prev, hi: prev };
    }
    return out;
  }
  const half = (win - 1) / 2;
  const need = Math.max(2, Math.ceil(win * 0.5));
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - half), b = Math.min(n, i + half + 1);
    const v: number[] = [];
    for (let j = a; j < b; j++) if (points[j].ok) v.push(points[j].py);
    if (v.length < need) continue;
    v.sort((x, y) => x - y);
    const mid = v.length >> 1;
    const py = stat === "mean"
      ? v.reduce((s, x) => s + x, 0) / v.length
      : (v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2);
    out[i] = {
      py,
      lo: v[Math.floor((v.length - 1) * 0.25)],
      hi: v[Math.ceil((v.length - 1) * 0.75)],
    };
  }
  return out;
};

/** Contiguous stretches of a computed trend (a hole in the data ends one). */
export const trendRuns = (tv: (TrendValue | null)[]): { i: number; j: number }[] => {
  const runs: { i: number; j: number }[] = [];
  let i = 0;
  while (i < tv.length) {
    if (!tv[i]) { i++; continue; }
    let j = i;
    while (j + 1 < tv.length && tv[j + 1]) j++;
    runs.push({ i, j });
    i = j + 1;
  }
  return runs;
};

// ── line smoothing (monotone cubic, Fritsch–Carlson) ─────────────────────
/** Contiguous runs of drawable points. A hole (ok: false) ends the run, so a
 *  smoothed line never bridges a gap in the data. */
export const lineRuns = (points: GraphPoint[]): GraphPoint[][] => {
  const out: GraphPoint[][] = [];
  let run: GraphPoint[] = [];
  for (const pt of points) {
    if (pt.ok) run.push(pt);
    else if (run.length) { out.push(run); run = []; }
  }
  if (run.length) out.push(run);
  return out;
};

/** Fritsch–Carlson monotone tangents (dy/dx at each point). Local extrema get a
 *  flat tangent and the neighbours are clamped to the monotonicity circle, so a
 *  smoothed line passes through every step without inventing spikes the data
 *  does not have — the property that makes this safe for spiky per-step series. */
export const smoothTangents = (pts: GraphPoint[]): number[] => {
  const n = pts.length;
  const m = new Array<number>(n).fill(0);
  if (n < 2) return m;
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = pts[i + 1].px - pts[i].px;
    slope.push(h > 0 ? (pts[i + 1].py - pts[i].py) / h : 0);
  }
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1], b = slope[i];
    m[i] = a * b <= 0 ? 0 : (a + b) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    const s = slope[i];
    if (s === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / s, b = m[i + 1] / s;
    const q = a * a + b * b;
    if (q > 9) { const t = 3 / Math.sqrt(q); m[i] = t * a * s; m[i + 1] = t * b * s; }
  }
  return m;
};

/** Extend the current path from its last point through `pts`: cubic Béziers
 *  when smoothing, straight segments otherwise. `tension` (0..1) scales the
 *  tangents — 1 is the full monotone spline, lower sits flatter between steps. */
const curveThrough = (ctx: GraphCtx, pts: GraphPoint[], smooth: boolean, tension: number): void => {
  if (!smooth || pts.length < 3) {
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].px, pts[i].py);
    return;
  }
  const m = smoothTangents(pts);
  const k = Math.max(0, Math.min(1, tension));
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const h = p1.px - p0.px;
    if (!(h > 0)) { ctx.lineTo(p1.px, p1.py); continue; }
    ctx.bezierCurveTo(
      p0.px + h / 3, p0.py + (m[i] * k * h) / 3,
      p1.px - h / 3, p1.py - (m[i + 1] * k * h) / 3,
      p1.px, p1.py,
    );
  }
};

/** Stroke width / smoothing knobs of one series, resolved once per draw. */
const strokeOf = (s: GraphSeries): { width: number; tension: number } => ({
  width: s.width != null ? s.width : 1.5,
  tension: s.tension != null ? s.tension : 0.5,
});

export interface GraphRenderOpts {
  theme?: Partial<GraphTheme>;
  hoverPx?: number | null;   // canvas-space x of the hovered step (crosshair)
  mode?: PointMode;          // line / both / dots / trend / heat (default "line")
  trend?: TrendOptions;      // how the trend line is computed (mode "trend")
  heat?: HeatOptions;        // how the grid is shaded (mode "heat")
}

const px05 = (v: number): number => Math.round(v) + 0.5;

/** Draw a frame. Everything is in CSS pixels — the caller sets the device-pixel
 *  transform once (see client/graph-canvas.tsx). */
export const renderGraph = (ctx: GraphCtx, f: GraphFrame, o: GraphRenderOpts = {}): void => {
  const t: GraphTheme = { ...GRAPH_THEME, ...(o.theme || {}) };
  const { plot } = f;
  const bottom = plot.y + plot.h;
  ctx.clearRect(0, 0, f.width, f.height);
  if (t.bg) { ctx.fillStyle = t.bg; ctx.fillRect(plot.x, plot.y, plot.w, plot.h); }
  ctx.font = t.font;
  ctx.lineWidth = 1;

  const mode = o.mode || "line";

  // grid + value-axis labels (grid only for axis 0 so two axes never double-draw).
  // In heat mode the ROWS are categories, so a value axis would be a lie.
  if (mode !== "heat") f.columns.forEach((col, i) => {
    if (col.hideLabels) return;
    const onLeft = i === 0;
    if (onLeft) {
      ctx.strokeStyle = t.grid;
      ctx.beginPath();
      for (const tk of col.ticks) { const y = px05(tk.px); ctx.moveTo(plot.x, y); ctx.lineTo(plot.x + plot.w, y); }
      ctx.stroke();
    }
    ctx.fillStyle = t.text;
    ctx.textAlign = onLeft ? "right" : "left";
    ctx.textBaseline = "middle";
    const lx = onLeft ? plot.x - 7 : plot.x + plot.w + 7;
    for (const tk of col.ticks) ctx.fillText(tk.label, lx, tk.px);
  });

  // x grid + labels
  ctx.strokeStyle = t.grid;
  ctx.beginPath();
  for (const tk of f.xTicks) { const xp = px05(tk.px); ctx.moveTo(xp, plot.y); ctx.lineTo(xp, bottom); }
  ctx.stroke();
  ctx.fillStyle = t.dim;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const tk of f.xTicks) ctx.fillText(tk.label, tk.px, bottom + 5);

  // plot frame: baseline + left edge
  ctx.strokeStyle = t.axis;
  ctx.beginPath();
  ctx.moveTo(plot.x, px05(bottom)); ctx.lineTo(plot.x + plot.w, px05(bottom));
  ctx.moveTo(px05(plot.x), plot.y); ctx.lineTo(px05(plot.x), bottom);
  ctx.stroke();

  // series — clipped to the plot rect so nothing bleeds into the axis gutter
  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.x, plot.y, plot.w, plot.h);
  ctx.clip();

  if (mode === "heat" && f.heat) {
    // The lattice: rows are metrics (or series), columns are steps. The raw
    // points are not drawn at all — the cell IS the reading.
    const heat = f.heat;
    const rowH = Math.max(1, (plot.h - heat.stripH) / Math.max(1, heat.rows.length));
    for (const s of heat.strip) { ctx.fillStyle = s.color; ctx.fillRect(s.x, plot.y, Math.max(0.8, s.w), heat.stripH); }
    heat.rows.forEach((row, ri) => {
      const y = plot.y + heat.stripH + ri * rowH;
      for (const c of row.cells) {
        // alpha carries the intensity; the row's own hue carries the identity
        ctx.globalAlpha = 0.16 + 0.84 * c.t;
        ctx.fillStyle = (o.heat && o.heat.ramp === "shared") ? sampleRamp(SHARED_RAMP, c.t) : row.color;
        ctx.fillRect(c.x, y + 0.6, Math.max(0.8, c.w - 0.8), Math.max(1, rowH - 1.4));
      }
    });
    ctx.globalAlpha = 1;
  } else if (mode === "trend") {
    const to: TrendOptions = { stat: "median", window: 0, dots: true, dotsAlpha: 0.25, band: false, ...(o.trend || {}) };
    // every series' raw steps first (one faint pass), then every trend on top:
    // the trend is the reading, the dots stay as the audit trail behind it
    if (to.dots !== false) {
      const r = 1.8;
      const alpha = to.dotsAlpha != null ? to.dotsAlpha : 0.25;
      for (const ln of f.lines) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ln.series.color;
        for (const pt of ln.points) {
          if (!pt.ok) continue;
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    for (const ln of f.lines) {
      const s = ln.series;
      const tv = trendOf(ln.points, to);
      const runs = trendRuns(tv);
      if (to.band) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = s.color;
        for (const run of runs) {
          if (run.j <= run.i) continue;
          ctx.beginPath();
          ctx.moveTo(ln.points[run.i].px, tv[run.i]!.lo);
          for (let k = run.i; k <= run.j; k++) ctx.lineTo(ln.points[k].px, tv[k]!.lo);
          for (let k = run.j; k >= run.i; k--) ctx.lineTo(ln.points[k].px, tv[k]!.hi);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      for (const run of runs) {
        ctx.moveTo(ln.points[run.i].px, tv[run.i]!.py);
        // a trend joins the window statistics with straight segments: it is an
        // aggregate of many steps, and curving through it would invent shape
        for (let k = run.i + 1; k <= run.j; k++) ctx.lineTo(ln.points[k].px, tv[k]!.py);
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = Math.max(1.8, strokeOf(s).width);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  } else if (mode === "bars") {
    // Bars read a DISCRETE value (a day's cost, one run's speed) as an area grown
    // from the axis floor, so heights compare directly instead of a line threading
    // through the noise. The slot width comes from the x spacing the points
    // occupy; several series share the slot side by side rather than stacking.
    let slots = 0;
    for (const ln of f.lines) if (ln.points.length > slots) slots = ln.points.length;
    const m = Math.max(1, f.lines.length);
    const slotW = Math.min(26, (plot.w / Math.max(1, slots)) * 0.72);
    const bw = Math.max(0.8, slotW / m);
    f.lines.forEach((ln, si) => {
      const s = ln.series;
      const sc = (f.columns[ln.axis] || f.columns[0]).scale;
      const baseY = Math.max(plot.y, Math.min(bottom, sc(sc.domain[0])));
      const dx = (si - (m - 1) / 2) * bw;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = s.color;
      for (const pt of ln.points) {
        if (!pt.ok) continue;
        // never thinner than a hairline, so a real 0 still reads as "measured"
        ctx.fillRect(pt.px + dx - bw / 2, Math.min(pt.py, baseY), bw, Math.max(0.8, Math.abs(baseY - pt.py)));
      }
      ctx.globalAlpha = 1;
    });
  } else for (const pass of ["fill", "line", "dot"]) {
    for (const ln of f.lines) {
      const s = ln.series;
      const sc = (f.columns[ln.axis] || f.columns[0]).scale;
      const baseY = Math.max(plot.y, Math.min(bottom, sc(sc.domain[0])));
      const { width, tension } = strokeOf(s);
      const runs = lineRuns(ln.points);
      if (pass === "fill" && s.fill && mode !== "dots") {
        for (const run of runs) {
          if (run.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(run[0].px, baseY);
          ctx.lineTo(run[0].px, run[0].py);
          curveThrough(ctx, run, ln.smooth, tension);
          ctx.lineTo(run[run.length - 1].px, baseY);
          ctx.closePath();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = s.color;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else if (pass === "line" && s.line !== false && mode !== "dots") {
        ctx.beginPath();
        for (const run of runs) {
          if (!run.length) continue;
          ctx.moveTo(run[0].px, run[0].py);
          curveThrough(ctx, run, ln.smooth, tension);
        }
        ctx.strokeStyle = s.color;
        ctx.lineWidth = width;
        ctx.setLineDash(s.dash || []);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (pass === "dot") {
        const r = dotRadius(s, mode);
        if (r > 0) {
          ctx.fillStyle = s.color;
          for (const pt of ln.points) {
            if (!pt.ok) continue;
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }
  ctx.lineWidth = 1;

  // ✂ compaction rules (line + a label chip pinned to the top of the plot)
  for (const r of f.rules) {
    ctx.strokeStyle = r.color;
    ctx.setLineDash(r.dash);
    ctx.beginPath();
    ctx.moveTo(px05(r.px), plot.y);
    ctx.lineTo(px05(r.px), bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    if (!r.label) continue;
    const w = (ctx.measureText ? ctx.measureText(r.label).width : r.label.length * 5.5) + 8;
    const bx = Math.max(plot.x, Math.min(plot.x + plot.w - w, r.px + 3));
    ctx.fillStyle = t.chipBg;
    ctx.fillRect(bx, plot.y + 2, w, 13);
    ctx.fillStyle = t.ruleText;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(r.label, bx + 4, plot.y + 9);
  }

  // hover crosshair + a ring on each line's nearest point
  if (o.hoverPx != null && o.hoverPx >= plot.x && o.hoverPx <= plot.x + plot.w) {
    // In heat mode there are no lines to ring: the whole hovered COLUMN lights up
    // instead, which is the cell the tooltip is describing.
    if (mode === "heat" && f.heat) {
      let bestPx = o.hoverPx, bestD = Infinity;
      for (const tip of f.tips) { const d = Math.abs(tip.px - o.hoverPx); if (d < bestD) { bestD = d; bestPx = tip.px; } }
      const w = Math.max(2, f.heat.cellW || 6);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(bestPx - w / 2, plot.y, w, plot.h);
    }
    ctx.strokeStyle = t.crosshair;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(px05(o.hoverPx), plot.y);
    ctx.lineTo(px05(o.hoverPx), bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const ln of mode === "heat" ? [] : f.lines) {
      let best: GraphPoint | null = null, bestD = Infinity;
      for (const pt of ln.points) {
        if (!pt.ok) continue;
        const d = Math.abs(pt.px - o.hoverPx);
        if (d < bestD) { bestD = d; best = pt; }
      }
      if (!best) continue;
      ctx.strokeStyle = t.ring;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(best.px, best.py, 3.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }
  ctx.restore();

  // Heat furniture lives OUTSIDE the clip: row names sit in the left gutter and
  // the shared-ramp legend along the top edge of the plot.
  if (mode === "heat" && f.heat) {
    const heat = f.heat;
    const rowH = Math.max(1, (plot.h - heat.stripH) / Math.max(1, heat.rows.length));
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    heat.rows.forEach((row, ri) => {
      if (o.heat && o.heat.labels === false) return;
      const y = plot.y + heat.stripH + ri * rowH + rowH / 2;
      const label = row.label.length > 10 ? row.label.slice(0, 9) + "…" : row.label;
      ctx.fillStyle = row.color;
      ctx.fillText(label, plot.x - 7, y);
    });
    if (o.heat && o.heat.ramp === "shared") {
      const lw = 64, lh = 5, lx = plot.x + plot.w - lw, ly = plot.y + Math.max(0, (heat.stripH - lh) / 2);
      for (let i = 0; i < 16; i++) {
        ctx.fillStyle = sampleRamp(SHARED_RAMP, i / 15);
        ctx.fillRect(lx + (lw * i) / 16, ly, lw / 16 + 0.7, lh);
      }
      ctx.fillStyle = t.dim;
      ctx.textAlign = "right";
      ctx.fillText("low", lx - 5, ly + lh / 2);
      ctx.textAlign = "left";
      ctx.fillText("high", lx + lw + 5, ly + lh / 2);
    }
  }
};
