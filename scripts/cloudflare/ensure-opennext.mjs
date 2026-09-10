#!/usr/bin/env node
/**
 * Wrangler custom build — produce OpenNext artifacts when missing.
 * No-op when `.open-next/worker.js` already exists (dashboard already ran cf:build).
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

if (existsSync(".open-next/worker.js") && existsSync(".open-next/.build/open-next.config.edge.mjs")) {
  console.log("OpenNext artifacts present — skip rebuild");
  process.exit(0);
}

const r = spawnSync("npx", ["opennextjs-cloudflare", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(r.status || 1);
