/**
 * Apply ecosystem migrations (20260825*) via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in .env.local or npx supabase login token file.
 */
import { loadProjectEnv } from "./load-env.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function getTokenFromFile() {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  for (const p of [
    path.join(home, ".supabase", "access-token"),
    path.join(home, ".config", "supabase", "access-token"),
  ]) {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8").trim();
  }
  return null;
}

function projectRef(env) {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const m = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)/);
  return m?.[1] ?? null;
}

async function runQuery(token, ref, sql, { retries = 4 } = {}) {
  let lastErr;
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
        if ([429, 502, 503, 504].includes(res.status) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        throw new Error(`API ${res.status}: ${text.slice(0, 400)}`);
      }
      return;
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      if (attempt < retries && /timeout|ECONNRESET|fetch failed/i.test(msg)) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

const files = [
  "supabase/migrations/20260825120000_mediflow_ecosystem.sql",
  "supabase/migrations/20260825220000_editorial_redakce.sql",
  "supabase/migrations/20260825230000_editorial_images.sql",
];

const env = loadProjectEnv(root);
const ref = projectRef(env);
const token = env.SUPABASE_ACCESS_TOKEN || (await getTokenFromFile());

if (!ref || !token) {
  console.error(`
Missing Supabase Management API credentials.

Add to .env.local:
  SUPABASE_ACCESS_TOKEN=...  (https://supabase.com/dashboard/account/tokens)

Or run: npx supabase login

Then retry: MEDSCOPE_PROJECT_ROOT=${root} pnpm db:apply-ecosystem
`);
  process.exit(1);
}

console.log(`Project: ${ref}`);
console.log(`Applying ${files.length} ecosystem migration files...\n`);

for (const rel of files) {
  const sql = fs.readFileSync(path.join(root, rel), "utf8");
  process.stdout.write(`→ ${path.basename(rel)} ... `);
  try {
    await runQuery(token, ref, sql);
    console.log("OK");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/already exists|duplicate key|relation .* already exists/i.test(msg)) {
      console.log("SKIP (already applied)");
      continue;
    }
    console.log("FAILED");
    console.error(msg);
    process.exit(1);
  }
}

console.log("\nDone. Run: MEDSCOPE_PROJECT_ROOT=" + root + " pnpm db:verify");
