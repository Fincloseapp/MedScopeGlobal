#!/usr/bin/env node
/**
 * Cloudflare Workers Builds entry — build if needed, then deploy.
 *
 * Dashboard (no API token):
 *   Build command:  npm run cf:build
 *   Deploy command: npm run cf:workers-ci
 *
 * Also safe as the only command (empty Build, Deploy = npm run cf:workers-ci).
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

const built =
  existsSync(".open-next/.build/open-next.config.edge.mjs") &&
  existsSync(".open-next/worker.js");

if (!built) {
  console.log("OpenNext artifacts missing — running opennextjs-cloudflare build");
  run("npx", ["opennextjs-cloudflare", "build"]);
} else {
  console.log("OpenNext artifacts present — deploy only");
}

run("npx", ["opennextjs-cloudflare", "deploy"]);
console.log("Workers Builds deploy complete");
