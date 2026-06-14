#!/usr/bin/env node
/**
 * Local v26 autonomous pipeline — predeploy, push, poll Vercel, smoke, retry loop.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const node =
  process.env.NODE_BIN ??
  (fs.existsSync(path.join(process.env.TEMP ?? "", "node-v22.22.0-win-x64/node.exe"))
    ? path.join(process.env.TEMP, "node-v22.22.0-win-x64/node.exe")
    : process.execPath);

const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const MAX_RETRIES = 2;
const commitMsg = env.DEPLOY_COMMIT_MESSAGE ?? "feat: MedScope v26 editorial standard + autonomous engine";

function run(label, cmd, args, opts = {}) {
  console.log(`\n→ ${label}`);
  const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", env, stdio: "inherit", ...opts });
  return r.status === 0;
}

let attempt = 0;
let success = false;

while (attempt <= MAX_RETRIES && !success) {
  console.log(`\n=== v26 autonomous attempt ${attempt + 1}/${MAX_RETRIES + 1} ===`);

  if (!run("predeploy gates", node, [path.join(root, "scripts/run-predeploy-gates.mjs")])) {
    attempt++;
    continue;
  }

  env.DEPLOY_COMMIT_MESSAGE = commitMsg;
  if (!run("push to GitHub", "powershell", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    path.join(root, "scripts/push-d-to-github.ps1"),
  ], { env })) {
    attempt++;
    continue;
  }

  if (!run("poll Vercel READY", node, [path.join(root, "scripts/trigger-vercel-production.mjs")])) {
    attempt++;
    continue;
  }

  const secret = env.CRON_SECRET;
  if (secret) {
    const base = env.PRODUCTION_URL ?? "https://medscopeglobal.com";
    console.log("\n→ trigger v26 crons on production");
    for (const p of ["/api/cron/v26-rewrite?batch=4", "/api/cron/v26-autonomous?skipDeploy=1"]) {
      const res = await fetch(`${base}${p}`, {
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(280_000),
      });
      console.log(`  ${p} → ${res.status}`);
    }
  }

  if (!run("v26 smoke tests", node, [path.join(root, "scripts/v26-smoke.mjs")])) {
    attempt++;
    continue;
  }

  success = true;
}

process.exit(success ? 0 : 1);
