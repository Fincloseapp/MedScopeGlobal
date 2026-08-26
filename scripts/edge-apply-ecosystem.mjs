/**
 * One-off edge worker — apply ecosystem migrations using Worker secrets.
 * Run: pnpm db:edge-apply-ecosystem
 * Or:  npx wrangler dev -c scripts/wrangler-edge-apply.jsonc --remote --port 8787
 * Then: curl http://127.0.0.1:8787/
 */
import { MIGRATIONS } from "./edge-apply-ecosystem-data.mjs";

async function runQuery(token, ref, sql) {
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
  if (!res.ok) throw new Error(`API ${res.status}: ${text.slice(0, 400)}`);
}

export default {
  async fetch(_request, env) {
    const token = env.SUPABASE_ACCESS_TOKEN;
    const ref =
      env.SUPABASE_PROJECT_REF ||
      env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];

    if (!token || !ref) {
      return Response.json(
        {
          ok: false,
          error: "Missing SUPABASE_ACCESS_TOKEN or project ref in Worker secrets",
          hasToken: Boolean(token),
          hasRef: Boolean(ref),
        },
        { status: 503 }
      );
    }

    const results = [];
    for (const migration of MIGRATIONS) {
      try {
        await runQuery(token, ref, migration.sql);
        results.push({ name: migration.name, ok: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/already exists|duplicate key|relation .* already exists/i.test(msg)) {
          results.push({ name: migration.name, ok: true, skipped: true });
          continue;
        }
        results.push({ name: migration.name, ok: false, error: msg });
        return Response.json({ ok: false, projectRef: ref, results }, { status: 500 });
      }
    }
    return Response.json({ ok: true, projectRef: ref, results });
  },
};
