#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const modules = ["meta-generator.mjs", "keywords.mjs", "semantic-optimizer.mjs", "schema-generator.mjs"];

for (const name of modules) {
  if (!existsSync(join(dir, name))) {
    console.error(`✗ seo missing ${name}`);
    process.exit(1);
  }
}

console.log("✓ v24 seo engine scripts ready");
