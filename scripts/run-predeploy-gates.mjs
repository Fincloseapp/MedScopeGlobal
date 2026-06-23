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

function runNpmTypecheck() {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCmd, ["run", "typecheck"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    env: { ...process.env },
    shell: process.platform === "win32",
  });
  return result.status === 0;
}

function runTsc() {
  if (process.env.SKIP_PREDEPLOY_TYPECHECK === "1") {
    console.log("skip tsc (SKIP_PREDEPLOY_TYPECHECK=1)");
    return true;
  }

  const tsc = join(root, "node_modules/typescript/bin/tsc");
  if (!existsSync(tsc)) {
    console.error("tsc missing");
    return false;
  }

  if (existsSync(tsbuildinfo)) {
    try {
      rmSync(tsbuildinfo, { force: true });
      console.log("removed stale tsconfig.tsbuildinfo");
    } catch {}
  }

  const result = spawnSync(process.execPath, [tsc, "--noEmit"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"],
  });
  const out = (result.stdout || "") + (result.stderr || "");
  if (out) process.stderr.write(out);

  if (result.status === 0) {
    console.log("tsc ok");
    return true;
  }

  const isTs6053 = /TS6053/.test(out);
  if (isTs6053) {
    console.warn("TS6053 on D: - retry npm run typecheck");
    if (runNpmTypecheck()) {
      console.log("tsc ok via npm typecheck after TS6053");
      return true;
    }
  }

  console.error("tsc failed");
  console.error("Tip: SKIP_PREDEPLOY_TYPECHECK=1 after npm run typecheck passes");
  return false;
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
