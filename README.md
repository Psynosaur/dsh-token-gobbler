# 🦃 token-gobbler

> *same gobbling, different invoices. watch the corp tokens get chomped.*

A [DeepSeek Harness](http://127.0.0.1:3080) **composition plugin** that reads your DSH session
data, counts every token you fed the machine (fresh input, output, cache reads, cache writes),
and prices that gobbling against the models your corp *could've* billed you for — Copilot's
Claude / Grok — next to the free local models you're *actually* running.

It's a little turkey with a spreadsheet. The turkey is you. The spreadsheet is the invoice.

---

## What it reads

Two sources, merged (no build step, pure Node ESM):

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
non-Anthropic entries (Grok, Sonnet 5) are **estimates** and flagged `(est.)`.

```
cost = (uncachedInput·input + output·output + cacheRead·cacheRead + cacheWrite·cacheWrite) / 1e6
```

| Model | $/M in | $/M out | $/M cacheR | $/M cacheW |
| --- | ---: | ---: | ---: | ---: |
| Claude Opus 4.6 | 5.00 | 25.00 | 0.50 | 6.25 |
| Claude Sonnet 4.6 | 3.00 | 15.00 | 0.30 | 3.75 |
| Claude Sonnet 5 *(est.)* | 3.00 | 15.00 | 0.30 | 3.75 |
| Grok 4.6 *(est.)* | 3.00 | 15.00 | 0.30 | 3.75 |
| Qwen 3.8 27B (local) | 0.25 | 2.50 | 0.05 | 0.3125 |

The full Anthropic family (Opus 4/4.1/4.5/4.6, Sonnet 3.7/4/4.5/4.6, Haiku 3/3.5/4.5) is in
[`lib/pricing.js`](lib/pricing.js) — **that's the one file you edit to change prices.**

**Real-usage pricing is provider-aware** (`modelKey` / `priceForProvider`): a **Copilot**
provider keeps the specific model's card (Sonnet/Opus/Grok); **any other provider is local Qwen**
(the home lab), priced at the Qwen 3.8 27B baseline — whose rates come from the OpenRouter table
as the representative cost of running a local model.

### Where to edit the pricing table
Open lib/pricing.js → the PRICING object. Each entry is "model-id": P(input, output, cacheRead,
cacheWrite, estimated?, label?) — per-1M USD. `qwen3.8-local` is the home-lab baseline (OpenRouter
Qwen 3.8 27B). Add or rename a model there, or tweak DEFAULT_CANDIDATES in lib/report.js to change
which models appear in the "what it would cost" comparison.

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
    $190.71  Priced from exact per-model usage (harness request events).
    💰 All-local (Qwen) would've been $33.84 — the home lab saved $156.87 vs what you actually spent.

  BY MODEL (what you actually ran)
    MODEL                          KIND      SESS       INPUT      OUTPUT      CACHE R        COST
    Claude Sonnet 4.6              Copilot     46       10.9M        1.2M       203.6M     $111.64
    Qwen 3.8 27B (local)           local       41        3.7M        1.4M       105.2M       $9.60
    Claude Sonnet 5                Copilot      9        2.8M      313.2K        65.5M      $32.65
    Claude Opus 4.6                Copilot      3      959.1K        158K          37M      $27.27
    Grok 4.6                       Copilot      2        1.7M      131.6K           8M       $9.54

  WHAT IT WOULD COST THE CORP (all tokens on one model)
    MODEL                                      COST    YOU SAVE
    Qwen 3.8 27B (local — what you ran)      $33.84  baseline
    Claude Sonnet 4.6 (Copilot)             $233.09  $199.25
    Claude Opus 4.6 (Copilot)               $388.48  $354.64
    Grok 4.6 (Copilot)                      $233.09  $199.25 (est.)
    💰 You save $199.25–$354.64 by running local instead of Copilot.
```

## Web dashboard (settings modal)

Adds a **Token Gobbler** section to the DSH settings modal, with a **↻ Refresh** button to
re-pull fresh data, plus a wider activity modal (floating 🦃 trigger) with six tabs.
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

The rate cards are user-editable in the **Pricing** tab: adjust any model's $/M input / output /
cache-read / cache-write rates, add models (e.g. new Copilot models), remove non-local entries,
and pick the **★ WFH reference model** that local compute is valued against. The table is saved
to `~/.dsh/token-gobbler/pricing.json` (an array of model entries + the reference model id) and
re-read on every request, so saves re-price everything immediately — no restart needed after the
first one.

- `GET /token-gobbler/pricing` — current table (built-in defaults until first save);
- `POST /token-gobbler/pricing` — save `{ referenceModel, models: [{ id, label, input, output, cacheRead, cacheWrite, estimated, local }] }`;
- `GET /token-gobbler/performance` — decode + prompt-processing speed per model and per
  session × model (only sessions with per-turn usage carry timing).

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
lib/pricing.js     rate cards + cost math        (pure, shared)
lib/trajectory.js  zstd trajectory reader/parser (pure)
lib/projcache.js   projection-store reader       (pure)
lib/report.js      aggregate + what-if pricing   (pure)
lib/index.js       host: /token-gobbler/* routes
lib/client.js      settings.section dashboard
bin/token-gobbler.js  CLI
test/report.test.js  node --test suite
```

## Tests

```bash
node --test test/*.test.js
```

---

*MIT. Not affiliated with any turkey, corp, or token ledger. The gobbler does not eat
your tokens — it just reads the receipt.*
