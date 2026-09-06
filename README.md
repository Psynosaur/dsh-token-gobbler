# 🦃 token-gobbler

> *same gobbling, different invoices. watch the corp tokens get chomped.*

A [DeepSeek Harness](http://127.0.0.1:3080) **composition plugin** that reads your DSH session
data, counts every token you fed the machine (fresh input, output, cache reads, cache writes),
attributes those tokens to the models that actually produced them, and prices the whole gobbling
against the models your corp *could've* billed you for — Copilot's Claude / Grok — next to the free
local models you're *actually* running.

It's a little turkey with a spreadsheet. The turkey is you. The spreadsheet is the invoice.

---

## What it does

Reads the trajectory file DSH keeps per session — `~/.dsh/sessions/<ws>/<sid>/session.jsonl.zstd`, a
multi-frame zstd JSONL event log — and reconstructs, per session:

- **Model attribution** — which provider/model served each step, matched against the projection
  store's authoritative totals and split across the models actually used. Best available: exact
  per-turn `usage` chunks, else estimated by step count, else the profile default model.
- **Token buckets** — uncached input, output, cache read, cache write (thinking is a subdivision of
  output, never double-counted).
- **Speed** — decode tok/s (streamed output ÷ time from first chunk to the usage chunk) and prefill
  tok/s (new input ÷ TTFT), plus per-step thinking time.
- **Per-tool cost** — the actual tool-call argument payload (~chars/4), not the whole step context.
- **Pricing** — a rate-card table (corp vs local) with a WFH / corp cost split.

The hard parts (multi-frame zstd decompression, per-step timing from chunk/step timestamps, a two-layer
in-memory + disk parse cache with a **♻ Reprocess** reset) live in `lib/trajectory.ts` and
`lib/report.ts`.

## Install

```bash
npx @deepseek-ai/dsh plugin --profile web add github:Psynosaur/dsh-token-gobbler
```

Then restart the harness. Or add `"token-gobbler": "link:/path/to/token-gobbler"` to the profile's
`dependencies` and `"token-gobbler"` to its `dsh.profile.bundles`, then `pnpm install`.

## Usage

```bash
node bin/token-gobbler.js          # pretty report
node bin/token-gobbler.js --json   # machine-readable
node bin/token-gobbler.js --days N # time window
```

## Web dashboard

Adds a **Token Gobbler** section to the DSH settings modal (a **↻ Refresh** button, plus a **♻
Reprocess** button that clears the trajectory parse cache and re-parses every historic file), and an
activity modal with tabs: **Events**, **Cost**, **Models**, **Performance**, **Tokens**,
**Combined**, **Daily** (a GitHub-style calendar heatmap of token usage per day — hover a day for its
combined stats, click to filter the per-session table to it), **Sessions**, and **Pricing**.

## Pricing

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

Pricing is table-driven: a model prices under its own entry, family fallbacks resolve for unseen
self-hosted models, and the first table is seeded from the trajectory (known models prefilled with
their real rates). Every entry carries a **kind** — **corp** (billed, in the company bucket) or
**local** (the home lab, priced at its configured rates). Edit `lib/pricing.ts`, or the **Pricing tab**
(saved to `~/.dsh/token-gobbler/pricing.json`), where you set each model's kind, its rates, and the
★ WFH reference model without touching code.

## Build

```bash
npm install     # one-time: esbuild + typescript
npm run build   # build:lib (tsc lib/*.ts -> lib/*.js) + build:client (esbuild -> lib/client.js)
npm run typecheck
npm test        # builds lib/*.js, then runs the node --test suite
```

Edit the `.ts` sources, never the generated `.js`.

## Layout

```
client/*.ts(x)     web dashboard (TypeScript, bundled by esbuild)
lib/index.ts       host: /token-gobbler/* routes
lib/trajectory.ts  zstd trajectory reader/parser
lib/projcache.ts   projection-store reader
lib/pricing.ts     rate cards + cost math
lib/report.ts      aggregate + attribution + pricing
lib/client.js      GENERATED (esbuild); do not edit
bin/token-gobbler.js  CLI (pretty/--json/--days/--breakdown)
test/report.test.js   node --test suite
```

---

*MIT. Not affiliated with any turkey, corp, or token ledger. The gobbler does not eat
your tokens — it just reads the receipt.*
