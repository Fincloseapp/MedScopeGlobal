#!/usr/bin/env node
/**
 * v20.1 hard purge — Vercel edge + ISR + CDN tags.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const PID = "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const TID = "team_m1FSjvKjWV9Wgm1WhEycgHqJ";

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

const VT = loadSecret("VERCEL_TOKEN");
const CRON = loadSecret("CRON_SECRET");

const TAGS = [
  "medscope-ui-v20.1",
  "medscope-ui-v20.0",
  "medscope-ui-v19.9",
  "medscope-pages",
  "v19-articles",
  "v20-articles",
];

async function purgeEdge() {
  if (!VT) {
    console.log("edge: skip (no VERCEL_TOKEN)");
    return false;
  }
  let ok = false;
  for (const ep of ["dangerously-delete-by-tags", "invalidate-by-tags"]) {
    const qs = new URLSearchParams({ projectIdOrName: PID, teamId: TID });
    const res = await fetch(`https://api.vercel.com/v1/edge-cache/${ep}?${qs}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${VT}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tags: TAGS, target: "production" }),
    });
    const body = await res.text();
    console.log(`edge ${ep}: ${res.status} ${body.slice(0, 100)}`);
    if (res.ok) ok = true;
  }
  return ok;
}

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
    console.log(`html ${p}: ${res.status} cache=${res.headers.get("x-vercel-cache")}`);
  }
}

console.log("\n=== v20.1 HARD PURGE ===\n");
await purgeEdge();
await purgeIsr();
await bustHtmlSnapshots();
console.log("\nPurge hotovo.\n");
