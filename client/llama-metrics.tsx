// token-gobbler · client/llama-metrics.tsx
// Llama.cpp Metrics tab: connect to a llama.cpp server's /metrics endpoint,
// poll it live, and plot the key performance gauges (prompt/generation
// throughput, requests processing, speculative decoding acceptance).
//
// The metrics endpoint is Prometheus-style text. We parse it client-side
// and maintain a rolling window of samples for the live charts.

import { fmt, fmtC, fmtMs, badgeGrid } from "./core";
import { costCard } from "./panels";
import { AmBarChart } from "./amchart";

// ── Prometheus metrics parser ──────────────────────────────────────────

type MetricSample = { name: string; labels: Record<string, string>; value: number };

function parsePrometheus(text: string): MetricSample[] {
  const samples: MetricSample[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    // Format: metric_name{labels} value  or  metric_name value
    const match = trimmed.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s*(\{[^}]*\})?\s+([0-9eE.+-]+)$/);
    if (!match) continue;
    const name = match[1];
    const labelsStr = match[2] || "";
    const value = parseFloat(match[3]);
    const labels: Record<string, string> = {};
    if (labelsStr) {
      const inner = labelsStr.slice(1, -1); // remove { }
      for (const pair of inner.split(",")) {
        // Split on first = only (value may contain =)
        const eqIdx = pair.indexOf("=");
        if (eqIdx > 0) {
          const key = pair.slice(0, eqIdx).trim();
          let val = pair.slice(eqIdx + 1).trim();
          // Remove surrounding quotes
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          labels[key] = val;
        }
      }
    }
    samples.push({ name, labels, value });
  }
  return samples;
}

function getMetric(samples: MetricSample[], name: string, labels?: Record<string, string>): number | null {
  for (const s of samples) {
    if (s.name !== name) continue;
    if (labels) {
      let match = true;
      for (const [k, v] of Object.entries(labels)) {
        if (s.labels[k] !== v) { match = false; break; }
      }
      if (!match) continue;
    }
    return s.value;
  }
  return null;
}

// ── Live metrics state ─────────────────────────────────────────────────

type MetricPoint = { time: number; value: number };

const WINDOW_SIZE = 60; // keep 60 seconds of history
const POLL_INTERVAL = 2000; // poll every 2 seconds

export function LlamaMetricsTab() {
  // Server configuration
  const [serverUrl, setServerUrl] = React.useState(() => {
    try {
      const saved = localStorage.getItem("tg_llama_server_url");
      return saved || "http://127.0.0.1:8080";
    } catch { return "http://127.0.0.1:8080"; }
  });
  const [modelName, setModelName] = React.useState(() => {
    try {
      const saved = localStorage.getItem("tg_llama_model_name");
      return saved || "";
    } catch { return ""; }
  });
  const [models, setModels] = React.useState<any[]>([]);
  const [loadingModels, setLoadingModels] = React.useState(false);

  // Live metrics
  const [connected, setConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<number | null>(null);

  // Current snapshot values
  const [promptTokPerSec, setPromptTokPerSec] = React.useState<number | null>(null);
  const [genTokPerSec, setGenTokPerSec] = React.useState<number | null>(null);
  const [requestsProcessing, setRequestsProcessing] = React.useState<number | null>(null);
  const [requestsDeferred, setRequestsDeferred] = React.useState<number | null>(null);
  const [busySlots, setBusySlots] = React.useState<number | null>(null);
  const [specDraftTokens, setSpecDraftTokens] = React.useState<number | null>(null);
  const [specAcceptedTokens, setSpecAcceptedTokens] = React.useState<number | null>(null);
  const [specAcceptanceRate, setSpecAcceptanceRate] = React.useState<number | null>(null);
  const [promptTokensTotal, setPromptTokensTotal] = React.useState<number | null>(null);
  const [genTokensTotal, setGenTokensTotal] = React.useState<number | null>(null);
  const [cachedTokensTotal, setCachedTokensTotal] = React.useState<number | null>(null);

  // Time-series data for charts
  const [throughputHistory, setThroughputHistory] = React.useState<{
    time: string; prompt: number; gen: number;
  }[]>([]);
  const [requestHistory, setRequestHistory] = React.useState<{
    time: string; processing: number; deferred: number;
  }[]>([]);
  const [specHistory, setSpecHistory] = React.useState<{
    time: string; rate: number;
  }[]>([]);

  const pollTimer = React.useRef<number | null>(null);

  // Save server URL when it changes
  React.useEffect(() => {
    try { localStorage.setItem("tg_llama_server_url", serverUrl); } catch {}
  }, [serverUrl]);

  // Save model name when it changes
  React.useEffect(() => {
    try { localStorage.setItem("tg_llama_model_name", modelName); } catch {}
  }, [modelName]);

  // Fetch available models
  const loadModels = React.useCallback(async () => {
    setLoadingModels(true);
    setError(null);
    try {
      const url = serverUrl.replace(/\/+$/, "");
      const resp = await fetch(`${url}/models`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const modelList = Array.isArray(data) ? data : (data.data || []);
      setModels(modelList);
      // Auto-select first loaded model if none selected
      if (!modelName && modelList.length > 0) {
        const loaded = modelList.find((m: any) => m.status && m.status.value === "loaded");
        if (loaded) {
          setModelName(loaded.id);
          try { localStorage.setItem("tg_llama_model_name", loaded.id); } catch {}
        }
      }
    } catch (e: any) {
      setError("Failed to load models: " + (e.message || String(e)));
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [serverUrl, modelName]);

  // Poll metrics
  const pollMetrics = React.useCallback(async () => {
    if (!modelName) return;
    try {
      const url = serverUrl.replace(/\/+$/, "");
      const modelParam = encodeURIComponent(modelName);
      const resp = await fetch(`${url}/metrics?model=${modelParam}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      const samples = parsePrometheus(text);

      // Extract gauge values
      const ptps = getMetric(samples, "llamacpp:prompt_tokens_seconds");
      const gtps = getMetric(samples, "llamacpp:predicted_tokens_seconds");
      const rp = getMetric(samples, "llamacpp:requests_processing");
      const rd = getMetric(samples, "llamacpp:requests_deferred");
      const bs = getMetric(samples, "llamacpp:n_busy_slots_per_decode");
      const sd = getMetric(samples, "llamacpp:spec_decode_num_draft_tokens_total");
      const sa = getMetric(samples, "llamacpp:spec_decode_num_accepted_tokens_total");
      const pt = getMetric(samples, "llamacpp:prompt_tokens_total");
      const gt = getMetric(samples, "llamacpp:tokens_predicted_total");
      const ct = getMetric(samples, "llamacpp:prompt_tokens_cached_total");

      setPromptTokPerSec(ptps);
      setGenTokPerSec(gtps);
      setRequestsProcessing(rp);
      setRequestsDeferred(rd);
      setBusySlots(bs);
      setSpecDraftTokens(sd);
      setSpecAcceptedTokens(sa);
      setSpecAcceptanceRate(sd != null && sd > 0 ? (sa || 0) / sd : null);
      setPromptTokensTotal(pt);
      setGenTokensTotal(gt);
      setCachedTokensTotal(ct);

      setConnected(true);
      setError(null);
      setLastUpdate(Date.now());

      // Update time-series
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      setThroughputHistory((prev) => {
        const next = [...prev, { time: timeStr, prompt: ptps || 0, gen: gtps || 0 }];
        if (next.length > 60) next.shift();
        return next;
      });

      setRequestHistory((prev) => {
        const next = [...prev, { time: timeStr, processing: rp || 0, deferred: rd || 0 }];
        if (next.length > 60) next.shift();
        return next;
      });

      const specRate = sd != null && sd > 0 ? (sa || 0) / sd : 0;
      setSpecHistory((prev) => {
        const next = [...prev, { time: timeStr, rate: specRate }];
        if (next.length > 60) next.shift();
        return next;
      });

    } catch (e: any) {
      setConnected(false);
      setError("Failed to fetch metrics: " + (e.message || String(e)));
    }
  }, [serverUrl, modelName]);

  // Start/stop polling
  React.useEffect(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    if (modelName) {
      pollMetrics(); // immediate first poll
      pollTimer.current = window.setInterval(pollMetrics, POLL_INTERVAL);
    }
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [modelName, pollMetrics]);

  const formatTime = (ts: number | null): string => {
    if (!ts) return "—";
    return new Date(ts).toLocaleTimeString();
  };

  // Server config UI
  const serverConfig = jsxs("div", {
    className: "tg-card",
    style: { padding: "16px 20px" },
    children: [
      jsxs("div", {
        style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
        children: [
          jsx("label", {
            className: "tg-label",
            style: { whiteSpace: "nowrap" },
            children: "Server URL:"
          }),
          jsx("input", {
            type: "text",
            value: serverUrl,
            onChange: (e: any) => setServerUrl(e.target.value),
            style: {
              flex: 1,
              minWidth: 200,
              padding: "6px 10px",
              fontSize: 13,
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 6,
            },
            placeholder: "http://127.0.0.1:8080"
          }),
          jsx("button", {
            className: "tg-ghost",
            onClick: loadModels,
            disabled: loadingModels,
            children: loadingModels ? "Loading…" : "↻ Load Models"
          }),
        ]
      }),
      models.length > 0 ? jsxs("div", {
        style: { display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" },
        children: [
          jsx("label", {
            className: "tg-label",
            style: { whiteSpace: "nowrap" },
            children: "Model:"
          }),
          jsx("select", {
            value: modelName,
            onChange: (e: any) => setModelName(e.target.value),
            style: {
              flex: 1,
              minWidth: 200,
              padding: "6px 10px",
              fontSize: 13,
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 6,
              maxWidth: 500,
            },
            children: [
              jsx("option", { value: "", children: "— select a model —" }),
              ...models.map((m: any) =>
                jsx("option", {
                  key: m.id,
                  value: m.id,
                  children: `${m.aliases?.[0] || m.id} (${m.status?.value || "?"})`
                })
              ),
            ]
          }),
        ]
      }) : null,
    ]
  });

  // Status indicator
  const statusIndicator = jsxs("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      fontSize: 12,
      color: "#94a3b8",
    },
    children: [
      jsx("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: connected ? "#34d399" : error ? "#f87171" : "#64748b",
          display: "inline-block",
        }
      }),
      connected
        ? `Connected — last update ${formatTime(lastUpdate)}`
        : error
          ? error
          : "Not connected — select a model to start polling",
    ]
  });

  // Live gauges
  const gauges = jsxs("div", {
    style: { marginTop: 20 },
    children: [
      jsx("div", {
        className: "tg-label",
        style: { marginBottom: 10 },
        children: "⚡ Live Throughput"
      }),
      badgeGrid([
        costCard("Prompt throughput", promptTokPerSec != null ? `${promptTokPerSec.toFixed(1)} tok/s` : "—", "prompt processing speed", "#38bdf8"),
        costCard("Generation throughput", genTokPerSec != null ? `${genTokPerSec.toFixed(1)} tok/s` : "—", "token generation speed", "#a78bfa"),
        costCard("Requests processing", requestsProcessing != null ? fmt(requestsProcessing) : "—", "actively being processed", "#fbbf24"),
        costCard("Requests deferred", requestsDeferred != null ? fmt(requestsDeferred) : "—", "waiting for capacity", "#f472b6"),
      ]),
    ]
  });

  // Speculative decoding gauges
  const specGauges = jsxs("div", {
    style: { marginTop: 20 },
    children: [
      jsx("div", {
        className: "tg-label",
        style: { marginBottom: 10 },
        children: "🎯 Speculative Decoding"
      }),
      badgeGrid([
        costCard("Draft tokens", specDraftTokens != null ? fmtC(specDraftTokens) : "—", "total draft tokens generated", "#34d399"),
        costCard("Accepted tokens", specAcceptedTokens != null ? fmtC(specAcceptedTokens) : "—", "draft tokens accepted", "#2dd4bf"),
        costCard("Acceptance rate", specAcceptanceRate != null ? `${(specAcceptanceRate * 100).toFixed(1)}%` : "—", "accepted / drafted", "#fbbf24"),
        costCard("Busy slots", busySlots != null ? `${busySlots.toFixed(1)}` : "—", "avg busy slots per decode", "#a78bfa"),
      ]),
    ]
  });

  // Token totals
  const tokenTotals = jsxs("div", {
    style: { marginTop: 20 },
    children: [
      jsx("div", {
        className: "tg-label",
        style: { marginBottom: 10 },
        children: "🪙 Token Totals (since server start)"
      }),
      badgeGrid([
        costCard("Prompt tokens", promptTokensTotal != null ? fmtC(promptTokensTotal) : "—", "uncached prompt tokens", "#60a5fa"),
        costCard("Cached tokens", cachedTokensTotal != null ? fmtC(cachedTokensTotal) : "—", "reused from cache", "#2dd4bf"),
        costCard("Generated tokens", genTokensTotal != null ? fmtC(genTokensTotal) : "—", "output tokens", "#a78bfa"),
      ]),
    ]
  });

  // Throughput chart
  const throughputChart = throughputHistory.length > 1 ? jsxs("div", {
    style: { marginTop: 24 },
    children: [
      jsx("div", {
        className: "tg-label",
        style: { marginBottom: 8 },
        children: "📈 Throughput over time (tok/s)"
      }),
      jsx(AmBarChart, {
        data: throughputHistory,
        categoryField: "time",
        kind: "line",
        smooth: true,
        series: [
          { key: "prompt", label: "Prompt", color: "#38bdf8", unit: "tok/s", axis: 0 },
          { key: "gen", label: "Generation", color: "#a78bfa", unit: "tok/s", axis: 0 },
        ],
        height: 200,
      }),
    ]
  }) : null;

  // Requests chart
  const requestsChart = requestHistory.length > 1 ? jsxs("div", {
    style: { marginTop: 24 },
    children: [
      jsx("div", {
        className: "tg-label",
        style: { marginBottom: 8 },
        children: "📊 Requests over time"
      }),
      jsx(AmBarChart, {
        data: requestHistory,
        categoryField: "time",
        kind: "line",
        smooth: true,
        series: [
          { key: "processing", label: "Processing", color: "#fbbf24", unit: "req", axis: 0 },
          { key: "deferred", label: "Deferred", color: "#f472b6", unit: "req", axis: 0 },
        ],
        height: 160,
      }),
    ]
  }) : null;

  // Speculative decoding chart
  const specChart = specHistory.length > 1 ? jsxs("div", {
    style: { marginTop: 24 },
    children: [
      jsx("div", {
        className: "tg-label",
        style: { marginBottom: 8 },
        children: "🎯 Speculative decoding acceptance rate over time"
      }),
      jsx(AmBarChart, {
        data: specHistory,
        categoryField: "time",
        kind: "line",
        smooth: true,
        series: [
          { key: "rate", label: "Acceptance rate", color: "#34d399", unit: "%", axis: 0 },
        ],
        height: 160,
      }),
    ]
  }) : null;

  if (!modelName) {
    return jsxs("div", {
      style: { display: "flex", flexDirection: "column", gap: 16 },
      children: [
        serverConfig,
        statusIndicator,
        jsx("div", {
          className: "tg-faint",
          style: { fontSize: 11, marginTop: 20 },
          children: "Configure the llama.cpp server URL above and load the available models. Once a model is selected, metrics are polled every 2 seconds and plotted live."
        }),
      ]
    });
  }

  return jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: 16 },
    children: [
      serverConfig,
      statusIndicator,
      gauges,
      specGauges,
      tokenTotals,
      throughputChart,
      requestsChart,
      specChart,
      jsx("div", {
        className: "tg-faint",
        style: { fontSize: 11, marginTop: 20 },
        children: `Polling ${serverUrl} every ${POLL_INTERVAL / 1000}s. Metrics source: llama.cpp /metrics endpoint (Prometheus format). Throughput gauges are server-reported averages since last request; charts show the rolling window of sampled values.`
      }),
    ]
  });
}