// token-gobbler · host
// Registers the token-usage HTTP routes on the DSH web server. The client
// (lib/client.js) renders the settings.section dashboard that calls these.
import { buildReport, buildBreakdown, buildPerformance, loadPricing, savePricing, resolvePaths } from "./report.js";

export const name = "token-gobbler";
export const inject = ["webServer"];

export function apply(ctx, _config = {}) {
  const sendJson = (res, status, body) => {
    res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify(body));
  };
  const webAction = (method, action) => async (req, res) => {
    if (req.method !== method) {
      res.setHeader("allow", method);
      sendJson(res, 405, { ok: false, error: `Use ${method}` });
      return;
    }
    try {
      sendJson(res, 200, { ok: true, value: await action() });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  };
  const readBody = (req) => new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) { reject(new Error("body too large")); req.destroy(); }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });

  // Optional surface: only mounted when the web profile provides a webServer.
  ctx.inject(["webServer"], (wctx) => {
    wctx.effect(() => {
      const disposers = [
        wctx.webServer.register({
          kind: "exact",
          path: "/token-gobbler/usage",
          handler: webAction("GET", () => buildReport()),
        }),
        wctx.webServer.register({
          kind: "exact",
          path: "/token-gobbler/breakdown",
          handler: webAction("GET", () => buildBreakdown()),
        }),
        wctx.webServer.register({
          kind: "exact",
          path: "/token-gobbler/performance",
          handler: webAction("GET", () => buildPerformance()),
        }),
        wctx.webServer.register({
          kind: "exact",
          path: "/token-gobbler/summary",
          handler: webAction("GET", () => {
            const r = buildReport();
            return { totals: r.totals, actual: r.actual, comparison: r.comparison, byModel: r.byModel, sources: r.sources };
          }),
        }),
        wctx.webServer.register({
          kind: "exact",
          path: "/token-gobbler/pricing",
          handler: async (req, res) => {
            if (req.method === "GET") {
              try {
                sendJson(res, 200, { ok: true, value: loadPricing(resolvePaths().dshHome) });
              } catch (error) {
                sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
              }
              return;
            }
            if (req.method !== "POST") {
              res.setHeader("allow", "GET, POST");
              sendJson(res, 405, { ok: false, error: "Use GET or POST" });
              return;
            }
            try {
              const raw = await readBody(req);
              const body = raw ? JSON.parse(raw) : {};
              sendJson(res, 200, { ok: true, value: savePricing(resolvePaths().dshHome, body) });
            } catch (error) {
              sendJson(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
            }
          },
        }),
      ];
      return () => { for (const dispose of disposers.reverse()) dispose(); };
    }, `${name}: token usage routes`);
  });
}
