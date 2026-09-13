// token-gobbler · host
// Registers the token-usage HTTP routes on the DSH web server. The client
// (lib/client.js) renders the settings.section dashboard that calls these.
import { existsSync } from "node:fs";
import { buildReport, buildBreakdown, buildPerformance, loadPricing, savePricing, resolvePaths, discoverModels, discoverModelCards, pricingFilePath, reprocessTrajectories, getCompactionDetail, listImportSources, addImportSource, removeImportSource, updateImportSource, resyncImportSource, scanImportCandidates } from "./report.js";

/** Minimal DSH plugin host context (webServer injection container). */
interface DshContext {
  inject(deps: string[], fn: (wctx: DshWebContext) => void): void;
}
/** The web-context an inject() provides: effect lifecycle + the web server. */
interface DshWebContext {
  effect(fn: () => (() => void) | void, name?: string): void;
  webServer: {
    register(opts: { kind: string; path: string; handler: (req: DshReq, res: DshRes) => void | Promise<void> }): () => void;
  };
}
/** A server request (subset of node:http IncomingMessage used here). */
interface DshReq {
  method?: string;
  url?: string;
  on(event: "data", cb: (chunk: string | Buffer) => void): void;
  on(event: "end", cb: () => void): void;
  on(event: "error", cb: (err: Error) => void): void;
  destroy(): void;
}
/** A server response (subset of node:http ServerResponse used here). */
interface DshRes {
  writeHead(status: number, headers?: Record<string, string>): void;
  setHeader(name: string, value: string): void;
  end(data?: unknown): void;
}

export const name = "token-gobbler";
export const inject = ["webServer"];

export function apply(ctx: DshContext, _config: Record<string, unknown> = {}) {
  const sendJson = (res: DshRes, status: number, body: unknown) => {
    res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify(body));
  };
  const webAction = (method: string, action: () => unknown) => async (req: DshReq, res: DshRes) => {
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
  // Collect raw Buffer chunks and decode ONCE at the end. Decoding each chunk
  // separately (`data += c`) corrupts multibyte UTF-8 characters that are split
  // across chunk boundaries — e.g. a non-ASCII pricing label in a large body
  // would fail JSON.parse with a bogus 400.
  const readBody = (req: DshReq) => new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer | string) => {
      const buf = Buffer.isBuffer(c) ? c : Buffer.from(String(c));
      size += buf.length;
      if (size > 1e6) { reject(new Error("body too large")); req.destroy(); return; }
      chunks.push(buf);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

  // Optional surface: only mounted when the web profile provides a webServer.
  ctx.inject(["webServer"], (wctx) => {
    wctx.effect(() => {
      const disposers: (() => void)[] = [
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
            } catch (error) {
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
        // ── imported DSH homes (other machines / other OSes) ──────────────
        // GET  /token-gobbler/sources           -> { sources }
        // GET  /token-gobbler/sources?scan=1    -> { sources, candidates }
        // POST /token-gobbler/sources           -> { sources, result } for
        //      { action: "add" | "remove" | "resync" | "update", ... }
        // Every mutation answers with the fresh list, so the settings card never
        // needs a second round trip. Nothing here writes to the imported home.
        wctx.webServer.register({
          kind: "prefix",
          path: "/token-gobbler/sources",
          handler: async (req, res) => {
            const home = resolvePaths().dshHome;
            if (req.method === "GET") {
              try {
                const u = new URL(req.url || "", "http://localhost");
                const value: Record<string, unknown> = { sources: listImportSources(home) };
                if (u.searchParams.get("scan")) {
                  const roots = (u.searchParams.get("roots") || "").split(",").map((s) => s.trim()).filter(Boolean);
                  value.candidates = scanImportCandidates(home, roots.length ? roots : undefined);
                }
                sendJson(res, 200, { ok: true, value });
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
              const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
              const action = String(body.action || "");
              const id = String(body.id || "");
              let result: unknown;
              if (action === "add") result = addImportSource(home, body);
              else if (action === "remove") result = removeImportSource(home, id);
              else if (action === "resync") result = resyncImportSource(home, id);
              else if (action === "update") result = updateImportSource(home, id, body);
              else {
                sendJson(res, 400, { ok: false, error: "unknown action: " + (action || "(none)") });
                return;
              }
              sendJson(res, 200, { ok: true, value: { result, sources: listImportSources(home) } });
            } catch (error) {
              // A rejected add (bad path, already imported) is a client error, not a crash.
              sendJson(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
            }
          },
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
              const body = raw ? (JSON.parse(raw) as { models?: unknown; referenceModel?: unknown; baselineModel?: unknown }) : {};
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
