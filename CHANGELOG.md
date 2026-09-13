# Changelog

## 1.1.0

### Minor Changes

- Every chart is now drawn by the plugin's own canvas engine — the vendored amCharts bundle is gone.
  
  - **The Runs tab is drawn by that engine.** The per-model chart is one line per metric — Decode on the
    left linear axis; Prefill, Avg TTFT and Avg ctx sharing the right log axis — over the runs' ordinals,
    with every x tick labelled by that run's date. It gains the Lines / Both / Dots / Trend / Heat switch,
    metric chips that rescale the axes, one hover box carrying the run's whole row, and remembered
    per-chart state. The bar chart it replaced put a 66 tok/s decode bar beside a 989 tok/s prefill bar on
    two unrelated scales, drew a run with no measured speed as a zero, and could not answer the tab's
    actual question — whether the model is improving. **Trend** answers it.
  - **A model that ran in more than one home is split per home** (imported sources), one chip each and a
    dashed line for the import, so an imported machine's slower runs are not read as this machine's
    regression.
  - **Every other chart moved to the same engine**: the Performance tab's daily token totals (log) and
    daily speed/TTFT, the Llama Metrics live throughput / requests / speculative-acceptance charts (the
    acceptance rate now reads as a real percentage, 0–100), and the Cost tab's "by day" and "by session"
    columns — which open in the engine's new **Bars** plot mode.
  - **The engine gained the two features the port needed**: `xTickFormat` (a numeric index axis labelled
    as its dates/categories, in the ticks *and* the hover box) and a `bars` plot mode (one bar per point
    grown from the axis floor; several series share the slot side by side). The plot-mode list the
    settings store validates against is now DERIVED from the engine's own list — a hard-coded copy had
    silently rejected the new mode and reset a saved choice back to Lines.
  - **The settings section is a stack of drawers** — Cost (which opens itself), Tokens, Speed, Activity,
    Chart defaults and Imported sources, in that order — each head carrying the at-a-glance numbers while
    the cards stay folded, with the imported homes as the LAST drawer. The row layout was fixed with it:
    the hint text used to be the grid's third column, which the narrow settings pane squeezed into a
    clipped ribbon (or pushed clean out of the card); it now takes its own full-width line under the
    label and control.
  - **Removed the vendored amCharts bundle** — `client/amchart.tsx` (the wrapper + script loader), the
    `/token-gobbler/vendor` route and `AMCHARTS_ROOT` in `lib/index.ts`, `vendor/amcharts` (5 tracked
    files, 11.7 MB — 11.1 MB of it a font subset) and its `.tg-amchart*` / turn-chip / x-min CSS. The
    client bundle drops from 297 kB to 275 kB and no chart library is fetched into the host page.
  - **Removed the dead drawers** — `TokenSpendChart`, `perfDrawer`, `tokenTreeDrawer` /
    `TokenDrawerBody` and their helpers were unreferenced (the old Tokens tab was superseded by the
    combined drawer): ~130 lines gone.
  - **Fixes** — `sources.test.js` now pins `DSH_HOME` for its whole route test (its first `GET` read the
    real `~/.dsh/token-gobbler/sources.json` and failed as soon as a home was actually imported), and the
    client bundle builds again (a shadowed `rows` binding in `client/panels.tsx` broke it — esbuild is
    the only thing that type-checks the client sources, so `npm run build` is the gate, not the tests).
- Imported sources: read other machines' DSH homes (Windows on a mounted drive, macOS on `/Volumes`, a
  synced `~/.dsh`, or just its `sessions/` folder) alongside the local one.
  
  - **Register another DSH home and fold its sessions into every number** — Settings › Token Gobbler ›
    **🔌 Imported sources** lists each home with its OS, path, session/trajectory/token counts and last
    sync, and manages it: **＋ Import source** (a full `.dsh` home, its `sessions/` folder, a projection
    store, or a bare copy of a sessions tree), **🔍 Scan for DSH homes** (probes `/mnt`, `/media/<you>`,
    `/run/media/<you>`, `/Volumes` and your home), **↻ Resync** (re-reads that home only — its cached
    parses are dropped, the rest of the dashboard keeps its warm cache), **⏸ Pause**, and **✕ Remove**
    (two-step; the imported files are never touched). Read-only on the other machine: the registry lives
    in this home's `token-gobbler/sources.json`.
  - **Every imported session is marked** — a 🪟/🍎/🐧 badge naming its home in every session table and
    drawer, plus a source chip row in the activity modal that filters all tabs to one home. A summary
    line under the settings header says which homes are folded in.
  - **Cross-home merge rules** — the OS is read from the sessions' own cwds (`D:\models\…` on a Windows
    volume mounted anywhere), a session id held by two homes is counted once (this machine wins, and the
    duplicate is reported per source), archived state is read from each home's own `workspace.json`, and
    an import with trajectories but no projection store still reports — its rows are rebuilt from the
    trajectory (tokens, steps, cwd, createdAt).
  - **`lib/sources.ts`** — the import registry (`<dsh home>/token-gobbler/sources.json`), layout and OS
    detection, and a cheap (parse-free) scan; **`/token-gobbler/sources`** GET/POST routes;
    **`invalidateTrajectoryCache(prefix)`** so a resync/removal also drops those entries from the
    persisted parse cache.

All notable changes to `token-gobbler` are documented here.

## [1.0.0] - 2026-09-12

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
- **Daily tab** — a GitHub-style calendar heatmap of token usage per day (3M / 6M / 1Y / All range buttons), colored by token intensity with a fixed unclipped hover tooltip; click a day to filter the matched day's overview + session table. A 🦃 FAB opens today's entry. Per-day and per-range overview badges show speed (decode, prefill, TTFT) and the token buckets.
- **Over-time charts** — the Combined tab plots daily token-summary lines (In / Out / Cache / Think / Total) and daily decode / prefill / TTFT speed lines across every session.
- **Shared session aggregation** (`client/agg.ts`) — the single home for the "sum these sessions" math (day + range totals, per-day series, per-session token totals), used by the Daily, Combined, and drawer views instead of repeated inline arithmetic.
- **Shared per-session table** (`client/session-table.tsx`) — one column set (Date | Session | Models | Steps | [Turns] | Decode | Prefill | Runtime | Total, or the token+cost set) rendered through a generic `TgTable`, so every session-backed tab (Performance, Tokens, Combined, Daily, Sessions, Cost) reuses the same paging / expand / drawer behavior. Archived sessions get a 📦 marker.
- **Minimal, dependency-free Markdown renderer** (`client/markdown.tsx`) — for the compaction-summary popup; builds React elements directly (no `innerHTML`, so no XSS surface), covering headings, fenced code, nested lists, pipe tables, blockquotes, and inline code / bold / italic / strikethrough / links.
- **Runs tab** (`client/runs.tsx`) — sessions grouped BY MODEL (heaviest model first) into one expandable drawer each, so a model is only ever compared against itself: drawer head carries the model, provider and runs / steps / decode / prefill / tokens chips, the body a time-weighted performance badge grid, an in/out/cache/think allocation bar, and a per-run table with a ● marker on runs that carry P2P evidence. The per-run chart hides the (repeating) category labels and puts decode and prefill on separate axes — prefill runs ~10× faster.
- **Mixed-model sessions get their own drawer** — a "🔀 Mix" section lists the sessions that switched model with a model-color stacked blend bar (segment = that model's share of the session's tokens) and a per-model table, so a blended session is never read as a like-for-like number.
- **P2P (GPU peer-to-peer) evidence detection** — `parseTrajectoryText` credits a session only on AFFIRMATIVE enablement evidence ("P2P access enabled", "enable P2P", "P2P: on", a driver/kernel patched for P2P, nvlink ↔ P2P), so a session that merely discusses P2P stays uncredited, while still recording `p2pMentions` for triage. Surfaced as `p2p` / `p2pMentions` on every session row and split into a before/after delta by `scripts/p2p-report.js`.
- **Corpus analysis CLIs** (`scripts/`, dependency-free ESM, no build step) — `npm run report:days` (`day-compare.js`), `report:p2p` (`p2p-report.js`), `report:snapshot` (`corpus-snapshot.js`). `scripts/census.js` is the shared core: per-step flattening for one model, time-weighted rollups (Σ tokens ÷ Σ ms, never a mean of rates), same-question tables inside narrow context / output / reasoning bands, and a SESSION-clustered bootstrap (one session = one draw) with a relative-% or percentage-point mode. `day-compare.js` answers "are today's runs different, or is that just the workload?" and now supports exact two-day comparisons with `--compare YYYY-MM-DD YYYY-MM-DD`; `corpus-snapshot.js` exports a machine's corpus as columnar JSON and pools snapshots from several machines into a pooled table plus a per-host table (session ids namespaced per host, so pooling two machines cannot fake precision).
- **Node floor check** (`scripts/runtime.js`) — DSH trajectories are multi-frame zstd, which `node:zlib` only gained in Node 22.15 / 23.8 / 24; the check runs before the zstd-dependent pipeline is imported so an old Node gets a fix hint instead of "does not provide an export named `zstdDecompressSync`".
- **`npm run deploy`** — build everything and copy `lib/*.js` into the local web profile in one step.
- **v3 trajectory support** — the parser now reads the current on-disk format (`session.v3.jsonl.zstd`), where the streaming chunks and the authoritative per-step `usage` are NESTED in `assistant/message.data.stream` instead of being top-level `assistant/chunk` records (`data.usage` mirrors the stream's usage chunk; `finish` no longer carries `replayState`; the system prompt moved to a new `system/message` record; the header gained `isSeeded`). One pass handles both formats, and a session directory holding both files parses the v3 copy only. Verified against a session that exists in both: identical per-step buckets, `decodeMs`, `ttftMs` and session decode/prefill totals.
- **Trajectory shape snapshots** (`npm run report:shape`, `scripts/trajectory-shape.js`) — every parse also records the SHAPE of what it read (record types, structural field paths, the closed value sets the parser keys on, and the nested v3 stream entry kinds). The CLI writes a manifest (`docs/trajectory-shapes.md`, with the machine-readable snapshot embedded) and `--compare <snapshot>` diffs the current sessions against it, exiting 1 and naming the changed record when DSH moves the format again — so a future change is a diff, not silently zeroed numbers.
- **Turn outline & event timeline in every session drawer** — every tab's session drawer now opens with a per-turn outline (status badge, prompt, response, wall time, step count) plus the turn's compact event chips, and a session-level row for the events that belong to no turn (system prompt, title). The per-turn → step table's Turn header rows carry the same signal inline: the outcome badge (completed / in progress / aborted / blocked / error / max tokens / interrupted) and the first four event icons with a `+N` count. The event categories come from the trajectory records the parser previously only counted: `error` (turn/end non-completed reasons, failed compactions), `user-stop` (interrupted by the user), `retry` (llm/retry with its failure code and backoff), `approval` (asked/decided), `compaction` / `prune`, `todo`, `command`, `title`, `model` (model/selection), `deliverable` (deliverables/presented) and `info` (agent preset). Sessions with no turn records (older trajectories) fall back to the step tree for the turn list.

### Changed
- **Sticky table headers no longer float over drawer content.** `position:sticky` resolves against the nearest SCROLLING ancestor, so a sticky header inside a height-unbounded wrapper (`.tg-tscroll` was `overflow:visible`) pinned itself to the modal body and hovered over everything as it scrolled past — every expanded drawer. Sticky is now scoped in CSS to the table's own bounded scroll container (`.tg-tscroll` / `.tg-vscroll` / `.tg-scrollable` / `.tg-field-scroll`), each of those is height-bounded, and `TgTable` drops the sticky class entirely while a drawer row is open (the table is split by the drawer there, so no header may pin over it). The per-turn step table got its own bounded scroller (`.tg-field-scroll`, tall but capped) instead of the 320px clamp.
- `kind` is derived provider-aware everywhere; a model with a rate card uses its `local`/`corp` flag, otherwise it's classified by provider.
- The WFH **reference model** must be a corp (non-local) model; `savePricing` enforces it and the Pricing tab only offers corp models.
- **TypeScript migration** — the `lib/` runtime (`index`, `pricing`, `report`, `trajectory`, `projcache`) moved from plain `.js` to `.ts`; added `tsconfig.json` / `tsconfig.build.json`, a `tsc`-based `build:lib` / `typecheck`, and `esbuild`-based `build:client`. The compiled `lib/client.js` is no longer committed — it's built.
- The drawers expose a unified **turn → step table** (`combinedDrawer`, used as the session drawer across the tabs) with a collapsible header row per turn and per-turn column totals, replacing several bespoke per-tab drawer builders.
- Session tables now report **Prefill** (new uncached input tokens ÷ TTFT, a lower bound) and **Runtime** (TTFT + decode, with the thinking window not double-counted).
- Per-model stats now count single-model sessions only; a session that switched model goes to the Mix drawer instead. The old numbers were blends — davidAU read 54.2 tok/s over 25 runs and 47.7 over its 19 pure runs, and 3 of the 6 blended sessions also carried P2P evidence, which confounded the earlier P2P comparison.
- The analysis scripts hold out mixed-model sessions by default too (the Runs-tab rule: a model with no steps does not make a session mixed); `--include-mixed` opts back in and the held-out counts are always printed.
- Cache versions bumped for the new fields: trajectory parse cache v12 → v13 (`p2p` / `p2pMentions`) and the client breakdown cache v3 → v4, with the superseded client keys dropped so they stop eating quota.
- Trajectory parse cache v13 → v14 (v3 support: usage now read from `assistant/message.data.stream` + `data.usage`, and every parse carries the observed format version and shape) and the client breakdown cache v4 → v5 (sessions previously read as v0/zero-usage now have per-step points), with the superseded client keys dropped.
- Trajectory parse cache v14 → v15 (every parse now also extracts the per-turn prompts/outcomes and the session event timeline) and the client breakdown cache v5 → v6 (sessions gained `turnTimeline`), with the superseded keys dropped.
- Per-step context allocation now backfills the system prompt and tools-definition sizes onto the steps that started before their own request metadata was written (both formats) — previously the first step of every session read `ctxSys`/`ctxTools` 0.
- The event breakdown gained a **System msgs** bucket for v3's `system/message` records (the one new record type the parser consumes).
- `scripts/**` is now included in the published package `files` list.

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
- Added a shared aggregation module and a generic paged/expandable table so the tabs no longer hand-roll rows, chevrons, drawer rows, or the "sum these sessions" math.
- Added `tsconfig*.json` and build/typecheck scripts; removed the committed `lib/client.js` build artifact (now generated by `build:client`).
- Added `test/census.test.js` (8 tests) — a synthetic DSH home with real multi-frame zstd trajectories proving the mixed-session hold-out, the rollup-only fallback flag, time-weighted `wDecode`, the cluster-bootstrap refusal below 3 sessions per side, `pp` vs `rel` mode, and quantile.
