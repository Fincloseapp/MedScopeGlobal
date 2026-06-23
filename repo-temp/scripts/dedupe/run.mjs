#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const modules = ["hash-generator.mjs", "similarity-checker.mjs", "topic-map.mjs"];

for (const name of modules) {
  if (!existsSync(join(dir, name))) {
    console.error(`✗ dedupe missing ${name}`);
    process.exit(1);
  }
}

console.log("✓ v24 dedupe engine scripts ready");
