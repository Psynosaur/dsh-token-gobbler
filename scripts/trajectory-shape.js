#!/usr/bin/env node
// token-gobbler · scripts/trajectory-shape.js
// Snapshot the SHAPE of the DSH session trajectories Token Gobbler reads, so a
// future DSH release that changes the on-disk format is DETECTED as a diff
// instead of silently zeroing the numbers.
//
//   node scripts/trajectory-shape.js                     # shape of this project's sessions
//   node scripts/trajectory-shape.js --root ~/.dsh/sessions
//   node scripts/trajectory-shape.js --session <dir|file> [--session …]
//   node scripts/trajectory-shape.js --out docs/trajectory-shapes.md
//   node scripts/trajectory-shape.js --compare <snapshot.json> [--compare <snapshot.json>]
//
// A snapshot is written as Markdown with the machine-readable shape embedded in a
// fenced JSON block, so it is both readable in the repo and re-loadable by
// --compare on any later release. See lib/trajectory.ts ("FORMAT VERSIONS") for
// the field-level meaning of the two versions.
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";

import { assertNode } from "./runtime.js";
assertNode();

const { findTrajectoryFiles, readTrajectory, formatVersionName, mergeShapes, diffShape } = await import("../lib/trajectory.js");

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const flagAll = (name) => argv.reduce((acc, a, i) => (a === name && argv[i + 1] ? [...acc, argv[i + 1]] : acc), []);

/** Expand CLI inputs into the list of trajectory files to read. */
function resolveFiles() {
  const root = flag("--root") || join(homedir(), ".dsh", "sessions");
  const explicit = flagAll("--session");
  if (explicit.length) {
    const files = [];
    for (const p of explicit) {
      const full = isAbsolute(p) ? p : resolve(process.cwd(), p);
      if (!existsSync(full)) continue;
      if (statSync(full).isDirectory()) files.push(...findTrajectoryFiles(full));
      else files.push(full);
    }
    return { files, mode: "explicit", root: null };
  }
  // Default: the whole sessions ROOT (every workspace), so a format only used by
  // another project is still seen. `--session` narrows to particular sessions.
  return { files: findTrajectoryFiles(root), mode: "root", root };
}

const { files, mode: scanMode, root: scanRoot } = resolveFiles();
if (!files.length) {
  console.error("no trajectory files found (pass --root or --session)");
  process.exit(2);
}
/** A session directory carries `session.lock` while it is LIVE (being written). */
const fileIsLive = (f) => existsSync(join(dirname(f), "session.lock"));

// ── read + shape every file ─────────────────────────────────────────────────
const label = (f) => {
  const parts = f.split("/");
  return parts.slice(-2).join("/");
};
const rows = [];
let liveSkipped = 0;
for (const f of files) {
  const live = fileIsLive(f);
  if (live && !argv.includes("--include-live")) { liveSkipped++; continue; }
  let t = null;
  try { t = readTrajectory(f); } catch { /* unreadable */ }
  if (!t) { rows.push({ file: f, label: label(f), error: true, live }); continue; }
  rows.push({ file: f, label: label(f), shape: t.shape, version: t.formatVersion, live, records: Object.values(t.shape.counts).reduce((a, b) => a + b, 0) });
}
if (!rows.length) {
  console.error("nothing to snapshot" + (liveSkipped ? ` (${liveSkipped} live session(s) skipped; pass --include-live)` : ""));
  process.exit(2);
}
rows.sort((a, b) => (a.version ?? -1) - (b.version ?? -1) || a.label.localeCompare(b.label));

// ── group by format version (what a snapshot actually pins) ─────────────────
const byVersion = new Map();
for (const r of rows) {
  if (r.error) continue;
  const key = r.version === null ? "null" : String(r.version);
  if (!byVersion.has(key)) byVersion.set(key, []);
  byVersion.get(key).push(r);
}
const groups = [...byVersion.entries()]
  .map(([version, rs]) => ({ version: version === "null" ? null : Number(version), rows: rs, merged: mergeShapes(rs.map((r) => r.shape)) }))
  .sort((a, b) => (a.version ?? -1) - (b.version ?? -1));

// ── compare against stored snapshots ────────────────────────────────────────
/** Read a snapshot file: a full JSON snapshot, or Markdown with an embedded ```json block. */
function loadSnapshot(p) {
  const text = readFileSync(p, "utf8");
  try { return JSON.parse(text); } catch { /* markdown */ }
  const fence = text.match(/```json\s*([\s\S]*?)```/);
  if (!fence) throw new Error(p + ": no JSON snapshot found");
  return JSON.parse(fence[1]);
}
const compares = flagAll("--compare");
const snapshot = {
  tool: "token-gobbler/trajectory-shape",
  generatedBy: process.argv.slice(1).join(" "),
  liveSessionsSkipped: liveSkipped,
  liveSessionsIncluded: argv.includes("--include-live"),
  formats: groups.map((g) => ({
    version: g.version,
    name: formatVersionName(g.version),
    sessions: g.rows.length,
    records: g.rows.reduce((n, r) => n + (r.records || 0), 0),
    shape: g.merged,
  })),
};

if (compares.length) {
  let anyDiff = false;
  for (const cp of compares) {
    let other;
    try { other = loadSnapshot(cp); } catch (e) { console.error("cannot read " + cp + ": " + e.message); process.exit(2); }
    console.log(`\n=== ${cp} vs current sessions ===`);
    const otherByVersion = new Map((other.formats || []).map((f) => [f.version, f]));
    const currentByVersion = new Map(snapshot.formats.map((f) => [f.version, f]));
    // A format that is only in the snapshot can only be judged "gone" when this
    // run scanned the same scope (the whole sessions root). A narrow or
    // live-session-excluding scan simply may not contain it.
    const comparable = scanMode === "root" && !!other.liveSessionsIncluded === snapshot.liveSessionsIncluded;
    for (const cf of snapshot.formats) {
      const of = otherByVersion.get(cf.version);
      if (!of) { console.log(`  format ${formatVersionName(cf.version)}: NEW — not present in the snapshot (a new on-disk format appeared)`); anyDiff = true; continue; }
      const ds = diffShape(of.shape, cf.shape);
      if (!ds.length) { console.log(`  format ${formatVersionName(cf.version)}: unchanged ✓`); continue; }
      anyDiff = true;
      console.log(`  format ${formatVersionName(cf.version)}: ${ds.length} change(s)`);
      for (const d of ds) console.log(`      [${d.kind}] ${d.detail.length > 300 ? d.detail.slice(0, 300) + "…" : d.detail}`);
    }
    const missing = (other.formats || []).filter((f) => !currentByVersion.has(f.version));
    if (missing.length) {
      if (comparable) {
        for (const m of missing) { console.log(`  format ${formatVersionName(m.version)}: GONE — in the snapshot but no session of it was scanned`); anyDiff = true; }
      } else {
        console.log(`  (not observed here: ${missing.map((m) => formatVersionName(m.version)).join(", ")}) — scan scope differs: ${scanMode === "root" ? "live-session scope" : "narrowed by --session"}`);
      }
    }
  }
  process.exit(anyDiff ? 1 : 0);
}

// ── human report ────────────────────────────────────────────────────────────
const text = renderMarkdown(snapshot);
const out = flag("--out");
if (out) {
  const p = isAbsolute(out) ? out : resolve(process.cwd(), out);
  writeFileSync(p, text);
  console.error("wrote " + p + " (" + groups.map((g) => `${g.rows.length}× ${formatVersionName(g.version)}`).join(", ") + ")");
} else {
  process.stdout.write(text);
}

function renderMarkdown(snap) {
  const lines = [];
  lines.push("# DSH trajectory shape snapshot");
  lines.push("");
  lines.push("Generated by `npm run report:shape` (`scripts/trajectory-shape.js`). Token Gobbler reads DSH");
  lines.push("session trajectories from `~/.dsh/sessions/<workspace>/<session-id>/`; this file records the");
  lines.push("SHAPE of what it parses — record types, structural keys, closed value sets and the nested v3");
  lines.push("stream entry kinds — so a future DSH release that changes the on-disk format shows up as a diff.");
  lines.push("");
  lines.push("Compare at any time with:");
  lines.push("");
  lines.push("```sh");
  lines.push("node scripts/trajectory-shape.js --compare docs/trajectory-shapes.md   # exit 1 when the format moved");
  lines.push("```");
  lines.push("");
  lines.push("Format history (what changed between versions, for a human reader):");
  lines.push("");
  lines.push("- **v0** — `session.jsonl.zstd`. One TOP-LEVEL record per streaming chunk:");
  lines.push("  `assistant/chunk` (`chunk.type` `block-start`/`reasoning-delta`/`tool-call-delta`/`usage`/`finish`),");
  lines.push("  plus `text-chunks` / `tool-call-chunks` / `reasoning-chunks` batch records. The usage chunk is the");
  lines.push("  per-step token source; `chunk.finish.replayState.response` carries the serving model; the system");
  lines.push("  prompt sits in `request/header.header.system`.");
  lines.push("- **v3** — `session.v3.jsonl.zstd`. The whole stream is NESTED in `assistant/message.data.stream`");
  lines.push("  (same entry kinds, flattened one level: `time0`/`dt`/`texts`/`args` at entry level), there are NO");
  lines.push("  top-level chunk records, `data.usage` mirrors the stream's usage chunk (and `finish` no longer");
  lines.push("  carries `replayState`), the system prompt moved to a new `system/message` record, and the header");
  lines.push("  gained `isSeeded`. Both versions are parsed by the same pass (see `lib/trajectory.ts`).");
  lines.push("");
  for (const g of snap.formats) {
    const s = g.shape;
    lines.push(`## ${formatVersionName(g.version)}`);
    lines.push("");
    lines.push(`Sessions sampled: ${g.sessions} · records: ${g.records}${g.live ? " (includes live sessions)" : ""}`);
    lines.push("");
    lines.push("| record type | count | structure |");
    lines.push("| --- | ---: | --- |");
    for (const [t, n] of Object.entries(s.counts)) {
      const shape = JSON.stringify(s.types[t] ?? null);
      lines.push(`| \`${t}\` | ${n} | \`${shape.length > 260 ? shape.slice(0, 260) + "…" : shape}\` |`);
    }
    lines.push("");
    if (Object.keys(s.streamKinds).length) {
      lines.push("Nested `assistant/message.data.stream[]` entry kinds (v3):");
      lines.push("");
      for (const [k, n] of Object.entries(s.streamKinds)) lines.push(`- \`${k}\` × ${n}`);
      lines.push("");
    }
    if (Object.keys(s.valueSets).length) {
      lines.push("Value sets the parser keys on:");
      lines.push("");
      for (const [p, vs] of Object.entries(s.valueSets)) lines.push(`- \`${p}\` → ${vs.map((v) => JSON.stringify(v)).join(", ")}`);
      lines.push("");
    }
  }
  lines.push("## Machine-readable snapshot");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(snap, null, 1));
  lines.push("```");
  lines.push("");
  return lines.join("\n");
}
