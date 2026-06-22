/** Latency / throughput statistics helpers. */

export function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}

export function summarizeLatencies(latenciesMs) {
  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    count: sorted.length,
    avgMs: sorted.length ? Math.round(sum / sorted.length) : 0,
    minMs: sorted[0] ?? 0,
    maxMs: sorted[sorted.length - 1] ?? 0,
    p50Ms: Math.round(percentile(sorted, 50)),
    p95Ms: Math.round(percentile(sorted, 95)),
    p99Ms: Math.round(percentile(sorted, 99)),
  };
}

export function asciiSparkline(values, width = 40) {
  if (!values.length) return "(no data)";
  const max = Math.max(...values, 1);
  const chars = "▁▂▃▄▅▆▇█";
  const step = Math.max(1, Math.floor(values.length / width));
  const sampled = [];
  for (let i = 0; i < values.length; i += step) sampled.push(values[i]);
  return sampled.map((v) => chars[Math.min(chars.length - 1, Math.floor((v / max) * (chars.length - 1)))]).join("");
}

export function bucketSeries(latenciesMs, bucketMs = 1000) {
  if (!latenciesMs.length) return [];
  const max = Math.max(...latenciesMs);
  const buckets = Math.ceil(max / bucketMs) + 1;
  const hist = Array(buckets).fill(0);
  for (const ms of latenciesMs) {
    hist[Math.min(buckets - 1, Math.floor(ms / bucketMs))] += 1;
  }
  return hist;
}

export function detectFallbackModel(modelField) {
  if (!modelField || typeof modelField !== "string") return "unknown";
  const m = modelField.toLowerCase();
  if (m.includes("mixtral") || m.includes("8b-instant") || m.includes("3.1-8b")) {
    return "mixtral";
  }
  if (m.includes("gemma") || m.includes("gpt-oss") || m.includes("27b")) {
    return "gemma2";
  }
  if (m.includes("llama") || m.includes("70b") || m.includes("versatile")) {
    return "primary";
  }
  return "other";
}
