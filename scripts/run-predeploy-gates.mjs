/**
 * Unified pre-deploy gates — env + V17 + V6 (cross-platform, no npm required).
 * Run: node scripts/run-predeploy-gates.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MEDSCOPE_LOGO_SOURCE } from "../lib/config/paths.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function runStep(label, scriptPath, args = []) {
  const abs = join(root, scriptPath);
  if (!existsSync(abs)) {
    console.error(`✗ ${label}: missing ${scriptPath}`);
    return false;
  }
  const result = spawnSync(process.execPath, [abs, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`✗ ${label} failed`);
    return false;
  }
  console.log(`✓ ${label}`);
  return true;
}

function runTsc() {
  const tsc = join(root, "node_modules/typescript/bin/tsc");
  if (!existsSync(tsc)) {
    console.error("✗ tsc --noEmit: TypeScript binary missing (run npm install)");
    return false;
  }
  const result = spawnSync(process.execPath, [tsc, "--noEmit"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error("✗ tsc --noEmit failed");
    return false;
  }
  console.log("✓ tsc --noEmit");
  return true;
}

console.log("\n=== Pre-deploy gates ===\n");

const isVercel = process.env.VERCEL === "1";
const isCI = process.env.GITHUB_ACTIONS === "true";
const hasCronSecret = (process.env.CRON_SECRET ?? "").length >= 16;
const logoSource = MEDSCOPE_LOGO_SOURCE;
const canSyncLogos = existsSync(logoSource) || (!isVercel && !isCI);

const steps = [
  ...(canSyncLogos ? [["sync-logos", "scripts/sync-logos.mjs"]] : []),
  ["validate-logos", "scripts/validate-logos.mjs"],
  ...(hasCronSecret
    ? [
        ["env:verify", "scripts/verify-env.mjs"],
        ["verify-v17-skeleton", "scripts/verify-v17-skeleton.mjs"],
        ["verify-acp", "scripts/verify-acp.mjs"],
        ["verify-clinical-safety", "scripts/verify-clinical-safety.mjs"],
      ]
    : []),
  ["verify-v6-api-routes", "scripts/verify-v6-api-routes.mjs"],
];

if (isVercel && !canSyncLogos) {
  console.log("(Vercel) logo source unavailable — using committed assets in public/assets/logo/\n");
}
if (isCI && !hasCronSecret) {
  console.log("(CI) CRON_SECRET not set — skipping cron env gates\n");
}

let ok = isCI ? true : runTsc();
for (const [label, script] of steps) {
  ok = runStep(label, script) && ok;
}

if (!ok) {
  console.error("\nPre-deploy gates FAILED\n");
  process.exit(1);
}

console.log("\nPre-deploy gates PASSED");
console.log("Tip: npm run env:diff — compare local vs Vercel env keys\n");
