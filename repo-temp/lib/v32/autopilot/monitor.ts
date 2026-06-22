const PRODUCTION_BASE =
  process.env.PRODUCTION_URL?.replace(/\/$/, "") ??
  process.env.PROD_BASE_URL?.replace(/\/$/, "") ??
  "https://medscopeglobal.com";

const HEALTH_ENDPOINTS = [
  "/api/v30/health",
  "/api/v31/health",
  "/api/v32/health",
  "/api/v29/health",
  "/api/academy/health",
];

export type MonitorFailure = { endpoint: string; status: number; error?: string };

export async function runAutopilotMonitor(): Promise<{
  ok: boolean;
  checks: { endpoint: string; status: number; latencyMs: number; ok: boolean }[];
  failures: MonitorFailure[];
}> {
  const checks: { endpoint: string; status: number; latencyMs: number; ok: boolean }[] = [];
  const failures: MonitorFailure[] = [];

  for (const endpoint of HEALTH_ENDPOINTS) {
    const url = `${PRODUCTION_BASE}${endpoint}`;
    const t0 = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      const latencyMs = Date.now() - t0;
      const ok = res.status >= 200 && res.status < 400;
      checks.push({ endpoint, status: res.status, latencyMs, ok });
      if (!ok) failures.push({ endpoint, status: res.status });
    } catch (e) {
      const latencyMs = Date.now() - t0;
      checks.push({ endpoint, status: 0, latencyMs, ok: false });
      failures.push({
        endpoint,
        status: 0,
        error: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return { ok: failures.length === 0, checks, failures };
}
