/**
 * Applies Supabase SQL migrations via Management API.
 * Requires: npx supabase login  OR  SUPABASE_ACCESS_TOKEN in .env.local
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local — run: npm run env:setup");
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

function projectRef(env) {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? null;
}

async function getAccessToken(env) {
  if (env.SUPABASE_ACCESS_TOKEN) return env.SUPABASE_ACCESS_TOKEN;

  const home = process.env.USERPROFILE || process.env.HOME || "";
  const candidates = [
    path.join(home, ".supabase", "access-token"),
    path.join(home, ".config", "supabase", "access-token"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf8").trim();
    }
  }
  return null;
}

function isRetryableStatus(status) {
  return status === 502 || status === 503 || status === 504 || status === 429;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
        if (isRetryableStatus(res.status) && attempt < retries) {
          const wait = 2000 * (attempt + 1);
          console.warn(`  retry ${attempt + 1}/${retries} after ${res.status}, wait ${wait}ms`);
          await sleep(wait);
          continue;
        }
        throw new Error(`API ${res.status}: ${text.slice(0, 500)}`);
      }
      return text;
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      if (attempt < retries && /timeout|ECONNRESET|fetch failed/i.test(msg)) {
        const wait = 2000 * (attempt + 1);
        console.warn(`  retry ${attempt + 1}/${retries} (${msg.slice(0, 60)}…)`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

async function main() {
  const env = loadEnv();
  const ref = projectRef(env);
  const token = await getAccessToken(env);

  if (!ref) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_REF in .env.local");
    process.exit(1);
  }

  if (!token) {
    console.log(`
No Supabase access token found.

Option A (recommended):
  npx supabase login
  npm run db:setup

Option B:
  Add SUPABASE_ACCESS_TOKEN from https://supabase.com/dashboard/account/tokens
  to .env.local, then run: npm run db:setup

Option C:
  Open Supabase SQL Editor and run file:
  supabase/APPLY_IN_DASHBOARD.sql
  https://supabase.com/dashboard/project/${ref}/sql/new
`);
    process.exit(1);
  }

  const migDir = path.join(root, "supabase", "migrations");
  const files = fs
    .readdirSync(migDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Project: ${ref}`);
  console.log(`Applying ${files.length} migration files...\n`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migDir, file), "utf8");
    process.stdout.write(`→ ${file} ... `);
    try {
      await runQuery(token, ref, sql);
      console.log("OK");
    } catch (e) {
      console.log("FAILED");
      console.error(e.message);
    }
  }

  const seedPath = path.join(root, "supabase", "seed-medical.sql");
  if (fs.existsSync(seedPath)) {
    process.stdout.write("→ seed-medical.sql ... ");
    try {
      await runQuery(token, ref, fs.readFileSync(seedPath, "utf8"));
      console.log("OK");
    } catch (e) {
      console.log("FAILED");
      console.error(e.message);
    }
  }

  console.log("\nDone. Run: npm run db:verify");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
