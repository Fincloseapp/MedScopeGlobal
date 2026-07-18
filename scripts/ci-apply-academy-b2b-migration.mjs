#!/usr/bin/env node
/**
 * CI helper: apply Academy B2B CME SQL using DATABASE_URL from env or pulled Vercel file.
 * Usage: node scripts/ci-apply-academy-b2b-migration.mjs [.env.production.pulled]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

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
    out[m[1].trim()] = v;
  }
  return out;
}

const fileEnv = loadEnvFile(envFile);
const url =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  fileEnv.DIRECT_URL ||
  fileEnv.DATABASE_URL ||
  fileEnv.SUPABASE_DB_URL;

if (!url) {
  console.error(
    "No DATABASE_URL/DIRECT_URL in process env or",
    path.basename(envFile)
  );
  process.exit(1);
}

const hostPreview = url.replace(/:\/\/([^@/]+)@/, "://***@").slice(0, 96);
console.log("DB target:", hostPreview);

const files = [
  "supabase/migrations/20260718120000_academy_b2b_cme.sql",
  "supabase/migrations/20260718120100_academy_b2b_cme_seed.sql",
].map((rel) => path.join(root, rel));

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  for (const file of files) {
    const sql = fs.readFileSync(file, "utf8");
    process.stdout.write(`-> ${path.basename(file)} ... `);
    await client.query(sql);
    console.log("OK");
  }
  console.log("Academy B2B CME migrations applied.");
} finally {
  await client.end().catch(() => undefined);
}
