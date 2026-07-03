#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDeployEnv, vercelFetch } from "./deploy/vercel-api.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadDeployEnv();
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function fetchProductionCronSecret() {
  const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
  const rows = await vercelFetch(`/v9/projects/${projectId}/env`, { env });
  const list = Array.isArray(rows) ? rows : rows?.envs ?? [];
  const row = list.find((r) => r.key === "CRON_SECRET");
  if (!row?.id) return null;
  const detail = await vercelFetch(`/v9/projects/${projectId}/env/${row.id}?decrypt=true`, { env });
  return detail?.value ?? detail?.decryptedValue ?? null;
}

let secret = env.CRON_SECRET;
const limit = process.argv[2] ?? "2";
const base = env.PRODUCTION_URL ?? "https://www.medscopeglobal.com";
const url = `${base}/api/cron/public-articles?limit=${limit}`;

async function callCron(s) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${s}` },
    signal: AbortSignal.timeout(180_000),
  });
  return { status: res.status, text: await res.text() };
}

let result = await callCron(secret);
if (result.status === 401) {
  const remote = await fetchProductionCronSecret();
  if (remote && remote !== secret) {
    result = await callCron(remote);
  }
}

console.log("status:", result.status);
console.log(result.text);
