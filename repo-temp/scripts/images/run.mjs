#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const modules = ["diagram-generator.mjs", "medical-illustrator.mjs", "safe-filter.mjs"];

for (const name of modules) {
  if (!existsSync(join(dir, name))) {
    console.error(`✗ images missing ${name}`);
    process.exit(1);
  }
}

console.log("✓ v24 images engine scripts ready");
