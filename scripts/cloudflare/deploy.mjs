#!/usr/bin/env node
/**
 * Build + deploy MedScopeGlobal to Cloudflare Workers via OpenNext.
 *
 * Auth:
 * - GitHub Actions / local CLI: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
 * - Cloudflare Workers Builds: WORKERS_CI=1 (platform injects credentials)
 *
 * Never deploy with placeholder Supabase / localhost site URL — that wipes
 * production article data access (OpenNext bakes env into the Worker).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    const v = m[2].trim().replace(/^['"]|['"]$/g, "");
    if (process.env[k] == null || process.env[k] === "") process.env[k] = v;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".dev.vars");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status || 1);
}

function assertProductionEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const bad = [];
  if (!url || /placeholder/i.test(url)) bad.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anon || /placeholder/i.test(anon)) bad.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!service || /placeholder/i.test(service)) bad.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!site || /localhost/i.test(site)) bad.push("NEXT_PUBLIC_SITE_URL (must be https://medscopeglobal.com)");
  if (bad.length) {
    console.error("Refusing Cloudflare deploy with non-production env:\n  " + bad.join("\n  "));
    console.error("Put real Supabase keys in .env.local / .dev.vars (or CLOUDFLARE_ENV_JSON) before cf:deploy.");
    process.exit(1);
  }
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

assertProductionEnv();

if (!existsSync(".dev.vars")) {
  console.warn("Warning: .dev.vars missing — secrets may be incomplete for SSR.");
}

run("npx", ["opennextjs-cloudflare", "build"]);
run("npx", ["opennextjs-cloudflare", "deploy"]);
console.log("Cloudflare deploy complete");
