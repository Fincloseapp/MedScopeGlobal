/** Worker scheduled() pulse — HTTP self-call so Next/Supabase run in request context. */

export function arenaPulsePaths(at = new Date()): string[] {
  const paths = ["/api/cron/agent-arena"];
  if (at.getUTCMinutes() % 15 === 0) {
    paths.push("/api/cron/growth-sprint?light=1");
  }
  return paths;
}

export type ArenaPulseEnv = {
  CRON_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  WORKER_SELF_REFERENCE?: { fetch: typeof fetch };
};

export async function runArenaRacePulse(
  env: ArenaPulseEnv,
  at = new Date()
): Promise<{ ok: boolean; results: { path: string; status: number }[]; error?: string }> {
  const secret = env.CRON_SECRET;
  if (!secret) return { ok: false, results: [], error: "missing CRON_SECRET" };
  const origin = (env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com").replace(/\/$/, "");
  const fetcher = env.WORKER_SELF_REFERENCE?.fetch?.bind(env.WORKER_SELF_REFERENCE) ?? fetch;
  const results: { path: string; status: number }[] = [];
  for (const path of arenaPulsePaths(at)) {
    const res = await fetcher(
      new Request(`${origin}${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
      })
    );
    results.push({ path, status: res.status });
  }
  return {
    ok: results.every((row) => row.status === 200 || row.status === 204 || row.status === 207),
    results,
  };
}
