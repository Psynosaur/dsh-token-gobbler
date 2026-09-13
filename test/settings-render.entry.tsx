// test/settings-render.entry.tsx — bundling entry for the settings-section tests
// (test/settings-render.test.js). The settings section is the surface DSH mounts
// into its settings page, so it is rendered here with the same stub runtime the
// other client tests use — no browser, no react.
export { TokenGobblerSettings } from "../client/activity";
export { Collapse } from "../client/drawers";
export { loadChartSettings, saveChartSettings } from "../client/graph-store";
