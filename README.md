# 🦃 token-gobbler

> *same gobbling, different invoices. watch the corp tokens get chomped.*

A [DeepSeek Harness](http://127.0.0.1:3080) **composition plugin** that reads your DSH session
data, counts every token you fed the machine (fresh input, output, cache reads, cache writes),
and prices that gobbling against the models your corp *could've* billed you for — Copilot's
Claude / Grok — next to the free local models you're *actually* running.

It's a little turkey with a spreadsheet. The turkey is you. The spreadsheet is the invoice.

---

## What it reads

Two sources, merged (server is pure Node ESM; the web client is TypeScript, compiled by `esbuild`):

| Source | Path | What it gives |
| --- | --- | --- |
| **Trajectories** | `~/.dsh/sessions/<ws>/<sid>/session.jsonl.zstd` | per-turn usage + **model attribution** (when populated) |
| **Projection store** | `~/.dsh/storages/session_projcache.json` | authoritative **per-session totals** (always present) |

- Trajectories are **multi-frame** zstd JSONL (DSH appends a frame per write). The reader
  (`zstdMultiFrameDecompress`) locates every frame and decompresses them all — node's
  one-shot/streaming zstd only returns the first frame.
- **Parse cache**: trajectories are append-only and static once a session is done, so the parsed
  result is cached per file, keyed on `(mtimeMs, size)` with a SHA-256 content-hash backstop.
  Unchanged files are served from memory with **no re-read / re-parse** — only files that actually
  changed (e.g. a live session) are recomputed. The dashboard footer and the CLI header show the
  per-load `hits / recomputed` counts (a warm load is ~500× faster than a cold one).
- **Model timeline**: `request/header` (`data.header.config.{provider,model}`) and
  `request/context` (`data.{provider,model}`) mark which model was active; `step/end`
  (one per LLM call) carries the global `seq`. Together they let us attribute a session's
  real tokens to the models it actually used.
- **Real per-model usage** is recovered per session, best available:
  - **exact** — per-turn `assistant/chunk` usage records (when present), each tagged with the active model;
  - **estimated** — attribution: split the session's totals across models by step count (when only the timeline is present);
  - **assumed** — the profile default model (when a session has no model signal).
- `reasoningTokens` is a subdivision of output — tracked for display, **never double-counted**.

## The math

Per-1M-token rate cards (USD). Anthropic rates are authoritative
([platform.claude.com pricing](https://platform.claude.com/docs/en/about-claude/pricing));
DeepSeek rates come from [api.deepseek.com](https://api.deepseek.com) (peak; off-peak is half price);
Grok and Claude Sonnet 5 are **estimates** and flagged `(est.)`.

Every entry carries a **kind**: **corp** (billed at that rate, counted in the company bucket) or
**local** (the home lab — priced at its configured rates so you can track what local compute
costs, and still measured in the performance analysis). Mark a model **local** to move it out of
the corp (billed) bucket.

```
cost = (uncachedInput·input + output·output + cacheRead·cacheRead + cacheWrite·cacheWrite) / 1e6
```

| Model | Kind | $/M in | $/M out | $/M cacheR | $/M cacheW |
| --- | --- | ---: | ---: | ---: | ---: |
| Claude Opus 4.6 | corp | 5.00 | 25.00 | 0.50 | 6.25 |
| Claude Sonnet 4.6 | corp | 3.00 | 15.00 | 0.30 | 3.75 |
| Claude Sonnet 5 *(est.)* | corp | 3.00 | 15.00 | 0.30 | 3.75 |
| Grok 4.6 *(est.)* | corp | 3.00 | 15.00 | 0.30 | 3.75 |
| DeepSeek V4 Flash (API) | corp | 0.44 | 1.32 | 0.014 | 0 |
| DeepSeek V4 Pro (API) | corp | 1.32 | 3.96 | 0.044 | 0 |
| Qwen 3.8 27B (local) | local | 0.25 | 2.50 | 0.05 | 0.3125 |

The full Anthropic family (Opus 4/4.1/4.5/4.6, Sonnet 3.7/4/4.5/4.6, Haiku 3/3.5/4.5) and the
DeepSeek V4 family (Flash / Flash-0731 / Flash-Vision-Exp / Pro / Pro-0813) are in
[`lib/pricing.js`](lib/pricing.js) — **that's the seed for the built-in rates.**

**Real-usage pricing is table-driven.** A model used in a session prices under its own table
entry: a **Copilot** provider, or a paid-API provider like the **DeepSeek API**
(`deepseek-official`), keeps the specific model's card; any other (local) provider keeps its
own model name too — each local model you actually ran is shown separately, priced family-wise
(Qwen → the metered `qwen3.8-local` card, other self-hosted → the `local-free` card). The
**first** cost table is seeded from the
trajectory — every provider/model you've actually used gets a row you can mark **corp** or
**local** in the Pricing tab (known models are prefilled with their real rates), and the built-in
cards are merged in so family fallbacks and the ★ WFH reference model always resolve.

### Where to edit the pricing table
Open lib/pricing.js → the PRICING object. Each entry is "model-id": P(input, output, cacheRead,
cacheWrite, estimated?, label?, corp?) — per-1M USD, plus a `local: true` marker on home-lab
models. Or, more simply, edit it in the **Pricing tab** (saved to
`~/.dsh/token-gobbler/pricing.json`), where you set each model's **kind** (corp/local), its
rates, and the ★ WFH reference model without touching code. Add or tweak the what-if roster via
DEFAULT_CANDIDATES in lib/report.js.

## CLI

```bash
node bin/token-gobbler.js              # all time, pretty
node bin/token-gobbler.js --days 7     # last 7 days (re-prices the window)
node bin/token-gobbler.js --breakdown  # per-day / per-model / per-session tables
node bin/token-gobbler.js --json       # machine-readable
node bin/token-gobbler.js --dsh-home ~/other-dsh   # override DSH home
```

Sample:

```
  🦃 TOKEN GOBBLER — the corp token meter
  ──────────────────────────────────────────────────────────────────────
  TOTALS GOBLED
    Input (uncached) : 20,032,679
    Output           : 3,162,868
    Cache read       : 418,497,132
    Total tokens     : 441,692,679

  ACTUAL (what you actually ran)
    $11.69  Priced from exact per-model usage (harness request events).
    💰 All-local (Qwen) would've been $0.00 — the home lab saved $11.69 vs what you actually spent.

  BY MODEL (what you actually ran)
    MODEL                          KIND      SESS       INPUT      OUTPUT      CACHE R        COST
    DeepSeek V4 Flash Vision (API)  corp       40        3.9M        2.9M       233.4M       $8.74
    DeepSeek V4 Flash (API)         corp        8          1M      916.2K        92.2M       $2.95
    Qwen 3.8 27B (local)            local     157        6.4M        1.2M        57.9M       $0.00

  WHAT IT WOULD COST THE CORP (all tokens on one model)
    MODEL                                      COST    YOU SAVE
    Qwen 3.8 27B (local — what you ran)       $0.00  baseline
    Claude Sonnet 4.6 (Copilot)              $220.87  $220.87
    Claude Opus 4.6 (Copilot)                $368.11  $368.11
    Grok 4.6 (Copilot)                       $241.71  $241.71
    DeepSeek V4 Flash (API)                   $16.69  $16.69
    💰 You save $16.69–$368.11 by running local instead of the corp.
```

## Web dashboard (settings modal)

Adds a **Token Gobbler** section to the DSH settings modal, with a **↻ Refresh** button to
re-pull fresh data and a **♻ Reprocess** button that clears the trajectory parse cache and
re-parses every historic file (so a parser upgrade or a stale cache is picked up without a
restart), plus a wider activity modal (floating 🦃 trigger) with six tabs.
It calls `GET /token-gobbler/usage` + `GET /token-gobbler/breakdown` + `GET /token-gobbler/performance`
(host) and renders:
- the token totals,
- **"what you actually ran"** (the real per-model cost) with a **home-lab savings** headline
  (all-local cost vs your actual spend),
- a **WFH compute** card: local sessions valued against the user-selected **reference model**
  (default Claude Opus 4.6) — "what the corp would've billed" minus the home-lab cost,
- modal tabs:
  - **Events** — activity by event type + top tools;
  - **Cost** — WFH vs Copilot split cards, the what-if comparison (every model in the rate-card
    table), cost by day, cost by session;
  - **Models** — the real per-model mix + the corp what-if table;
  - **Performance** — model speed: decode (streamed output tokens ÷ decode time) and prompt
    processing (new uncached input tokens ÷ TTFT, where TTFT = step start → first token),
    aggregated per model and per session × model (a session that switched models mid-flight
    shows one row per model, each with its own speed stats);
  - **Sessions** — per-session buckets with the models used; rows expand into a drawer with
    session metadata (timings, sandbox, context pressure, …), the tools called, and the turn outline;
  - **Pricing** — the editable rate-card table (see below).

### Editable pricing table

The rate cards are user-editable in the **Pricing** tab: mark each model **corp** (billed at its
rate, in the company bucket) or **local** (home lab — priced at its configured rates, kept in the
performance analysis),
adjust any model's $/M input / output / cache-read / cache-write rates, add models (e.g. a new
Copilot or API model), remove entries, and pick the **★ WFH reference model** that local compute
is valued against. With no saved table, the **first** table is seeded from the models actually
used in your trajectory (known models prefilled with their real rates, the rest at `$0` for you
to fill in), merged with the built-in cards. The table is saved to
`~/.dsh/token-gobbler/pricing.json` (an array of model entries + the reference model id) and
re-read on every request, so saves re-price everything immediately — no restart needed after the
first one.

- `GET /token-gobbler/pricing` — current table (built-in / seeded defaults until first save);
- `POST /token-gobbler/pricing` — save `{ referenceModel, models: [{ id, label, input, output, cacheRead, cacheWrite, estimated, local, corp }] }`;
- `POST /token-gobbler/reprocess` — clear the trajectory parse cache and re-parse every historic file (returns `{ files, withUsage, withModelTimeline, cache: { hits, recomputed }, defaultModel }`);
- `GET /token-gobbler/performance` — decode + prompt-processing speed per model and per
  session × model (only sessions with per-turn usage carry timing);
- `GET /token-gobbler/discover-models` — re-scan every processed trajectory and return the
  distinct **local** models (id + label + provider + rates). The Pricing tab's
  **🔎 Scan trajectories for local models** button calls this and adds each local model
  as its own rate card (per provider) instead of folding them into the `qwen3.8-local` baseline.

### Speed metrics

Both speed metrics come from trajectory chunk/step timestamps (no external timing):
- **Decode** = streamed output tokens ÷ decode time (first chunk → usage chunk — pure
  generation, TTFT excluded).
- **Prompt processing (prefill)** = new (uncached) input tokens ÷ TTFT (step start → first
  token). TTFT includes serialization + network + queue, so it is a lower bound on the
  model's true prefill rate. Cached context is served from the provider's cache and is not
  counted as new work. A session's first step also includes local model load time.

## Install (web profile)

In `~/.dsh/profiles/web/package.json`:

```jsonc
{
  "dependencies": {
    "token-gobbler": "link:/Users/OhanSmit/git/token-gobbler"
  },
  "dsh": { "profile": { "bundles": [ /* …existing… */ , "token-gobbler" ] } }
}
```

then `pnpm install` in the profile and restart the harness. (Same pattern as the local
`dsh-ltm-gate` link dep.)

## Layout

```
client/index.ts     entry: registers the module + injects the runtime globals
client/core.ts      shared primitives (formatting, cell/seg helpers, CSS, cards)
client/table.tsx    TgTable (paging/grouping/drawers)
client/drawers.tsx  step tables + session/perf/token drawers (collapsible turn table)
client/panels.tsx   by-model / by-day / by-session tables + pricing tab
client/activity.tsx settings section + activity modal + overlay + registration
client/hooks.ts     useGobblerData + settings→modal open ref
lib/client.js       ← GENERATED bundle (do not edit; run `npm run build:client`)
lib/pricing.js     rate cards + cost math        (pure, shared)
lib/trajectory.js  zstd trajectory reader/parser (pure)
lib/projcache.js   projection-store reader       (pure)
lib/report.js      aggregate + what-if pricing   (pure)
lib/index.js       host: /token-gobbler/* routes
bin/token-gobbler.js  CLI
test/report.test.js  node --test suite
```

### Building the web client

```bash
npm run build:client     # esbuild client/index.ts -> lib/client.js
npm run typecheck:client # tsc --noEmit (strict)
npm run watch:client     # rebuild on change
```

The client is authored in TypeScript under `client/` and bundled by `esbuild` to
`lib/client.js` — the exact file the DSH host loads (it preserves the
`window.__ModuleLoader__.load({ id, factory })` contract). `react` and
`react/jsx-runtime` are **external** (injected by the DSH client runtime), so
edit the TS under `client/` and rebuild, never the generated `lib/client.js`.

> Note: `npm install` (even `--ignore-scripts`) is needed once to get `esbuild`
> + `typescript` into `node_modules`.

## Tests

```bash
node --test test/*.test.js
```

---

*MIT. Not affiliated with any turkey, corp, or token ledger. The gobbler does not eat
your tokens — it just reads the receipt.*
