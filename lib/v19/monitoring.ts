import { v19CacheStats } from "@/lib/v19/cache";
import { v19ConcurrencyStats } from "@/lib/v19/concurrency";

export type V19MetricsSnapshot = {
  status: "ok";
  engine: "v19";
  version: string;
  timestamp: string;
  metrics: {
    requestsTotal: number;
    requestsLastHour: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    errorRate: number;
    fallbackRate: number;
    cacheEntries: number;
    cacheActive: number;
    groqInFlight: number;
    groqQueued: number;
    documentBytesAvg: number;
    auditWritesLastHour: number;
  };
};

const state = {
  requestsTotal: 0,
  requestsLastHour: 0,
  latencies: [] as number[],
  errors: 0,
  fallbacks: 0,
  models: 0,
  lastHourReset: Date.now(),
  documentBytes: [] as number[],
  auditWrites: 0,
};

function maybeResetHour() {
  if (Date.now() - state.lastHourReset > 3_600_000) {
    state.requestsLastHour = 0;
    state.latencies = [];
    state.errors = 0;
    state.fallbacks = 0;
    state.models = 0;
    state.documentBytes = [];
    state.auditWrites = 0;
    state.lastHourReset = Date.now();
  }
}

export function recordV19Request(params: {
  latencyMs: number;
  error?: boolean;
  model?: string;
  documentBytes?: number;
  auditWritten?: boolean;
}) {
  maybeResetHour();
  state.requestsTotal += 1;
  state.requestsLastHour += 1;
  state.latencies.push(params.latencyMs);
  if (params.error) state.errors += 1;
  if (params.model) {
    state.models += 1;
    const m = params.model.toLowerCase();
    if (m.includes("8b") || m.includes("gpt-oss") || m.includes("mixtral")) {
      state.fallbacks += 1;
    }
  }
  if (params.documentBytes) state.documentBytes.push(params.documentBytes);
  if (params.auditWritten) state.auditWrites += 1;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function getV19MonitoringSnapshot(): V19MetricsSnapshot {
  maybeResetHour();
  const cache = v19CacheStats();
  const conc = v19ConcurrencyStats();
  const sorted = [...state.latencies].sort((a, b) => a - b);
  const avg = sorted.length
    ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
    : 0;
  const errorRate =
    state.requestsLastHour > 0
      ? Math.round((state.errors / state.requestsLastHour) * 10000) / 100
      : 0;
  const fallbackRate =
    state.models > 0
      ? Math.round((state.fallbacks / state.models) * 10000) / 100
      : 0;
  const docAvg = state.documentBytes.length
    ? Math.round(
        state.documentBytes.reduce((a, b) => a + b, 0) / state.documentBytes.length
      )
    : 0;

  return {
    status: "ok",
    engine: "v19",
    version: "V19.0.0",
    timestamp: new Date().toISOString(),
    metrics: {
      requestsTotal: state.requestsTotal,
      requestsLastHour: state.requestsLastHour,
      avgLatencyMs: avg,
      p95LatencyMs: Math.round(percentile(sorted, 95)),
      errorRate,
      fallbackRate,
      cacheEntries: cache.entries,
      cacheActive: cache.active,
      groqInFlight: conc.inFlight,
      groqQueued: conc.queued,
      documentBytesAvg: docAvg,
      auditWritesLastHour: state.auditWrites,
    },
  };
}
