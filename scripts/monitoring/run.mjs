#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const modules = ["cron-health.mjs", "content-health.mjs", "error-log.mjs", "alert-system.mjs"];

for (const name of modules) {
  if (!existsSync(join(dir, name))) {
    console.error(`✗ monitoring missing ${name}`);
    process.exit(1);
  }
}

console.log("✓ v24 monitoring engine scripts ready");
