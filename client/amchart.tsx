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
};

export type AmChartProps = {
  data: Record<string, any>[];
  categoryField: string;  // field on each row that labels the x category
  series: AmSeries[];
  unit?: string;          // fallback unit for tooltails / axis title
  height?: number;        // px height of the chart body (default 260)
  kind?: "column" | "line" | "area"; // "column" (default) = bars; "line" = strokes; "area" = filled + stacked when stacked
  stacked?: boolean;      // stack series (columns stack; area layers stack)
  smooth?: boolean;       // smooth line/area curves instead of straight segments
  log?: boolean;          // logarithmic value axis — use when series span orders of magnitude (e.g. cache ~600K vs in/out ~1K)
  subField?: string;      // optional field whose value is shown above the tooltip line
  rotateCategories?: boolean; // rotate x labels for readability on long names
  groupField?: string;    // optional field marking a group (e.g. turn) — each time this value changes,
                          // a zebra-striped vertical band starts so turns read as distinct groups
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
// data actually changes rather than on every parent render.
const sig = (p: AmChartProps) =>
  p.categoryField + "|n" + p.data.length + "|" + p.series.map((s) => s.key + ":" + s.color + ":" + (s.axis || 0)).join(",") +
  "|k" + (p.kind || "column") + "|sm" + (p.smooth ? 1 : 0) + "|st" + (p.stacked ? 1 : 0) + "|lg" + (p.log ? 1 : 0) + "|h" + (p.height ?? 260) +
  "|g" + (p.groupField || "") + "|" + p.data.map((r) => r[p.groupField as string]).join(",") +
  // full per-cell fingerprint (not just the grand total) so a refresh that keeps the
  // total but redistributes values across rows/series still rebuilds the chart.
  "|v" + p.data.map((r) => p.series.map((s) => Number(r[s.key]) || 0).join(".")).join(",");

export const AmBarChart = (props: AmChartProps) => {
  const ref = React.useRef(null);
  const axisRef = React.useRef<any>(null);
  const [err, setErr] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string>("");
  const [active, setActive] = React.useState<string | null>(null);
  const key = sig(props);

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

  React.useEffect(() => {
    let root: any;
    let disposed = false;
    loadAmCharts().then((w: any) => {
      if (disposed || !ref.current) return;
      const am5 = w.am5, am5xy = w.am5xy;
      root = am5.Root.new(ref.current);
      root.setThemes([w.am5themes_Dark.new(root), w.am5themes_Animated.new(root)]);

      const chart = root.container.children.push(am5xy.XYChart.new(root, { panY: false, layout: root.verticalLayout }));

      // category (x) axis
      const catAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}), categoryField: props.categoryField }));
      catAxis.data.setAll(props.data);
      catAxis.get("renderer").grid.template.set("strokeOpacity", 0);
      // Horizontal category labels (default). For the by-model chart we drop the
      // old rotated-diagonal styling: allow wrapping so long model names render
      // as clean 2-line chips under their columns instead of tiny rotated text.
      catAxis.get("renderer").labels.template.setAll({ fontSize: 10, maxWidth: 100, wrap: true, textAlign: "center" });
      if (props.rotateCategories) catAxis.get("renderer").labels.template.set("rotation", -45);
      axisRef.current = catAxis;

      // value axis — one, or a second (opposite) axis so series with wildly
      // different scales (decode ~10-20× slower than prefill) each stay legible.
      const maxAxis = props.series.reduce((m, s) => Math.max(m, s.axis || 0), 0);
      const yAxes: any[] = [];
      for (let a = 0; a <= maxAxis; a++) {
        const settings: any = {
          renderer: am5xy.AxisRendererY.new(root, a === 0 ? {} : { opposite: true }),
        };
        // log scale turns small values (in/out/think) visible next to huge ones
        // (cache); treatZeroAs keeps a valid log when a value drops to 0.
        if (props.log) { settings.logarithmic = true; settings.treatZeroAs = 1; }
        else { settings.min = 0; }
        yAxes.push(chart.yAxes.push(am5xy.ValueAxis.new(root, settings)));
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
        const base: any = {
          name: s.label,
          xAxis: catAxis,
          yAxis: yAxes[s.axis || 0],
          valueYField: s.key,
          categoryXField: props.categoryField,
          stacked: !!props.stacked,
        };
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
        parts.push("{categoryX}", "{name}", "{valueY}" + (unit ? " " + unit : ""));
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
          ser.columns.template.set("width", am5.percent(props.stacked ? 90 : 60));
        }
        ser.data.setAll(props.data);
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
  if (!props.data || !props.data.length) return null;

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
    jsx("div", { ref, className: "tg-amchart", style: { height: (props.height ?? 260) + "px" } }),
  ]});
};
