// test/drawers-render.entry.tsx — bundling entry for the render smoke tests
// (test/drawers-render.test.js, test/sticky-header.test.js). Re-exports the
// drawer builders and the generic table so a Node test can render them with a
// React stub — the real plugin only registers them with the DSH module loader.
export { combinedDrawer, sessionDrawer, TurnTimelineSection } from "../client/drawers";
export { TgTable } from "../client/table";
