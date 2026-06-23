/**
 * Unified pre-deploy gates — env + V17 + V6 (cross-platform, no npm required).
 * Run: node scripts/run-predeploy-gates.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsbuildinfo = join(root, "tsconfig.tsbuildinfo");

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
  if (process.env.SKIP_PREDEPLOY_TYPECHECK === "1") {
    console.log("○ tsc --noEmit skipped (SKIP_PREDEPLOY_TYPECHECK=1)");
    return true;
  }

  const tsc = join(root, "node_modules/typescript/bin/tsc");
  if (!existsSync(tsc)) {
    console.error("✗ tsc --noEmit: TypeScript binary missing (run npm install)");
    return false;
  }

  // Stale incremental cache on Windows (D:) can cause TS6053 missing-file errors.
  if (existsSync(tsbuildinfo)) {
    try {
      rmSync(tsbuildinfo, { force: true });
      console.log("○ removed stale tsconfig.tsbuildinfo");
    } catch {
      /* non-fatal */
    }
  }

  const result = spawnSync(process.execPath, [tsc, "--noEmit"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error("✗ tsc --noEmit failed");
    console.error(
      "  Tip: fix types locally, or SKIP_PREDEPLOY_TYPECHECK=1 to push (Vercel Linux build may pass)"
    );
    return false;
  }
  console.log("✓ tsc --noEmit");
  return true;
}

const steps = [
  ["env:verify", "scripts/verify-env.mjs"],
  ["verify-v17-skeleton", "scripts/verify-v17-skeleton.mjs"],
  ["verify-acp", "scripts/verify-acp.mjs"],
  ["verify-clinical-safety", "scripts/verify-clinical-safety.mjs"],
  ["verify-v6-api-routes", "scripts/verify-v6-api-routes.mjs"],
];

console.log("\n=== Pre-deploy gates ===\n");

let ok = runTsc();
for (const [label, script] of steps) {
  ok = runStep(label, script) && ok;
}

if (!ok) {
  console.error("\nPre-deploy gates FAILED\n");
  process.exit(1);
}

console.log("\nPre-deploy gates PASSED");
console.log("Tip: npm run env:diff — compare local vs Vercel env keys\n");
