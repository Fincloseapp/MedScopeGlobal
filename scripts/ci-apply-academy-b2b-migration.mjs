#!/usr/bin/env node
/**
 * Apply Academy B2B CME SQL via:
 * 1) valid Postgres URL (DATABASE_URL / DIRECT_URL / SUPABASE_DB_URL), or
 * 2) Supabase Management API (SUPABASE_ACCESS_TOKEN + project ref)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = process.argv[2] || path.join(root, ".env.production.pulled");

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
    // Unwrap vercel "*****" / empty placeholders
    if (!v || v === "******" || v.startsWith("@")) continue;
    out[m[1].trim()] = v;
  }
  return out;
}

function isUsableSecret(v) {
  return (
    Boolean(v) &&
    v !== "******" &&
    v !== "[SENSITIVE]" &&
    v !== "[REDACTED]" &&
    !v.startsWith("@")
  );
}

function pickDbUrl(env) {
  const candidates = [
    env.DIRECT_URL,
    env.DATABASE_URL,
    env.SUPABASE_DB_URL,
    env.POSTGRES_URL,
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
  ].filter(isUsableSecret);

  for (const url of candidates) {
    try {
      const u = new URL(url);
      if (!u.hostname || u.hostname === "base" || !u.hostname.includes(".")) {
        console.warn(`Skipping invalid DB host: ${u.hostname || "(empty)"}`);
        continue;
      }
      return url;
    } catch {
      console.warn("Skipping unparseable DB URL candidate");
    }
  }

  const host = env.POSTGRES_HOST || process.env.POSTGRES_HOST;
  const user = env.POSTGRES_USER || process.env.POSTGRES_USER;
  const pass = env.POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD;
  const db = env.POSTGRES_DATABASE || process.env.POSTGRES_DATABASE || "postgres";
  if (
    isUsableSecret(host) &&
    isUsableSecret(user) &&
    isUsableSecret(pass) &&
    host.includes(".")
  ) {
    console.log(`Constructing Postgres URL from POSTGRES_* host=${host}`);
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

function projectRef(env) {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? null;
}

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
      throw new Error(`API ${res.status}: ${text.slice(0, 400)}`);
    }
    console.log("OK");
  }
}

const fileEnv = loadEnvFile(envFile);
const merged = { ...fileEnv, ...process.env };
const files = [
  "supabase/migrations/20260718120000_academy_b2b_cme.sql",
  "supabase/migrations/20260718120100_academy_b2b_cme_seed.sql",
].map((rel) => path.join(root, rel));

const dbUrl = pickDbUrl(merged);
const token = merged.SUPABASE_ACCESS_TOKEN || null;
const ref = projectRef(merged);

if (dbUrl) {
  const host = new URL(dbUrl).hostname;
  console.log(`Using Postgres URL host: ${host}`);
  await applyViaPg(dbUrl, files);
} else if (token && ref) {
  console.log(`Using Supabase Management API project: ${ref}`);
  await applyViaManagementApi(token, ref, files);
} else {
  console.error(
    "No usable DATABASE_URL and no SUPABASE_ACCESS_TOKEN+project ref in env file."
  );
  const keys = Object.keys(fileEnv).sort();
  console.error("Available env keys:", keys.join(", "));
  process.exit(1);
}

console.log("Academy B2B CME migrations applied.");
