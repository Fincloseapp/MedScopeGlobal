#!/usr/bin/env node
/**
 * Trigger production ecosystem migration cron.
 * Auth: CRON_SECRET in .env.local, or CLOUDFLARE_API_TOKEN (bootstrap verify on worker).
 */
import { loadProjectEnv } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadProjectEnv(root);
const base = env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com";
const url = `${base.replace(/\/$/, "")}/api/cron/apply-ecosystem-migrations`;

const cron = env.CRON_SECRET;
const cf = env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN;
const token = cron?.length >= 16 ? cron : cf;

if (!token) {
  console.error("Need CRON_SECRET or CLOUDFLARE_API_TOKEN in .env.local");
  process.exit(1);
}

console.log(`POST ${url}`);
const res = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
const text = await res.text();
console.log("status=" + res.status);
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text.slice(0, 800));
}
process.exit(res.ok ? 0 : 1);
