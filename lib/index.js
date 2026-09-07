// token-gobbler · host
// Registers the token-usage HTTP routes on the DSH web server. The client
// (lib/client.js) renders the settings.section dashboard that calls these.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildReport, buildBreakdown, buildPerformance, loadPricing, savePricing, resolvePaths, discoverModels, discoverModelCards, pricingFilePath, reprocessTrajectories, getCompactionDetail } from "./report.js";
// amCharts 5 is vendored locally (vendor/amcharts) so the token charts render
// offline instead of failing on a cdn.amcharts.com fetch. Resolve the directory
// relative to THIS module (lib/index.ts) so it works from the checkout and an
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
        }
        catch (error) {
            sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
    };
    // Collect raw Buffer chunks and decode ONCE at the end. Decoding each chunk
    // separately (`data += c`) corrupts multibyte UTF-8 characters that are split
    // across chunk boundaries — e.g. a non-ASCII pricing label in a large body
    // would fail JSON.parse with a bogus 400.
    const readBody = (req) => new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        req.on("data", (c) => {
            const buf = Buffer.isBuffer(c) ? c : Buffer.from(String(c));
            size += buf.length;
            if (size > 1e6) {
                reject(new Error("body too large"));
                req.destroy();
                return;
            }
            chunks.push(buf);
        });
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
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
                        }
                        catch {
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
                    kind: "prefix",
                    path: "/token-gobbler/compaction",
                    handler: async (req, res) => {
                        // GET /token-gobbler/compaction?session=<sessionId>&index=<n> — the full
                        // detail of one compaction event, INCLUDING the generated summary text
                        // (kept out of the breakdown payload because it can be many KB).
                        if (req.method !== "GET") {
                            res.setHeader("allow", "GET");
                            sendJson(res, 405, { ok: false, error: "Use GET" });
                            return;
                        }
                        try {
                            const u = new URL(req.url || "", "http://localhost");
                            const sessionId = u.searchParams.get("session") || "";
                            const index = Number(u.searchParams.get("index") || "0");
                            if (!sessionId || !Number.isInteger(index) || index < 1) {
                                sendJson(res, 400, { ok: false, error: "session and index (1-based) are required" });
                                return;
                            }
                            const ev = getCompactionDetail(sessionId, index);
                            if (!ev) {
                                sendJson(res, 404, { ok: false, error: "compaction not found" });
                                return;
                            }
                            sendJson(res, 200, { ok: true, value: ev });
                        }
                        catch (error) {
                            sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
                        }
                    },
                }),
                wctx.webServer.register({
                    kind: "exact",
                    path: "/token-gobbler/reprocess",
                    handler: webAction("POST", () => reprocessTrajectories()),
                }),
                wctx.webServer.register({
                    kind: "exact",
                    path: "/token-gobbler/discover-models",
                    handler: webAction("GET", () => discoverModelCards(resolvePaths().dshHome)),
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
                            }
                            catch (error) {
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
                        }
                        catch (error) {
                            sendJson(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
                        }
                    },
                }),
            ];
            return () => { for (const dispose of disposers.reverse())
                dispose(); };
        }, `${name}: token usage routes`);
    });
}
