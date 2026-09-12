# Token Gobbler — Complete Data Structure Analysis

This document catalogs every data type, interface, and stream tracked by Token Gobbler across its backend (lib/) and frontend (client/) code.

## Architecture Overview

Token Gobbler ingests data from **two primary sources**:

1. **Projection Cache (`projcache`)** — Authoritative per-session token totals (always present, no model info)
2. **Trajectory Files (`trajectory`)** — Per-turn usage, model timeline, tool calls, events, and timing data

These are aggregated into reports served via HTTP endpoints and consumed by the React client.

---

## Core Token Types

### TokenBuckets
The fundamental unit of token tracking, representing the four token buckets DSH tracks per session.

```typescript
interface TokenBuckets {
  uncachedInputTokens: number;  // New input tokens (not from cache)
  outputTokens: number;         // Generated output tokens
  cacheReadTokens: number;      // Input tokens served from cache
  cacheWriteTokens: number;     // Input tokens written to cache
  reasoningTokens?: number;     // Tokens spent on reasoning/thinking (optional)
}
```

### BucketsLike
Partial token bucket set (any field may be absent, treated as 0).

```typescript
type BucketsLike = Partial<TokenBuckets>;
```

---

## Pricing & Cost Types

### RateCard
Per-1M-token prices (USD) for one model ID.

```typescript
interface RateCard {
  input: number;      // Price per 1M input tokens
  output: number;     // Price per 1M output tokens
  cacheRead: number;  // Price per 1M cache read tokens
  cacheWrite: number; // Price per 1M cache write tokens
  estimated: boolean; // Whether prices are estimates
  label: string;      // Human-readable model name
  corp?: boolean;     // Billed by corporation (Copilot)
  local?: boolean;    // Home lab (free)
}
```

### PricingEntry
User-editable pricing table row (what the Pricing tab holds per model).

```typescript
interface PricingEntry {
  id: string;
  label?: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  estimated: boolean;
  local: boolean;
  corp: boolean;
  provider?: string | null;
}
```

### CostBreakdown
Per-bucket USD cost breakdown for a bucket set under a rate card.

```typescript
interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cacheReadCost: number;
  cacheWriteCost: number;
  total: number;
}
```

### DiscoveredModel
A model the trajectory revealed (id + optional label/provider).

```typescript
interface DiscoveredModel {
  id: string;
  label?: string;
  provider?: string | null;
  steps?: number;
}
```

### Candidate
A what-if candidate model for cost comparison.

```typescript
interface Candidate { id: string; label: string; }
```

---

## Trajectory Types

### ParsedTrajectory
The fully parsed trajectory — everything callers need.

```typescript
interface ParsedTrajectory {
  meta: TrajectoryMeta | null;
  usage: UsageRecord[];
  modelCounts: Record<string, number>;
  modelChanges: ModelChange[];
  stepSeqs: number[];
  events: EventCounts;
  tools: Record<string, number>;
  toolCalls: Record<string, number>;
  toolCallArgs: Record<string, number>;
  stepTools: Record<string, string[]>;
  stepToolArgs: Record<string, Record<string, number>>;
  decode: TimingRollup;
  prefill: TimingRollup;
  systemChars: number;
  toolsChars: number;
  contextWindow: number | null;
  stepContext: Record<string, { sys: number; tools: number; msg: number }>;
  compactions: CompactionEvent[];
  prunes: number;
  prunedTokens: number;
  postCompaction: Record<string, number>;
  p2p: boolean;
  p2pMentions: number;
  formatVersion: number | null;
  shape: TrajectoryShape;
  timeline: TurnTimeline;
}
```

### TrajectoryMeta
Session meta from the `session` record.

```typescript
interface TrajectoryMeta {
  id: string | null;
  cwd: string | null;
  createdAt: string | null;
  agentPreset: string | null;
}
```

### UsageRecord
Per-turn exact usage (from usage/finish chunks).

```typescript
interface UsageRecord {
  turn: number | null;
  step: number | null;
  model: string | null;
  provider: string | null;
  buckets: TokenBuckets;
  decodeMs: number | null;
  ttftMs: number | null;
  thinkingMs: number | null;
  thinkingChars: number;
}
```

### ModelChange
A model-timeline change point (which provider+model became active).

```typescript
interface ModelChange {
  seq: number | null;
  provider: string | null;
  model: string;
}
```

### EventCounts
Activity-category counters (the event breakdown).

```typescript
interface EventCounts {
  steps: number;
  toolCalls: number;
  toolSubCalls: number;
  userMessages: number;
  assistantMessages: number;
  systemMessages: number;
  turns: number;
  compactions: number;
  retries: number;
  approvals: number;
  todos: number;
  commands: number;
  userStops: number;
}
```

### TurnStatus
How a turn ended (from turn/end).

```typescript
type TurnStatus = "open" | "completed" | "aborted" | "blocked" | "error" | "max-tokens" | "interrupted";
```

### TimelineKind
Event categories shown on the timeline.

```typescript
type TimelineKind =
  | "session" | "prompt" | "system" | "error" | "user-stop" | "retry" | "approval"
  | "compaction" | "prune" | "todo" | "command" | "title" | "model" | "deliverable" | "info";
```

### TimelineEvent
One non-step event, positioned by turn/step.

```typescript
interface TimelineEvent {
  turn: number | null;
  step: number | null;
  seq: number | null;
  time: number | null;
  kind: TimelineKind;
  text: string;
}
```

### TurnDetail
One turn's prompt/response and outcome.

```typescript
interface TurnDetail {
  turn: number;
  seq: number | null;
  startTime: number | null;
  endTime: number | null;
  status: TurnStatus;
  detail: string | null;
  prompt: string;
  response: string;
  steps: number;
}
```

### TurnTimeline
The assembled per-turn + session activity of one trajectory.

```typescript
interface TurnTimeline {
  turns: TurnDetail[];
  events: TimelineEvent[];
}
```

### CompactionEvent
One compaction event, grouped by compactionId.

```typescript
interface CompactionEvent {
  seq: number | null;
  endSeq: number | null;
  time: number | null;
  endTime: number | null;
  durationMs: number | null;
  compactionId: string | null;
  hasSummary: boolean;
  summaryChars: number;
  summaryText: string;
  shadowedTokens: number;
  contextBefore: number | null;
  afterTurn: number | null;
  afterStep: number | null;
  error: string | null;
}
```

### TimingRollup
A decode/prefill timing rollup.

```typescript
interface TimingRollup {
  tokens: number;
  ms: number;
  steps: number;
}
```

### TrajectoryShape
The observed shape of one trajectory file (for format-change detection).

```typescript
interface TrajectoryShape {
  version: number | null;
  types: Record<string, ShapeNode>;
  counts: Record<string, number>;
  valueSets: Record<string, (string | number)[]>;
  streamKinds: Record<string, number>;
  unparsed: number;
}

type ShapeNode = string | ShapeNode[] | { [key: string]: ShapeNode };
```

### ShapeDiff
Diff between two trajectory shapes.

```typescript
interface ShapeDiff {
  added: string[];
  removed: string[];
  changed: string[];
  unchanged: string[];
}
```

---

## Projection Cache Types

### ProjSession
A report row for one projcache session.

```typescript
interface ProjSession {
  id: string;
  cwd: string | null;
  createdAt: number | null;
  title: string | null;
  turns: number;
  steps: number;
  llmMs: number;
  buckets: TokenBuckets | null;
  allTokens: number;
  meta: SessionMeta;
}
```

### SessionMeta
Rich per-session metadata surfaced to the activity drawers.

```typescript
interface SessionMeta {
  toolMs: number;
  ttftMs: number;
  ttftSteps: number;
  decodeMs: number;
  decodeTokens: number;
  lastTurn: number;
  sandbox: string | null;
  approval: string | null;
  preset: string | null;
  agentPreset: string | null;
  lastUsedModel: { provider: string | null; model: string | null } | null;
  goal: { id: string | null; revision: number | null; objective: string } | null;
  goalFailure: string | null;
  planActive: boolean;
  todos: unknown;
  contextPressure: { surfaceTokens: number; contextWindow: number; pressureTokens: number } | null;
  contextBreakdown: { systemTokens: number; toolsTokens: number; messageTokens: number } | null;
  lastPromptAt: number | string | null;
  subagentCount: number;
  subagentSettledMs: number;
  llmRetries: unknown;
  turnOutline: { turn: number; prompt: string; response: string }[] | null;
  isSeeded: boolean;
  inheritedEventCount: number;
}
```

### ProjcacheResult
Aggregated read result.

```typescript
interface ProjcacheResult {
  sessions: ProjSession[];
  totals: TokenBuckets;
  count: number;
  nonZero: number;
  error?: string;
}
```

### ProjStorePaths
Resolved projection store paths.

```typescript
interface ProjStorePaths {
  dshHome: string;
  storePath: string;
  storeKind: "dir" | "file";
  otherStorePath: string | null;
}
```

---

## Report Types

### ReportOptions
Options accepted by the report builders.

```typescript
interface ReportOptions {
  dshHome?: string;
  sessionsRoot?: string;
  storePath?: string;
  candidates?: Candidate[];
}
```

### ResolvedPaths
Resolved filesystem paths.

```typescript
interface ResolvedPaths {
  dshHome: string;
  sessionsRoot: string;
  storePath: string;
  storeKind: "dir" | "file";
  otherStorePath: string | null;
}
```

### DefaultModel
The profile default model (from settings.yaml).

```typescript
interface DefaultModel {
  provider: string | null;
  model: string | null;
  label: string;
}
```

### CompactionLite
Compact compaction summary (excludes summary text).

```typescript
interface CompactionLite {
  seq: number | null;
  endSeq: number | null;
  time: number | null;
  endTime: number | null;
  durationMs: number | null;
  compactionId: string | null;
  hasSummary: boolean;
  summaryChars: number;
  shadowedTokens: number;
  contextBefore: number | null;
  afterTurn: number | null;
  afterStep: number | null;
  error: string | null;
}
```

### SessionTimeline
Per-session timeline data for the breakdown.

```typescript
interface SessionTimeline {
  sessionId: string;
  turns: TurnDetail[];
  events: TimelineEvent[];
}
```

### AggregateModel
Per-model aggregate row.

```typescript
interface AggregateModel {
  model: string;
  key: string;
  label: string;
  provider: string | null;
  copilot: boolean;
  kind: "corp" | "local" | "unknown";
  sessions: number;
  steps: number;
  exact: boolean;
  uncachedInputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  allTokens: number;
  decodeTokens: number;
  decodeMs: number;
  decodeSteps: number;
  tokPerSec: number | null;
  prefillTokens: number;
  prefillMs: number;
  prefillSteps: number;
  promptTokPerSec: number | null;
  avgTtftMs: number | null;
  avgContext: number | null;
  cost: number | null;
}
```

### ToolTokenStat
A per-tool token stat row.

```typescript
interface ToolTokenStat {
  tool: string;
  calls: number;
  min: number;
  avg: number;
  max: number;
  total: number;
  reasoning: number;
  input?: number;
}
```

### AggregatedToolToken
A cross-session aggregated per-tool token stat.

```typescript
interface AggregatedToolToken {
  tool: string;
  sessions: number;
  total: number;
  avgPerSession: number;
  reasoning: number;
  input: number;
}
```

### SessionBreakdownRow
A session row in the breakdown.

```typescript
interface SessionBreakdownRow {
  id: string;
  date: string;
  cwd: string | null;
  title: string | null;
  createdAt: number | null;
  turns: number;
  steps: number;
  llmMs: number;
  buckets: TokenBuckets;
  allTokens: number;
  model: string;
  modelMix: string;
  cost: number | null;
  decodeTokens: number;
  decodeMs: number;
  tokPerSec: number | null;
  toolTokens: ToolTokenStat[] | null;
  compactions: CompactionLite[] | null;
  prunes: number;
  prunedTokens: number;
  p2p: boolean;
  p2pMentions: number;
  turnTimeline: TurnTimeline | null;
  archived: boolean;
}
```

---

## HTTP Endpoints & Response Streams

### GET /token-gobbler/usage
Returns the main usage report.

**Response structure:**
```json
{
  "generatedAt": "ISO string",
  "dshHome": "string",
  "decode": { "tokens": 0, "ms": 0, "steps": 0, "tokPerSec": 0 },
  "prefill": { "tokens": 0, "ms": 0, "steps": 0, "tokPerSec": 0, "avgTtftMs": 0 },
  "compactionSig": "string",
  "sources": {
    "projcache": { "storePath": "string", "storeKind": "dir|file", "sessions": 0, "nonZero": 0 },
    "trajectories": { "sessionsRoot": "string", "files": 0, "withUsage": 0, "usageRecords": 0, "withModelTimeline": 0, "cache": {} }
  },
  "totals": { /* TokenBuckets + allTokens */ },
  "byModel": [ /* AggregateModel[] */ ],
  "sessions": [ /* ProjSession[] */ ],
  "comparison": [ /* cost comparison rows */ ],
  "savings": { /* savings object */ },
  "actualSavings": 0,
  "split": { "wfh": {}, "corp": {} },
  "actual": { /* actual cost info */ },
  "defaultModel": { /* DefaultModel */ },
  "events": { /* EventCounts */ },
  "tools": [ /* tool usage array */ ],
  "toolCalls": [ /* tool call array */ ]
}
```

### GET /token-gobbler/breakdown
Returns the per-day / per-session / per-model breakdown.

**Response structure:**
```json
{
  "defaultModel": { /* DefaultModel */ },
  "byDay": [ /* daily breakdown rows */ ],
  "byModel": [ /* AggregateModel[] */ ],
  "bySession": [ /* SessionBreakdownRow[] */ ],
  "events": { /* EventCounts */ },
  "tools": [ /* tool usage array */ ],
  "toolCalls": [ /* tool call array */ ],
  "toolTokensAggregate": [ /* AggregatedToolToken[] */ ],
  "sources": { /* source info */ }
}
```

### GET /token-gobbler/performance
Returns model performance metrics.

**Response structure:**
```json
{
  "totals": {
    "decode": { "tokens": 0, "ms": 0, "tokPerSec": 0 },
    "prefill": { "tokens": 0, "ms": 0, "steps": 0, "tokPerSec": 0, "avgTtftMs": 0 }
  },
  "byModel": [ /* model performance rows */ ],
  "sessions": [ /* session performance rows */ ]
}
```

### GET /token-gobbler/compaction?session=<id>&index=<n>
Returns full detail of one compaction event.

### GET /token-gobbler/pricing
Returns the user's pricing table.

### POST /token-gobbler/pricing
Saves the user's pricing table.

### GET /token-gobbler/discover-models
Discovers models used in trajectories.

### GET /token-gobbler/summary
Returns a summary of the usage report.

### POST /token-gobbler/reprocess
Forces a full re-parse of all trajectory files.

---

## Client-Side Types

### TgCache
localStorage cache structure.

```typescript
type TgCache = {
  v: 1;
  home: string;
  fp: string;
  at: number;
  usage: any;
  breakdown: any;
  perf: any;
};
```

### EVENT_META
Event category display configuration.

```typescript
const EVENT_META = [
  { key: "steps", label: "LLM steps", color: "#60a5fa" },
  { key: "toolCalls", label: "Tool calls", color: "#a78bfa" },
  { key: "toolSubCalls", label: "Tool runs", color: "#c084fc" },
  { key: "userMessages", label: "Your messages", color: "#34d399" },
  { key: "assistantMessages", label: "Assistant msgs", color: "#2dd4bf" },
  { key: "systemMessages", label: "System msgs", color: "#94a3b8" },
  { key: "turns", label: "Turns", color: "#fbbf24" },
  { key: "userStops", label: "User stops", color: "#f87171" },
  { key: "compactions", label: "Compactions", color: "#f472b6" },
  { key: "retries", label: "LLM retries", color: "#fb923c" },
  { key: "approvals", label: "Approvals", color: "#f87171" },
  { key: "todos", label: "Todo writes", color: "#a3e635" },
  { key: "commands", label: "Commands", color: "#38bdf8" },
];
```

---

## Data Flow Summary

```
DSH Sessions
    ├── Projection Cache (session_projcache.json / session_projcache/)
    │       → Token totals per session (authoritative)
    │
    └── Trajectory Files (*.v3.jsonl.zstd)
            → Per-turn usage, model timeline, tool calls, events, timing

lib/projcache.ts → ProjcacheResult (sessions + totals)
lib/trajectory.ts → ParsedTrajectory[] (per-file parse)
lib/report.ts → Aggregates both sources into reports
lib/pricing.ts → Rate cards + cost calculations

HTTP Endpoints (lib/index.ts)
    → /usage, /breakdown, /performance, /pricing, etc.

Client (client/*.tsx)
    → React hooks fetch data, render dashboard
    → localStorage cache for performance
```

---

## Key Tracking Dimensions

1. **Tokens**: Uncached input, output, cache read, cache write, reasoning
2. **Cost**: Per-model pricing, actual vs. comparison costs, WFH vs. corp split
3. **Performance**: Decode speed (tok/s), prefill speed (tok/s), TTFT
4. **Activity**: Steps, tool calls, user messages, assistant messages, turns
5. **Events**: Compactions, retries, approvals, todos, commands, user stops
6. **Tools**: Per-tool usage counts and token attribution
7. **Models**: Per-model breakdown, model changes, provider tracking
8. **Time**: Per-day breakdown, session timing, turn duration
9. **Context**: Context window, pressure, breakdown (system/tools/messages)
10. **Compaction**: Compaction events, shadowed tokens, summary text
