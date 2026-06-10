#!/usr/bin/env node
/**
 * CI validate — v24 structure, verify-v18, gates (CI-aware).
 * GitHub Actions: typecheck/lint/test run separately in ci.yml.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const isCI = process.env.GITHUB_ACTIONS === "true";

function run(label, scriptPath, args = []) {
  const abs = join(root, scriptPath);
  const result = spawnSync(process.execPath, [abs, ...args], {
    cwd: root,
    stdio: "inherit",
  });
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
if (isCI) console.log("(CI) typecheck/lint/test run in workflow steps\n");

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
  "lib/v25/orchestrator.ts",
  "lib/v25/linktest/link-checker.mjs",
  "lib/v25/screenshots/screenshot-engine.mjs",
  "lib/v25/navmonitor/nav-monitor.mjs",
  "app/api/v25/health/route.ts",
  "app/api/v25/system/route.ts",
  "app/(admin)/admin/system/page.tsx",
  "scripts/verify-v25.0.mjs",
  "supabase/migrations/20260610140000_v25_enterprise.sql",
  "lib/v25/providers/universities-provider.mjs",
  "lib/v25/universities-data.ts",
  "lib/v25/universities.ts",
  "scripts/cron/universities/fetch-universities.mjs",
  "app/api/cron/v25-universities/route.ts",
  "app/(public)/studium/univerzity/page.tsx",
  "app/(admin)/admin/system/components/SystemStatus.tsx",
  "app/(admin)/admin/system/components/UniversitySources.tsx",
  "supabase/migrations/20260610150000_v25_universities.sql",
];

for (const p of v24Required) checkPath(p);

if (!isCI) {
  const tsc = join(root, "node_modules/typescript/bin/tsc");
  if (existsSync(tsc)) {
    const result = spawnSync(process.execPath, [tsc, "--noEmit"], {
      cwd: root,
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status || 1);
    console.log("✓ typecheck");
  }
}

run("verify-v18", "scripts/verify-v18.mjs");

if (isCI) {
  run("validate-logos", "scripts/validate-logos.mjs");
  run("verify-v6-api-routes", "scripts/verify-v6-api-routes.mjs");
  if (process.env.CRON_SECRET?.length >= 16) {
    run("env:verify", "scripts/verify-env.mjs");
    run("verify-v17-skeleton", "scripts/verify-v17-skeleton.mjs");
    run("verify-acp", "scripts/verify-acp.mjs");
    run("verify-clinical-safety", "scripts/verify-clinical-safety.mjs");
  } else {
    console.log("⚠ (CI) CRON_SECRET not configured — skipping cron env gates");
  }
} else {
  run("pre-deploy gates", "scripts/run-predeploy-gates.mjs");
}

run("verify build version", "scripts/verify-build-version.mjs");

console.log("\n=== validate PASSED ===\n");
