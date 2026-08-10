#!/usr/bin/env node
/**
 * Build + deploy MedScopeGlobal to Cloudflare Workers via OpenNext.
 * Requires: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 * Optional: .dev.vars present (from write-dev-vars-from-json.mjs)
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status || 1);
}

if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error("Missing CLOUDFLARE_API_TOKEN");
  process.exit(1);
}
if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  console.error("Missing CLOUDFLARE_ACCOUNT_ID");
  process.exit(1);
}
if (!existsSync(".dev.vars")) {
  console.warn("Warning: .dev.vars missing — secrets may be incomplete for SSR.");
}

run("npx", ["opennextjs-cloudflare", "build"]);
run("npx", ["opennextjs-cloudflare", "deploy"]);
console.log("Cloudflare deploy complete");