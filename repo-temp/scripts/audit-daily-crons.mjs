#!/usr/bin/env node
/** Audit daily article crons + last 7 days article count per section. */
import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";

const root = MEDSCOPE_PROJECT_ROOT;
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const secret = env.CRON_SECRET;
const base = env.PRODUCTION_URL ?? "https://medscopeglobal.com";
const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? "").replace(/\/$/, "");
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const DAILY_CRONS = [
  "/api/cron/ingest",
  "/api/cron/v4c-drugs",
  "/api/cron/v4c-daily",
  "/api/cron/public-articles",
  "/api/cron/public-osveta-daily",
  "/api/cron/v19-daily-briefs",
  "/api/cron/daily-pubmed-update",
  "/api/cron/daily-regulatory-update",
  "/api/cron/daily-autopublish",
  "/api/cron/v24-ultra",
  "/api/cron/v25-enterprise",
  "/api/cron/v26-rewrite",
  "/api/cron/academy-daily",
];

async function probeCron(path) {
  if (!secret) return { path, ok: false, status: 0, error: "CRON_SECRET missing" };
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(120_000),
    });
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 120) };
    }
    return { path, ok: res.ok, status: res.status, body };
  } catch (e) {
    return { path, ok: false, status: 0, error: e.message };
  }
}

async function articleCounts7d() {
  if (!supabaseUrl || !supabaseKey) return { error: "Supabase missing" };
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const H = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
  const res = await fetch(
    `${supabaseUrl}/rest/v1/articles?select=id,published_at,rubric_slug,categories(slug)&published=eq.true&published_at=gte.${since}&order=published_at.desc`,
    { headers: H }
  );
  if (!res.ok) return { error: `articles GET ${res.status}` };
  const rows = await res.json();
  const bySection = {};
  for (const row of rows) {
    const key = row.rubric_slug ?? row.categories?.slug ?? "other";
    bySection[key] = (bySection[key] ?? 0) + 1;
  }
  return { total: rows.length, bySection };
}

console.log("=== Daily cron audit ===\n");
const cronResults = [];
for (const p of DAILY_CRONS) {
  const r = await probeCron(p);
  cronResults.push(r);
  console.log(`${r.ok ? "OK" : "FAIL"} ${p} → ${r.status}${r.error ? ` (${r.error})` : ""}`);
}

console.log("\n=== Articles last 7 days ===\n");
const counts = await articleCounts7d();
console.log(JSON.stringify(counts, null, 2));

const out = { base, cronResults, counts, at: new Date().toISOString() };
fs.mkdirSync(path.join(root, ".data"), { recursive: true });
fs.writeFileSync(path.join(root, ".data", "cron-audit.json"), JSON.stringify(out, null, 2));

const failed = cronResults.filter((r) => !r.ok);
process.exit(failed.length ? 1 : 0);
