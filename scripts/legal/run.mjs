#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const modules = ["medical-disclaimer.mjs", "risk-checker.mjs", "claims-validator.mjs"];

for (const name of modules) {
  if (!existsSync(join(dir, name))) {
    console.error(`✗ legal missing ${name}`);
    process.exit(1);
  }
}

console.log("✓ v24 legal engine scripts ready");
