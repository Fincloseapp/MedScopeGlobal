/** Supabase Management API — run DDL on hosted Postgres (Workers-safe, no pg driver). */

const RETRYABLE = new Set([429, 502, 503, 504]);

export function supabaseProjectRef(url?: string): string | null {
  const raw = url || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const m = raw.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? process.env.SUPABASE_PROJECT_REF ?? null;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runManagementQuery(
  sql: string,
  opts: { token?: string; projectRef?: string; retries?: number } = {}
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const token = opts.token ?? process.env.SUPABASE_ACCESS_TOKEN;
  const ref =
    opts.projectRef ?? supabaseProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!token || !ref) {
    return {
      ok: false,
      status: 503,
      message: "SUPABASE_ACCESS_TOKEN or project ref missing",
    };
  }

  const retries = opts.retries ?? 4;
  let lastMsg = "";

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `https://api.supabase.com/v1/projects/${ref}/database/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: sql }),
        }
      );

      const text = await res.text();
      if (!res.ok) {
        lastMsg = `API ${res.status}: ${text.slice(0, 400)}`;
        if (RETRYABLE.has(res.status) && attempt < retries) {
          await sleep(2000 * (attempt + 1));
          continue;
        }
        return { ok: false, status: res.status, message: lastMsg };
      }
      return { ok: true };
    } catch (e) {
      lastMsg = e instanceof Error ? e.message : String(e);
      if (attempt < retries && /timeout|ECONNRESET|fetch failed/i.test(lastMsg)) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      return { ok: false, status: 500, message: lastMsg };
    }
  }

  return { ok: false, status: 500, message: lastMsg || "unknown error" };
}
