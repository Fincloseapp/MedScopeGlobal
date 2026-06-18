import { createServiceRoleClient } from "@/lib/supabase/service";

export type RouteMetric = {
  route: string;
  latency_ms: number;
  status_code: number;
  slow: boolean;
};

const SLOW_THRESHOLD_MS = 3000;

const AUDIT_ROUTES = [
  "/api/v40/health",
  "/api/v41/health",
  "/api/v45/health",
  "/api/v46/security/report",
  "/api/v38/health",
];

export async function auditRoutePerformance(baseUrl: string): Promise<{
  metrics: RouteMetric[];
  slow_routes: string[];
  suggestions: string[];
  avg_latency_ms: number;
  audited_at: string;
}> {
  const metrics: RouteMetric[] = [];

  for (const route of AUDIT_ROUTES) {
    const start = Date.now();
    let status_code = 0;
    try {
      const res = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(15000) });
      status_code = res.status;
    } catch {
      status_code = 0;
    }
    const latency_ms = Date.now() - start;
    const slow = latency_ms > SLOW_THRESHOLD_MS;
    metrics.push({ route, latency_ms, status_code, slow });

    try {
      const admin = createServiceRoleClient();
      await admin.from("v45_performance_logs").insert({
        route,
        latency_ms,
        status_code,
        slow,
      });
    } catch {
      /* table may not exist */
    }
  }

  const slow_routes = metrics.filter((m) => m.slow).map((m) => m.route);
  const suggestions: string[] = [];
  if (slow_routes.length) {
    suggestions.push(`Slow routes detected (>${SLOW_THRESHOLD_MS}ms): ${slow_routes.join(", ")} — consider edge caching for health endpoints`);
  }
  if (metrics.some((m) => m.status_code === 0)) {
    suggestions.push("Some routes timed out — verify deployment and cold-start settings");
  }
  if (!slow_routes.length && metrics.every((m) => m.status_code >= 200 && m.status_code < 400)) {
    suggestions.push("All audited routes within performance budget");
  }

  const avg_latency_ms = Math.round(
    metrics.reduce((s, m) => s + m.latency_ms, 0) / Math.max(metrics.length, 1)
  );

  return { metrics, slow_routes, suggestions, avg_latency_ms, audited_at: new Date().toISOString() };
}
