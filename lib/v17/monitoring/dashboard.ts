import { getMemoryAuditLog } from "@/lib/v17/audit/logger";
import { getMonitorEvents, getMonitorStats } from "@/lib/v17/monitoring/hooks";
import { getVersion } from "@/lib/v17/versioning/version";

export type MonitoringSnapshot = {
  timestamp: string;
  version: string;
  metrics: {
    requestsLastHour: number;
    avgLatencyMs: number;
    errorRate: number;
    fallbackRate: number;
    acpLatencyMs: number;
    mkgLatencyMs: number;
    auditQueueSize: number;
    storageWritesLastHour: number;
  };
};

const HOUR_MS = 60 * 60 * 1000;

function eventsInLastHour(events: ReturnType<typeof getMonitorEvents>): typeof events {
  const cutoff = Date.now() - HOUR_MS;
  return events.filter((event) => {
    const ts = Date.parse(event.timestamp);
    return Number.isFinite(ts) && ts >= cutoff;
  });
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Aggregate in-process monitoring metrics for production dashboard. */
export function getMonitoringSnapshot(): MonitoringSnapshot {
  const events = getMonitorEvents(500);
  const recent = eventsInLastHour(events);
  const stats = getMonitorStats();

  const requestsLastHour = recent.filter((e) => e.eventType === "job_start").length;
  const errors = recent.filter(
    (e) => e.eventType === "job_error" || e.eventType === "mkg_inconsistent"
  ).length;
  const fallbacks = recent.filter(
    (e) =>
      e.eventType === "clinical_unsafe" ||
      e.payload?.fallbackApplied === true
  ).length;

  const acpLatencies = recent
    .filter(
      (e) =>
        e.eventType === "job_end" &&
        e.payload?.job === "acp" &&
        typeof e.payload?.durationMs === "number"
    )
    .map((e) => e.payload.durationMs as number);

  const mkgLatencies = recent
    .filter(
      (e) =>
        e.eventType === "job_end" &&
        e.payload?.job === "graph" &&
        typeof e.payload?.durationMs === "number"
    )
    .map((e) => e.payload.durationMs as number);

  const auditLog = getMemoryAuditLog();
  const auditRecent = auditLog.filter((entry) => {
    const ts = Date.parse(String(entry.timestamp ?? ""));
    return Number.isFinite(ts) && ts >= Date.now() - HOUR_MS;
  });

  const requestBase = Math.max(requestsLastHour, 1);

  return {
    timestamp: new Date().toISOString(),
    version: getVersion(),
    metrics: {
      requestsLastHour,
      avgLatencyMs: Math.round(stats.avgDurationMs),
      errorRate: Number((errors / requestBase).toFixed(4)),
      fallbackRate: Number((fallbacks / requestBase).toFixed(4)),
      acpLatencyMs: Math.round(avg(acpLatencies)),
      mkgLatencyMs: Math.round(avg(mkgLatencies)),
      auditQueueSize: auditLog.length,
      storageWritesLastHour: auditRecent.length,
    },
  };
}
