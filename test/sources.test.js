// token-gobbler · test/sources.test.js
// IMPORTED DSH HOMES (lib/sources.ts + the import path through lib/report.ts).
//
// Three layers:
//   1. the pure registry/layout/OS helpers — every accepted path SHAPE, every
//      rejection, the OS heuristics, the cheap scan;
//   2. the management API — add / update / resync / remove against a temp home;
//   3. the REPORT merge — a home registered as an import must contribute its
//      sessions, tagged with its source id, deduplicated against the local home,
//      and must keep working when it has trajectories but no projection store.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zstdCompressSync } from "node:zlib";

import {
  LOCAL_SOURCE_ID, SOURCES_VERSION, expandPath, sourceId, sourceRegistryPath,
  readSourceRegistry, writeSourceRegistry, enabledSources, resolveSourceLayout,
  layoutError, osFromCwd, detectSourceOs, localOs, sampleCwds, scanSource, markKnown,
} from "../lib/sources.js";
import {
  addImportSource, removeImportSource, updateImportSource, resyncImportSource,
  listImportSources, resolveAllSources, buildReport, buildBreakdown,
} from "../lib/report.js";
import { invalidateTrajectoryCache } from "../lib/trajectory.js";

// ── fixtures ─────────────────────────────────────────────────────────────
const tmp = (p) => mkdtempSync(join(tmpdir(), p));

/** A full DSH home: sessions/ + storages/ (+ optionally a projection store). */
function mkDshHome(prefix, opts = {}) {
  const home = tmp(prefix);
  mkdirSync(join(home, "sessions"), { recursive: true });
  mkdirSync(join(home, "storages"), { recursive: true });
  if (opts.store !== false) writeStore(home, opts.sessions || {});
  return home;
}

/** One projection record in the DIRECTORY store (the current layout). */
function writeProj(home, id, o = {}) {
  const dir = join(home, "storages", "session_projcache", "sessions");
  mkdirSync(dir, { recursive: true });
  const totals = { uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, ...(o.tokens || {}) };
  writeFileSync(join(dir, id + ".json"), JSON.stringify({
    version: 7,
    record: {
      identity: { cwd: o.cwd || "/home/o/proj", createdAt: o.createdAt || 1_700_000_000_000 },
      rows: {
        tokenUsage: { val: { totals } },
        ...(o.title ? { title: { val: o.title } } : {}),
      },
    },
  }));
}

/** Sessions in the LEGACY single-file store. */
function writeStore(home, sessions) {
  mkdirSync(join(home, "storages"), { recursive: true });
  writeFileSync(join(home, "storages", "session_projcache.json"), JSON.stringify({ tables: { sessions } }));
}

/** One v3 trajectory under <home>/sessions/<encoded cwd>/<id>/. */
function writeTraj(home, id, o = {}) {
  const dir = join(home, "sessions", o.bucket || "--proj--", id);
  mkdirSync(dir, { recursive: true });
  const rows = [{ type: "session", version: 3, id, cwd: o.cwd || "/home/o/proj" }];
  if (o.model) rows.push({ type: "request/context", data: { provider: o.provider || "llamaserver", model: o.model } });
  for (let i = 1; i <= (o.steps || 0); i++) {
    rows.push({ type: "step/start", seq: i * 2, time: 1000 + i * 1000, data: { turn: 1, step: i } });
    rows.push({ type: "assistant/chunk", data: { turn: 1, step: i, chunk: { type: "usage", usage: { inputTokens: o.inputTokens || 100, outputTokens: o.outputTokens || 10 } } } });
    rows.push({ type: "step/end", seq: i * 2 + 1, time: 1500 + i * 1000, data: { turn: 1, step: i } });
  }
  const name = o.legacy ? "session.jsonl.zstd" : "session.v3.jsonl.zstd";
  writeFileSync(join(dir, name), zstdCompressSync(Buffer.from(rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8")));
  return join(dir, name);
}

/** Register an import the way the settings card does. */
const add = (home, path, extra = {}) => addImportSource(home, { path, ...extra });

// ── 1 · pure helpers ─────────────────────────────────────────────────────
test("expandPath: ~, quotes and trailing noise are normalised", () => {
  assert.ok(expandPath("~/x").endsWith("/x"));
  assert.equal(expandPath('"/media/disk/.dsh"'), "/media/disk/.dsh");
  assert.equal(expandPath("'/media/disk/.dsh'"), "/media/disk/.dsh");
  assert.equal(expandPath("  /media/disk/.dsh  "), "/media/disk/.dsh");
});

test("sourceId: slugged, unique, and never 'local'", () => {
  assert.equal(sourceId("Sabrent · Ohan", []), "sabrent-ohan");
  assert.equal(sourceId("local", []), "local-2"); // the id of the local home is reserved
  assert.equal(sourceId("Sabrent", ["sabrent"]), "sabrent-2");
  assert.equal(sourceId("", []), "source");
});

test("registry: round-trip, versioning, and a corrupt file degrades to empty", () => {
  const home = tmp("tg-src-reg-");
  assert.deepEqual(readSourceRegistry(home), { version: SOURCES_VERSION, sources: [] }); // missing file
  const source = {
    id: "win", label: "Windows 3090", path: "/mnt/win/.dsh", os: "windows", osAuto: true,
    enabled: true, addedAt: 1, lastSyncAt: 2, error: null,
    stats: { sessions: 3, legacySessions: 1, files: 4, bytes: 5, tokens: 6, newest: 7 },
  };
  writeSourceRegistry(home, { version: SOURCES_VERSION, sources: [source] });
  assert.deepEqual(readSourceRegistry(home).sources, [source]);
  assert.equal(enabledSources(home).length, 1);
  writeFileSync(sourceRegistryPath(home), "{not json");
  assert.deepEqual(readSourceRegistry(home).sources, []);
});

test("registry: unusable entries are dropped, duplicate ids are not allowed to shadow", () => {
  const home = tmp("tg-src-reg2-");
  mkdirSync(join(home, "token-gobbler"), { recursive: true });
  writeFileSync(sourceRegistryPath(home), JSON.stringify({ sources: [
    { id: "a", path: "/x", os: "windows" },
    { id: "a", path: "/y" },              // same id -> dropped
    { id: LOCAL_SOURCE_ID, path: "/z" },  // would shadow the local home -> dropped
    { path: "/no-id" },                   // no id -> dropped
    null,
  ]}));
  const reg = readSourceRegistry(home);
  assert.equal(reg.sources.length, 1);
  assert.equal(reg.sources[0].id, "a");
  assert.equal(reg.sources[0].os, "windows");
  assert.equal(reg.sources[0].enabled, true); // defaults
  assert.equal(reg.sources[0].osAuto, true);
});

test("resolveSourceLayout: a full .dsh home resolves both projection stores", () => {
  const home = mkDshHome("tg-src-home-");
  writeProj(home, "s-1");
  writeStore(home, {});
  const l = resolveSourceLayout(home);
  assert.equal(l.dshHome, home);
  assert.equal(l.sessionsRoot, join(home, "sessions"));
  assert.equal(l.storePath, join(home, "storages", "session_projcache"));
  assert.equal(l.otherStorePath, join(home, "storages", "session_projcache.json"));
  assert.equal(layoutError(l), null);
});

test("resolveSourceLayout: the sessions folder alone infers its home", () => {
  const home = mkDshHome("tg-src-sess-");
  writeProj(home, "s-1");
  writeTraj(home, "s-1", { steps: 1 });
  const l = resolveSourceLayout(join(home, "sessions"));
  assert.equal(l.dshHome, home);
  assert.equal(l.storePath, join(home, "storages", "session_projcache"));
  assert.equal(layoutError(l), null);
});

test("resolveSourceLayout: a bare copy of a sessions tree is importable (no store)", () => {
  const root = tmp("tg-src-bare-");
  const dir = join(root, "session-abc");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "session.v3.jsonl.zstd"), zstdCompressSync(Buffer.from('{"type":"session","version":3,"id":"session-abc"}\n')));
  const l = resolveSourceLayout(root);
  assert.equal(l.sessionsRoot, root);
  assert.equal(l.storePath, null);
  assert.equal(l.hasSessions, true);
  assert.equal(layoutError(l), null);
});

test("resolveSourceLayout: a projection store (dir or legacy file) can be registered directly", () => {
  const home = mkDshHome("tg-src-store-");
  writeProj(home, "s-1");
  writeStore(home, { "s-2": { identity: { cwd: "C:\\git\\x" }, rows: {} } });
  const dir = resolveSourceLayout(join(home, "storages", "session_projcache"));
  assert.equal(dir.storePath, join(home, "storages", "session_projcache"));
  assert.equal(dir.dshHome, home);
  const file = resolveSourceLayout(join(home, "storages", "session_projcache.json"));
  assert.equal(file.storePath, join(home, "storages", "session_projcache.json"));
  assert.equal(file.dshHome, home);
  assert.equal(layoutError(file), null);
});

test("resolveSourceLayout + layoutError: unusable paths say why", () => {
  const missing = resolveSourceLayout("/definitely/not/here/at/all");
  assert.match(layoutError(missing), /path not found/);
  const empty = tmp("tg-src-empty-");
  assert.match(layoutError(resolveSourceLayout(empty)), /no DSH sessions found/);
});

test("osFromCwd: windows / macos / linux / unknown", () => {
  assert.equal(osFromCwd("C:\\git\\proj"), "windows");
  assert.equal(osFromCwd("D:\\models"), "windows");
  assert.equal(osFromCwd("\\\\server\\share\\proj"), "windows");
  assert.equal(osFromCwd("/Users/ohan/proj"), "macos");
  assert.equal(osFromCwd("/Volumes/backup/proj"), "macos");
  assert.equal(osFromCwd("/home/ohan/proj"), "linux");
  assert.equal(osFromCwd("/mnt/data/proj"), "linux");
  assert.equal(osFromCwd(""), "unknown");
  assert.equal(osFromCwd("relative/path"), "unknown");
});

test("detectSourceOs: the sessions' own cwds win over where the drive is mounted", () => {
  const layout = resolveSourceLayout("/media/ohan/Sabrent/Users/Ohan/.dsh");
  const d = detectSourceOs(layout, ["D:\\models\\qwen", "C:\\git\\x", "/home/ohan/stray"]);
  assert.equal(d.os, "windows"); // 2 windows vs 1 linux
  assert.match(String(d.evidence), /^D:/);
  // No cwd yet: fall back to the mount shape (/mnt/c/... and .../Users/<u>/.dsh are Windows volumes).
  assert.equal(detectSourceOs(resolveSourceLayout("/mnt/c/Users/Ohan/.dsh"), []).os, "windows");
  assert.equal(detectSourceOs(resolveSourceLayout("/Volumes/backup/.dsh"), []).os, "macos");
  assert.equal(detectSourceOs(resolveSourceLayout("/srv/dsh"), []).os, "linux"); // a POSIX path is a Linux home
  assert.equal(detectSourceOs(resolveSourceLayout("dsh-copy"), []).os, "unknown"); // nothing to go on at all
});

test("scanSource: counts both stores and the trajectory files without parsing them", () => {
  const home = mkDshHome("tg-src-scan-");
  writeProj(home, "s-1", { tokens: { uncachedInputTokens: 100, outputTokens: 50 } });
  writeProj(home, "s-2", { tokens: { uncachedInputTokens: 10 } });
  writeStore(home, {
    "s-3": { identity: { cwd: "/x" }, rows: { tokenUsage: { val: { totals: { uncachedInputTokens: 5, outputTokens: 5 } } } } },
  });
  writeTraj(home, "s-1", { steps: 1 });
  writeTraj(home, "s-2", { steps: 1 });
  const stats = scanSource(resolveSourceLayout(home));
  assert.equal(stats.sessions, 2);
  assert.equal(stats.legacySessions, 1);
  assert.equal(stats.files, 2);
  assert.ok(stats.bytes > 0);
  assert.equal(stats.tokens, 170); // both stores, v0 file included
  assert.ok(stats.newest > 0);
});

test("sampleCwds: reads the cwds the OS detection needs", () => {
  const home = mkDshHome("tg-src-cwd-");
  writeProj(home, "s-1", { cwd: "C:\\git\\one" });
  writeProj(home, "s-2", { cwd: "D:\\git\\two" });
  const cwds = sampleCwds(resolveSourceLayout(home));
  assert.deepEqual(cwds.sort(), ["C:\\git\\one", "D:\\git\\two"]);
});

test("markKnown: flags candidates that are already registered", () => {
  const home = mkDshHome("tg-src-known-");
  const v = add(home, home);
  const cands = [{ path: home, label: "x", os: "linux", sessions: 0, files: 0, tokens: 0, known: false },
                 { path: "/elsewhere", label: "y", os: "linux", sessions: 0, files: 0, tokens: 0, known: false }];
  const marked = markKnown(cands, readSourceRegistry(home).sources);
  assert.equal(marked[0].known, true);
  assert.equal(marked[1].known, false);
  assert.equal(v.os, localOs());
});

// ── 2 · management API ───────────────────────────────────────────────────
test("addImportSource: registers, detects the OS, and rejects the unusable", () => {
  const local = mkDshHome("tg-src-local-");
  const win = mkDshHome("tg-src-win-");
  writeProj(win, "w-1", { cwd: "C:\\git\\proj", tokens: { uncachedInputTokens: 1000 } });
  const v = add(local, win, { label: "Windows 3090" });
  assert.equal(v.id, "windows-3090");
  assert.equal(v.os, "windows");
  assert.equal(v.osAuto, true);
  assert.equal(v.enabled, true);
  assert.equal(v.scan.sessions, 1);
  assert.equal(readSourceRegistry(local).sources.length, 1);

  assert.throws(() => add(local, win), /already imported/);
  assert.throws(() => add(local, "/no/such/dir"), /path not found/);
  const empty = tmp("tg-src-empty2-");
  assert.throws(() => add(local, empty), /no DSH sessions found/);
  assert.throws(() => addImportSource(local, {}), /path is required/);
});

test("addImportSource: an explicit OS overrides detection and stops auto-refresh", () => {
  const local = mkDshHome("tg-src-os-");
  const other = mkDshHome("tg-src-os2-");
  writeProj(other, "o-1", { cwd: "C:\\git\\proj" });
  const v = add(local, other, { os: "linux" });
  assert.equal(v.os, "linux");
  assert.equal(v.osAuto, false);
});

test("addImportSource: an unnamed source gets a readable default label", () => {
  const local = mkDshHome("tg-src-lbl-");
  const other = mkDshHome("tg-src-lbl2-");
  writeProj(other, "l-1");
  const v = add(local, other);
  assert.match(v.label, /tg-src-lbl2-/);
});

test("updateImportSource: rename, force an OS, pause and resume", () => {
  const local = mkDshHome("tg-src-up-");
  const other = mkDshHome("tg-src-up2-");
  writeProj(other, "u-1", { cwd: "D:\\models" });
  const v = add(local, other);
  assert.equal(updateImportSource(local, v.id, { label: "Laptop" }).label, "Laptop");
  assert.equal(updateImportSource(local, v.id, { os: "macos" }).os, "macos");
  assert.equal(updateImportSource(local, v.id, { os: "auto" }).os, "windows"); // re-detected from D:\\
  const off = updateImportSource(local, v.id, { enabled: false });
  assert.equal(off.enabled, false);
  assert.equal(enabledSources(local).length, 0);
  assert.throws(() => updateImportSource(local, "nope", {}), /unknown source/);
});

test("updateImportSource: the stored error is refreshed when the path disappears", () => {
  const local = mkDshHome("tg-src-err-");
  const other = mkDshHome("tg-src-err2-");
  writeProj(other, "e-1");
  const v = add(local, other);
  // Simulate an unmounted drive by pointing the registry entry at a gone path.
  const reg = readSourceRegistry(local);
  writeSourceRegistry(local, { version: reg.version, sources: reg.sources.map((s) => ({ ...s, path: "/gone/for/good" })) });
  const listed = listImportSources(local)[0];
  assert.match(String(listed.error), /path not found/);
  assert.equal(listed.id, v.id);
});

test("resyncImportSource: re-scans, stamps the time, and drops that home's cached parses", () => {
  const local = mkDshHome("tg-src-rs-");
  const other = mkDshHome("tg-src-rs2-");
  writeProj(other, "r-1", { cwd: "C:\\git\\x" });
  const file = writeTraj(other, "r-1", { steps: 1 });
  const v = add(local, other);
  assert.ok(invalidateTrajectoryCache(join(other, "sessions")) >= 0); // warm the drop path
  const before = readSourceRegistry(local).sources[0];
  writeProj(other, "r-2", { cwd: "C:\\git\\y" });
  const { source, dropped } = resyncImportSource(local, v.id);
  assert.equal(source.scan.sessions, 2, "the new session is picked up");
  assert.ok(source.lastSyncAt >= (before.lastSyncAt || 0));
  assert.equal(source.os, "windows");
  assert.ok(dropped >= 0);
  assert.ok(existsSync(file), "resync never touches the imported files");
  assert.throws(() => resyncImportSource(local, "nope"), /unknown source/);
});

test("removeImportSource: forgets the import, keeps the files, and is idempotent", () => {
  const local = mkDshHome("tg-src-rm-");
  const other = mkDshHome("tg-src-rm2-");
  writeProj(other, "x-1");
  const v = add(local, other);
  assert.deepEqual(removeImportSource(local, v.id).removed, true);
  assert.equal(readSourceRegistry(local).sources.length, 0);
  assert.equal(removeImportSource(local, v.id).removed, false);
  assert.ok(existsSync(other), "the imported home is untouched");
});

test("listImportSources: reports every registered source with a live cheap scan", () => {
  const local = mkDshHome("tg-src-list-");
  const a = mkDshHome("tg-src-list-a-");
  const b = mkDshHome("tg-src-list-b-");
  writeProj(a, "a-1");
  writeProj(b, "b-1", { cwd: "/Users/o/mac" });
  writeTraj(b, "b-1", { steps: 2 });
  add(local, a, { label: "Alpha" });
  add(local, b, { label: "Beta" });
  const list = listImportSources(local);
  assert.deepEqual(list.map((s) => s.label), ["Alpha", "Beta"]);
  assert.equal(list[1].os, "macos");
  assert.equal(list[1].scan.files, 1);
  assert.equal(list[1].live, null); // no report load: the cheap scan is what is shown
});

// ── 3 · the report merge ─────────────────────────────────────────────────
test("buildReport: imported sessions are folded in and tagged with their source", () => {
  const local = mkDshHome("tg-merge-local-");
  writeProj(local, "l-1", { tokens: { uncachedInputTokens: 1000, outputTokens: 100 } });
  writeTraj(local, "l-1", { steps: 1, model: "Qwen3.8-27B-Q6-GGUF" });
  const win = mkDshHome("tg-merge-win-");
  writeProj(win, "w-1", { cwd: "C:\\git\\win", tokens: { uncachedInputTokens: 5000, outputTokens: 500 } });
  writeTraj(win, "w-1", { steps: 1, model: "claude-sonnet-4.6", provider: "github-copilot" });
  const v = add(local, win, { label: "Win box" });

  const rep = buildReport({ dshHome: local });
  assert.equal(rep.sessions.length, 2);
  assert.equal(rep.totals.uncachedInputTokens, 6000);
  const bySource = Object.fromEntries(rep.sessions.map((s) => [s.id, s.source]));
  assert.equal(bySource["l-1"], LOCAL_SOURCE_ID);
  assert.equal(bySource["w-1"], v.id);

  const imported = rep.sources.imported;
  assert.equal(imported.length, 1);
  assert.equal(imported[0].id, v.id);
  assert.equal(imported[0].live.sessions, 1);
  assert.equal(imported[0].live.tokens, 5500);
  assert.equal(imported[0].live.files, 1);
  assert.equal(rep.sources.local.sessions, 1);
  assert.equal(rep.sources.local.os, localOs());

  // The breakdown rows carry the tag the tables mark with, and the client gets
  // the same source block it needs to resolve labels.
  const bd = buildBreakdown({ dshHome: local });
  const row = bd.bySession.find((r) => r.id === "w-1");
  assert.equal(row.source, v.id);
  assert.equal(bd.bySession.find((r) => r.id === "l-1").source, LOCAL_SOURCE_ID);
  assert.equal(bd.sources.imported[0].id, v.id);
  assert.equal(bd.sources.imported[0].scan.sessions, 1);
});

test("buildReport: a session id held by two homes is counted ONCE (this machine wins)", () => {
  const local = mkDshHome("tg-dedup-local-");
  writeProj(local, "same", { tokens: { uncachedInputTokens: 1000 } });
  writeTraj(local, "same", { steps: 1 });
  const other = mkDshHome("tg-dedup-other-");
  writeProj(other, "same", { cwd: "C:\\copy", tokens: { uncachedInputTokens: 999_999 } });
  writeProj(other, "only-here", { cwd: "C:\\copy", tokens: { uncachedInputTokens: 7 } });
  const v = add(local, other);

  const rep = buildReport({ dshHome: local });
  assert.equal(rep.totals.uncachedInputTokens, 1007, "the local copy wins, the imported duplicate is dropped");
  assert.equal(rep.sources.imported[0].live.duplicates, 1);
  assert.equal(rep.sources.imported[0].live.sessions, 1);
  const same = rep.sessions.filter((s) => s.id === "same");
  assert.equal(same.length, 1);
  assert.equal(same[0].source, LOCAL_SOURCE_ID);
});

test("buildReport: an import with trajectories but NO projection store still reports sessions", () => {
  const local = mkDshHome("tg-synth-local-");
  const other = tmp("tg-synth-other-");
  const file = writeTraj(other, "session-abc", { cwd: "D:\\models\\llama", steps: 3, inputTokens: 1000, outputTokens: 100, model: "Qwen3.8-27B-Q4-GGUF" });
  const v = add(local, other);

  const rep = buildReport({ dshHome: local });
  const s = rep.sessions.find((x) => x.id === "session-abc");
  assert.ok(s, "the trajectory-only session is synthesised");
  assert.equal(s.source, v.id);
  assert.equal(s.cwd, "D:\\models\\llama");
  assert.equal(s.steps, 3);
  assert.equal(s.allTokens, 3300);
  assert.equal(rep.sources.imported[0].live.synthetic, 1);
  const bd = buildBreakdown({ dshHome: local });
  const row = bd.bySession.find((r) => r.id === "session-abc");
  assert.equal(row.allTokens, 3300);
  assert.equal(row.source, v.id);
  assert.equal(row.model, "Qwen3.8-27B-Q4-GGUF"); // the model comes from the trajectory
  assert.ok(existsSync(file));
});

test("buildReport: a PAUSED import contributes nothing but stays listed", () => {
  const local = mkDshHome("tg-off-local-");
  const other = mkDshHome("tg-off-other-");
  writeProj(other, "o-1", { tokens: { uncachedInputTokens: 1234 } });
  const v = add(local, other);
  updateImportSource(local, v.id, { enabled: false });
  const rep = buildReport({ dshHome: local });
  assert.equal(rep.totals.uncachedInputTokens, 0);
  assert.equal(rep.sources.imported.length, 1);
  assert.equal(rep.sources.imported[0].enabled, false);
  assert.equal(rep.sources.imported[0].live, null);
});

test("buildReport: imports:false reports this machine only", () => {
  const local = mkDshHome("tg-only-local-");
  const other = mkDshHome("tg-only-other-");
  writeProj(other, "o-1", { tokens: { uncachedInputTokens: 1234 } });
  add(local, other);
  assert.equal(buildReport({ dshHome: local }).totals.uncachedInputTokens, 1234);
  assert.equal(buildReport({ dshHome: local, imports: false }).totals.uncachedInputTokens, 0);
});

test("buildReport: an unmounted import is flagged, not fatal", () => {
  const local = mkDshHome("tg-gone-local-");
  const other = mkDshHome("tg-gone-other-");
  writeProj(other, "g-1", { tokens: { uncachedInputTokens: 42 } });
  const v = add(local, other);
  const reg = readSourceRegistry(local);
  writeSourceRegistry(local, { version: reg.version, sources: reg.sources.map((s) => ({ ...s, path: join(other, "nope") })) });
  const rep = buildReport({ dshHome: local });
  assert.equal(rep.totals.uncachedInputTokens, 0);
  assert.equal(rep.sources.imported[0].id, v.id);
  assert.match(String(rep.sources.imported[0].error), /path not found/);
  assert.equal(rep.sources.imported[0].live, null);
});

test("resolveAllSources: local home first, registry order after, broken ones included", () => {
  const local = mkDshHome("tg-order-local-");
  const a = mkDshHome("tg-order-a-");
  const b = mkDshHome("tg-order-b-");
  writeProj(a, "a-1");
  writeProj(b, "b-1");
  const va = add(local, a, { label: "First" });
  const vb = add(local, b, { label: "Second" });
  const all = resolveAllSources({ dshHome: local });
  assert.deepEqual(all.map((s) => s.id), [LOCAL_SOURCE_ID, va.id, vb.id]);
  assert.equal(all[0].imported, false);
  assert.equal(all[1].imported, true);
  assert.equal(all[1].home, a);
  assert.equal(all[1].storePath, join(a, "storages", "session_projcache"));
});

test("buildReport: archived flags come from EVERY home's own workspace.json", () => {
  const local = mkDshHome("tg-arch-local-");
  writeProj(local, "l-1", { tokens: { uncachedInputTokens: 1 } });
  const other = mkDshHome("tg-arch-other-");
  writeProj(other, "w-1", { tokens: { uncachedInputTokens: 1 } });
  writeFileSync(join(other, "storages", "workspace.json"), JSON.stringify({ global: { archivedSessionIds: ["w-1"] } }));
  add(local, other);
  const bd = buildBreakdown({ dshHome: local });
  assert.equal(bd.bySession.find((r) => r.id === "w-1").archived, true);
  assert.equal(bd.bySession.find((r) => r.id === "l-1").archived, false);
});

// ── 4 · the HTTP route (lib/index.ts host wiring) ────────────────────────
// The plugin mounts /token-gobbler/sources as a PREFIX route: GET lists (and
// scans with ?scan=1), POST runs one action. Driven here through a fake web
// context so the wiring, the method guard and the error mapping are covered.
const mountPlugin = async () => {
  const { apply } = await import("../lib/index.js");
  const routes = [];
  const ctx = {
    inject: (_deps, fn) => fn({
      effect: (f) => { f(); return () => {}; },
      webServer: { register: (r) => { routes.push(r); return () => {}; } },
    }),
  };
  apply(ctx, {});
  return routes;
};

const fakeRes = () => {
  const out = { status: 0, headers: {}, body: undefined, ended: false };
  return {
    out,
    setHeader: (k, v) => { out.headers[k] = v; },
    writeHead: (s, h) => { out.status = s; out.headers = { ...out.headers, ...(h || {}) }; },
    end: (d) => { out.ended = true; out.body = typeof d === "string" ? JSON.parse(d) : d; },
  };
};
const fakeReq = (method, url, body) => {
  const handlers = {};
  const req = {
    method, url,
    on(ev, cb) { (handlers[ev] = handlers[ev] || []).push(cb); return req; },
    destroy() {},
  };
  setTimeout(() => {
    if (body !== undefined) for (const cb of handlers.data || []) cb(Buffer.from(body));
    for (const cb of handlers.end || []) cb();
  }, 0);
  return req;
};
const call = async (route, method, url, body) => {
  const res = fakeRes();
  await route.handler(fakeReq(method, url, body), res);
  return res.out;
};

test("route: GET /token-gobbler/sources lists the registry, POST adds and removes", async () => {
  const local = mkDshHome("tg-route-local-");
  const win = mkDshHome("tg-route-win-");
  writeProj(win, "w-1", { cwd: "C:\\git\\win", tokens: { uncachedInputTokens: 10 } });
  // The LOCAL home comes from DSH_HOME, so point the process at the fixture for
  // the WHOLE test: even the first GET reads the registry, and a developer's real
  // ~/.dsh/token-gobbler/sources.json must never leak into the assertion.
  const prevHome = process.env.DSH_HOME;
  process.env.DSH_HOME = local;
  try {
    const routes = await mountPlugin();
    const route = routes.find((r) => r.path === "/token-gobbler/sources");
    assert.equal(route.kind, "prefix");

    // Empty to start with.
    const empty = await call(route, "GET", "/token-gobbler/sources");
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body.value.sources, []);

    const added = await call(route, "POST", "/token-gobbler/sources", JSON.stringify({ action: "add", path: win, label: "Win box" }));
    assert.equal(added.status, 200);
    assert.equal(added.body.ok, true);
    assert.equal(added.body.value.result.label, "Win box");
    assert.equal(added.body.value.result.os, "windows");
    assert.equal(added.body.value.sources.length, 1);

    const id = added.body.value.result.id;
    const listed = await call(route, "GET", "/token-gobbler/sources");
    assert.equal(listed.body.value.sources[0].id, id);

    const scan = await call(route, "GET", "/token-gobbler/sources?scan=1");
    assert.ok(Array.isArray(scan.body.value.candidates), "?scan=1 returns candidates");

    // A bad path is a 400 with the reason, not a 500.
    const bad = await call(route, "POST", "/token-gobbler/sources", JSON.stringify({ action: "add", path: "/no/such/home" }));
    assert.equal(bad.status, 400);
    assert.match(bad.body.error, /path not found/);

    // Unknown action.
    const unknown = await call(route, "POST", "/token-gobbler/sources", JSON.stringify({ action: "explode" }));
    assert.equal(unknown.status, 400);
    assert.match(unknown.body.error, /unknown action/);

    const paused = await call(route, "POST", "/token-gobbler/sources", JSON.stringify({ action: "update", id, enabled: false }));
    assert.equal(paused.body.value.result.enabled, false);

    const resynced = await call(route, "POST", "/token-gobbler/sources", JSON.stringify({ action: "resync", id }));
    assert.equal(resynced.status, 200);
    assert.ok(resynced.body.value.result.source.lastSyncAt > 0);

    const removed = await call(route, "POST", "/token-gobbler/sources", JSON.stringify({ action: "remove", id }));
    assert.equal(removed.body.value.result.removed, true);
    assert.deepEqual(removed.body.value.sources, []);

    // Method guard.
    const wrong = await call(route, "DELETE", "/token-gobbler/sources");
    assert.equal(wrong.status, 405);
    assert.equal(wrong.headers.allow, "GET, POST");
  } finally {
    if (prevHome === undefined) delete process.env.DSH_HOME; else process.env.DSH_HOME = prevHome;
  }
});

test("route: the report the dashboard polls carries the imported source views", async () => {
  const local = mkDshHome("tg-route2-local-");
  const win = mkDshHome("tg-route2-win-");
  writeProj(win, "w-2", { cwd: "D:\\models", tokens: { uncachedInputTokens: 77 } });
  const routes = await mountPlugin();
  const route = routes.find((r) => r.path === "/token-gobbler/sources");
  const usageRoute = routes.find((r) => r.path === "/token-gobbler/usage");
  const prevHome = process.env.DSH_HOME;
  process.env.DSH_HOME = local;
  try {
    await call(route, "POST", "/token-gobbler/sources", JSON.stringify({ action: "add", path: win }));
    const usage = await call(usageRoute, "GET", "/token-gobbler/usage");
    assert.equal(usage.status, 200);
    assert.equal(usage.body.value.totals.uncachedInputTokens, 77);
    assert.equal(usage.body.value.sources.imported.length, 1);
    assert.equal(usage.body.value.sources.imported[0].live.sessions, 1);
    assert.equal(usage.body.value.sources.local.sessions, 0);
    assert.equal(usage.body.value.sessions[0].source, usage.body.value.sources.imported[0].id);
  } finally {
    if (prevHome === undefined) delete process.env.DSH_HOME; else process.env.DSH_HOME = prevHome;
  }
});
