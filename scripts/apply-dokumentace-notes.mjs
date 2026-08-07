/**
 * Apply dokumentace_notes migration via Supabase Management API (service / access token).
 * Fallback: prints SQL for Dashboard SQL Editor.
 */
import fs from "node:fs";
import path from "node:path";
import { projectPath } from "../lib/config/paths.mjs";

const root = projectPath();
const migrationRel = "supabase/migrations/20260808000000_dokumentace_notes.sql";
const migrationPath = path.join(root, migrationRel);

function loadEnv() {
  const env = {};
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

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

const env = loadEnv();
const sql = fs.readFileSync(migrationPath, "utf8");
const ref =
  env.SUPABASE_PROJECT_REF ||
  env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const token = env.SUPABASE_ACCESS_TOKEN || (await getTokenFromFile());

if (!accessOk(token, ref)) {
  console.log("Paste into Supabase SQL Editor:\n");
  console.log(sql);
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
if (!res.ok) {
  console.error("Failed:", res.status, text.slice(0, 400));
  process.exit(1);
}
console.log("✓ dokumentace_notes table applied");

function accessOk(t, r) {
  return Boolean(t && r);
}
