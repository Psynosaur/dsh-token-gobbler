// token-gobbler · client/import-sources.tsx
// The "Imported sources" card of the settings dashboard: register ANOTHER
// machine's DSH home (a Windows install on a mounted drive, a macOS home on
// /Volumes, a synced copy of a laptop's ~/.dsh, or just its sessions folder),
// see what each one holds, and manage it — add, disable, resync, remove.
//
// Nothing here writes into the imported home: the whole feature is read-only on
// the other machine's data, and the registry lives in THIS home's
// token-gobbler/sources.json.
import { fmt, fmtC, request } from "./core";
import { OS_ICON, OS_NAME, osIcon, setSourceIndex, sourceIndex, LOCAL_ID } from "./sources";

/** "3m ago" / "2d ago" — a source is only as fresh as its last sync. */
function ago(ms: number | null | undefined): string {
  if (!ms) return "never";
  const d = Date.now() - ms;
  if (d < 45_000) return "just now";
  if (d < 3_600_000) return Math.round(d / 60_000) + "m ago";
  if (d < 86_400_000) return Math.round(d / 3_600_000) + "h ago";
  return Math.round(d / 86_400_000) + "d ago";
}
const fmtBytes = (n: number): string => {
  if (!n) return "0 B";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
  return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
};

/** How much of a source the report actually folded in (live), else the last scan. */
function counts(s: any): { sessions: number; files: number; tokens: number; live: boolean } {
  if (s.live) return { sessions: s.live.sessions || 0, files: s.live.files || 0, tokens: s.live.tokens || 0, live: true };
  const scan = s.scan || {};
  return { sessions: (scan.sessions || 0) + (scan.legacySessions || 0), files: scan.files || 0, tokens: scan.tokens || 0, live: false };
}

const OS_CHOICES = [
  { k: "auto", name: "Auto-detect", hint: "Read the OS from the sessions' own cwd (C:\\… = Windows, /Users/… = macOS, /home/… = Linux)" },
  { k: "windows", name: "🪟 Windows", hint: "Force the Windows badge" },
  { k: "macos", name: "🍎 macOS", hint: "Force the macOS badge" },
  { k: "linux", name: "🐧 Linux", hint: "Force the Linux badge" },
];

function Seg(props: { value: string; options: typeof OS_CHOICES; onChange: (k: string) => void }) {
  return jsx("div", { className: "tg-seg tg-seg-sm", children: props.options.map((o) => jsx("button", {
    className: "tg-seg-btn" + (props.value === o.k ? " active" : ""),
    title: o.hint,
    onClick: () => props.onChange(o.k),
    children: o.name,
  }, "os-" + o.k)) });
}

export function ImportSourcesCard(props: { onChanged?: () => void } = {}) {
  const [sources, setSources] = React.useState<any[] | null>(null);
  const [candidates, setCandidates] = React.useState<any[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<any>(null);
  const [path, setPath] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [os, setOs] = React.useState("auto");
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const apply = React.useCallback((value: any, note?: any) => {
    if (value && Array.isArray(value.sources)) setSources(value.sources);
    if (value && value.candidates) setCandidates(value.candidates);
    if (note) setMsg(note);
    // Keep the shared index in step so badges elsewhere match this list.
    if (value && Array.isArray(value.sources)) setSourceIndex({ imported: value.sources.map((s: any) => ({ ...s, live: s.live })), local: (sourceIndex()[LOCAL_ID] || null) });
  }, []);

  const fail = (e: unknown): void => setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });

  const load = React.useCallback(async (scan = false) => {
    try { apply(await request("/sources" + (scan ? "?scan=1" : ""))); }
    catch (e) { fail(e); }
  }, [apply]);
  React.useEffect(() => { load(); }, [load]);

  const act = React.useCallback(async (body: any, id: string, ok: (value: any) => any) => {
    setBusy(id);
    setMsg(null);
    try {
      const value = await request("/sources", body);
      apply(value, ok(value));
      if (props.onChanged) props.onChanged();
    } catch (e) { fail(e); }
    finally { setBusy(null); }
  }, [apply, props]);

  const add = (p?: string) => {
    const target = (p != null ? p : path).trim();
    if (!target) { setMsg({ kind: "err", text: "Give the path of the other machine's .dsh folder (or of its sessions folder)." }); return; }
    return act({ action: "add", path: target, label: p != null ? "" : label, os }, "add:" + target, (v) => ({ kind: "ok", text: "Imported " + ((v.result && v.result.label) || target) + " — its sessions are now folded in and marked." }));
  };
  const resync = (id: string) => act({ action: "resync", id }, "resync:" + id, (v) => ({ kind: "ok", text: "Resynced " + id + " — " + ((v.result && v.result.dropped) || 0) + " cached trajectories dropped; the next load re-reads the home." }));
  const toggle = (s: any) => act({ action: "update", id: s.id, enabled: !s.enabled }, "toggle:" + s.id, (v) => ({ kind: "ok", text: (v.result && v.result.enabled === false ? "Paused " : "Re-enabled ") + s.label }));
  const remove = (id: string) => { setConfirmId(null); return act({ action: "remove", id }, "remove:" + id, () => ({ kind: "ok", text: "Removed " + id + " — its files were not touched." })); };

  const scan = async () => {
    setBusy("scan");
    setMsg(null);
    try {
      const value = await request("/sources?scan=1");
      apply(value);
      const n = (value.candidates || []).length;
      setMsg({ kind: n ? "ok" : "warn", text: n ? "Found " + n + " candidate" + (n === 1 ? "" : "s") + " — add the one you want." : "No DSH home found under the usual mount points. Type the path instead." });
    } catch (e) { fail(e); }
    finally { setBusy(null); }
  };

  const list = sources || [];
  const row = (s: any) => {
    const c = counts(s);
    const bad = !!s.error;
    return jsxs("div", { className: "tg-src-row" + (bad ? " tg-src-row-bad" : "") + (s.enabled === false ? " tg-src-row-off" : ""), children: [
      jsx("div", { className: "tg-src-row-ico", title: OS_NAME[s.os] || s.os, children: osIcon(s.os) }),
      jsxs("div", { className: "tg-src-row-main", children: [
        jsxs("div", { className: "tg-src-row-top", children: [
          jsx("span", { className: "tg-src-row-label", children: s.label }),
          jsx("span", { className: "tg-src-row-os", children: OS_NAME[s.os] || s.os }),
          s.enabled === false ? jsx("span", { className: "tg-src-row-off-pill", children: "paused" }) : null,
          bad ? jsx("span", { className: "tg-src-row-err", children: "⚠ " + s.error }) : null,
        ]}),
        jsx("div", { className: "tg-src-row-path", title: s.path, children: s.path }),
        jsx("div", { className: "tg-src-row-stats", children:
          fmt(c.sessions) + " sessions · " + fmt(c.files) + " trajectories" +
          (c.tokens ? " · " + fmtC(c.tokens) + " tokens" : "") +
          (s.scan && s.scan.bytes ? " · " + fmtBytes(s.scan.bytes) : "") +
          (c.live ? "" : " · last scan") +
          " · synced " + ago(s.lastSyncAt)
        }),
      ]}),
      jsxs("div", { className: "tg-src-row-actions", children: [
        jsx("button", { className: "tg-ghost tg-src-btn", disabled: !!busy, title: "Re-read this home from disk (drops its cached parses)", onClick: () => resync(s.id), children: busy === "resync:" + s.id ? "…" : "↻ Resync" }),
        jsx("button", { className: "tg-ghost tg-src-btn", disabled: !!busy, title: s.enabled === false ? "Fold this home back into the dashboard" : "Keep it registered but stop reading it", onClick: () => toggle(s), children: busy === "toggle:" + s.id ? "…" : (s.enabled === false ? "▶ Enable" : "⏸ Pause") }),
        confirmId === s.id
          ? jsxs("span", { className: "tg-src-confirm", children: [
              jsx("button", { className: "tg-ghost tg-src-btn tg-src-danger", disabled: !!busy, onClick: () => remove(s.id), children: busy === "remove:" + s.id ? "…" : "Remove" }),
              jsx("button", { className: "tg-ghost tg-src-btn", onClick: () => setConfirmId(null), children: "Cancel" }),
            ]})
          : jsx("button", { className: "tg-ghost tg-src-btn", title: "Forget this import (the files on disk are never touched)", onClick: () => setConfirmId(s.id), children: "✕ Remove" }),
      ]}),
    ]}, s.id);
  };

  return jsxs("div", { className: "tg-card tg-set-card", children: [
    jsxs("div", { className: "tg-set-row tg-src-add", children: [
      jsx("div", { className: "tg-set-label", children: "Add a DSH home" }),
      jsxs("div", { className: "tg-set-ctl", children: [
        jsx("input", {
          className: "tg-input tg-src-path",
          placeholder: "/media/you/DRIVE/Users/you/.dsh  ·  /Volumes/backup/.dsh  ·  ~/dsh-copies/laptop",
          value: path,
          spellcheck: false,
          onChange: (e: any) => setPath(e.target.value),
          onKeyDown: (e: any) => { if (e.key === "Enter") add(); },
        }),
        jsx("input", {
          className: "tg-input tg-src-name",
          placeholder: "name (optional)",
          value: label,
          onChange: (e: any) => setLabel(e.target.value),
          onKeyDown: (e: any) => { if (e.key === "Enter") add(); },
        }),
      ]}),
      jsxs("div", { className: "tg-set-hint", children: [
        "Point it at the other machine's ",
        jsx("code", { children: ".dsh" }),
        " folder — or straight at its ",
        jsx("code", { children: "sessions" }),
        " folder if that is all you copied. Nothing on that machine is written to; it is read where it lies (a mounted drive, a network share, a synced backup).",
      ]}),
    ]}),
    jsxs("div", { className: "tg-set-row", children: [
      jsx("div", { className: "tg-set-label", children: "Its OS" }),
      jsx("div", { className: "tg-set-ctl", children: jsx(Seg, { value: os, options: OS_CHOICES, onChange: setOs }) }),
      jsx("div", { className: "tg-set-hint", children: "Drives the badge that MARKS every session it contributed, so a Windows session never looks like one of your own." }),
    ]}),
    jsxs("div", { className: "tg-src-actions", children: [
      jsx("button", { className: "tg-refresh", disabled: !!busy, onClick: () => add(), children: busy && busy.startsWith("add:") ? "Importing…" : "＋ Import source" }),
      jsx("button", { className: "tg-ghost", disabled: !!busy, onClick: scan, title: "Look for .dsh homes under /mnt, /media/<you>, /run/media/<you>, /Volumes and your home", children: busy === "scan" ? "Scanning…" : "🔍 Scan for DSH homes" }),
      jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: list.length ? list.length + " imported home" + (list.length === 1 ? "" : "s") : "No imports yet — Token Gobbler reads only this machine." }),
    ]}),
    msg ? jsx("div", { className: "tg-src-msg" + (msg.kind === "err" ? " err" : msg.kind === "warn" ? " warn" : " ok"), children: msg.text }) : null,
    candidates && candidates.length ? jsxs("div", { className: "tg-src-cands", children: [
      jsx("div", { className: "tg-src-cands-head", children: "Found on this machine" }),
      ...candidates.map((c: any) => jsxs("div", { className: "tg-src-cand", children: [
        jsx("span", { className: "tg-src-row-ico", children: osIcon(c.os) }),
        jsxs("div", { className: "tg-src-cand-main", children: [
          jsx("div", { className: "tg-src-cand-path", title: c.path, children: c.path }),
          jsx("div", { className: "tg-src-cand-stats", children: fmt(c.sessions) + " sessions · " + fmt(c.files) + " trajectories · " + OS_NAME[c.os] }),
        ]}),
        c.known
          ? jsx("span", { className: "tg-src-cand-known", children: "already imported" })
          : jsx("button", { className: "tg-ghost tg-src-btn", disabled: !!busy, onClick: () => add(c.path), children: "＋ Add" }),
      ]}, c.path)),
    ]}) : null,
    list.length ? jsxs("div", { className: "tg-src-list", children: [
      jsx("div", { className: "tg-src-list-head", children: "Imported homes" }),
      ...list.map(row),
    ]}) : null,
    jsxs("div", { className: "tg-set-foot", children: [
      jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children:
        "Imported sessions are folded into every total and marked " +
        "with their home's badge. An id that exists in two homes is counted once (this machine wins). Resync re-reads that home only; the rest of the dashboard keeps its warm cache." }),
    ]}),
  ]});
}
