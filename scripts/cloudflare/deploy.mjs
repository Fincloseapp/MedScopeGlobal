#!/usr/bin/env node
/**
 * Build + deploy MedScopeGlobal to Cloudflare Workers via OpenNext.
 *
 * Auth:
 * - GitHub Actions / local CLI: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
 * - Cloudflare Workers Builds: WORKERS_CI=1 (platform injects credentials)
 *
 * Never bake placeholder Supabase / localhost site URL into next-env.mjs.
 * Prefer existing Cloudflare Worker secrets for Supabase (applied at runtime
 * before next-env via ??= in OpenNext init).
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

function run(cmd, args, env = process.env) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

function assertProductionEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const bad = [];
  if (/placeholder/i.test(url)) bad.push("NEXT_PUBLIC_SUPABASE_URL is placeholder");
  if (/placeholder/i.test(anon)) bad.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is placeholder");
  if (/placeholder/i.test(service)) bad.push("SUPABASE_SERVICE_ROLE_KEY is placeholder");
  if (/localhost/i.test(site)) bad.push("NEXT_PUBLIC_SITE_URL must not be localhost");
  if (bad.length) {
    console.error("Refusing Cloudflare deploy with unsafe env:\n  " + bad.join("\n  "));
    console.error("Remove placeholders from .env.local/.dev.vars. Prefer Worker secrets for Supabase.");
    process.exit(1);
  }
  if (!url || !anon || !service) {
    console.warn("Supabase keys not in local env — relying on existing Cloudflare Worker secrets at runtime.");
  }
}

const inWorkersBuilds = process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1";
const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || "";

if (!inWorkersBuilds) {
  if (!token) {
    console.error(`
Missing CLOUDFLARE_API_TOKEN — cannot deploy to Cloudflare Workers.

Unblock (pick one):
  1) PC: in D:\\medscope.local run  pnpm auto:d  (restore token from D: .env.local)
  2) Set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in env / Cursor Secrets / .env.local
  3) GitHub Actions secrets, then re-run workflow cloudflare-deploy.yml
  4) Cloudflare Workers Builds (medscopeglobal) — platform injects credentials

Verify after deploy:
  curl -sI https://medscopeglobal.com/assets/marketing/mediflow.webp
`);
    process.exit(1);
  }
  if (!accountId) {
    console.error(`
Missing CLOUDFLARE_ACCOUNT_ID

Set it alongside CLOUDFLARE_API_TOKEN (env, .env.local, or GitHub Actions secrets).
PC shortcut: pnpm auto:d inside D:\\medscope.local
`);
    process.exit(1);
  }
}

assertProductionEnv();

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = "https://medscopeglobal.com";
}

if (!existsSync(".dev.vars")) {
  console.warn("Warning: .dev.vars missing — secrets may be incomplete for SSR.");
}

// Build without baking Cloudflare API credentials into next-env.mjs
const buildEnv = { ...process.env };
delete buildEnv.CLOUDFLARE_API_TOKEN;
delete buildEnv.CF_API_TOKEN;
delete buildEnv.CLOUDFLARE_ACCOUNT_ID;
delete buildEnv.CF_ACCOUNT_ID;
run("npx", ["opennextjs-cloudflare", "build"], buildEnv);

const deployEnv = {
  ...process.env,
  CLOUDFLARE_API_TOKEN: token,
  CLOUDFLARE_ACCOUNT_ID: accountId,
};
run("npx", ["opennextjs-cloudflare", "deploy"], deployEnv);
console.log("Cloudflare deploy complete");
