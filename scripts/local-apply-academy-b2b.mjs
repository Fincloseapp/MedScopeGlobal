#!/usr/bin/env node
/**
 * Local helper: apply B2B CME migrations using .env.local without printing secrets.
 * Tries: DATABASE_URL → POSTGRES_* parts → production setup API (CRON_SECRET).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

function loadEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!v || v === "******" || v === "[SENSITIVE]" || v === "[REDACTED]") continue;
    out[m[1].trim()] = v;
  }
  return out;
}

function usable(v) {
  return Boolean(v) && v.length > 3 && !v.includes("[SENSITIVE]");
}

function pickDbUrl(env) {
  for (const key of ["DIRECT_URL", "DATABASE_URL", "SUPABASE_DB_URL", "POSTGRES_URL"]) {
    const url = env[key];
    if (!usable(url)) continue;
    try {
      const u = new URL(url);
      if (u.hostname && u.hostname.includes(".") && u.hostname !== "base") return url;
    } catch {
      /* skip */
    }
  }
  const host = env.POSTGRES_HOST;
  const user = env.POSTGRES_USER;
  const pass = env.POSTGRES_PASSWORD;
  const db = env.POSTGRES_DATABASE || "postgres";
  if (usable(host) && usable(user) && usable(pass) && host.includes(".")) {
    return (
      "postgresql://" +
      encodeURIComponent(user) +
      ":" +
      encodeURIComponent(pass) +
      "@" +
      host +
      ":5432/" +
      encodeURIComponent(db)
    );
  }
  return null;
}

const env = loadEnvFile(envPath);
const report = {
  has_cron: usable(env.CRON_SECRET),
  has_db_url: Boolean(pickDbUrl(env)),
  has_pg_host: usable(env.POSTGRES_HOST),
  has_pg_pass: usable(env.POSTGRES_PASSWORD),
  has_supabase_token: usable(env.SUPABASE_ACCESS_TOKEN),
  has_vercel_token: usable(env.VERCEL_TOKEN),
};
console.log(JSON.stringify(report));

const files = [
  "supabase/migrations/20260718120000_academy_b2b_cme.sql",
  "supabase/migrations/20260718120100_academy_b2b_cme_seed.sql",
].map((rel) => path.join(root, rel));

const dbUrl = pickDbUrl(env);
if (dbUrl) {
  const { default: pg } = await import("pg");
  const host = new URL(dbUrl).hostname;
  console.log("using_pg_host=" + host);
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (const file of files) {
      process.stdout.write("-> " + path.basename(file) + " ... ");
      await client.query(fs.readFileSync(file, "utf8"));
      console.log("OK");
    }
    const cols = await client.query(
      `select column_name from information_schema.columns
       where table_schema='public' and table_name='users'
         and column_name in ('clk_id','verified_doctor','specialization')
       order by 1`
    );
    console.log("users_cols=" + cols.rows.map((r) => r.column_name).join(","));
    const t = await client.query(
      `select to_regclass('public.partner_institutions') as t`
    );
    console.log("partner_institutions=" + t.rows[0].t);
  } finally {
    await client.end().catch(() => undefined);
  }
  console.log("MIGRATE_OK");
  process.exit(0);
}

if (usable(env.CRON_SECRET)) {
  const url =
    "https://medscopeglobal.com/api/setup/academy-b2b-schema?secret=" +
    encodeURIComponent(env.CRON_SECRET);
  console.log("trying_production_setup_api");
  const res = await fetch(url);
  const text = await res.text();
  console.log("setup_status=" + res.status);
  console.log("setup_body=" + text.slice(0, 500));
  if (!res.ok) process.exit(1);
  console.log("MIGRATE_OK");
  process.exit(0);
}

console.error("No usable DB credentials or CRON_SECRET in .env.local");
process.exit(1);
