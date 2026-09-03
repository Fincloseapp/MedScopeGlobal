#!/usr/bin/env node
/**
 * v20.1 hard purge — ISR revalidate + HTML cache-bust on Cloudflare.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

function loadSecret(name) {
  if (process.env[name]) return process.env[name];
  const p = join(root, ".env.local");
  if (!existsSync(p)) return null;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(new RegExp(`^${name}=(.+)$`));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const CRON = loadSecret("CRON_SECRET");

async function purgeIsr() {
  if (!CRON) {
    console.log("isr: skip (no CRON_SECRET)");
    return false;
  }
  const res = await fetch(`${BASE}/api/admin/revalidate-ui`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON}`, "Cache-Control": "no-cache" },
  });
  const text = await res.text();
  console.log(`isr: ${res.status} ${text.slice(0, 200)}`);
  return res.ok;
}

async function bustHtmlSnapshots() {
  const paths = ["/", "/articles", "/categories", "/odborne/briefy"];
  for (const p of paths) {
    const res = await fetch(`${BASE}${p}?_purge=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    console.log(`html ${p}: ${res.status} cf-cache=${res.headers.get("cf-cache-status") ?? "n/a"}`);
  }
}

console.log("\n=== v20.1 HARD PURGE (Cloudflare) ===\n");
await purgeIsr();
await bustHtmlSnapshots();
console.log("\nPurge hotovo.\n");
