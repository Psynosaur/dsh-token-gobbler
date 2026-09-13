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
import { basename, dirname, join, normalize, resolve } from "node:path";
import { homedir, userInfo } from "node:os";
/** The id of the always-present local home. */
export const LOCAL_SOURCE_ID = "local";
/** Registry schema version (bump when the stored shape changes). */
export const SOURCES_VERSION = 1;
/** Empty scan (a source with neither store nor trajectories). */
export const emptyScan = () => ({ sessions: 0, legacySessions: 0, files: 0, bytes: 0, tokens: 0, newest: null });
// ── paths ────────────────────────────────────────────────────────────────
/** Expand a leading ~ (and ~user) and normalise; never resolves against cwd. */
export function expandPath(p) {
    let s = String(p || "").trim();
    // A pasted path may arrive quoted ("/media/x/.dsh") or with a trailing separator.
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
        s = s.slice(1, -1);
    if (s === "~")
        return homedir();
    if (s.startsWith("~/") || s.startsWith("~\\"))
        return join(homedir(), s.slice(2));
    return normalize(s);
}
/** Where the registry lives (beside pricing.json, in the LOCAL home). */
export function sourceRegistryPath(dshHome) {
    return join(dshHome, "token-gobbler", "sources.json");
}
const isDir = (p) => { try {
    return statSync(p).isDirectory();
}
catch {
    return false;
} };
const isFile = (p) => { try {
    return statSync(p).isFile();
}
catch {
    return false;
} };
// ── registry I/O ─────────────────────────────────────────────────────────
const OS_VALUES = ["linux", "windows", "macos", "unknown"];
/** Coerce one stored entry; null when it is unusable (no id/path). */
function normalizeStoredSource(raw) {
    if (!raw || typeof raw !== "object")
        return null;
    const r = raw;
    const id = typeof r.id === "string" ? r.id.trim() : "";
    const path = typeof r.path === "string" ? r.path.trim() : "";
    if (!id || !path)
        return null;
    const os = OS_VALUES.includes(r.os) ? r.os : "unknown";
    const stats = r.stats && typeof r.stats === "object" ? r.stats : null;
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
export function readSourceRegistry(dshHome) {
    try {
        const raw = JSON.parse(readFileSync(sourceRegistryPath(dshHome), "utf8"));
        const list = Array.isArray(raw?.sources) ? raw.sources : [];
        const sources = [];
        const seen = new Set([LOCAL_SOURCE_ID]);
        for (const entry of list) {
            const s = normalizeStoredSource(entry);
            if (!s || seen.has(s.id))
                continue; // drop duplicate ids rather than shadow a source
            seen.add(s.id);
            sources.push(s);
        }
        return { version: typeof raw?.version === "number" ? raw.version : SOURCES_VERSION, sources };
    }
    catch {
        return { version: SOURCES_VERSION, sources: [] };
    }
}
/** Persist the registry atomically (temp file + rename). */
export function writeSourceRegistry(dshHome, registry) {
    const file = sourceRegistryPath(dshHome);
    mkdirSync(dirname(file), { recursive: true });
    const tmp = file + ".tmp";
    writeFileSync(tmp, JSON.stringify({ version: SOURCES_VERSION, sources: registry.sources }, null, 2) + "\n");
    renameSync(tmp, file);
}
/** Only the sources that should be read (registered + enabled). */
export function enabledSources(dshHome) {
    return readSourceRegistry(dshHome).sources.filter((s) => s.enabled);
}
/** A unique slug for a new source id. */
export function sourceId(label, taken) {
    const base = String(label || "source").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "source";
    const used = new Set(taken);
    if (base !== LOCAL_SOURCE_ID && !used.has(base))
        return base;
    for (let i = 2; i < 1000; i++) {
        const id = base + "-" + i;
        if (!used.has(id))
            return id;
    }
    return base + "-" + Date.now();
}
// ── layout resolution ────────────────────────────────────────────────────
/** Bounded walk that answers "are there trajectory files under here?". */
function probeTrajectories(root, limit = 1, maxDirs = 400) {
    let found = 0;
    const queue = [{ dir: root, depth: 0 }];
    let visited = 0;
    while (queue.length && found < limit && visited < maxDirs) {
        const { dir, depth } = queue.shift();
        visited++;
        let entries;
        try {
            entries = readdirSync(dir, { withFileTypes: true });
        }
        catch {
            continue;
        }
        for (const e of entries) {
            if (e.isFile() && e.name.endsWith(".zstd")) {
                found++;
                if (found >= limit)
                    break;
            }
            else if (e.isDirectory() && depth < 3 && e.name !== "node_modules" && e.name !== ".git")
                queue.push({ dir: join(dir, e.name), depth: depth + 1 });
        }
    }
    return found;
}
/**
 * Does <dir> look like a projection STORE rather than a home or a sessions tree?
 * Either it is named like one, or it (or its own sessions/ subfolder) holds
 * per-session JSON records and NO trajectories.
 */
function looksLikeStoreDir(dir) {
    if (basename(dir) === "session_projcache")
        return true;
    if (probeTrajectories(dir) > 0)
        return false; // holds trajectories -> a sessions tree
    const inner = isDir(join(dir, "sessions")) ? join(dir, "sessions") : dir;
    try {
        return readdirSync(inner, { withFileTypes: true }).some((e) => e.isFile() && e.name.endsWith(".json") && !e.name.startsWith("."));
    }
    catch {
        return false;
    }
}
/**
 * Work out what an imported path actually is. Accepts, in order of preference:
 *   <home>/.dsh                     a full DSH home (sessions/ + storages/)
 *   <home>/.dsh/sessions            the sessions root (home inferred from the parent)
 *   <home>/.dsh/storages/...        a projection store (dir or the legacy file)
 *   <anywhere>/session-<id>/…       a bare copy of a sessions tree
 * Never throws — an unusable path still returns a layout with hasSessions/hasStore false.
 */
export function resolveSourceLayout(input) {
    const root = expandPath(input);
    const layout = { root, dshHome: null, sessionsRoot: join(root, "sessions"), storePath: null, otherStorePath: null, hasSessions: false, hasStore: false };
    const base = basename(root);
    /** Fill the store fields for a candidate DSH home. */
    const withHome = (home) => {
        layout.dshHome = home;
        layout.sessionsRoot = join(home, "sessions");
        const dirStore = join(home, "storages", "session_projcache");
        const fileStore = join(home, "storages", "session_projcache.json");
        if (isDir(dirStore))
            layout.storePath = dirStore;
        if (isFile(fileStore)) {
            if (layout.storePath)
                layout.otherStorePath = fileStore;
            else
                layout.storePath = fileStore;
        }
        layout.hasStore = !!layout.storePath;
    };
    if (isFile(root)) {
        // A projection store file registered directly: .../storages/session_projcache.json
        const storages = dirname(root);
        if (basename(storages) === "storages")
            withHome(dirname(storages));
        layout.storePath = root; // the explicitly registered file wins over a sibling store
        layout.hasStore = true;
        if (!layout.dshHome)
            layout.sessionsRoot = root; // no home to infer: a store-only import
    }
    else if (isDir(root)) {
        // Precedence matters: a DSH home also contains a "sessions" folder, and a
        // projection store ALSO contains a "sessions" folder — of JSON files. The
        // definitive home markers (storages/ next to sessions/) are checked first,
        // then the store shapes, and only then a bare tree of trajectories.
        if (isDir(join(root, "storages")))
            withHome(root);
        else if (base === "sessions")
            withHome(dirname(root));
        else if (base === "storages")
            withHome(dirname(root));
        else if (looksLikeStoreDir(root)) {
            // .../storages/session_projcache, or any folder of per-session JSON records.
            const parent = dirname(root);
            const home = basename(parent) === "storages" ? dirname(parent) : null;
            if (home && isDir(join(home, "sessions")))
                withHome(home);
            layout.storePath = root; // exactly what was registered
            layout.hasStore = true;
            if (!layout.dshHome)
                layout.sessionsRoot = root; // store-only import (tokens, no trajectories)
        }
        else if (probeTrajectories(root) > 0) {
            layout.sessionsRoot = root; // a bare copy of a sessions tree
        }
        // A home whose sessions dir is absent is still usable (projection totals only).
    }
    layout.hasSessions = isDir(layout.sessionsRoot) && probeTrajectories(layout.sessionsRoot) > 0;
    return layout;
}
/** Human-readable reason a path cannot be imported, or null when it is usable. */
export function layoutError(layout) {
    if (!existsSync(layout.root))
        return "path not found — is the drive mounted?";
    if (!isDir(layout.root) && !isFile(layout.root))
        return "path is neither a directory nor a file";
    if (!layout.hasSessions && !layout.hasStore) {
        return "no DSH sessions found — expected a .dsh home (sessions/ + storages/) or a copy of its sessions/ folder";
    }
    return null;
}
// ── OS detection ─────────────────────────────────────────────────────────
/** Sample cwds from a projection store (cheap: a few small JSON reads). */
export function sampleCwds(layout, limit = 40) {
    const out = [];
    const push = (v) => { if (typeof v === "string" && v)
        out.push(v); };
    if (layout.storePath && isDir(layout.storePath)) {
        for (const dir of [join(layout.storePath, "sessions"), layout.storePath]) {
            let entries;
            try {
                entries = readdirSync(dir, { withFileTypes: true });
            }
            catch {
                continue;
            }
            for (const e of entries) {
                if (out.length >= limit)
                    break;
                if (!e.isFile() || !e.name.endsWith(".json"))
                    continue;
                try {
                    const raw = JSON.parse(readFileSync(join(dir, e.name), "utf8"));
                    push((raw?.record || raw)?.identity?.cwd);
                }
                catch { /* skip unreadable entry */ }
            }
            if (out.length)
                break;
        }
    }
    else if (layout.storePath && isFile(layout.storePath)) {
        try {
            const raw = JSON.parse(readFileSync(layout.storePath, "utf8"));
            for (const rec of Object.values(raw?.tables?.sessions || {})) {
                if (out.length >= limit)
                    break;
                push(rec?.identity?.cwd);
            }
        }
        catch { /* unreadable */ }
    }
    return out;
}
/** What an OS looks like from the outside: a cwd shape, or nothing at all. */
export function osFromCwd(cwd) {
    const s = String(cwd || "");
    if (/^[A-Za-z]:[\\/]/.test(s) || s.startsWith("\\\\"))
        return "windows"; // C:\… or a UNC share
    if (s.startsWith("/Users/") || s.startsWith("/Volumes/") || s.startsWith("/private/"))
        return "macos";
    if (s.startsWith("/home/") || s.startsWith("/root") || s.startsWith("/mnt/") || s.startsWith("/media/") || s.startsWith("/opt/") || s.startsWith("/srv/"))
        return "linux";
    if (s.includes("\\"))
        return "windows";
    if (s.startsWith("/"))
        return "linux";
    return "unknown";
}
/**
 * Detect the OS of an imported home. The sessions' own cwds are the strongest
 * signal (a Windows DSH writes "D:\models\…" no matter where the drive is mounted
 * today); the mount path is only a fallback for a home with no recorded cwd yet.
 */
export function detectSourceOs(layout, cwds = []) {
    const counts = new Map();
    for (const cwd of cwds) {
        const os = osFromCwd(cwd);
        if (os === "unknown")
            continue;
        const e = counts.get(os) || { n: 0, sample: cwd };
        e.n++;
        counts.set(os, e);
    }
    const best = [...counts.entries()].sort((a, b) => b[1].n - a[1].n)[0];
    if (best)
        return { os: best[0], evidence: best[1].sample };
    // No cwd yet — fall back to the path shape.
    const p = layout.root.replace(/\\/g, "/");
    if (/^\/mnt\/[a-z]\//i.test(p) || /^\/media\/[^/]+\/[^/]+\/Users\//i.test(p))
        return { os: "windows", evidence: "mount path looks like a Windows volume" };
    if (p.startsWith("/Volumes/"))
        return { os: "macos", evidence: "mount path" };
    if (p.includes("\\"))
        return { os: "windows", evidence: "path separator" };
    // Last resort: the path itself. A POSIX path under /home, /tmp, /srv … is a
    // Linux home (and /Users, /Volumes already returned macOS above).
    const byPath = osFromCwd(p);
    if (byPath !== "unknown")
        return { os: byPath, evidence: "path shape" };
    return { os: "unknown", evidence: null };
}
/** The local machine's OS, in the same vocabulary. */
export function localOs() {
    return process.platform === "win32" ? "windows" : process.platform === "darwin" ? "macos" : process.platform === "linux" ? "linux" : "unknown";
}
/** Icon + readable name for an OS (used by the client, kept here as the one source of truth). */
export const OS_META = {
    windows: { icon: "🪟", name: "Windows" },
    macos: { icon: "🍎", name: "macOS" },
    linux: { icon: "🐧", name: "Linux" },
    unknown: { icon: "💾", name: "unknown OS" },
};
// ── scanning a source ────────────────────────────────────────────────────
/** Count the sessions metered by a projection store (no trajectory parsing). */
function storeTotals(storePath) {
    let sessions = 0, tokens = 0;
    const add = (rec) => {
        sessions++;
        const tu = rec?.rows?.tokenUsage?.val;
        const t = tu?.totals;
        if (t)
            tokens += (t.uncachedInputTokens || 0) + (t.outputTokens || 0) + (t.cacheReadTokens || 0) + (t.cacheWriteTokens || 0);
    };
    if (isDir(storePath)) {
        const dir = isDir(join(storePath, "sessions")) ? join(storePath, "sessions") : storePath;
        let entries;
        try {
            entries = readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return { sessions, tokens };
        }
        const seen = new Set();
        for (const e of entries) {
            if (!e.isFile() || !e.name.endsWith(".json"))
                continue;
            const id = e.name.slice(0, -5);
            if (seen.has(id))
                continue;
            seen.add(id);
            try {
                const raw = JSON.parse(readFileSync(join(dir, e.name), "utf8"));
                add((raw?.record || raw));
            }
            catch {
                add(undefined);
            } // still counts as a session file
        }
    }
    else if (isFile(storePath)) {
        try {
            const raw = JSON.parse(readFileSync(storePath, "utf8"));
            for (const rec of Object.values(raw?.tables?.sessions || {}))
                add(rec);
        }
        catch { /* unreadable store */ }
    }
    return { sessions, tokens };
}
/** Cheap scan of one source: counts + sizes, no decompression. */
export function scanSource(layout) {
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
        const queue = [layout.sessionsRoot];
        let dirs = 0;
        while (queue.length && dirs < 20000) {
            const dir = queue.shift();
            dirs++;
            let entries;
            try {
                entries = readdirSync(dir, { withFileTypes: true });
            }
            catch {
                continue;
            }
            for (const e of entries) {
                if (e.isDirectory()) {
                    if (e.name !== "node_modules" && e.name !== ".git")
                        queue.push(join(dir, e.name));
                    continue;
                }
                if (!e.name.endsWith(".zstd"))
                    continue;
                stats.files++;
                try {
                    const st = statSync(join(dir, e.name));
                    stats.bytes += st.size;
                    if (stats.newest == null || st.mtimeMs > stats.newest)
                        stats.newest = st.mtimeMs;
                }
                catch { /* vanished */ }
            }
        }
    }
    return stats;
}
/** Default places another machine's DSH home tends to appear. */
export function defaultScanRoots() {
    const env = (process.env.TOKEN_GOBBLER_SCAN_ROOTS || "").split(/[:;]/).map((s) => s.trim()).filter(Boolean);
    let user = "";
    try {
        user = userInfo().username;
    }
    catch { /* no passwd entry */ }
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
export function scanForDshHomes(roots = defaultScanRoots(), opts = {}) {
    const limit = opts.limit ?? 40;
    const out = [];
    const seen = new Set();
    const deadline = Date.now() + 4000; // a mount can be slow/networked: never hang the request
    const add = (p) => {
        if (out.length >= limit || Date.now() > deadline)
            return;
        const abs = resolve(p);
        if (seen.has(abs))
            return;
        seen.add(abs);
        const layout = resolveSourceLayout(abs);
        if (layoutError(layout))
            return;
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
    const probeRoot = (root) => {
        add(join(root, ".dsh"));
        let entries;
        try {
            entries = readdirSync(root, { withFileTypes: true });
        }
        catch {
            return;
        }
        let n = 0;
        for (const e of entries) {
            if (!e.isDirectory() || Date.now() > deadline)
                continue;
            if (n++ > 200)
                break;
            const dir = join(root, e.name);
            // The directory itself may already be a DSH home or a sessions copy.
            if (e.name === "sessions" || e.name === "session_projcache" || e.name === "storages")
                continue;
            add(dir);
            add(join(dir, ".dsh"));
            // Windows volumes keep home folders under Users/, Linux ones under home/ (or ~).
            for (const sub of ["Users", "home"]) {
                const users = join(dir, sub);
                if (!isDir(users))
                    continue;
                let homes;
                try {
                    homes = readdirSync(users, { withFileTypes: true });
                }
                catch {
                    continue;
                }
                let m = 0;
                for (const h of homes) {
                    if (!h.isDirectory() || Date.now() > deadline || m++ > 60)
                        continue;
                    add(join(users, h.name, ".dsh"));
                }
            }
        }
    };
    for (const root of roots) {
        if (Date.now() > deadline || out.length >= limit)
            break;
        probeRoot(root);
    }
    // `known` is filled by markKnown() against the live registry (the route does it).
    return out.sort((a, b) => b.sessions - a.sessions || b.files - a.files);
}
/** Mark the candidates that are already registered (paths are compared resolved). */
export function markKnown(candidates, sources) {
    const have = new Set(sources.map((s) => resolve(expandPath(s.path))));
    return candidates.map((c) => ({ ...c, known: have.has(resolve(c.path)) }));
}
