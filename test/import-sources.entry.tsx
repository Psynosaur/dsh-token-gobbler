// test/import-sources.entry.tsx — bundling entry for the imported-sources tests
// (test/import-sources.test.js). Re-exports the shared source helpers and the
// settings card so both can be exercised without a browser.
export * from "../client/sources";
export { ImportSourcesCard } from "../client/import-sources";
