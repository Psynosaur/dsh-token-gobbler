// token-gobbler · host
// Registers the token-usage HTTP routes on the DSH web server. The client
// (lib/client.js) renders the settings.section dashboard that calls these.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildReport, buildBreakdown, buildPerformance, loadPricing, savePricing, resolvePaths, discoverModels, discoverLocalModels, pricingFilePath, reprocessTrajectories } from "./report.js";

// amCharts 5 is vendored locally (vendor/amcharts) so the token charts render
// offline instead of failing on a cdn.amcharts.com fetch. Resolve the directory
// relative to THIS module (lib/index.js) so it works from the checkout and an
// installed package alike. Normalize and strip any trailing separator so the
// served-path containment check compares like-for-like.
const AMCHARTS_ROOT = normalize(fileURLToPath(new URL("../vendor/amcharts/", import.meta.url))).replace(/[/\\]+$/, "");

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
          kind: "prefix",
          path: "/token-gobbler/vendor",
          handler: async (req, res) => {
            // Serve a vendored amCharts asset. Resolve the requested relative
            // path under AMCHARTS_ROOT and refuse anything that escapes it.
            const urlPath = decodeURIComponent((req.url || "").split("?")[0]);
            const rel = normalize(urlPath.replace(/^\/token-gobbler\/vendor/, "").replace(/^[/\\]+/, ""));
            const abs = normalize(join(AMCHARTS_ROOT, rel));
            const mime = {
              ".js": "text/javascript; charset=utf-8",
              ".json": "application/json; charset=utf-8",
            };
            if (abs !== AMCHARTS_ROOT && !abs.startsWith(AMCHARTS_ROOT + sep)) {
              res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
              res.end("forbidden");
              return;
            }
            try {
              const data = await readFile(abs);
              res.writeHead(200, { "content-type": mime[extname(abs)] || "application/octet-stream", "cache-control": "no-store" });
              res.end(data);
            } catch {
              res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
              res.end("not found");
            }
          },
        }),
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
          path: "/token-gobbler/reprocess",
          handler: webAction("POST", () => reprocessTrajectories()),
        }),
        wctx.webServer.register({
          kind: "exact",
          path: "/token-gobbler/discover-models",
          handler: webAction("GET", () => discoverLocalModels(resolvePaths().dshHome)),
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
                const home = resolvePaths().dshHome;
                // With no saved pricing file, seed the FIRST table from the models
                // actually used in the trajectory (discoverModels) so every provider/
                // model you've run gets an editable row.
                const hasSaved = existsSync(pricingFilePath(home));
                sendJson(res, 200, { ok: true, value: loadPricing(home, hasSaved ? null : discoverModels(home)) });
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
