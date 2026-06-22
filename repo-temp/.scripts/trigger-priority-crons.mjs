#!/usr/bin/env node
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
const base = env.PRODUCTION_URL ?? "https://medscopeglobal.com";
const writerLimit = env.PUBLIC_WRITER_LIMIT ?? "4";

const jobs = [
  { name: "public-articles", path: `/api/cron/public-articles?limit=${writerLimit}` },
  { name: "ingest", path: "/api/cron/ingest" },
  { name: "v4c-drugs", path: "/api/cron/v4c-drugs" },
  { name: "v24-ultra", path: "/api/cron/v24-ultra" },
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
      body = { raw: text.slice(0, 300) };
    }
    return { name: job.name, ok: res.ok, status: res.status, ms: Date.now() - t0, body };
  } catch (e) {
    return { name: job.name, ok: false, status: 0, ms: Date.now() - t0, error: e.message };
  }
}

console.log(`Triggering ${jobs.length} crons on ${base}`);
const results = [];
for (const job of jobs) {
  const r = await runJob(job);
  results.push(r);
  console.log(JSON.stringify(r));
}
const failed = results.filter((r) => !r.ok);
process.exit(failed.length ? 1 : 0);
