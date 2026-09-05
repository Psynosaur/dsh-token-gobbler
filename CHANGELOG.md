# Changelog

All notable changes to `token-gobbler` are documented here.

## [Unreleased]

### Added
- **Home-lab (local) billing** — local models now price at their configured rates (set in the Pricing tab) instead of a flat $0, so you can track what local compute actually costs; the WFH split compares local cost against the reference model.
- **Provider-aware `corp` / `local` classification** (`kindFor`) replaces the old Copilot-vs-local heuristic, used consistently by the dashboard and the CLI.
- **DeepSeek API rate cards** (peak rates; off-peak is half price; no cache-write billing).
- **Per-tool token stats** — the actual tool-call payload (~chars/4) plus reasoning, per session and aggregated across sessions.
- **Per-step speed + thinking** — prefill/decode tok/s per step and thinking tokens (authoritative `reasoningTokens`, or estimated from the reasoning text when the provider reports 0).
- **Turn-grouped step tree** with the tool calls made after each step (parallel-call groups flagged).
- **Disk-backed trajectory parse cache** that survives harness restarts, plus a **♻ Reprocess** button to force a full re-parse of historic files.
- **Pricing tab seeding** — with no saved table, the first table is seeded from the models actually seen in the trajectory; a "scan trajectories for local models" button adds local rows.
- **amCharts 5 vendored locally** — the token charts now render offline (no `cdn.amcharts.com` fetch).
- **CLI** — `--days N` time window, per-model `kind`, and the savings line names the real baseline model.

### Changed
- `kind` is derived provider-aware everywhere; a model with a rate card uses its `local`/`corp` flag, otherwise it's classified by provider.
- The WFH **reference model** must be a corp (non-local) model; `savePricing` enforces it and the Pricing tab only offers corp models.

### Fixed
- Per-tool payload no longer double-counts when a step calls the same tool multiple times; a step's reasoning is split across its tool calls instead of being counted once per tool.
- `recordUsage` dedups a step that emits both a `usage` chunk and a `finish` chunk carrying usage (previously double-recorded the step's buckets, tree, and timing).
- Paid gateway ids (e.g. `openrouter/claude-sonnet-4.6`) no longer seed as $0 local.
- A DeepSeek API model whose name contains "qwen" now classifies as corp, not local.
- A real `500` from `/performance` (or `/breakdown`) now surfaces the actual error; only a genuinely missing route shows "restart the web server".
- amCharts rebuilds the chart when the data redistributes at the same grand total (the signature now fingerprints per-cell values, not just the total).
- Stale "$0 local / excluded from cost" wording in the dashboard note, README, and the Pricing kind tooltip.

### Housekeeping
- Removed the unused `tokenPerfDrawer` and a no-op regex in `normalizeModel`.
- Fixed indentation glitches introduced by earlier edits.
- Staged `vendor/amcharts` so the published package ships the offline chart assets.
