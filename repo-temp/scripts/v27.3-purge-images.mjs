#!/usr/bin/env node
/**
 * v27.3 — aggressive image purge + v25 backfill + production cron trigger.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
const dryRun = process.argv.includes("--dry-run");

for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const tsx = path.join(root, "node_modules/tsx/dist/cli.mjs");
const purgeCli = path.join(root, "scripts/v27.3-purge-cli.ts");

console.log(`\n=== v27.3 image purge${dryRun ? " (dry-run)" : ""} ===\n`);

const purgeArgs = [tsx, purgeCli];
if (dryRun) purgeArgs.push("--dry-run");

const purge = spawnSync(process.execPath, purgeArgs, {
  cwd: root,
  stdio: "inherit",
  env,
});

if (purge.status !== 0) {
  console.error("purge failed");
  process.exit(purge.status ?? 1);
}

if (dryRun) {
  console.log("\n(dry-run — skip backfill + cron)\n");
  process.exit(0);
}

console.log("\n=== v25 image backfill (96) ===\n");
const backfill = spawnSync(process.execPath, ["scripts/run-v25-image-backfill.mjs", "96"], {
  cwd: root,
  stdio: "inherit",
  env,
});

const secret = env.CRON_SECRET;
const base = (env.PRODUCTION_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");

if (secret && secret.length >= 16) {
  console.log("\n=== Trigger /api/cron/v25-images ===\n");
  try {
    const res = await fetch(`${base}/api/cron/v25-images`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(180_000),
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
