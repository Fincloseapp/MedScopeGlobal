#!/usr/bin/env node
/**
 * Apply ecosystem migrations (20260825*) via Postgres URL or Supabase Management API.
 * Used by .github/workflows/apply-ecosystem-migrations.yml
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = process.argv[2] || path.join(root, ".env.local");

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
    if (!v || v === "******" || v.startsWith("@")) continue;
    out[m[1].trim()] = v;
  }
  return out;
}

function isUsableSecret(v) {
  return Boolean(v) && v !== "******" && v !== "[SENSITIVE]" && v !== "[REDACTED]";
}

function pickDbUrl(env) {
  for (const key of [
    "DIRECT_URL",
    "DATABASE_URL",
    "SUPABASE_DB_URL",
    "POSTGRES_URL",
  ]) {
    const url = env[key];
    if (!isUsableSecret(url)) continue;
    try {
      const u = new URL(url);
      if (u.hostname?.includes(".")) return url;
    } catch {
      /* skip */
    }
  }
  return null;
}

function projectRef(env) {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const m = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? null;
}

const MIGRATION_FILES = [
  "supabase/migrations/20260825120000_mediflow_ecosystem.sql",
  "supabase/migrations/20260825220000_editorial_redakce.sql",
  "supabase/migrations/20260825230000_editorial_images.sql",
].map((rel) => path.join(root, rel));

async function applyViaPg(url, files) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(file, "utf8");
      process.stdout.write(`-> ${path.basename(file)} (pg) ... `);
      await client.query(sql);
      console.log("OK");
    }
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function applyViaManagementApi(token, ref, files) {
  for (const file of files) {
    const sql = fs.readFileSync(file, "utf8");
    process.stdout.write(`-> ${path.basename(file)} (mgmt-api) ... `);
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
      if (/already exists|duplicate key|relation .* already exists/i.test(text)) {
        console.log("SKIP (already applied)");
        continue;
      }
      throw new Error(`API ${res.status}: ${text.slice(0, 400)}`);
    }
    console.log("OK");
  }
}

const fileEnv = loadEnvFile(envFile);
const merged = { ...fileEnv, ...process.env };
const dbUrl = pickDbUrl(merged);
const token = merged.SUPABASE_ACCESS_TOKEN || null;
const ref = projectRef(merged);

if (dbUrl) {
  console.log(`Using Postgres URL host: ${new URL(dbUrl).hostname}`);
  await applyViaPg(dbUrl, MIGRATION_FILES);
} else if (token && ref) {
  console.log(`Using Supabase Management API project: ${ref}`);
  await applyViaManagementApi(token, ref, MIGRATION_FILES);
} else {
  console.error(
    "No usable DATABASE_URL and no SUPABASE_ACCESS_TOKEN+project ref."
  );
  process.exit(1);
}

console.log("Ecosystem migrations applied.");
