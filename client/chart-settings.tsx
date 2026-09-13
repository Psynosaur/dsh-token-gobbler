// token-gobbler · client/chart-settings.tsx
// The "Chart defaults" card of the settings dashboard: every knob the canvas
// charts read from client/graph-store.ts — the default plot mode, and the
// options of the two aggregate renderers:
//
//   TREND (Panel B)  which rolling statistic (median / mean / EMA), its window
//                    in steps (or auto), whether the raw steps stay visible
//                    under it (and how faint), and the p25–p75 spread band.
//   HEAT  (Panel C)  one row per metric or per series/window, its own hue or one
//                    shared ramp, log or linear shading, the maximum number of
//                    columns before steps are binned, the window-colour strip
//                    and the row labels.
//
// Every control writes straight through saveChartSettings(), which persists the
// record and notifies open charts — no Save button, and a chart that is already
// on screen repaints as the value changes. A per-chart mode the user picked by
// clicking the chart's own switch still wins over the default set here.
import { POINT_MODES } from "./graph";
import {
  loadChartSettings, saveChartSettings, resetChartSettings, clearChartModes, trendWindowSize, TREND_STATS,
  type ChartSettings, type TrendSettings, type HeatSettings,
} from "./graph-store";

/** A segmented control — the same .tg-seg the rest of the dashboard uses. */
function Seg<T extends string>(props: { value: T; options: readonly { k: T; name: string; hint?: string }[]; onChange: (k: T) => void }) {
  return jsx("div", { className: "tg-seg", children: props.options.map((o) => jsx("button", {
    className: "tg-seg-btn" + (props.value === o.k ? " active" : ""),
    title: o.hint || o.name,
    onClick: () => props.onChange(o.k),
    children: o.name,
  }, "seg-" + o.k)) });
}

/** An on/off pill (the dashboard's .tg-ghost button with the active state). */
const Toggle = (props: { on: boolean; label?: string; onChange: (on: boolean) => void }) =>
  jsx("button", {
    className: "tg-ghost tg-set-toggle" + (props.on ? " active" : ""),
    onClick: () => props.onChange(!props.on),
    children: props.label || (props.on ? "On" : "Off"),
  });

const Num = (props: { value: number; min: number; max: number; step?: number; width?: number; onChange: (v: number) => void }) =>
  jsx("input", {
    className: "tg-input tg-input-num tg-set-num",
    type: "number", min: props.min, max: props.max, step: props.step || 1, value: props.value,
    style: { width: (props.width || 74) + "px" },
    onChange: (e: any) => props.onChange(Number(e.target.value)),
  });

const Row = (label: string, control: any, hint?: any) => jsxs("div", { className: "tg-set-row", children: [
  jsx("div", { className: "tg-set-label", children: label }),
  jsx("div", { className: "tg-set-ctl", children: control }),
  jsx("div", { className: "tg-set-hint", children: hint || "" }),
]}, "row-" + label);

export function ChartDefaultsCard() {
  // The card owns the live record: every edit is persisted immediately and the
  // normalized result (clamped numbers, known enums) becomes the shown state.
  const [s, setS] = React.useState<ChartSettings>(() => loadChartSettings());
  const apply = (next: ChartSettings) => setS(saveChartSettings(next));
  const setTrend = (p: Partial<TrendSettings>) => apply({ ...s, trend: { ...s.trend, ...p } });
  const setHeat = (p: Partial<HeatSettings>) => apply({ ...s, heat: { ...s.heat, ...p } });
  const autoWindow = trendWindowSize(s.trend, 150);

  return jsxs("div", { className: "tg-card tg-set-card", children: [
    Row("Default plot mode", jsx(Seg, {
      value: s.mode,
      options: POINT_MODES,
      onChange: (k: any) => apply({ ...s, mode: k }),
    }), "What a chart opens with the first time. A mode you pick on a chart itself is remembered per chart and overrules this."),

    Row("Trend statistic", jsx(Seg, {
      value: s.trend.stat,
      options: TREND_STATS,
      onChange: (k: any) => setTrend({ stat: k }),
    }), "Median ignores single-step spikes, the mean lets them pull, the EMA weights recent steps and has no window edges."),

    Row("Trend window", jsxs("div", { className: "tg-set-inline", children: [
      jsx(Num, { value: s.trend.window, min: 0, max: 51, onChange: (v: number) => setTrend({ window: v }) }),
      jsx("span", { className: "tg-set-unit", children: "steps" }),
      jsx(Toggle, { on: s.trend.window === 0, label: "Auto", onChange: (on: boolean) => setTrend({ window: on ? 0 : 15 }) }),
    ]}), "0 = auto: 8% of the session's steps, forced odd, 3–51. A 150-step session would use " + autoWindow + "."),

    Row("Raw steps under the trend", jsxs("div", { className: "tg-set-inline", children: [
      jsx(Toggle, { on: s.trend.dots, onChange: (on: boolean) => setTrend({ dots: on }) }),
      jsx("input", {
        className: "tg-range", type: "range", min: 0.05, max: 0.8, step: 0.05, value: s.trend.dotsAlpha,
        title: "Opacity of the raw steps",
        disabled: !s.trend.dots,
        onChange: (e: any) => setTrend({ dotsAlpha: Number(e.target.value) }),
      }),
      jsx("span", { className: "tg-set-unit", children: Math.round(s.trend.dotsAlpha * 100) + "%" }),
    ]}), "The trend is the reading; the faint steps behind it are the audit trail (the tooltip still hits real steps)."),

    Row("Spread band", jsx(Toggle, { on: s.trend.band, onChange: (on: boolean) => setTrend({ band: on }) }),
      "Shade the window's p25–p75 behind the trend — how much the session wobbles around it."),

    Row("Heat rows", jsx(Seg, {
      value: s.heat.rows,
      options: [
        { k: "metric", name: "Per metric", hint: "One row per metric — the window's steps share the row" },
        { k: "series", name: "Per series", hint: "One row per drawn series, so each context window gets its own" },
      ],
      onChange: (k: any) => setHeat({ rows: k }),
    }), "The perf panel has 7 metrics; per series it has one row per window and metric."),

    Row("Heat colours", jsx(Seg, {
      value: s.heat.ramp,
      options: [
        { k: "row", name: "Row hue", hint: "Each row in its own colour — identity and intensity in one channel" },
        { k: "shared", name: "Shared ramp", hint: "One ramp for every row, with a low→high legend" },
      ],
      onChange: (k: any) => setHeat({ ramp: k }),
    }), "Rows are normalised inside themselves either way, so the shade always means \"high for this metric\"."),

    Row("Heat shading", jsx(Seg, {
      value: s.heat.scale,
      options: [
        { k: "log", name: "Log", hint: "Logarithmic — the right call for token counts spanning decades" },
        { k: "linear", name: "Linear", hint: "Linear within the row's own min..max" },
      ],
      onChange: (k: any) => setHeat({ scale: k }),
    }), "Log keeps a 36 → 23K tok/s prefill row readable; linear is easier to compare against the axis."),

    Row("Heat max columns", jsxs("div", { className: "tg-set-inline", children: [
      jsx(Num, { value: s.heat.maxCols, min: 0, max: 4000, onChange: (v: number) => setHeat({ maxCols: v }) }),
      jsx("span", { className: "tg-set-unit", children: s.heat.maxCols === 0 ? "never bin" : "columns" }),
    ]}), "Past this many steps the grid bins them, and a cell shows the largest step it covers so spikes survive."),

    Row("Window strip", jsx(Toggle, { on: s.heat.strip, onChange: (on: boolean) => setHeat({ strip: on }) }),
      "The compaction-window colours along the top of the grid."),

    Row("Row labels", jsx(Toggle, { on: s.heat.labels, onChange: (on: boolean) => setHeat({ labels: on }) }),
      "Metric names in the left gutter; without them the chips are the only legend."),

    jsxs("div", { className: "tg-set-foot", children: [
      jsx("button", {
        className: "tg-ghost",
        onClick: () => setS(resetChartSettings()),
        children: "↺ Reset to defaults",
      }),
      jsx("button", {
        className: "tg-ghost tg-set-forget",
        title: "Drop the mode remembered for each chart, so the default above applies to them again",
        onClick: () => clearChartModes(),
        children: "Forget per-chart modes",
      }),
      jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children:
        "Saved per browser, and charts already on screen follow along. A chart you switch by hand remembers its own mode — “Forget per-chart modes” hands them back to the default." }),
    ]}),
  ]});
}
