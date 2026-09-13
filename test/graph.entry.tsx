// test/graph.entry.tsx — bundling entry for the canvas graph engine tests
// (test/graph-render.test.js). Re-exports the pure core so the Node tests can
// exercise scales/ticks/frames/drawing directly, plus the React shell so the
// resize → paint path and the chip toggles can be rendered with a stub runtime.
export * from "../client/graph";
export * from "../client/graph-store";
export { GraphCanvas } from "../client/graph-canvas";
export { ChartDefaultsCard } from "../client/chart-settings";
