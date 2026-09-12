// token-gobbler · client/amchart.tsx
// Reusable amCharts 5 wrapper. The library is vendored locally and served from
// the plugin's own /token-gobbler/vendor route (see lib/index.js) so charts
// render offline instead of failing on a cdn.amcharts.com fetch. The DSH host
// page pulls the client IIFE, and the plugin injects the amCharts script tags
// on demand. Two render targets used to be hand-rolled HTML/CSS bars
// (metricBars in drawers.tsx) — those felt clunky, so the bar/column charts now
// use amCharts for real axes, tooltips, a legend, and hover, while staying
// width-constrained so a large chart never pushes the modal wide.
//
// amCharts is an ambient global injected at runtime (window.am5 / am5xy /
// am5themes_*), so we type them `any` and never import a local package. Like
// React, it must be read at call time, never bundled.

export type AmSeries = {
  key: string;            // field on each data row holding the numeric value
  label: string;          // legend / tooltip name
  color: string;          // column fill + stroke
  unit?: string;          // appended to tooltip (falls back to chart unit)
  axis?: 0 | 1;           // 0 = left value axis, 1 = right (opposite) value axis
  data?: Record<string, any>[]; // optional per-series data (e.g. scatter regime subsets); falls back to the chart data
  bullet?: "circle" | "triangle"; // scatter: dot shape (triangle separates a second metric on a shared chart)
  line?: boolean;         // scatter: draw a VISIBLE line through the points in data order (no dots)
  fill?: boolean;         // scatter line: translucent fill under the line (area-style)
  dash?: string;          // scatter line: stroke dash pattern (e.g. "1 3" = dotted) — pairs with a solid line
  group?: string;         // scatter: series sharing a group ride their OWN hidden value axis,
                          // auto-scaled (min/max from the group's data) — per-group scaling
  tension?: number;       // scatter line: smoothing tension for the tension-spline (0..1, default 0.5)
  regime?: number;        // scatter: legend-chip toggle identity (a context window's index) —
                          // lines sharing a regime hide/restore together and bound the ✂ rules
};

export type AmChartProps = {
  data: Record<string, any>[];
  categoryField?: string; // field on each row that labels the x category (omitted for kind "scatter")
  series: AmSeries[];
  unit?: string;          // fallback unit for tooltails / axis title
  height?: number;        // px height of the chart body (default 260)
  kind?: "column" | "line" | "area" | "scatter"; // "column" (default) = bars; "line" = strokes; "area" = filled + stacked when stacked; "scatter" = dots on two numeric axes
  horizontal?: boolean;   // true = bars run left→right (category on Y, value on X); good for long labels (model names)
  hideCategoryLabels?: boolean; // true = drop the category axis labels + grid (reclaims that gutter for the bars; hover tooltip still names each category)
  columnWidth?: number;   // percent width of each column (default 60; stacked default 90) — smaller = thinner bars
  stacked?: boolean;      // stack series (columns stack; area layers stack)
  smooth?: boolean;       // smooth line/area curves instead of straight segments
  log?: boolean;          // logarithmic value axis — use when series span orders of magnitude (e.g. cache ~600K vs in/out ~1K)
  subField?: string;      // optional field whose value is shown above the tooltip line
  rotateCategories?: boolean; // rotate x labels for readability on long names
  groupField?: string;    // optional field marking a group (e.g. turn) — each time this value changes,
                          // a zebra-striped vertical band starts so turns read as distinct groups
  // scatter (kind "scatter") extras — both axes become ValueAxis:
  xField?: string;        // field on each row holding the numeric X value
  labelField?: string;    // field shown first in the tooltip (e.g. a step id)
  xLabel?: string;        // human label for the x value in the tooltip (falls back to xField)
  xUnit?: string;         // unit appended to the x value in the tooltip
  xStep?: number;         // scatter: force the x-axis tick interval (e.g. integer steps)
  rules?: { x: number; label: string; tip?: string; color?: string; windows?: [number, number] }[]; // scatter: vertical annotation line at x; windows = the regime indices it bounds (hidden when either is hidden)
  legendChips?: boolean; // scatter: replace the am5 legend with TOGGLEABLE html chips (one per series name)
  legendUnit?: string;   // unit suffix shown on the legend chips (e.g. "tok/s")
  chips?: { name: string; color: string; k: string | number }[]; // scatter+legendChips: EXPLICIT chip list (e.g. one per context window) —
                                                                 // used instead of deriving chips from the series names
  metricChips?: { name: string; color: string; k: string }[]; // scatter: toggleable metric chips (one per dot metric) —
                                                               // clicking hides all dot series with that key across all windows
  xMinControl?: boolean; // scatter: render a small "x min" input that pins the x-axis minimum
                         // (persisted in localStorage) — zoom into the later context range
  xMinLabel?: string;    // label for the xMinControl input (default "x min (ctx, tok)")
  xMinStep?: number;     // step attribute for the xMinControl input (default 1000)
  logAxes?: number[];    // scatter: which value-axis indices are LOGARITHMIC (per-axis scales;
                         // supersedes `log`, which makes ALL axes log)
  hideAxisLabels?: number[]; // scatter: value-axis indices with NO labels/ticks/grid (the axis
                             // still scales its series; the tooltip carries the values)
  tipField?: string;     // scatter: ONE shared multi-line tooltip — a dedicated invisible series
                         // (tipData) carries it; rows expose pre-formatted text in tipField, and
                         // no data series gets its own tooltip (one box, not one per series)
  tipData?: Record<string, any>[]; // rows for the dedicated tooltip series (all points)
  tipAxis?: 0 | 1;      // value axis the invisible tooltip series rides (default 1)
};

// ── CDN loader (module-level singleton) ──────────────────────────────────
// Vendored locally and served by the plugin's /token-gobbler/vendor route, so
// charts render offline without a cdn.amcharts.com fetch.
const CDN = "/token-gobbler/vendor/";
const FILES: { src: string; global: string }[] = [
  { src: "index.js", global: "am5" },
  { src: "xy.js", global: "am5xy" },
  { src: "themes/Animated.js", global: "am5themes_Animated" },
  { src: "themes/Dark.js", global: "am5themes_Dark" },
];

let amPromise: Promise<any> | null = null;
export function loadAmCharts(): Promise<any> {
  if (amPromise) return amPromise;
  amPromise = new Promise((resolve, reject) => {
    const w = window as any;
    const ready = () => w.am5 && w.am5xy && w.am5themes_Animated && w.am5themes_Dark;
    if (ready()) { resolve(w); return; }
    let i = 0;
    const next = () => {
      if (i >= FILES.length) { ready() ? resolve(w) : reject(new Error("amCharts globals missing after load")); return; }
      const f = FILES[i++];
      if (w[f.global]) { next(); return; }
      const s = document.createElement("script");
      s.src = CDN + f.src;
      s.async = true;
      s.onload = () => next();
      s.onerror = () => reject(new Error("Failed to load " + CDN + f.src));
      document.head.appendChild(s);
    };
    next();
  });
  return amPromise;
}

// cheap O(n) signature — catches the data set changing (refresh) without a
// per-render JSON.stringify of big arrays, so the chart only rebuilds when the
// data actually changes rather than on every parent render. For scatter (or any
// per-series data) each series' OWN rows are fingerprinted (x + y per row) so a
// refresh that reshuffles points between regimes still rebuilds the chart.
const sig = (p: AmChartProps) => {
  const perSeries = p.series.some((s) => s.data);
  const cells = perSeries
    ? p.series.map((s) => (s.data || p.data).map((r) => (p.xField ? (Number(r[p.xField]) || 0) + "." : "") + (Number(r[s.key]) || 0)).join(",")).join("|")
    : p.data.map((r) => p.series.map((s) => Number(r[s.key]) || 0).join(".")).join(",");
  return (p.categoryField || "") + "|x" + (p.xField || "") + "|n" + p.data.length + "|" + p.series.map((s) => s.key + ":" + s.color + ":" + (s.axis || 0) + ":" + (s.data ? s.data.length : 0) + ":" + (s.group || "") + (s.line ? "L" : "") + (s.dash ? "D" : "") + (s.regime != null ? "R" + s.regime : "")).join(",") +
    "|k" + (p.kind || "column") + "|sm" + (p.smooth ? 1 : 0) + "|st" + (p.stacked ? 1 : 0) + "|lg" + (p.log ? 1 : 0) + "|hz" + (p.horizontal ? 1 : 0) + "|h" + (p.height ?? 260) +
    "|lc" + (p.legendChips ? 1 : 0) +
    "|ch" + (p.chips || []).map((c) => c.k + ":" + c.color).join(",") +
    "|mc" + (p.metricChips || []).map((c) => c.k).join(",") +
    "|xm" + (p.xMinControl ? 1 : 0) +
    "|la" + (p.logAxes || []).join(",") + "|hal" + (p.hideAxisLabels || []).join(",") +
    "|tf" + (p.tipField || "") + "|td" + (p.tipData ? p.tipData.length : 0) + (p.tipData ? "|" + p.tipData.map((r) => Number(r[p.xField || "x"]) || 0).join(",") : "") +
    "|g" + (p.groupField || "") + "|" + p.data.map((r) => r[p.groupField as string]).join(",") +
    "|ru" + (p.rules || []).map((r) => r.x + ":" + (r.label || "") + (r.windows ? ":" + r.windows.join("-") : "")).join(",") +
    cells;
};

export const AmBarChart = (props: AmChartProps) => {
  const ref = React.useRef(null);
  const axisRef = React.useRef<any>(null);
  const [err, setErr] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string>("");
  const [active, setActive] = React.useState<string | null>(null);
  const key = sig(props);

  // legend chips (legendChips): hidden state per REGIME (a context window's
  // decode + prefill lines share the regime, so one chip toggles the whole
  // window; series without a regime fall back to their name as the key).
  const [hiddenGroups, setHiddenGroups] = React.useState<Record<string | number, boolean>>({});
  const hiddenRef = React.useRef<Record<string | number, boolean>>({});
  hiddenRef.current = hiddenGroups;
  const [hiddenMetrics, setHiddenMetrics] = React.useState<Record<string, boolean>>({});
  const hiddenMetricsRef = React.useRef<Record<string, boolean>>({});
  hiddenMetricsRef.current = hiddenMetrics;
  const xRef = React.useRef<any>(null);                       // scatter x-axis (for rescale on toggle)
  const xFixedRef = React.useRef(false);                      // true once we pinned the x min/max ourselves
  const seriesMetaRef = React.useRef<{ ser: any; k: string | number; mk?: string; ctxs: number[] }[]>([]); // data series (rules excluded) + their x values
  const ruleMetaRef = React.useRef<{ ser: any; windows: number[] }[]>([]);                    // rule lines + the regimes they bound
  // Adjustable x-axis minimum (xMinControl): the raw input text + its numeric
  // interpretation (null = empty = auto). Persisted so the zoom survives reloads.
  const XMIN_KEY = "tg:perf-xmin";
  const [xMinText, setXMinText] = React.useState<string>(() => {
    try { return props.xMinControl ? localStorage.getItem(XMIN_KEY) || "" : ""; } catch { return ""; }
  });
  const xMinRef = React.useRef<number | null>(null);
  const parseXMin = (t: string): number | null => {
    const v = Number(String(t).trim().replace(/[,\s]/g, ""));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  xMinRef.current = parseXMin(xMinText);
  // Apply the current hidden state + the manual x minimum to the live chart:
  // hide/show the data series + the ✂ rules a hidden window bounds, and rescale
  // the x-axis to the remaining (visible) windows so the chart fits what is left.
  // NOTE: `visible` (NOT `forceHidden`) — this vendored am5 build has no series
  // forceHidden implementation (only the license logo + a tooltip check use the
  // name), so forceHidden was a silent no-op and deselected windows' dots kept
  // rendering. `visible` is what isHidden() (cursor + tooltip logic) reads.
  const applyHidden = React.useCallback(() => {
    const x = xRef.current;
    let lo = Infinity, hi = -Infinity, anyRegimeHidden = false;
    for (const m of seriesMetaRef.current) {
      const hidRegime = !!hiddenRef.current[m.k];
      const hidMetric = m.mk != null && !!hiddenMetricsRef.current[m.mk];
      const hid = hidRegime || hidMetric;
      if (hidRegime) anyRegimeHidden = true;
      try { m.ser.set("visible", !hid); } catch (_) { /* series gone */ }
      if (!hidRegime) for (const c of m.ctxs) { if (c < lo) lo = c; if (c > hi) hi = c; }
    }
    for (const r of ruleMetaRef.current) {
      const hid = r.windows.some((w) => hiddenRef.current[w]);
      try { r.ser.set("visible", !hid); } catch (_) { /* series gone */ }
    }
    if (!x) return;
    const manual = xMinRef.current;
    if (anyRegimeHidden && lo < hi) {
      // Pin the x-axis to the visible windows' context range (+2% padding); a
      // manual minimum (if set) wins over the auto lo.
      const pad = (hi - lo) * 0.02 || 1;
      x.set("min", manual != null ? manual : lo - pad);
      x.set("max", hi + pad);
      xFixedRef.current = true;
    } else if (manual != null) {
      // Nothing hidden but the user pinned a minimum — keep it, max stays auto.
      x.set("min", manual);
      x.set("max", undefined);
      xFixedRef.current = true;
    } else if (xFixedRef.current) {
      // Everything visible again, no manual min — hand the range back to auto.
      x.set("min", undefined);
      x.set("max", undefined);
      xFixedRef.current = false;
    }
  }, []);
  const onXMinChange = (t: string) => {
    setXMinText(t);
    try { localStorage.setItem(XMIN_KEY, t); } catch { /* ignore */ }
    applyHidden(); // live: pin/unpin the x-axis minimum without a chart rebuild
  };
  React.useEffect(() => {
    applyHidden();
  }, [hiddenGroups, hiddenMetrics, key, applyHidden]);

  // contiguous groups (e.g. turns) from groupField — each has a label + the
  // first/last data index so we can zoom the category axis to just that group.
  const groups = React.useMemo<any[]>(() => {
    if (!props.groupField) return [];
    const out: any[] = [];
    let start = 0, last: any = undefined;
    const rows = props.data || [];
    for (let i = 0; i < rows.length; i++) {
      const g = rows[i][props.groupField];
      if (i > 0 && g !== last) { out.push({ label: last, start, end: i - 1 }); start = i; }
      last = g;
    }
    if (rows.length) out.push({ label: last, start, end: rows.length - 1 });
    return out;
  }, [props.groupField, props.data, props.data && props.data.length]);

  const zoomTo = (g: any | null) => {
    const axis = axisRef.current;
    if (!axis) return;
    if (!g) { axis.zoomToIndexes(0, (props.data.length || 1) - 1); setActive(null); return; }
    axis.zoomToIndexes(g.start, g.end);
    setActive(String(g.label));
  };

  // legend chips (legendChips): explicit `chips` list when provided (one per
  // context window — the window's line + all its metric dots share the regime
  // key), otherwise one chip per series NAME with its color + the plotted unit.
  // Clicking toggles the whole window (by regime) — the vendored am5 Legend has
  // no working click toggle, so the chips drive forceHidden directly.
  const chipGroups = React.useMemo(() => {
    if (!props.legendChips) return [];
    if (props.chips && props.chips.length) return props.chips;
    const out: { name: string; color: string; k: string | number }[] = [];
    for (const s of props.series) {
      if (out.some((g) => g.name === s.label)) continue;
      out.push({ name: s.label, color: s.color, k: s.regime != null ? s.regime : s.label });
    }
    return out;
  }, [props.series, props.legendChips, props.chips]);

  React.useEffect(() => {
    // Fresh build — drop the previous chart's refs (they are repopulated as the
    // async build finishes; a hidden-state change in between is a no-op on the
    // disposed series).
    xRef.current = null;
    xFixedRef.current = false;
    seriesMetaRef.current = [];
    ruleMetaRef.current = [];
    let root: any;
    let disposed = false;
    loadAmCharts().then((w: any) => {
      if (disposed || !ref.current) return;
      const am5 = w.am5, am5xy = w.am5xy;
      root = am5.Root.new(ref.current);
      root.setThemes([w.am5themes_Dark.new(root), w.am5themes_Animated.new(root)]);

      const chart = root.container.children.push(am5xy.XYChart.new(root, { panY: false, layout: root.verticalLayout }));

      // ── scatter: both axes numeric (x = xField value, y = series key) ────
      // Dots via a LineSeries with invisible strokes + circle bullets (the
      // vendored xy build has no ScatterSeries; this is the documented v5
      // pattern for scatter-style plots).
      if ((props.kind || "column") === "scatter") {
        // No forced min/max — amCharts auto-scales BOTH axes from the data
        // values (including the rule lines' x), so the points fill the plot
        // instead of hugging one corner when the data lives in a narrow band.
        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}) }));
        if (props.xStep) xAxis.set("step", props.xStep);
        // Shared value axes (used by series without a `group`). Per-axis scales:
        // `logAxes` lists which indices are LOGARITHMIC (e.g. left axis linear
        // for a context-growth line, right axis log for mixed-unit dots — tok/s
        // ~10-300 next to token counts ~1K-300K). `log` (legacy) = all axes.
        const maxAxis = Math.max(props.series.reduce((m, s) => Math.max(m, s.axis || 0), 0), props.tipAxis || 0);
        const logAxes = props.logAxes || (props.log ? Array.from({ length: maxAxis + 1 }, (_, i) => i) : []);
        const yAxes: any[] = [];
        for (let a = 0; a <= maxAxis; a++) {
          const ys: any = { renderer: am5xy.AxisRendererY.new(root, a === 0 ? {} : { opposite: true }) };
          if (logAxes.indexOf(a) >= 0) { ys.logarithmic = true; ys.treatZeroAs = 1; }
          else { ys.min = 0; }
          yAxes.push(chart.yAxes.push(am5xy.ValueAxis.new(root, ys)));
        }
        // Hide an axis' LABELS + TICKS (and grid). The renderer's `visible:
        // false` constructor flag hides the axis line but NOT the label/grid
        // templates in this vendored build — with a dozen hidden axes their
        // numeric labels stack into a meaningless "number matrix" left of the
        // plot, so the templates must be hidden explicitly.
        const hideAxis = (a: any, keepGrid = false) => {
          try {
            const r = a.get("renderer");
            r.labels.template.set("visible", false);
            r.ticks.template.set("visible", false);
            if (!keepGrid) r.grid.template.set("visible", false);
          } catch (_) { /* ignore */ }
        };
        // When EVERY series rides its own group axis, the shared value axes hold
        // no data and their labels would be meaningless (each group is scaled
        // differently) — hide them (keeping the first axis' grid as a neutral
        // background); the x-axis carries the only absolute scale.
        const allGrouped = props.series.length > 0 && props.series.every((s) => s.group != null);
        for (const ya of [xAxis, ...yAxes]) {
          ya.get("renderer").grid.template.setAll({ stroke: am5.color(0xffffff), strokeOpacity: 0.05 });
          ya.get("renderer").labels.template.setAll({ fill: am5.color("#94a3b8"), fontSize: 9 });
          if (allGrouped && ya !== xAxis) hideAxis(ya, ya === yAxes[0]);
        }
        // Explicitly label-less axes (e.g. a secondary log axis whose values are
        // carried by the tooltip) — no labels/ticks/grid, avoids a second scale.
        for (const a of props.hideAxisLabels || []) {
          if (yAxes[a]) hideAxis(yAxes[a]);
        }
        // Per-group value axes: series sharing a `group` get a HIDDEN axis of
        // their own, auto-scaled (min/max from that group's data only) — every
        // group's points fill the plot height on their own min/max scale.
        const groupAxes: Record<string, any> = {};
        const yAxisFor = (s: AmSeries) => {
          if (s.group == null) return yAxes[s.axis || 0];
          const k = s.group + ":" + (s.axis || 0);
          if (!groupAxes[k]) {
            groupAxes[k] = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, { visible: false }) }));
            hideAxis(groupAxes[k]);
          }
          return groupAxes[k];
        };
        // ── rules: one full-height VERTICAL LINE per entry, at its x value ──
        // The vendored build has no am5.Rule, so each rule is a LineSeries with
        // two points at the SAME x — (x, 0) and (x, 1) on a dedicated hidden
        // axis fixed to 0..1 — whose segment renders as a vertical line spanning
        // the whole plot. Pushed BEFORE the data series so the lines sit behind.
        // No in-plot labels — the hover tooltip carries the compaction info.
        const ruleSers: any[] = [];
        if (props.rules && props.rules.length) {
          const ruleAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, { visible: false }), min: 0, max: 1 }));
          hideAxis(ruleAxis);
          const xF = props.xField || "x";
          props.rules.forEach((r) => {
            const rc = r.color || "#f472b6";
            const rser = chart.series.push(am5xy.LineSeries.new(root, {
              name: r.label,
              xAxis, yAxis: ruleAxis,
              valueXField: xF,
              valueYField: "tgRuleY",
            }));
            rser.strokes.template.setAll({ stroke: am5.color(rc), strokeOpacity: 0.8, strokeWidth: 1.5 });
            const rtt = am5.Tooltip.new(root, { labelText: r.tip || r.label });
            try {
              const lbl = rtt.get("label");
              if (lbl && typeof lbl.setAll === "function") lbl.setAll({ fontSize: 11, textAlign: "left" });
            } catch (_) { /* ignore */ }
            rser.set("tooltip", rtt);
            rser.data.setAll([
              { [xF]: r.x, tgRuleY: 0 },
              { [xF]: r.x, tgRuleY: 1 },
            ]);
            ruleSers.push(rser);
            ruleMetaRef.current.push({ ser: rser, windows: r.windows ? [r.windows[0], r.windows[1]] : [] });
          });
        }
        // Data series — lines FIRST (so they render behind the dots of the
        // series pushed later), dots after.
        const dataMeta: { ser: any; k: string | number; mk?: string; ctxs: number[] }[] = [];
        // Build a set of metric keys from the metric chips so we can identify
        // which series are metric series (for metric chip toggling).
        const metricKeys = new Set((props.metricChips || []).map((c) => c.k));
        for (const s of [...props.series.filter((x) => x.line), ...props.series.filter((x) => !x.line)]) {
          // Line series use the SMOOTHED XY series (tension spline) so a
          // window's sweep reads as one clean ribbon instead of a jagged
          // zigzag; dot series stay plain LineSeries (invisible stroke + bullets).
          const Ctor = s.line && am5xy.SmoothedXYLineSeries ? am5xy.SmoothedXYLineSeries : am5xy.LineSeries;
          const ser = chart.series.push(Ctor.new(root, {
            name: s.label,
            xAxis, yAxis: yAxisFor(s),
            valueXField: props.xField,
            valueYField: s.key,
          }));
          if (s.line) {
            // Visible connecting line through the points in data order — a
            // context window's token-accumulation segment. `dash` makes it the
            // dotted partner of a solid line (prefill vs decode); `tension`
            // tunes the smoothing (0 = straight, 0.5 = default spline).
            if (s.tension != null) { try { ser.set("tension", s.tension); } catch (_) { /* ignore */ } }
            const st: any = { stroke: am5.color(s.color), strokeOpacity: 0.9, strokeWidth: 1.5 };
            if (s.dash) st.dash = s.dash;
            ser.strokes.template.setAll(st);
            // Optional translucent fill under the line (area-style).
            if (s.fill) {
              ser.fills.template.setAll({
                visible: true,
                fill: am5.color(s.color),
                fillOpacity: 0.15,
              });
            }
          } else {
            ser.strokes.template.setAll({ stroke: am5.color(s.color), strokeOpacity: 0 }); // dots only, no connecting line
            ser.bullets.push(() => am5.Bullet.new(root, {
              // dot shape per series: circle by default, triangle when asked
              // (a second metric on a shared chart can keep its shape apart).
              sprite: s.bullet === "triangle"
                ? am5.Triangle.new(root, { width: 9, height: 8, fill: am5.color(s.color), fillOpacity: 0.85, stroke: am5.color(s.color), strokeOpacity: 1, strokeWidth: 1.5 })
                : am5.Circle.new(root, { radius: 1, fill: am5.color(s.color), fillOpacity: 0.85, stroke: am5.color(s.color), strokeOpacity: 1, strokeWidth: 0.5 }),
            }));
          }
          // Tooltip: just the step label + value + unit — the x position already
          // shows the context size, so no extra annotation in the plot. Skipped
          // entirely when a shared tipField tooltip exists (one box, not one per
          // series — with 6 metric series a hover would stack 6 identical boxes).
          if (!props.tipField) {
            const parts: string[] = [];
            if (props.labelField) parts.push("{" + props.labelField + "}");
            parts.push("{valueY}" + ((s.unit || props.unit) ? " " + (s.unit || props.unit) : ""));
            const tt = am5.Tooltip.new(root, { labelText: parts.join(" · ") });
            try {
              const lbl = tt.get("label");
              if (lbl && typeof lbl.setAll === "function") lbl.setAll({ fontSize: 11, textAlign: "left" });
              else if (lbl && typeof lbl.set === "function") { lbl.set("fontSize", 11); lbl.set("textAlign", "left"); }
            } catch (_) { /* ignore */ }
            ser.set("tooltip", tt);
          }
          const rows = s.data || props.data;
          ser.data.setAll(rows);
          // Remember the series' toggle key (regime, or name) + its x values so
          // a chip toggle can hide it and rescale the x-axis to the rest.
          // mk = metric key for metric chip toggling (set if this series' key
          // matches a metric chip key; otherwise undefined).
          dataMeta.push({ ser, k: s.regime != null ? s.regime : s.label, mk: metricKeys.has(s.key) ? s.key : undefined, ctxs: rows.map((r) => Number(r[props.xField || "x"]) || 0) });
        }
        // Shared multi-line tooltip (tipField): ONE dedicated invisible series
        // over ALL points carries a single tooltip box. The cursor is told to
        // match by X only (maxTooltipDistanceBy "x"), so hovering anywhere in a
        // step's column — over any of its metric dots — shows the one box with
        // that step's full stats. Invisible (transparent stroke, no bullets) but
        // visible:true, because the cursor's tooltip logic skips hidden series.
        let tipSer: any = null;
        if (props.tipField && props.tipData && props.tipData.length) {
          tipSer = chart.series.push(am5xy.LineSeries.new(root, {
            name: "tip",
            xAxis, yAxis: yAxes[props.tipAxis || 1],
            valueXField: props.xField,
            valueYField: props.xField, // y position is irrelevant (x-only matching)
          }));
          tipSer.strokes.template.setAll({ stroke: am5.color(0xffffff), strokeOpacity: 0 });
          const ttt = am5.Tooltip.new(root, { labelText: "{" + props.tipField + "}" });
          try {
            const lbl = ttt.get("label");
            if (lbl && typeof lbl.setAll === "function") lbl.setAll({ fontSize: 11, textAlign: "left", oversizedBehavior: "wrap" });
            else if (lbl && typeof lbl.set === "function") { lbl.set("fontSize", 11); lbl.set("textAlign", "left"); lbl.set("oversizedBehavior", "wrap"); }
          } catch (_) { /* ignore */ }
          tipSer.set("tooltip", ttt);
          tipSer.data.setAll(props.tipData);
        }
        if (!props.legendChips) {
          // Legend lists the data series only — the rule lines + the invisible
          // tooltip series are not real data.
          const legend = chart.children.push(am5.Legend.new(root, {}));
          legend.data.setAll(chart.series.values.filter((s: any) => ruleSers.indexOf(s) === -1 && s !== tipSer));
          legend.labels.template.setAll({ fill: am5.color("#e5e7eb"), fontSize: 11 });
        }
        const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { xAxis, yAxis: yAxes[0] }));
        cursor.set("behavior", "none");
        if (props.tipField) {
          // One-box tooltip: nearest point by X within 30px wins; other series'
          // points farther than that in X are suppressed (vendored cursor logic).
          cursor.set("maxTooltipDistance", 30);
          cursor.set("maxTooltipDistanceBy", "x");
        }
        // Remember the live chart pieces so the legend-chip toggles can hide a
        // window (both its lines), hide the ✂ rules it bounds, and rescale the
        // x-axis to the remaining windows. Apply any windows that were already
        // hidden to the freshly built chart.
        xRef.current = xAxis;
        seriesMetaRef.current = dataMeta;
        applyHidden();
        return;
      }

      // category axis — on X by default; on Y when horizontal (bars run left→right).
      const horizontal = !!props.horizontal;
      const catAxis = (horizontal ? chart.yAxes : chart.xAxes).push(am5xy.CategoryAxis.new(root, {
        renderer: (horizontal ? am5xy.AxisRendererY : am5xy.AxisRendererX).new(root, {}),
        categoryField: props.categoryField,
      }));
      catAxis.data.setAll(props.data);
      catAxis.get("renderer").grid.template.set("strokeOpacity", 0);
      // Category labels: allow wrapping so long names (models) render as clean
      // 2-line chips instead of tiny rotated text. Horizontal puts them on the
      // left, left-aligned.
      if (horizontal) catAxis.get("renderer").labels.template.setAll({ fontSize: 11, maxWidth: 150, wrap: true, textAlign: "left" });
      else catAxis.get("renderer").labels.template.setAll({ fontSize: 10, maxWidth: 100, wrap: true, textAlign: "center" });
      if (props.rotateCategories && !horizontal) catAxis.get("renderer").labels.template.set("rotation", -45);
      // Drop the category labels + grid entirely to give the bars the full width;
      // the hover tooltip still names each category.
      if (props.hideCategoryLabels) {
        catAxis.get("renderer").labels.template.set("visible", false);
        catAxis.get("renderer").grid.template.set("visible", false);
        catAxis.get("renderer").ticks.template.set("visible", false);
      }
      axisRef.current = catAxis;

      // value axis — one, or a second (opposite) axis so series with wildly
      // different scales (decode ~10-20× slower than prefill) each stay legible.
      const maxAxis = props.series.reduce((m, s) => Math.max(m, s.axis || 0), 0);
      const yAxes: any[] = [];
      for (let a = 0; a <= maxAxis; a++) {
        const settings: any = {
          renderer: (horizontal ? am5xy.AxisRendererX : am5xy.AxisRendererY).new(root, a === 0 ? {} : { opposite: true }),
        };
        // log scale turns small values (in/out/think) visible next to huge ones
        // (cache); treatZeroAs keeps a valid log when a value drops to 0.
        if (props.log) { settings.logarithmic = true; settings.treatZeroAs = 1; }
        else { settings.min = 0; }
        yAxes.push((horizontal ? chart.xAxes : chart.yAxes).push(am5xy.ValueAxis.new(root, settings)));
      }
      for (const ya of yAxes) {
        ya.get("renderer").grid.template.setAll({ stroke: am5.color(0xffffff), strokeOpacity: 0.05 });
        ya.get("renderer").labels.template.setAll({ fill: am5.color("#94a3b8"), fontSize: 9 });
      }

      // yellow buckets — when groupField is set, each distinct value (turn) is a
      // yellow vertical bucket behind that group's categories. Alternate two
      // yellow shades so neighbouring turns stay distinct, and stroke a thin
      // amber line between buckets. Axis data items follow props.data order.
      const yA = 0xf5b301, yB = 0xc48a00; // bright amber bucket fill (lit/unlit)
      if (props.groupField) {
        const items = catAxis.dataItems;
        let gi = -1, last: any = undefined;
        for (let i = 0; i < props.data.length; i++) {
          const g = props.data[i][props.groupField];
          if (g !== last) { gi += 1; last = g; }
          const di = items[i];
          if (di) di.set("background", am5.Rectangle.new(root, {
            fill: am5.color(gi % 2 === 0 ? yA : yB),
            fillOpacity: 0.16,
            stroke: am5.color(0xfbbf24),
            strokeOpacity: 0.35,
            strokeWidth: 1,
          }));
        }
      }

      // series — one per metric. kind: "column" = bars, "line" = strokes,
      // "area" = filled (and stacked when stacked) so per-step data reads as
      // clean curves instead of hundreds of cramped columns.
      const kind = props.kind || "column";
      const isCol = kind === "column";
      const LineCtor = props.smooth ? am5xy.SmoothedXLineSeries : am5xy.LineSeries;
      for (const s of props.series) {
        const base: any = { name: s.label, stacked: !!props.stacked };
        // vertical: category on X / value on Y; horizontal: category on Y / value on X.
        if (horizontal) {
          base.xAxis = yAxes[s.axis || 0];
          base.yAxis = catAxis;
          base.valueXField = s.key;
          base.categoryYField = props.categoryField;
        } else {
          base.xAxis = catAxis;
          base.yAxis = yAxes[s.axis || 0];
          base.valueYField = s.key;
          base.categoryXField = props.categoryField;
        }
        let ser: any;
        if (isCol) {
          ser = chart.series.push(am5xy.ColumnSeries.new(root, base));
          ser.set("fill", am5.color(s.color));
          ser.set("stroke", am5.color(s.color));
          ser.set("fillOpacity", 0.9);
        } else {
          ser = chart.series.push(LineCtor.new(root, base));
          // line + optional area fill ("area" shows a translucent fill; a plain
          // "line" keeps the fill off). Fill/stroke go through the series'
          // strokes/fills templates as documented for LineSeries.
          ser.strokes.template.setAll({ stroke: am5.color(s.color), strokeWidth: kind === "area" ? 1.5 : 2 });
          ser.fills.template.setAll({
            visible: kind === "area",
            fill: am5.color(s.color),
            fillOpacity: kind === "area" ? 0.32 : 0,
          });
        }
        const unit = s.unit || props.unit || "";
        // Single-line, compact tooltip: group · step · series · value+unit.
        // No newline/hard wraps — a one-line box reads cleaner and stays small
        // than the old multi-line label for per-step token charts.
        const parts: string[] = [];
        if (props.groupField) parts.push("{" + props.groupField + "}");
        const catPh = horizontal ? "{categoryY}" : "{categoryX}";
        const valPh = horizontal ? "{valueX}" : "{valueY}";
        parts.push(catPh, "{name}", valPh + (unit ? " " + unit : ""));
        const tt = am5.Tooltip.new(root, { labelText: parts.join(" · ") });
        // defensive: the label child may not expose setAll on every build — an
        // exception here would otherwise discard the whole chart for a cosmetic
        // style tweak.
        try {
          const lbl = tt.get("label");
          if (lbl && typeof lbl.setAll === "function") { lbl.setAll({ fontSize: 11, textAlign: "left" }); }
          else if (lbl && typeof lbl.set === "function") { lbl.set("fontSize", 11); lbl.set("textAlign", "left"); }
        } catch (_) { /* ignore */ }
        ser.set("tooltip", tt);
        if (isCol) {
          ser.columns.template.set(horizontal ? "height" : "width", am5.percent(props.columnWidth != null ? props.columnWidth : (props.stacked ? 90 : 60)));
        }
        ser.data.setAll(s.data || props.data);
      }
      // Bring the axis grid to the front on line/area so a stacked-area fill
      // doesn't sit on top of the value-axis gridlines.
      if (!isCol) for (const ya of yAxes) ya.get("renderer").grid.template.set("strokeOpacity", 0.08);

      // legend (outside/under the chart, driven by the series)
      const legend = chart.children.push(am5.Legend.new(root, {}));
      legend.data.setAll(chart.series.values);
      legend.labels.template.setAll({ fill: am5.color("#e5e7eb"), fontSize: 11 });

      // hover tooltips without hijacking the modal scroll
      const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
      cursor.set("behavior", "none");
    }).catch((e: any) => { if (!disposed) { setErr(true); setErrMsg(String((e && e.message) || e)); } });

    return () => { disposed = true; if (root) { try { root.dispose(); } catch (_) { /* ignore */ } } };
  }, [key]);

  if (err) return jsx("div", { className: "tg-amchart tg-amchart-err", style: { height: (props.height ?? 260) + "px" }, children: "Chart failed to load amCharts: " + (errMsg || "vendor assets missing") });
  const hasData = (props.data && props.data.length) || props.series.some((s) => s.data && s.data.length);
  if (!hasData) return null;

  return jsxs("div", { className: "tg-amchart-wrap", children: [
    groups.length ? jsxs("div", { className: "tg-turn-chips", children: [
      jsx("button", { className: "tg-turn-chip" + (active === null ? " active" : ""), onClick: () => zoomTo(null), children: "All" }, "all"),
      ...groups.map((g) => jsx("button", {
        className: "tg-turn-chip" + (String(g.label) === active ? " active" : ""),
        onClick: () => zoomTo(g),
        title: "Zoom to " + g.label + " (steps S" + (g.start + 1) + "–S" + (g.end + 1) + ")",
        children: g.label,
      }, String(g.label) + "-" + g.start)),
    ]}) : null,
    chipGroups.length ? jsx("div", { className: "tg-legend-chips", children: chipGroups.map((g) => {
      const off = !!hiddenGroups[g.k];
      return jsx("button", {
        className: "tg-legend-chip" + (off ? " off" : ""),
        onClick: () => setHiddenGroups((h) => ({ ...h, [g.k]: !h[g.k] })),
        title: (off ? "Show " : "Hide ") + g.name + (props.legendUnit ? " (" + props.legendUnit + ")" : ""),
        children: [
          // swatch: explicit window chips get a solid line + dot (the window's
          // context line + its scatter dots); name-derived chips keep the
          // paired solid/dotted swatch (decode + prefill).
          props.chips && props.chips.length
            ? jsx("span", { className: "sw", children: [
                jsx("i", { style: { borderTopColor: g.color } }),
                jsx("i", { className: "dot", style: { background: g.color } }),
              ]})
            : jsx("span", { className: "sw", children: [
                jsx("i", { style: { borderTopColor: g.color } }),
                jsx("i", { className: "dash", style: { borderTopColor: g.color } }),
              ]}),
          g.name + (props.legendUnit ? " · " + props.legendUnit : ""),
        ],
      }, g.name);
    })}) : null,
    props.metricChips && props.metricChips.length ? jsx("div", { className: "tg-legend-chips", style: { marginTop: 4 }, children: props.metricChips.map((g) => {
      const off = !!hiddenMetrics[g.k];
      return jsx("button", {
        className: "tg-legend-chip" + (off ? " off" : ""),
        onClick: () => setHiddenMetrics((h) => ({ ...h, [g.k]: !h[g.k] })),
        title: (off ? "Show " : "Hide ") + g.name + " dots",
        children: [
          jsx("span", { className: "sw", children: jsx("i", { className: "dot", style: { background: g.color } }) }),
          g.name,
        ],
      }, "metric-" + g.k);
    })}) : null,
    props.xMinControl ? jsxs("div", { className: "tg-xmin-row", children: [
      jsx("label", { className: "tg-faint", style: { fontSize: 10 }, children: props.xMinLabel || "x min (ctx, tok)" }),
      jsx("input", {
        className: "tg-xmin",
        type: "number",
        min: 0,
        step: props.xMinStep ?? 1000,
        placeholder: "auto",
        value: xMinText,
        onChange: (e: any) => onXMinChange(e.target.value),
        title: "Pin the x-axis minimum to this value. Empty = auto.",
      }),
      xMinText ? jsx("button", { className: "tg-xmin-clear", onClick: () => onXMinChange(""), title: "Reset to auto", children: "×" }) : null,
    ]}) : null,
    jsx("div", { ref, className: "tg-amchart", style: { height: (props.height ?? 260) + "px" } }),
  ]});
};
