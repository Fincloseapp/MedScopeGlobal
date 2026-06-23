type MonitorEvent = {
  eventType: string;
  payload: any;
  timestamp: string;
};

const events: MonitorEvent[] = [];
const MAX_EVENTS = 500;

/** In-process monitoring hook (duration, errors, audit, MKG). */
export function monitor(eventType: string, payload: any = {}): void {
  events.push({
    eventType,
    payload,
    timestamp: new Date().toISOString(),
  });
  if (events.length > MAX_EVENTS) events.shift();

  if (eventType === "job_end" && typeof payload?.durationMs === "number") {
    return;
  }
  if (eventType === "job_error") {
    return;
  }
  if (eventType === "audit_missing") {
    return;
  }
  if (eventType === "mkg_inconsistent") {
    return;
  }
}

export function getMonitorEvents(limit = 100): MonitorEvent[] {
  return events.slice(-limit);
}

export function getMonitorStats(): { total: number; errors: number; avgDurationMs: number } {
  const durations = events
    .filter((e) => e.eventType === "job_end" && typeof e.payload?.durationMs === "number")
    .map((e) => e.payload.durationMs as number);
  const errors = events.filter(
    (e) => e.eventType === "job_error" || e.eventType === "mkg_inconsistent"
  ).length;
  const avgDurationMs =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  return { total: events.length, errors, avgDurationMs };
}

export function monitorAuditIntegrity(audit: any): void {
  const missing: string[] = [];
  if (!audit?.nodesUsed?.length) missing.push("nodesUsed");
  if (!audit?.edgesUsed?.length) missing.push("edgesUsed");
  if (!audit?.inferenceChain?.length) missing.push("inferenceChain");
  if (missing.length) monitor("audit_missing", { missing });
}

export function monitorMkgConsistency(graph: any): void {
  const nodeIds = new Set((graph?.nodes ?? []).map((n: any) => n.id));
  const dangling = (graph?.edges ?? []).filter(
    (e: any) => !nodeIds.has(e.from) || !nodeIds.has(e.to)
  );
  if (dangling.length > 0) monitor("mkg_inconsistent", { danglingEdges: dangling.length });
}
