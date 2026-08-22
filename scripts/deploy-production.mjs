#!/usr/bin/env node
/**
 * PC production upload: D: only, wrangler OAuth, one Next build in-place (no C: copy).
 * npm run deploy already ran predeploy gates; this only builds + uploads.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));

if (process.platform === "win32" && !/^D:\\/i.test(root)) {
  console.error(`PC deploy must run from D: — got ${root}`);
  process.exit(1);
}

if (!process.env.MEDSCOPE_PROJECT_ROOT) {
  process.env.MEDSCOPE_PROJECT_ROOT = root;
}
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = "https://medscopeglobal.com";
}
if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  process.env.CLOUDFLARE_ACCOUNT_ID = "d3108976a0c396327ce8eb87d9f71c0c";
}

function run(label, cmd, args, env = process.env) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
    windowsHide: true,
  });
  if (r.status !== 0) {
    console.error(`✗ ${label} failed (exit ${r.status ?? 1})`);
    process.exit(r.status || 1);
  }
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const buildEnv = { ...process.env, MEDSCOPE_GATES_DONE: "1" };
delete buildEnv.CLOUDFLARE_API_TOKEN;
delete buildEnv.CF_API_TOKEN;

if (!existsSync(join(root, "node_modules", "next"))) {
  console.error("✗ node_modules missing — run npm install on D:");
  process.exit(1);
}

run("OpenNext build", npx, ["opennextjs-cloudflare", "build"], buildEnv);
run("OpenNext deploy (wrangler)", npx, ["opennextjs-cloudflare", "deploy"]);
console.log("\n✓ Production upload complete (Worker medscopeglobal)\n");
