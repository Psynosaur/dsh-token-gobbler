// token-gobbler · client/graph-canvas.tsx
// The React shell around the canvas graph core (client/graph.ts): it measures
// the container, keeps the canvas at device-pixel resolution, owns the chip /
// plot-mode state and the shared hover tooltip — and hands everything else to
// buildFrame + renderGraph, which are pure and testable in Node.
//
// The toggles (window chips, metric chips, plot mode) are a preference, not a
// property of the data, so with GraphProps.persistKey they are restored on mount
// and written back on every change (client/graph-store.ts).
//
// Written against the ambient jsx/jsxs helpers like the rest of the client
// bundle (react itself is provided by the DSH host at runtime, and the table
// invokes drawer builders as plain functions, so the chart must be created as
// an ELEMENT — jsx(GraphCanvas, {...}) — never called directly).
import {
  buildFrame, renderGraph, hitTest, fmtValue, POINT_MODES,
  type GraphProps, type GraphRow, type GraphFrame, type Hidden, type PointMode,
} from "./graph";
import { loadUi, saveUi, loadChartSettings, subscribeChartSettings, type GraphUiState, type ChartSettings } from "./graph-store";

/** The hover box: either the row's pre-formatted multi-line text (tipField) or
 *  ONE color-coded row per series that carries a value on that row — the dot is
 *  the line's own colour, so every number can be traced back to its line (two
 *  series may sit a few pixels apart, and they must never be confused). */
const tipBody = (p: GraphProps, row: GraphRow) => {
  const raw = p.tipField ? row[p.tipField] : null;
  if (typeof raw === "string" && raw.length) {
    const lines = raw.split("\n");
    return jsxs("div", { children: [
      jsx("div", { className: "tg-tip-date", children: lines[0] }),
      ...lines.slice(1).map((l, i) => jsx("div", { className: "tg-tip-sub", children: l }, "l" + i)),
    ]});
  }
  // The x value is LABELLED through xTickFormat, so an index axis reads as its
  // dates/categories in the tooltip exactly as it does under the plot.
  const rawX = row[p.xField];
  const xv = rawX == null ? "?" : (p.xTickFormat ? String(p.xTickFormat(Number(rawX))) : rawX);
  const head = p.tipHeadField && row[p.tipHeadField] != null
    ? String(row[p.tipHeadField]) + " · " + (p.xLabel || p.xField) + " " + xv
    : (p.xLabel || p.xField) + " " + xv + (p.xUnit ? " " + p.xUnit : "");
  const seen: Record<string, boolean> = {};
  const rows: any[] = [];
  for (const s of p.series) {
    if (seen[s.key]) continue;
    seen[s.key] = true;
    const v = row[s.key];
    if (v == null || !isFinite(Number(v))) continue;
    rows.push(jsxs("div", { className: "tg-cv-tip-row", children: [
      jsx("i", { className: "dot", style: { background: s.color } }),
      jsx("span", { className: "k", children: s.tipName || s.label }),
      jsx("span", { className: "v", children: fmtValue(Number(v)) + (s.unit ? " " + s.unit : "") }),
    ]}, s.key));
  }
  return jsxs("div", { children: [jsx("div", { className: "tg-tip-date", children: head }), ...rows] });
};

export const GraphCanvas = (props: GraphProps) => {
  const plotRef = React.useRef<any>(null);
  const canvasRef = React.useRef<any>(null);
  const [width, setWidth] = React.useState(0);
  // Shared chart defaults from the settings tab (trend statistic, heat ramp, …).
  // Subscribed, so editing them repaints every open chart immediately.
  const [settings, setSettings] = React.useState<ChartSettings>(() => loadChartSettings());
  React.useEffect(() => subscribeChartSettings(() => setSettings(loadChartSettings())), []);
  // chips + metrics + plot mode live in ONE state object: they travel together
  // (one persisted record) and the frame rebuilds whenever any of them changes.
  // A mode the user picked on THIS chart wins over the settings-tab default.
  const [ui, setUi] = React.useState<GraphUiState>(() => loadUi(props.persistKey, props.pointMode || settings.mode));
  const [hover, setHover] = React.useState<any>(null);
  const height = props.height || 320;

  // container width (ResizeObserver; falls back to a one-shot measure where the
  // observer is unavailable — e.g. the Node render smoke tests).
  React.useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(el.clientWidth || 0));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // remember the toggles for next time (no-op without a persistKey, and
  // best-effort when the browser denies storage)
  React.useEffect(() => { saveUi(props.persistKey, ui); }, [props.persistKey, ui]);

  const hidden: Hidden = ui;
  const frame: GraphFrame = React.useMemo(
    () => buildFrame(props, hidden, { width: width || 480, height }, { mode: ui.mode, heat: settings.heat }),
    [props, ui, width, height, settings],
  );

  // paint: size the backing store for the device pixel ratio, then draw in CSS px
  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !width) return;
    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round(height * dpr));
    if (cv.width !== w) cv.width = w;
    if (cv.height !== h) cv.height = h;
    const ctx = cv.getContext ? cv.getContext("2d") : null;
    if (!ctx) return;
    if (ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderGraph(ctx, frame, { hoverPx: hover ? hover.px : null, mode: ui.mode, trend: settings.trend, heat: settings.heat });
  }, [frame, width, height, hover, ui.mode, settings]);

  const onMove = (e: any) => {
    const cv = canvasRef.current;
    if (!cv || !cv.getBoundingClientRect) return;
    const rect = cv.getBoundingClientRect();
    const hit = hitTest(frame, e.clientX - rect.left);
    setHover(hit ? { px: hit.px, row: hit.row, cx: e.clientX, cy: e.clientY } : null);
  };
  const onLeave = () => setHover(null);

  const hasData = (props.series || []).some((s) => (s.data || props.data || []).length > 0);
  if (!hasData) return props.empty != null ? props.empty : null;

  // chips: explicit (one per context window / group) or derived (one per series)
  const chips = props.chips && props.chips.length
    ? props.chips
    : (props.legendChips ? (props.series || []).filter((s, i, all) => all.findIndex((o) => o.key === s.key) === i).map((s) => ({ name: s.label, color: s.color, k: s.key })) : []);
  const explicit = !!(props.chips && props.chips.length);
  // an explicit chip list toggles whole windows; otherwise the legend chips ARE
  // the metric chips (one per series)
  const toggleChip = (k: number | string) => setUi((h) => {
    const key = String(k), group = explicit ? h.chips : h.metrics;
    return explicit
      ? { ...h, chips: { ...group, [key]: !group[key] } }
      : { ...h, metrics: { ...group, [key]: !group[key] } };
  });
  const toggleMetric = (k: number | string) => setUi((h) => {
    const key = String(k);
    return { ...h, metrics: { ...h.metrics, [key]: !h.metrics[key] } };
  });
  const setMode = (m: PointMode) => setUi((h) => (h.mode === m ? h : { ...h, mode: m }));

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const tipStyle = hover ? {
    left: Math.max(8, Math.min(hover.cx + 14, vw - 300)) + "px",
    top: Math.max(8, Math.min(hover.cy + 16, vh - 140)) + "px",
  } : null;

  return jsxs("div", { className: "tg-graph", children: [
    chips.length ? jsx("div", { className: "tg-legend-chips", children: chips.map((c) => {
      const off = !!(explicit ? ui.chips[String(c.k)] : ui.metrics[String(c.k)]);
      return jsx("button", {
        className: "tg-legend-chip" + (off ? " off" : ""),
        onClick: () => toggleChip(c.k),
        title: (off ? "Show " : "Hide ") + c.name,
        children: [
          jsx("span", { className: "sw", children: [
            jsx("i", { style: { borderTopColor: c.color } }),
            jsx("i", { className: "dot", style: { background: c.color } }),
          ]}),
          c.name + (props.legendUnit ? " · " + props.legendUnit : ""),
        ],
      }, "chip-" + c.k);
    })} ) : null,
    props.metricChips && props.metricChips.length ? jsx("div", { className: "tg-legend-chips", children: props.metricChips.map((c) => {
      const off = !!ui.metrics[c.k];
      return jsx("button", {
        className: "tg-legend-chip" + (off ? " off" : ""),
        onClick: () => toggleMetric(c.k),
        title: (off ? "Show " : "Hide ") + c.name,
        children: [
          jsx("span", { className: "sw", children: jsx("i", { className: "dot", style: { background: c.color } }) }),
          c.name,
        ],
      }, "metric-" + c.k);
    })}) : null,
    props.modeChips ? jsx("div", { className: "tg-graph-modes", children: POINT_MODES.map((m) => jsx("button", {
      className: "tg-graph-mode" + (ui.mode === m.k ? " on" : ""),
      onClick: () => setMode(m.k),
      title: m.title,
      children: m.name,
    }, "mode-" + m.k)) }) : null,
    jsxs("div", { className: "tg-graph-plot", ref: plotRef, children: [
      jsx("canvas", {
        ref: canvasRef,
        className: "tg-graph-canvas",
        style: { width: "100%", height: height + "px" },
        onMouseMove: onMove,
        onMouseLeave: onLeave,
      }),
      (hover && tipStyle) ? jsx("div", { className: "tg-tip", style: tipStyle, children: tipBody(props, hover.row) }) : null,
    ]}),
  ]});
};
