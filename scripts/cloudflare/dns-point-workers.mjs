#!/usr/bin/env node
/**
 * Point medscopeglobal.com DNS to Cloudflare Workers custom domain mode.
 * Prefers CNAME flattening to workers.dev hostname OR proxied AAAA when using routes.
 *
 * .env.local: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID (optional), CLOUDFLARE_WORKER_HOST
 * CLOUDFLARE_WORKER_HOST example: medscopeglobal.<account-subdomain>.workers.dev
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const token = env.CLOUDFLARE_API_TOKEN;
const zoneName = env.CLOUDFLARE_ZONE_NAME || "medscopeglobal.com";
const workerHost = env.CLOUDFLARE_WORKER_HOST;
let zoneId = env.CLOUDFLARE_ZONE_ID;

if (!token) {
  console.error("Missing CLOUDFLARE_API_TOKEN in .env.local");
  process.exit(1);
}
if (!workerHost) {
  console.error("Set CLOUDFLARE_WORKER_HOST to your workers.dev hostname after first deploy");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function cf(p, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${p}`, {
    ...init,
    headers: { ...headers, ...init.headers },
  });
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors ?? json).slice(0, 400));
  return json.result;
}

if (!zoneId) {
  const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
  zoneId = zones[0]?.id;
  if (!zoneId) throw new Error("Zone not found: " + zoneName);
}

async function upsertCname(name, target) {
  const list = await cf(`/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`);
  const body = {
    type: "CNAME",
    name,
    content: target,
    proxied: true,
    ttl: 1,
  };
  if (list[0]?.id) {
    await cf(`/zones/${zoneId}/dns_records/${list[0].id}`, { method: "PUT", body: JSON.stringify(body) });
    console.log("updated CNAME", name, "->", target);
  } else {
    await cf(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(body) });
    console.log("created CNAME", name, "->", target);
  }
}

await upsertCname(zoneName, workerHost);
await upsertCname(`www.${zoneName}`, zoneName);
console.log("DNS pointed to Cloudflare Worker host (proxied). Ensure wrangler routes cover the domain.");