#!/usr/bin/env node
/**
 * v27.2 — purge bad cover images and trigger v25-images cron on production.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

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

console.log("\n=== v27.2 image backfill ===\n");

const backfill = spawnSync(process.execPath, ["scripts/run-v25-image-backfill.mjs", "96"], {
  cwd: root,
  stdio: "inherit",
  env,
});

const secret = env.CRON_SECRET;
const base = env.PRODUCTION_URL ?? "https://medscopeglobal.com";

if (secret && secret.length >= 16) {
  console.log("\n=== Trigger /api/cron/v25-images ===\n");
  try {
    const res = await fetch(`${base}/api/cron/v25-images`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(120_000),
    });
    const body = await res.json().catch(() => ({}));
    console.log(JSON.stringify({ status: res.status, ok: res.ok, body }, null, 2));
  } catch (e) {
    console.error("cron trigger failed:", e.message);
  }
} else {
  console.log("(skip cron — CRON_SECRET not set locally)");
}

process.exit(backfill.status === 0 ? 0 : 1);
