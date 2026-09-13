// token-gobbler · sources.ts
// IMPORTED DSH HOMES — the "other OS" side of the dashboard.
//
// Token Gobbler natively reads ONE DSH home (env DSH_HOME or ~/.dsh). This module
// lets the user register ADDITIONAL homes that live somewhere else on the machine:
// a Windows install mounted from an NTFS volume (/media/<user>/<drive>/Users/<u>/.dsh),
// a macOS home on /Volumes, a nightly rsync of a laptop's ~/.dsh, a bare copy of a
// "sessions" folder. Registered homes are read alongside the local one and every
// session they contribute is tagged with its origin, so the dashboard can mark it
// ("🪟 win-3090") instead of silently mixing machines together.
//
// The registry is a small JSON file in the LOCAL home (never in the imported one —
// an import is read-only and must stay that way):
//
//   <dshHome>/token-gobbler/sources.json
//   { "version": 1, "sources": [ { id, label, path, os, osAuto, enabled, addedAt,
//                                  lastSyncAt, error, stats } ] }
//
// Everything here is defensive: an unreadable registry, a malformed entry or a
// source whose drive got unmounted must never take the dashboard down — they
// degrade to "no imports" or to a source row that carries an error string.

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import type { Dirent } from "node:fs";
import { basename, dirname, join, normalize, resolve } from "node:path";
import { homedir, userInfo } from "node:os";

/** The operating system a DSH home came from (drives the icon + the label). */
export type SourceOs = "linux" | "windows" | "macos" | "unknown";
/** The id of the always-present local home. */
export const LOCAL_SOURCE_ID = "local";
/** Registry schema version (bump when the stored shape changes). */
export const SOURCES_VERSION = 1;

/** A cheap scan of one imported home: what is there, without parsing trajectories. */
export interface SourceScan {
  /** Sessions in the projection store (dir store + legacy file, deduped by id). */
  sessions: number;
  /** Sessions in the legacy single-file store only (informational). */
  legacySessions: number;
  /** Trajectory files (*.zstd) found under the sessions root. */
  files: number;
  /** Bytes of those trajectory files. */
  bytes: number;
  /** Tokens metered by the projection store(s) — legacy file included. */
  tokens: number;
  /** Newest trajectory mtime (ms), or null when there are none. */
  newest: number | null;
}

/** One registered import. */
export interface ImportSource {
  /** Stable slug, unique inside the registry ("local" is reserved). */
  id: string;
  /** User-visible name. */
  label: string;
  /** The path the user registered (absolute, ~ expanded). */
  path: string;
  /** Operating system the home came from. */
  os: SourceOs;
  /** True while os still comes from detection — a resync may then refine it. */
  osAuto: boolean;
  /** Disabled sources stay registered (and keep their stats) but are not read. */
  enabled: boolean;
  addedAt: number;
  lastSyncAt: number | null;
  /** Last resolution/scan failure ("path not found", "no sessions found", …). */
  error: string | null;
  /** Last successful scan. */
  stats: SourceScan | null;
}

/** The on-disk registry. */
export interface SourceRegistry {
  version: number;
  sources: ImportSource[];
}

/** Where an imported path actually keeps its data. */
export interface SourceLayout {
  /** The registered path, resolved. */
  root: string;
  /** The DSH home it belongs to, when one could be identified. */
  dshHome: string | null;
  /** Where the trajectory files live (may not exist yet). */
  sessionsRoot: string;
  /** The per-session projection store (directory layout), when present. */
  storePath: string | null;
  /** The legacy single-file projection store, when present. */
  otherStorePath: string | null;
  /** The sessions root really holds session directories. */
  hasSessions: boolean;
  /** A projection store was found. */
  hasStore: boolean;
}

/** Empty scan (a source with neither store nor trajectories). */
export const emptyScan = (): SourceScan => ({ sessions: 0, legacySessions: 0, files: 0, bytes: 0, tokens: 0, newest: null });

// ── paths ────────────────────────────────────────────────────────────────

/** Expand a leading ~ (and ~user) and normalise; never resolves against cwd. */
export function expandPath(p: string): string {
  let s = String(p || "").trim();
  // A pasted path may arrive quoted ("/media/x/.dsh") or with a trailing separator.
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  if (s === "~") return homedir();
  if (s.startsWith("~/") || s.startsWith("~\\")) return join(homedir(), s.slice(2));
  return normalize(s);
}

/** Where the registry lives (beside pricing.json, in the LOCAL home). */
export function sourceRegistryPath(dshHome: string): string {
  return join(dshHome, "token-gobbler", "sources.json");
}

const isDir = (p: string): boolean => { try { return statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p: string): boolean => { try { return statSync(p).isFile(); } catch { return false; } };

// ── registry I/O ─────────────────────────────────────────────────────────

const OS_VALUES: SourceOs[] = ["linux", "windows", "macos", "unknown"];

/** Coerce one stored entry; null when it is unusable (no id/path). */
function normalizeStoredSource(raw: unknown): ImportSource | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id.trim() : "";
  const path = typeof r.path === "string" ? r.path.trim() : "";
  if (!id || !path) return null;
  const os = OS_VALUES.includes(r.os as SourceOs) ? (r.os as SourceOs) : "unknown";
  const stats = r.stats && typeof r.stats === "object" ? (r.stats as SourceScan) : null;
  return {
    id,
    label: typeof r.label === "string" && r.label.trim() ? r.label.trim() : basename(path) || id,
    path,
    os,
    osAuto: r.osAuto !== false,
    enabled: r.enabled !== false,
    addedAt: typeof r.addedAt === "number" ? r.addedAt : Date.now(),
    lastSyncAt: typeof r.lastSyncAt === "number" ? r.lastSyncAt : null,
    error: typeof r.error === "string" ? r.error : null,
    stats: stats ? { ...emptyScan(), ...stats } : null,
  };
}

/** Read the registry. Missing/corrupt file -> an empty registry (never throws). */
export function readSourceRegistry(dshHome: string): SourceRegistry {
  try {
    const raw = JSON.parse(readFileSync(sourceRegistryPath(dshHome), "utf8")) as { version?: unknown; sources?: unknown };
    const list = Array.isArray(raw?.sources) ? raw.sources : [];
    const sources: ImportSource[] = [];
    const seen = new Set<string>([LOCAL_SOURCE_ID]);
    for (const entry of list) {
      const s = normalizeStoredSource(entry);
      if (!s || seen.has(s.id)) continue; // drop duplicate ids rather than shadow a source
      seen.add(s.id);
      sources.push(s);
    }
    return { version: typeof raw?.version === "number" ? raw.version : SOURCES_VERSION, sources };
  } catch {
    return { version: SOURCES_VERSION, sources: [] };
  }
}

/** Persist the registry atomically (temp file + rename). */
export function writeSourceRegistry(dshHome: string, registry: SourceRegistry): void {
  const file = sourceRegistryPath(dshHome);
  mkdirSync(dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  writeFileSync(tmp, JSON.stringify({ version: SOURCES_VERSION, sources: registry.sources }, null, 2) + "\n");
  renameSync(tmp, file);
}

/** Only the sources that should be read (registered + enabled). */
export function enabledSources(dshHome: string): ImportSource[] {
  return readSourceRegistry(dshHome).sources.filter((s) => s.enabled);
}

/** A unique slug for a new source id. */
export function sourceId(label: string, taken: Iterable<string>): string {
  const base = String(label || "source").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "source";
  const used = new Set(taken);
  if (base !== LOCAL_SOURCE_ID && !used.has(base)) return base;
  for (let i = 2; i < 1000; i++) { const id = base + "-" + i; if (!used.has(id)) return id; }
  return base + "-" + Date.now();
}

// ── layout resolution ────────────────────────────────────────────────────

/** Bounded walk that answers "are there trajectory files under here?". */
function probeTrajectories(root: string, limit = 1, maxDirs = 400): number {
  let found = 0;
  const queue: { dir: string; depth: number }[] = [{ dir: root, depth: 0 }];
  let visited = 0;
  while (queue.length && found < limit && visited < maxDirs) {
    const { dir, depth } = queue.shift() as { dir: string; depth: number };
    visited++;
    let entries: Dirent[];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith(".zstd")) { found++; if (found >= limit) break; }
      else if (e.isDirectory() && depth < 3 && e.name !== "node_modules" && e.name !== ".git") queue.push({ dir: join(dir, e.name), depth: depth + 1 });
    }
  }
  return found;
}

/**
 * Does <dir> look like a projection STORE rather than a home or a sessions tree?
 * Either it is named like one, or it (or its own sessions/ subfolder) holds
 * per-session JSON records and NO trajectories.
 */
function looksLikeStoreDir(dir: string): boolean {
  if (basename(dir) === "session_projcache") return true;
  if (probeTrajectories(dir) > 0) return false; // holds trajectories -> a sessions tree
  const inner = isDir(join(dir, "sessions")) ? join(dir, "sessions") : dir;
  try {
    return readdirSync(inner, { withFileTypes: true }).some((e) => e.isFile() && e.name.endsWith(".json") && !e.name.startsWith("."));
  } catch { return false; }
}

/**
 * Work out what an imported path actually is. Accepts, in order of preference:
 *   <home>/.dsh                     a full DSH home (sessions/ + storages/)
 *   <home>/.dsh/sessions            the sessions root (home inferred from the parent)
 *   <home>/.dsh/storages/...        a projection store (dir or the legacy file)
 *   <anywhere>/session-<id>/…       a bare copy of a sessions tree
 * Never throws — an unusable path still returns a layout with hasSessions/hasStore false.
 */
export function resolveSourceLayout(input: string): SourceLayout {
  const root = expandPath(input);
  const layout: SourceLayout = { root, dshHome: null, sessionsRoot: join(root, "sessions"), storePath: null, otherStorePath: null, hasSessions: false, hasStore: false };
  const base = basename(root);

  /** Fill the store fields for a candidate DSH home. */
  const withHome = (home: string): void => {
    layout.dshHome = home;
    layout.sessionsRoot = join(home, "sessions");
    const dirStore = join(home, "storages", "session_projcache");
    const fileStore = join(home, "storages", "session_projcache.json");
    if (isDir(dirStore)) layout.storePath = dirStore;
    if (isFile(fileStore)) { if (layout.storePath) layout.otherStorePath = fileStore; else layout.storePath = fileStore; }
    layout.hasStore = !!layout.storePath;
  };

  if (isFile(root)) {
    // A projection store file registered directly: .../storages/session_projcache.json
    const storages = dirname(root);
    if (basename(storages) === "storages") withHome(dirname(storages));
    layout.storePath = root; // the explicitly registered file wins over a sibling store
    layout.hasStore = true;
    if (!layout.dshHome) layout.sessionsRoot = root; // no home to infer: a store-only import
  } else if (isDir(root)) {
    // Precedence matters: a DSH home also contains a "sessions" folder, and a
    // projection store ALSO contains a "sessions" folder — of JSON files. The
    // definitive home markers (storages/ next to sessions/) are checked first,
    // then the store shapes, and only then a bare tree of trajectories.
    if (isDir(join(root, "storages"))) withHome(root);
    else if (base === "sessions") withHome(dirname(root));
    else if (base === "storages") withHome(dirname(root));
    else if (looksLikeStoreDir(root)) {
      // .../storages/session_projcache, or any folder of per-session JSON records.
      const parent = dirname(root);
      const home = basename(parent) === "storages" ? dirname(parent) : null;
      if (home && isDir(join(home, "sessions"))) withHome(home);
      layout.storePath = root; // exactly what was registered
      layout.hasStore = true;
      if (!layout.dshHome) layout.sessionsRoot = root; // store-only import (tokens, no trajectories)
    } else if (probeTrajectories(root) > 0) {
      layout.sessionsRoot = root; // a bare copy of a sessions tree
    }
    // A home whose sessions dir is absent is still usable (projection totals only).
  }
  layout.hasSessions = isDir(layout.sessionsRoot) && probeTrajectories(layout.sessionsRoot) > 0;
  return layout;
}

/** Human-readable reason a path cannot be imported, or null when it is usable. */
export function layoutError(layout: SourceLayout): string | null {
  if (!existsSync(layout.root)) return "path not found — is the drive mounted?";
  if (!isDir(layout.root) && !isFile(layout.root)) return "path is neither a directory nor a file";
  if (!layout.hasSessions && !layout.hasStore) {
    return "no DSH sessions found — expected a .dsh home (sessions/ + storages/) or a copy of its sessions/ folder";
  }
  return null;
}

// ── OS detection ─────────────────────────────────────────────────────────

/** Sample cwds from a projection store (cheap: a few small JSON reads). */
export function sampleCwds(layout: SourceLayout, limit = 40): string[] {
  const out: string[] = [];
  const push = (v: unknown): void => { if (typeof v === "string" && v) out.push(v); };
  if (layout.storePath && isDir(layout.storePath)) {
    for (const dir of [join(layout.storePath, "sessions"), layout.storePath]) {
      let entries: Dirent[];
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        if (out.length >= limit) break;
        if (!e.isFile() || !e.name.endsWith(".json")) continue;
        try {
          const raw = JSON.parse(readFileSync(join(dir, e.name), "utf8")) as { record?: { identity?: { cwd?: unknown } }; identity?: { cwd?: unknown } };
          push((raw?.record || raw)?.identity?.cwd);
        } catch { /* skip unreadable entry */ }
      }
      if (out.length) break;
    }
  } else if (layout.storePath && isFile(layout.storePath)) {
    try {
      const raw = JSON.parse(readFileSync(layout.storePath, "utf8")) as { tables?: { sessions?: Record<string, { identity?: { cwd?: unknown } }> } };
      for (const rec of Object.values(raw?.tables?.sessions || {})) { if (out.length >= limit) break; push(rec?.identity?.cwd); }
    } catch { /* unreadable */ }
  }
  return out;
}

/** What an OS looks like from the outside: a cwd shape, or nothing at all. */
export function osFromCwd(cwd: string): SourceOs {
  const s = String(cwd || "");
  if (/^[A-Za-z]:[\\/]/.test(s) || s.startsWith("\\\\")) return "windows"; // C:\… or a UNC share
  if (s.startsWith("/Users/") || s.startsWith("/Volumes/") || s.startsWith("/private/")) return "macos";
  if (s.startsWith("/home/") || s.startsWith("/root") || s.startsWith("/mnt/") || s.startsWith("/media/") || s.startsWith("/opt/") || s.startsWith("/srv/")) return "linux";
  if (s.includes("\\")) return "windows";
  if (s.startsWith("/")) return "linux";
  return "unknown";
}

/**
 * Detect the OS of an imported home. The sessions' own cwds are the strongest
 * signal (a Windows DSH writes "D:\models\…" no matter where the drive is mounted
 * today); the mount path is only a fallback for a home with no recorded cwd yet.
 */
export function detectSourceOs(layout: SourceLayout, cwds: string[] = []): { os: SourceOs; evidence: string | null } {
  const counts = new Map<SourceOs, { n: number; sample: string }>();
  for (const cwd of cwds) {
    const os = osFromCwd(cwd);
    if (os === "unknown") continue;
    const e = counts.get(os) || { n: 0, sample: cwd };
    e.n++;
    counts.set(os, e);
  }
  const best = [...counts.entries()].sort((a, b) => b[1].n - a[1].n)[0];
  if (best) return { os: best[0], evidence: best[1].sample };
  // No cwd yet — fall back to the path shape.
  const p = layout.root.replace(/\\/g, "/");
  if (/^\/mnt\/[a-z]\//i.test(p) || /^\/media\/[^/]+\/[^/]+\/Users\//i.test(p)) return { os: "windows", evidence: "mount path looks like a Windows volume" };
  if (p.startsWith("/Volumes/")) return { os: "macos", evidence: "mount path" };
  if (p.includes("\\")) return { os: "windows", evidence: "path separator" };
  // Last resort: the path itself. A POSIX path under /home, /tmp, /srv … is a
  // Linux home (and /Users, /Volumes already returned macOS above).
  const byPath = osFromCwd(p);
  if (byPath !== "unknown") return { os: byPath, evidence: "path shape" };
  return { os: "unknown", evidence: null };
}

/** The local machine's OS, in the same vocabulary. */
export function localOs(): SourceOs {
  return process.platform === "win32" ? "windows" : process.platform === "darwin" ? "macos" : process.platform === "linux" ? "linux" : "unknown";
}

/** Icon + readable name for an OS (used by the client, kept here as the one source of truth). */
export const OS_META: Record<SourceOs, { icon: string; name: string }> = {
  windows: { icon: "🪟", name: "Windows" },
  macos: { icon: "🍎", name: "macOS" },
  linux: { icon: "🐧", name: "Linux" },
  unknown: { icon: "💾", name: "unknown OS" },
};

// ── scanning a source ────────────────────────────────────────────────────

/** Count the sessions metered by a projection store (no trajectory parsing). */
function storeTotals(storePath: string): { sessions: number; tokens: number } {
  let sessions = 0, tokens = 0;
  const add = (rec: { rows?: Record<string, { val?: unknown }> } | undefined): void => {
    sessions++;
    const tu = rec?.rows?.tokenUsage?.val as { totals?: Record<string, number> } | undefined;
    const t = tu?.totals;
    if (t) tokens += (t.uncachedInputTokens || 0) + (t.outputTokens || 0) + (t.cacheReadTokens || 0) + (t.cacheWriteTokens || 0);
  };
  if (isDir(storePath)) {
    const dir = isDir(join(storePath, "sessions")) ? join(storePath, "sessions") : storePath;
    let entries: Dirent[];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return { sessions, tokens }; }
    const seen = new Set<string>();
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith(".json")) continue;
      const id = e.name.slice(0, -5);
      if (seen.has(id)) continue;
      seen.add(id);
      try {
        const raw = JSON.parse(readFileSync(join(dir, e.name), "utf8")) as { record?: { rows?: Record<string, { val?: unknown }> }; rows?: Record<string, { val?: unknown }> };
        add((raw?.record || raw) as { rows?: Record<string, { val?: unknown }> });
      } catch { add(undefined); } // still counts as a session file
    }
  } else if (isFile(storePath)) {
    try {
      const raw = JSON.parse(readFileSync(storePath, "utf8")) as { tables?: { sessions?: Record<string, { rows?: Record<string, { val?: unknown }> }> } };
      for (const rec of Object.values(raw?.tables?.sessions || {})) add(rec);
    } catch { /* unreadable store */ }
  }
  return { sessions, tokens };
}

/** Cheap scan of one source: counts + sizes, no decompression. */
export function scanSource(layout: SourceLayout): SourceScan {
  const stats = emptyScan();
  if (layout.storePath) {
    const t = storeTotals(layout.storePath);
    stats.sessions = t.sessions;
    stats.tokens = t.tokens;
  }
  if (layout.otherStorePath) {
    // Both stores are live at once and hold DISJOINT sets (v0 -> legacy file,
    // v3 -> directory store), so the total is the sum of the two.
    const legacy = storeTotals(layout.otherStorePath);
    stats.legacySessions = legacy.sessions;
    stats.tokens += legacy.tokens;
  }
  if (isDir(layout.sessionsRoot)) {
    // Walk the sessions tree once, cheaply: count *.zstd + their sizes.
    const queue: string[] = [layout.sessionsRoot];
    let dirs = 0;
    while (queue.length && dirs < 20000) {
      const dir = queue.shift() as string;
      dirs++;
      let entries: Dirent[];
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== ".git") queue.push(join(dir, e.name)); continue; }
        if (!e.name.endsWith(".zstd")) continue;
        stats.files++;
        try {
          const st = statSync(join(dir, e.name));
          stats.bytes += st.size;
          if (stats.newest == null || st.mtimeMs > stats.newest) stats.newest = st.mtimeMs;
        } catch { /* vanished */ }
      }
    }
  }
  return stats;
}

// ── candidate discovery (the "Scan" button) ──────────────────────────────

/** A directory that looks like it holds a DSH home. */
export interface SourceCandidate {
  path: string;
  label: string;
  os: SourceOs;
  sessions: number;
  files: number;
  tokens: number;
  /** True when this path is already registered. */
  known: boolean;
}

/** Default places another machine's DSH home tends to appear. */
export function defaultScanRoots(): string[] {
  const env = (process.env.TOKEN_GOBBLER_SCAN_ROOTS || "").split(/[:;]/).map((s) => s.trim()).filter(Boolean);
  let user = "";
  try { user = userInfo().username; } catch { /* no passwd entry */ }
  return [...new Set([
    ...env,
    "/mnt",
    user ? join("/media", user) : "/media",
    user ? join("/run/media", user) : "/run/media",
    "/Volumes",
    homedir(),
  ])].filter((p) => p && isDir(p));
}

/**
 * Look for importable DSH homes under the usual mount points. Deliberately
 * targeted instead of a deep walk: an external drive can hold millions of files,
 * so we only probe the shapes a DSH home actually takes —
 *   <root>/.dsh — <root>/<dir>/.dsh — <root>/<dir>/Users/<user>/.dsh —
 *   <root>/<dir>/home/<user>/.dsh — and any directory that already looks like a home.
 */
export function scanForDshHomes(roots: string[] = defaultScanRoots(), opts: { limit?: number } = {}): SourceCandidate[] {
  const limit = opts.limit ?? 40;
  const out: SourceCandidate[] = [];
  const seen = new Set<string>();
  const deadline = Date.now() + 4000; // a mount can be slow/networked: never hang the request

  const add = (p: string): void => {
    if (out.length >= limit || Date.now() > deadline) return;
    const abs = resolve(p);
    if (seen.has(abs)) return;
    seen.add(abs);
    const layout = resolveSourceLayout(abs);
    if (layoutError(layout)) return;
    const stats = scanSource(layout);
    const { os } = detectSourceOs(layout, sampleCwds(layout, 8));
    out.push({
      path: abs,
      label: basename(abs) === ".dsh" ? (basename(dirname(abs)) || abs) + " · .dsh" : basename(abs) || abs,
      os,
      sessions: stats.sessions + stats.legacySessions,
      files: stats.files,
      tokens: stats.tokens,
      known: false,
    });
  };
  // Direct shapes under a root, and one level deeper (mount points, user homes).
  const probeRoot = (root: string): void => {
    add(join(root, ".dsh"));
    let entries: Dirent[];
    try { entries = readdirSync(root, { withFileTypes: true }); } catch { return; }
    let n = 0;
    for (const e of entries) {
      if (!e.isDirectory() || Date.now() > deadline) continue;
      if (n++ > 200) break;
      const dir = join(root, e.name);
      // The directory itself may already be a DSH home or a sessions copy.
      if (e.name === "sessions" || e.name === "session_projcache" || e.name === "storages") continue;
      add(dir);
      add(join(dir, ".dsh"));
      // Windows volumes keep home folders under Users/, Linux ones under home/ (or ~).
      for (const sub of ["Users", "home"]) {
        const users = join(dir, sub);
        if (!isDir(users)) continue;
        let homes: Dirent[];
        try { homes = readdirSync(users, { withFileTypes: true }); } catch { continue; }
        let m = 0;
        for (const h of homes) {
          if (!h.isDirectory() || Date.now() > deadline || m++ > 60) continue;
          add(join(users, h.name, ".dsh"));
        }
      }
    }
  };
  for (const root of roots) {
    if (Date.now() > deadline || out.length >= limit) break;
    probeRoot(root);
  }
  // `known` is filled by markKnown() against the live registry (the route does it).
  return out.sort((a, b) => b.sessions - a.sessions || b.files - a.files);
}

/** Mark the candidates that are already registered (paths are compared resolved). */
export function markKnown(candidates: SourceCandidate[], sources: ImportSource[]): SourceCandidate[] {
  const have = new Set(sources.map((s) => resolve(expandPath(s.path))));
  return candidates.map((c) => ({ ...c, known: have.has(resolve(c.path)) }));
}
