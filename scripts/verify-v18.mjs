#!/usr/bin/env node
/**
 * V18 verify — routes, modules, tsc, placeholder tests.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "lib/ai/models.ts",
  "lib/ai/groq.ts",
  "lib/ai/safety.ts",
  "lib/ai/audit.ts",
  "lib/ai/engine.ts",
  "lib/ai/v18-api.ts",
  "lib/doc/extract.ts",
  "lib/v18/health.ts",
  "lib/v18/monitoring.ts",
  "app/api/v18/upload/route.ts",
  "app/api/v18/summarize/route.ts",
  "app/api/v18/guideline/route.ts",
  "app/api/v18/clinical-check/route.ts",
  "app/api/v18/health/route.ts",
  "app/api/v18/monitoring/route.ts",
  ".github/workflows/deploy-v18.yml",
];

let ok = true;

for (const rel of required) {
  if (!existsSync(join(root, rel))) {
    console.error("✗ missing", rel);
    ok = false;
  } else {
    console.log("✓", rel);
  }
}

const tsc = join(root, "node_modules/typescript/bin/tsc");
const tscRun = spawnSync(process.execPath, [tsc, "--noEmit"], {
  cwd: root,
  encoding: "utf8",
});
if (tscRun.status !== 0) {
  console.error("✗ tsc --noEmit");
  console.error(tscRun.stdout || tscRun.stderr);
  ok = false;
} else {
  console.log("✓ tsc --noEmit");
}

const tests = spawnSync(process.execPath, [join(root, "scripts/test-v18-placeholder.mjs")], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit",
});
if (tests.status !== 0) ok = false;

process.exit(ok ? 0 : 1);
