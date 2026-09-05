// token-gobbler · client/hooks.ts
// Shared data fetch hook + the settings→modal open-ref.
import { request } from "./core";

// shared open-ref (settings dashboard -> modal)
export const activityRef: { open: ((tab?: string) => void) | null } = { open: null };

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
    try {
      // A 404 means the route is genuinely missing (e.g. the web server hasn't been
      // restarted to load the plugin) -> null, so the UI shows "restart the web server".
      // Any other failure is a real error -> { __error }, so the UI surfaces the actual
      // message instead of masquerading it as "unavailable".
      const missing = (e: any) => (e && e.status === 404 ? null : { __error: e instanceof Error ? e.message : String(e) });
      const [u, b, p] = await Promise.all([request("/usage"), request("/breakdown").catch(missing), request("/performance").catch(missing)]);
      setData(u); setBreakdown(b); setPerf(p); setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false); setRefreshing(false);
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
