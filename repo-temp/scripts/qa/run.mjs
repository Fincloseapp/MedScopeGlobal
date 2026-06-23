#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const modules = [
  "medical-reviewer.mjs",
  "consistency-checker.mjs",
  "duplicate-detector.mjs",
  "clinical-accuracy.mjs",
];

for (const name of modules) {
  if (!existsSync(join(dir, name))) {
    console.error(`✗ qa missing ${name}`);
    process.exit(1);
  }
}

console.log("✓ v24 qa engine scripts ready");
