#!/usr/bin/env node
/**
 * Build + deploy MedScopeGlobal to Cloudflare Workers via OpenNext.
 *
 * Auth:
 * - GitHub Actions / local CLI: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
 * - Cloudflare Workers Builds: WORKERS_CI=1 (platform injects credentials)
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status || 1);
}

const inWorkersBuilds = process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1";
const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || "";

if (!inWorkersBuilds) {
  if (!token) {
    console.error(`
Missing CLOUDFLARE_API_TOKEN

GitHub Actions:
  Repo → Settings → Secrets and variables → Actions
  Add CLOUDFLARE_API_TOKEN (Workers Scripts Edit) and CLOUDFLARE_ACCOUNT_ID

Cloudflare dashboard (Workers Builds / Create and deploy):
  Project name: medscopeglobal
  Build command:  npm run cf:build
  Deploy command: npx opennextjs-cloudflare deploy
  (or leave Build empty and use: npm run deploy)
`);
    process.exit(1);
  }
  if (!accountId) {
    console.error("Missing CLOUDFLARE_ACCOUNT_ID");
    process.exit(1);
  }
  process.env.CLOUDFLARE_API_TOKEN = token;
  process.env.CLOUDFLARE_ACCOUNT_ID = accountId;
}

if (!existsSync(".dev.vars")) {
  console.warn("Warning: .dev.vars missing — secrets may be incomplete for SSR.");
}

run("npx", ["opennextjs-cloudflare", "build"]);
run("npx", ["opennextjs-cloudflare", "deploy"]);
console.log("Cloudflare deploy complete");
