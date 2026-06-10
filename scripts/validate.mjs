#!/usr/bin/env node
/**
 * CI validate — typecheck, lint, test, v24 structure, build gates.
 * Mirrors .github/workflows/ci.yml locally and on Vercel preflight.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${result.status ?? 1})\n`);
    process.exit(result.status || 1);
  }
  console.log(`✓ ${label}`);
}

function checkPath(rel, label = rel) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    console.error(`✗ missing: ${label}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

console.log("\n=== MedScopeGlobal validate (v24.0 ULTRA-MAX) ===\n");

const v24Required = [
  "lib/v24/orchestrator.ts",
  "lib/v24/cron.ts",
  "lib/v24/engines/qa/index.ts",
  "lib/v24/engines/seo/index.ts",
  "lib/v24/engines/legal/index.ts",
  "lib/v24/engines/monitoring/index.ts",
  "lib/v24/engines/dedupe/index.ts",
  "lib/v24/engines/images/index.ts",
  "scripts/verify-v24.0.mjs",
  "scripts/qa/run.mjs",
  "scripts/seo/run.mjs",
  "scripts/legal/run.mjs",
  "scripts/monitoring/run.mjs",
  "scripts/dedupe/run.mjs",
  "scripts/images/run.mjs",
  "app/api/v24/health/route.ts",
  "app/api/v24/monitoring/route.ts",
  "app/api/v24/quizzes/seed/route.ts",
  "app/api/cron/v24-ultra/route.ts",
  "supabase/migrations/20260610010000_v24_ultra_engine.sql",
];

for (const p of v24Required) checkPath(p);

const tsc = join(root, "node_modules/typescript/bin/tsc");
if (existsSync(tsc)) {
  run("typecheck", process.execPath, [tsc, "--noEmit"]);
} else {
  console.warn("⚠ tsc missing — skip typecheck (run pnpm install)");
}

run("verify-v18", process.execPath, [join(root, "scripts/verify-v18.mjs")]);
run("pre-deploy gates", process.execPath, [join(root, "scripts/run-predeploy-gates.mjs")]);
run("verify build version", process.execPath, [join(root, "scripts/verify-build-version.mjs")]);

console.log("\n=== validate PASSED ===\n");
