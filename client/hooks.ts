// token-gobbler · client/hooks.ts
// Shared data fetch hook + the settings→modal open-ref.
import { request, readCache, writeCache, clearCache, type TgCache } from "./core";
import { setSourceIndex } from "./sources";

// shared open-ref (settings dashboard -> modal)
export const activityRef: { open: ((tab?: string) => void) | null } = { open: null };

// Fingerprint of the heavy payloads, derived from the CHEAP /usage aggregates:
// it changes iff the trajectories changed (new usage record / step, new file,
// new model timeline event, session added) OR a compaction's STATE changed
// (the compactionSig flips running→ok without any count moving) — i.e. iff the
// cached points are stale. While it is unchanged the cached points are still
// valid and the heavy endpoints are skipped entirely (no server-side recompute).
const usageFingerprint = (u: any): string => {
  if (!u) return "";
  const t = (u.sources && u.sources.trajectories) || {};
  const src = ((u.sources && u.sources.imported) || []) as any[];
  return JSON.stringify({
    tok: (u.totals && u.totals.allTokens) || 0,
    files: t.files || 0,
    wu: t.withUsage || 0,
    rec: t.usageRecords || 0,
    wmt: t.withModelTimeline || 0,
    n: Array.isArray(u.sessions) ? u.sessions.length : 0,
    comp: u.compactionSig || "",
    stops: (u.events && u.events.userStops) || 0,
    // Imported homes are part of the payload: adding, removing, pausing or
    // resyncing one changes the fingerprint, so the cached points are refetched.
    src: src.map((s) => s.id + ":" + (s.enabled === false ? 0 : 1) + ":" + (s.lastSyncAt || 0) + ":" + ((s.live && s.live.sessions) || 0) + ":" + (s.error ? 1 : 0)).join(","),
  });
};

export function useGobblerData() {
  const [data, setData] = React.useState<any>(undefined);
  const [breakdown, setBreakdown] = React.useState<any>(undefined);
  const [perf, setPerf] = React.useState<any>(undefined); // undefined = loading, null = unavailable (route missing)
  const [error, setError] = React.useState<any>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [reprocessing, setReprocessing] = React.useState(false);
  const [reprocessMsg, setReprocessMsg] = React.useState<any>(null);
  const loadData = React.useCallback(async () => {
    setRefreshing(true);
    // A 404 means the route is genuinely missing (e.g. the web server hasn't been
    // restarted to load the plugin) -> null, so the UI shows "restart the web server".
    // Any other failure is a real error -> { __error }, so the UI surfaces the actual
    // message instead of masquerading it as "unavailable".
    const missing = (e: any) => (e && e.status === 404 ? null : { __error: e instanceof Error ? e.message : String(e) });
    let sawData = false; // becomes true as soon as ANY data (cached or fresh) is on screen
    try {
      // 1) Instant hydration from the localStorage cache: the points computed on
      //    the first load are reused — the table/modal render immediately while a
      //    cheap probe decides whether the heavy endpoints need to run at all.
      let cached: TgCache | null = null;
      try { cached = await readCache(); } catch { cached = null; }
      if (cached && cached.usage) {
        sawData = true;
        setSourceIndex(cached.usage.sources); // badges render from the very first paint
        setData(cached.usage);
        setBreakdown(cached.breakdown ?? null);
        setPerf(cached.perf ?? null);
        setError(null);
        setLoading(false);
      }
      // 2) Cheap probe: /usage (aggregates only) — the source of the fingerprint.
      const u = await request("/usage");
      sawData = true;
      setSourceIndex(u.sources);
      setData(u);
      const homeOk = !cached || !cached.home || cached.home === u.dshHome;
      const fp = usageFingerprint(u);
      if (cached && homeOk && cached.fp === fp) {
        // 3) Nothing changed since the points were computed — keep the cached
        //    breakdown/perf and skip the heavy endpoints entirely.
        setError(null);
      } else {
        if (cached && !homeOk) clearCache();
        const [b, p] = await Promise.all([request("/breakdown").catch(missing), request("/performance").catch(missing)]);
        setBreakdown(b);
        setPerf(p);
        // Only cache a REAL breakdown — a 404 (null) or error payload would
        // otherwise poison every later load (the fingerprint would match and
        // the refetch would be skipped forever).
        if (b && b.bySession) {
          await writeCache({ v: 1, home: u.dshHome || "", fp, at: Date.now(), usage: u, breakdown: b, perf: p });
        }
        setError(null);
      }
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : String(e);
      if (e && e.status === 404) {
        // The plugin's routes are gone (server not restarted) — the cached data
        // is no longer backed by anything: drop it and surface the guidance.
        clearCache();
        setData(undefined);
        setBreakdown(null);
        setPerf(null);
        setError(msg);
      } else if (!sawData) {
        setError(msg); // no cached data to fall back on -> surface the error
      }
      // else: cached data stays visible; the next open retries the probe.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  // Force a full re-parse of every historic trajectory (clear the parse cache), then re-pull.
  const reprocess = React.useCallback(async () => {
    setReprocessing(true);
    setReprocessMsg(null);
    try {
      const r = await request("/reprocess", {});
      const n = r && r.cache ? (r.cache.recomputed || 0) : 0;
      const f = r ? (r.files || 0) : 0;
      setReprocessMsg("♻ Reprocessed " + f + " trajectories (" + n + " re-parsed).");
      clearCache(); // a re-parse can change the points — the old cache is invalid
      await loadData();
    } catch (e) {
      setReprocessMsg("♻ Reprocess failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setReprocessing(false);
    }
  }, [loadData]);
  React.useEffect(() => { loadData(); }, [loadData]);
  return { data, breakdown, perf, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg };
}
