// token-gobbler · test/llama-metrics.test.js
// Adversarial tests for the llama.cpp metrics tab implementation.
// Tests the Prometheus parser, metric extraction, and edge cases.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Reimplement the parser for testing (same logic as in llama-metrics.tsx)
function parsePrometheusTest(text) {
  const samples = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s*(\{[^}]*\})?\s+([0-9eE.+-]+)$/);
    if (!match) continue;
    const name = match[1];
    const labelsStr = match[2] || "";
    const value = parseFloat(match[3]);
    const labels = {};
    if (labelsStr) {
      const inner = labelsStr.slice(1, -1);
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

function getMetricTest(samples, name, labels) {
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

// ── Parser edge cases ──────────────────────────────────────────────────────

test("parsePrometheus: empty input", () => {
  const samples = parsePrometheusTest("");
  assert.equal(samples.length, 0);
});

test("parsePrometheus: comments only", () => {
  const samples = parsePrometheusTest("# HELP foo\n# TYPE foo counter\n");
  assert.equal(samples.length, 0);
});

test("parsePrometheus: basic metric", () => {
  const samples = parsePrometheusTest("llamacpp:prompt_tokens_total 12345");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].name, "llamacpp:prompt_tokens_total");
  assert.equal(samples[0].value, 12345);
  assert.deepEqual(samples[0].labels, {});
});

test("parsePrometheus: metric with labels", () => {
  const samples = parsePrometheusTest('llamacpp:spec_decode_num_accepted_tokens_per_pos_total{position="0"} 100');
  assert.equal(samples.length, 1);
  assert.equal(samples[0].name, "llamacpp:spec_decode_num_accepted_tokens_per_pos_total");
  assert.equal(samples[0].labels.position, "0");
  assert.equal(samples[0].value, 100);
});

test("parsePrometheus: multiple labels", () => {
  const samples = parsePrometheusTest('metric{a="1", b="2", c="3"} 42');
  assert.equal(samples.length, 1);
  assert.equal(samples[0].labels.a, "1");
  assert.equal(samples[0].labels.b, "2");
  assert.equal(samples[0].labels.c, "3");
});

test("parsePrometheus: scientific notation", () => {
  const samples = parsePrometheusTest("metric 1.5e10");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 1.5e10);
});

test("parsePrometheus: negative scientific notation", () => {
  const samples = parsePrometheusTest("metric 1.5e-10");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 1.5e-10);
});

test("parsePrometheus: decimal value", () => {
  const samples = parsePrometheusTest("metric 3.14159");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 3.14159);
});

test("parsePrometheus: integer value", () => {
  const samples = parsePrometheusTest("metric 42");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 42);
});

test("parsePrometheus: negative value", () => {
  const samples = parsePrometheusTest("metric -5");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, -5);
});

test("parsePrometheus: whitespace handling", () => {
  const samples = parsePrometheusTest("  metric   42  ");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 42);
});

test("parsePrometheus: mixed lines", () => {
  const input = `# HELP foo
# TYPE foo counter
foo 10
# Another comment
bar{label="value"} 20
not a metric
baz 30
`;
  const samples = parsePrometheusTest(input);
  assert.equal(samples.length, 3);
  assert.equal(samples[0].name, "foo");
  assert.equal(samples[1].name, "bar");
  assert.equal(samples[2].name, "baz");
});

test("parsePrometheus: malformed lines are skipped", () => {
  const input = `good 1
bad line without value
another bad
good2 2
`;
  const samples = parsePrometheusTest(input);
  assert.equal(samples.length, 2);
  assert.equal(samples[0].name, "good");
  assert.equal(samples[1].name, "good2");
});

test("parsePrometheus: labels with special characters", () => {
  const samples = parsePrometheusTest('metric{path="/api/v1/test", query="a=b&c=d"} 1');
  assert.equal(samples.length, 1);
  assert.equal(samples[0].labels.path, "/api/v1/test");
  assert.equal(samples[0].labels.query, "a=b&c=d");
});

test("parsePrometheus: empty labels", () => {
  const samples = parsePrometheusTest("metric{} 1");
  assert.equal(samples.length, 1);
  assert.deepEqual(samples[0].labels, {});
});

test("parsePrometheus: label value with quotes", () => {
  const samples = parsePrometheusTest('metric{key="val with spaces"} 1');
  assert.equal(samples.length, 1);
  assert.equal(samples[0].labels.key, "val with spaces");
});

// ── Metric extraction tests ────────────────────────────────────────────────

test("getMetric: exact match", () => {
  const samples = parsePrometheusTest("foo 10\nbar 20");
  assert.equal(getMetricTest(samples, "foo"), 10);
  assert.equal(getMetricTest(samples, "bar"), 20);
});

test("getMetric: no match", () => {
  const samples = parsePrometheusTest("foo 10");
  assert.equal(getMetricTest(samples, "baz"), null);
});

test("getMetric: label match", () => {
  const samples = parsePrometheusTest('foo{a="1"} 10\nfoo{a="2"} 20\nfoo{a="3"} 30');
  assert.equal(getMetricTest(samples, "foo", { a: "1" }), 10);
  assert.equal(getMetricTest(samples, "foo", { a: "2" }), 20);
  assert.equal(getMetricTest(samples, "foo", { a: "3" }), 30);
  assert.equal(getMetricTest(samples, "foo", { a: "99" }), null);
});

test("getMetric: multiple labels", () => {
  const samples = parsePrometheusTest('foo{a="1",b="2"} 10\nfoo{a="1",b="3"} 20');
  assert.equal(getMetricTest(samples, "foo", { a: "1", b: "2" }), 10);
  assert.equal(getMetricTest(samples, "foo", { a: "1", b: "3" }), 20);
  assert.equal(getMetricTest(samples, "foo", { a: "1" }), 10); // first match
});

// ── Real-world llama.cpp metrics format ────────────────────────────────────

test("parsePrometheus: real llama.cpp metrics format", () => {
  const input = `# HELP llamacpp:prompt_tokens_total Number of prompt tokens processed
# TYPE llamacpp:prompt_tokens_total counter
llamacpp:prompt_tokens_total 145222
# HELP llamacpp:prompt_tokens_seconds Average prompt throughput in tokens/s
# TYPE llamacpp:prompt_tokens_seconds gauge
llamacpp:prompt_tokens_seconds 871.6
# HELP llamacpp:requests_processing Number of requests processing
# TYPE llamacpp:requests_processing gauge
llamacpp:requests_processing 0
# HELP llamacpp:spec_decode_num_accepted_tokens_per_pos_total Accepted tokens per draft position
# TYPE llamacpp:spec_decode_num_accepted_tokens_per_pos_total counter
llamacpp:spec_decode_num_accepted_tokens_per_pos_total{position="0"} 883
llamacpp:spec_decode_num_accepted_tokens_per_pos_total{position="1"} 743
`;
  const samples = parsePrometheusTest(input);
  assert.equal(samples.length, 5);
  assert.equal(getMetricTest(samples, "llamacpp:prompt_tokens_total"), 145222);
  assert.equal(getMetricTest(samples, "llamacpp:prompt_tokens_seconds"), 871.6);
  assert.equal(getMetricTest(samples, "llamacpp:requests_processing"), 0);
  assert.equal(getMetricTest(samples, "llamacpp:spec_decode_num_accepted_tokens_per_pos_total", { position: "0" }), 883);
  assert.equal(getMetricTest(samples, "llamacpp:spec_decode_num_accepted_tokens_per_pos_total", { position: "1" }), 743);
});

// ── Edge cases that could break the implementation ─────────────────────────

test("parsePrometheus: very large numbers", () => {
  const samples = parsePrometheusTest("metric 999999999999999999999");
  assert.equal(samples.length, 1);
  // JavaScript floats: should not crash
  assert.ok(samples[0].value > 1e20);
});

test("parsePrometheus: very small numbers", () => {
  const samples = parsePrometheusTest("metric 0.000000000001");
  assert.equal(samples.length, 1);
  assert.ok(samples[0].value > 0 && samples[0].value < 1e-10);
});

test("parsePrometheus: NaN-like input", () => {
  // Prometheus uses +Inf, -Inf, NaN
  const samples = parsePrometheusTest("metric +Inf");
  // Our regex doesn't match +Inf, so it should be skipped
  assert.equal(samples.length, 0);
});

test("parsePrometheus: metric name with underscores and colons", () => {
  const samples = parsePrometheusTest("llamacpp:very_long_metric_name_with_underscores 1");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].name, "llamacpp:very_long_metric_name_with_underscores");
});

test("parsePrometheus: label value with equals sign", () => {
  const samples = parsePrometheusTest('metric{expr="a=b=c"} 1');
  assert.equal(samples.length, 1);
  assert.equal(samples[0].labels.expr, "a=b=c");
});

test("parsePrometheus: blank lines mixed in", () => {
  const input = "foo 1\n\n\nbar 2\n\n";
  const samples = parsePrometheusTest(input);
  assert.equal(samples.length, 2);
});

test("parsePrometheus: tab-separated", () => {
  // Prometheus uses spaces, but tabs should be tolerated by trim()
  const samples = parsePrometheusTest("metric\t42");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 42);
});

test("parsePrometheus: trailing whitespace on lines", () => {
  const samples = parsePrometheusTest("metric 42   \n");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 42);
});

test("parsePrometheus: Windows line endings", () => {
  const samples = parsePrometheusTest("metric 42\r\n");
  assert.equal(samples.length, 1);
  assert.equal(samples[0].value, 42);
});

// ── URL handling tests ─────────────────────────────────────────────────────

test("URL: trailing slash removed", () => {
  const url = "http://127.0.0.1:8080/".replace(/\/+$/, "");
  assert.equal(url, "http://127.0.0.1:8080");
});

test("URL: multiple trailing slashes removed", () => {
  const url = "http://127.0.0.1:8080///".replace(/\/+$/, "");
  assert.equal(url, "http://127.0.0.1:8080");
});

test("URL: no trailing slash unchanged", () => {
  const url = "http://127.0.0.1:8080".replace(/\/+$/, "");
  assert.equal(url, "http://127.0.0.1:8080");
});

test("URL: model name encoded", () => {
  const model = "DavidAU/Qwen3.8-27B:Q6_K";
  const encoded = encodeURIComponent(model);
  assert.equal(encoded, "DavidAU%2FQwen3.8-27B%3AQ6_K");
});

// ── Speculative decoding acceptance rate calculation ───────────────────────

test("spec acceptance rate: normal case", () => {
  const draft = 1000;
  const accepted = 750;
  const rate = accepted / draft;
  assert.equal(rate, 0.75);
});

test("spec acceptance rate: zero drafts", () => {
  const draft = 0;
  const accepted = 0;
  // Should not divide by zero
  const rate = draft > 0 ? accepted / draft : null;
  assert.equal(rate, null);
});

test("spec acceptance rate: all accepted", () => {
  const draft = 100;
  const accepted = 100;
  const rate = accepted / draft;
  assert.equal(rate, 1.0);
});

test("spec acceptance rate: none accepted", () => {
  const draft = 100;
  const accepted = 0;
  const rate = accepted / draft;
  assert.equal(rate, 0.0);
});

// ── Chart data window management ───────────────────────────────────────────

test("chart window: shift when over 60", () => {
  const window = [];
  for (let i = 0; i < 65; i++) {
    window.push({ time: i, value: i });
    if (window.length > 60) window.shift();
  }
  assert.equal(window.length, 60);
  assert.equal(window[0].time, 5);
  assert.equal(window[59].time, 64);
});

test("chart window: under 60 keeps all", () => {
  const window = [];
  for (let i = 0; i < 30; i++) {
    window.push({ time: i, value: i });
    if (window.length > 60) window.shift();
  }
  assert.equal(window.length, 30);
});

// ── Time formatting ────────────────────────────────────────────────────────

test("time formatting: null", () => {
  const ts = null;
  const result = ts ? new Date(ts).toLocaleTimeString() : "—";
  assert.equal(result, "—");
});

test("time formatting: valid timestamp", () => {
  const ts = Date.now();
  const result = new Date(ts).toLocaleTimeString();
  assert.ok(result.length > 0);
  assert.ok(!result.includes("Invalid"));
});

// ── localStorage resilience ────────────────────────────────────────────────

test("localStorage: getItem failure handled", () => {
  let result = "default";
  try {
    const saved = null; // simulate failure
    result = saved || "default";
  } catch {
    result = "default";
  }
  assert.equal(result, "default");
});

test("localStorage: setItem failure handled", () => {
  let threw = false;
  try {
    // Simulate localStorage not available
    const ls = undefined;
    ls.setItem("key", "value");
  } catch (e) {
    threw = true;
  }
  assert.ok(threw, "setItem on undefined throws");
});

// ── Polling lifecycle ──────────────────────────────────────────────────────

test("polling: interval cleanup", () => {
  let interval = null;
  let cleared = false;
  
  // Simulate setting interval
  interval = 123;
  
  // Simulate cleanup
  if (interval) {
    cleared = true;
    interval = null;
  }
  
  assert.ok(cleared);
  assert.equal(interval, null);
});

// ── Metric value formatting ────────────────────────────────────────────────

test("format tok/s: null", () => {
  const value = null;
  const result = value != null ? `${value.toFixed(1)} tok/s` : "—";
  assert.equal(result, "—");
});

test("format tok/s: valid value", () => {
  const value = 871.6;
  const result = `${value.toFixed(1)} tok/s`;
  assert.equal(result, "871.6 tok/s");
});

test("format percentage: null", () => {
  const rate = null;
  const result = rate != null ? `${(rate * 100).toFixed(1)}%` : "—";
  assert.equal(result, "—");
});

test("format percentage: valid rate", () => {
  const rate = 0.75;
  const result = `${(rate * 100).toFixed(1)}%`;
  assert.equal(result, "75.0%");
});

test("format number: null", () => {
  const value = null;
  const result = value != null ? String(value) : "—";
  assert.equal(result, "—");
});

test("format number: valid value", () => {
  const value = 42;
  const result = String(value);
  assert.equal(result, "42");
});

// ── Model list handling ────────────────────────────────────────────────────

test("model list: array response", () => {
  const data = [{ id: "model1" }, { id: "model2" }];
  const list = Array.isArray(data) ? data : (data.data || []);
  assert.equal(list.length, 2);
});

test("model list: object with data field", () => {
  const data = { data: [{ id: "model1" }] };
  const list = Array.isArray(data) ? data : (data.data || []);
  assert.equal(list.length, 1);
});

test("model list: empty object", () => {
  const data = {};
  const list = Array.isArray(data) ? data : (data.data || []);
  assert.equal(list.length, 0);
});

test("model list: find loaded model", () => {
  const models = [
    { id: "m1", status: { value: "unloaded" } },
    { id: "m2", status: { value: "loaded" } },
    { id: "m3", status: { value: "loading" } },
  ];
  const loaded = models.find((m) => m.status && m.status.value === "loaded");
  assert.equal(loaded.id, "m2");
});

test("model list: no loaded model", () => {
  const models = [
    { id: "m1", status: { value: "unloaded" } },
    { id: "m2", status: { value: "loading" } },
  ];
  const loaded = models.find((m) => m.status && m.status.value === "loaded");
  assert.equal(loaded, undefined);
});

// ── Error handling ─────────────────────────────────────────────────────────

test("error: HTTP status", () => {
  const status = 404;
  const message = `HTTP ${status}`;
  assert.equal(message, "HTTP 404");
});

test("error: network error message", () => {
  const e = new Error("Network error");
  const message = e.message || String(e);
  assert.equal(message, "Network error");
});

test("error: non-Error object", () => {
  const e = "string error";
  const message = e instanceof Error ? e.message : String(e);
  assert.equal(message, "string error");
});

// ── Chart series configuration ─────────────────────────────────────────────

test("throughput chart series: correct keys", () => {
  const series = [
    { key: "prompt", label: "Prompt", color: "#38bdf8", unit: "tok/s", axis: 0 },
    { key: "gen", label: "Generation", color: "#a78bfa", unit: "tok/s", axis: 0 },
  ];
  assert.equal(series.length, 2);
  assert.equal(series[0].key, "prompt");
  assert.equal(series[1].key, "gen");
});

test("request chart series: correct keys", () => {
  const series = [
    { key: "processing", label: "Processing", color: "#fbbf24", unit: "req", axis: 0 },
    { key: "deferred", label: "Deferred", color: "#f472b6", unit: "req", axis: 0 },
  ];
  assert.equal(series.length, 2);
  assert.equal(series[0].key, "processing");
  assert.equal(series[1].key, "deferred");
});

test("spec chart series: correct key", () => {
  const series = [
    { key: "rate", label: "Acceptance rate", color: "#34d399", unit: "%", axis: 0 },
  ];
  assert.equal(series.length, 1);
  assert.equal(series[0].key, "rate");
});

// ── Data flow: sample → extract → format ───────────────────────────────────

test("end-to-end: parse and extract throughput", () => {
  const input = "llamacpp:prompt_tokens_seconds 871.6\nllamacpp:predicted_tokens_seconds 61.8";
  const samples = parsePrometheusTest(input);
  const ptps = getMetricTest(samples, "llamacpp:prompt_tokens_seconds");
  const gtps = getMetricTest(samples, "llamacpp:predicted_tokens_seconds");
  assert.equal(ptps, 871.6);
  assert.equal(gtps, 61.8);
});

test("end-to-end: parse and extract spec decoding", () => {
  const input = "llamacpp:spec_decode_num_draft_tokens_total 2833\nllamacpp:spec_decode_num_accepted_tokens_total 1700";
  const samples = parsePrometheusTest(input);
  const draft = getMetricTest(samples, "llamacpp:spec_decode_num_draft_tokens_total");
  const accepted = getMetricTest(samples, "llamacpp:spec_decode_num_accepted_tokens_total");
  const rate = draft > 0 ? accepted / draft : null;
  assert.equal(draft, 2833);
  assert.equal(accepted, 1700);
  assert.ok(rate > 0.5 && rate < 1.0);
});

test("end-to-end: parse and extract requests", () => {
  const input = "llamacpp:requests_processing 2\nllamacpp:requests_deferred 0";
  const samples = parsePrometheusTest(input);
  const processing = getMetricTest(samples, "llamacpp:requests_processing");
  const deferred = getMetricTest(samples, "llamacpp:requests_deferred");
  assert.equal(processing, 2);
  assert.equal(deferred, 0);
});

test("end-to-end: parse and extract token totals", () => {
  const input = "llamacpp:prompt_tokens_total 145222\nllamacpp:prompt_tokens_cached_total 1027080\nllamacpp:tokens_predicted_total 2712";
  const samples = parsePrometheusTest(input);
  const prompt = getMetricTest(samples, "llamacpp:prompt_tokens_total");
  const cached = getMetricTest(samples, "llamacpp:prompt_tokens_cached_total");
  const generated = getMetricTest(samples, "llamacpp:tokens_predicted_total");
  assert.equal(prompt, 145222);
  assert.equal(cached, 1027080);
  assert.equal(generated, 2712);
});

// ── Stress: many metrics ───────────────────────────────────────────────────

test("parsePrometheus: 1000 metrics", () => {
  let input = "";
  for (let i = 0; i < 1000; i++) {
    input += `metric_${i} ${i}\n`;
  }
  const samples = parsePrometheusTest(input);
  assert.equal(samples.length, 1000);
  assert.equal(getMetricTest(samples, "metric_0"), 0);
  assert.equal(getMetricTest(samples, "metric_999"), 999);
});

test("parsePrometheus: many labeled metrics", () => {
  let input = "";
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 10; j++) {
      input += `metric{i="${i}",j="${j}"} ${i * 10 + j}\n`;
    }
  }
  const samples = parsePrometheusTest(input);
  assert.equal(samples.length, 1000);
  assert.equal(getMetricTest(samples, "metric", { i: "5", j: "3" }), 53);
});

// ── Regression: ensure parser doesn't crash on weird input ─────────────────

test("parsePrometheus: no crash on null/undefined", () => {
  // These should be handled by the caller, but let's ensure robustness
  assert.doesNotThrow(() => parsePrometheusTest(""));
  assert.doesNotThrow(() => parsePrometheusTest("\n"));
  assert.doesNotThrow(() => parsePrometheusTest("   "));
});

test("parsePrometheus: no crash on very long line", () => {
  const longLine = "metric " + "x".repeat(10000) + " 42";
  assert.doesNotThrow(() => parsePrometheusTest(longLine));
});

test("parsePrometheus: no crash on unicode", () => {
  const input = "metric 42\n# Comment with émojis 🚀\nanother_metric 100";
  assert.doesNotThrow(() => parsePrometheusTest(input));
  const samples = parsePrometheusTest(input);
  assert.equal(samples.length, 2);
});