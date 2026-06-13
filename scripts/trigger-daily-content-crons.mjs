#!/usr/bin/env node
/**
 * Trigger daily content crons on production after deploy.
 * Usage: node scripts/trigger-daily-content-crons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const secret = env.CRON_SECRET;
if (!secret || secret.length < 16) {
  console.error("CRON_SECRET missing or too short in .env.local");
  process.exit(1);
}

const base = env.PRODUCTION_URL ?? "https://medscopeglobal.com";
const writerLimit = env.PUBLIC_WRITER_LIMIT ?? "4";

const jobs = [
  { name: "ingest", path: "/api/cron/ingest" },
  { name: "v4c-drugs", path: "/api/cron/v4c-drugs" },
  { name: "public-articles", path: `/api/cron/public-articles?limit=${writerLimit}` },
  { name: "v19-daily-briefs", path: "/api/cron/v19-daily-briefs" },
  { name: "daily-pubmed-update", path: "/api/cron/daily-pubmed-update" },
  { name: "daily-autopublish", path: "/api/cron/daily-autopublish" },
  { name: "v24-ultra", path: "/api/cron/v24-ultra" },
  { name: "v25-enterprise", path: "/api/cron/v25-enterprise" },
  { name: "marketing", path: "/api/cron/marketing" },
];

async function runJob(job) {
  const url = `${base}${job.path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(280_000),
    });
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 200) };
    }
    return {
      name: job.name,
      ok: res.ok,
      status: res.status,
      ms: Date.now() - t0,
      body,
    };
  } catch (e) {
    return {
      name: job.name,
      ok: false,
      status: 0,
      ms: Date.now() - t0,
      error: e.message,
    };
  }
}

console.log(`Triggering ${jobs.length} daily crons on ${base}\n`);
const results = [];
for (const job of jobs) {
  process.stdout.write(`→ ${job.name} … `);
  const r = await runJob(job);
  results.push(r);
  if (r.ok) {
    const detail =
      r.body?.created ??
      r.body?.generated ??
      r.body?.persisted?.db ??
      r.body?.detail ??
      "ok";
    console.log(`OK ${r.status} (${r.ms}ms) ${detail}`);
  } else {
    console.log(`FAIL ${r.status ?? "err"} (${r.ms}ms) ${r.error ?? r.body?.error ?? ""}`);
  }
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n⚠ ${failed.length} cron(s) failed` : "\n✅ All daily crons triggered");
process.exit(failed.length ? 1 : 0);
