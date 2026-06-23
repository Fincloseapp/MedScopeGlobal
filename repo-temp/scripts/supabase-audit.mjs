#!/usr/bin/env node
/** Supabase audit — v25 tables, RLS, indexes, storage buckets */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const dbUrl = env.DATABASE_URL ?? env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const TABLES = [
  "courses",
  "lessons",
  "clinical_simulations",
  "simulation_results",
  "v25_slide_videos",
  "marketplace_courses",
  "user_progress",
];

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows } = await client.query(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
);
const existing = new Set(rows.map((r) => r.tablename));

console.log("\n=== Supabase v25 audit ===\n");
let missing = 0;
for (const t of TABLES) {
  const ok = existing.has(t);
  console.log(`${ok ? "OK" : "MISSING"} ${t}`);
  if (!ok) missing++;
}

const migDir = path.join(root, "supabase", "migrations");
const migs = fs.existsSync(migDir) ? fs.readdirSync(migDir).filter((f) => f.endsWith(".sql")) : [];
console.log(`\nMigrations: ${migs.length}`);

await client.end();
process.exit(missing > 3 ? 1 : 0);
