import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const gatesPath = join(root, "scripts", "run-predeploy-gates.mjs");
let content = readFileSync(gatesPath, "utf8");
if (!content.includes("isTs6053")) {
  const start = content.indexOf("function runTsc()");
  const end = content.indexOf("const steps = [");
  const newRunTsc = `function runNpmTypecheck() {
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

`;
  writeFileSync(gatesPath, content.slice(0, start) + newRunTsc + content.slice(end));
  console.log("gates patched");
} else console.log("gates ok");

const deployPath = join(root, "scripts", "deploy-vercel-production.mjs");
let c = readFileSync(deployPath, "utf8");
if (!c.includes("runPredeploy")) {
  const start = c.indexOf('  log("\\n=== Pre-deploy gates ===");');
  const end = c.indexOf("  const sha = await pushToGitHub");
  const neu = `  log("\\n=== Pre-deploy gates ===");
  const runPredeploy = (extraEnv = {}) =>
    spawnSync(process.execPath, [join(root, "scripts", "run-predeploy-gates.mjs")], {
      cwd: root,
      encoding: "utf8",
      stdio: "inherit",
      env: { ...process.env, ...extraEnv },
    });

  let predeploy = runPredeploy();
  if (predeploy.status !== 0 && process.env.SKIP_PREDEPLOY_TYPECHECK !== "1") {
    log("Pre-deploy gates failed - trying npm run typecheck...");
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const typecheck = spawnSync(npmCmd, ["run", "typecheck"], {
      cwd: root,
      encoding: "utf8",
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (typecheck.status === 0) {
      log("npm run typecheck passed - continuing with SKIP_PREDEPLOY_TYPECHECK=1");
      predeploy = runPredeploy({ SKIP_PREDEPLOY_TYPECHECK: "1" });
    }
  }
  if (predeploy.status !== 0) {
    if (process.env.SKIP_PREDEPLOY_TYPECHECK === "1") {
      predeploy = runPredeploy({ SKIP_PREDEPLOY_TYPECHECK: "1" });
    }
    if (predeploy.status !== 0) {
      throw new Error("Pre-deploy gates failed");
    }
  }

`;
  if (start < 0 || end < 0) throw new Error("deploy markers missing");
  writeFileSync(deployPath, c.slice(0, start) + neu + c.slice(end));
  console.log("deploy patched");
} else console.log("deploy ok");
