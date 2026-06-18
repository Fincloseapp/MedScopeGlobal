import { createServiceRoleClient } from "@/lib/supabase/service";

export type RegionProbe = {
  region: string;
  endpoint: string;
  latency_ms: number;
  status_code: number;
  ok: boolean;
  error?: string;
};

const PROBE_TARGETS = [
  { region: "edge-primary", url: "https://medscopeglobal.com/api/v40/health" },
  { region: "vercel-app", url: "https://medscopeglobal.vercel.app/api/v40/health" },
];

export async function probeRegions(): Promise<{
  probes: RegionProbe[];
  overall_ok: boolean;
  probed_at: string;
}> {
  const probes: RegionProbe[] = [];

  for (const target of PROBE_TARGETS) {
    const start = Date.now();
    try {
      const res = await fetch(target.url, {
        method: "GET",
        signal: AbortSignal.timeout(15000),
        headers: { "Cache-Control": "no-cache" },
      });
      const latency_ms = Date.now() - start;
      const probe: RegionProbe = {
        region: target.region,
        endpoint: target.url,
        latency_ms,
        status_code: res.status,
        ok: res.ok,
      };
      probes.push(probe);

      try {
        const admin = createServiceRoleClient();
        await admin.from("v44_region_probes").insert({
          region: probe.region,
          latency_ms: probe.latency_ms,
          status_code: probe.status_code,
          ok: probe.ok,
        });
      } catch {
        /* table may not exist */
      }
    } catch (e) {
      probes.push({
        region: target.region,
        endpoint: target.url,
        latency_ms: Date.now() - start,
        status_code: 0,
        ok: false,
        error: e instanceof Error ? e.message : "probe failed",
      });
    }
  }

  return {
    probes,
    overall_ok: probes.some((p) => p.ok),
    probed_at: new Date().toISOString(),
  };
}
