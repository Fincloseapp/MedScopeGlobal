#!/usr/bin/env node
/**
 * V17 safe production deploy — validation + Vercel API deploy + alias switch.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assignProductionAlias,
  loadDeployEnv,
  triggerProductionDeploy,
  waitForDeploymentReady,
} from "./vercel-api.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const logDir = join(root, ".deploy-tmp");
const logFile = join(logDir, "production-deploy.log");
const buildsFile = join(logDir, "production-builds.json");
const skipGates = process.argv.includes("--skip-gates");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  mkdirSync(logDir, { recursive: true });
  appendFileSync(logFile, `${line}\n`, "utf8");
}

function runTsc() {
  const tsc = join(root, "node_modules/typescript/bin/tsc");
  if (!existsSync(tsc)) {
    return { ok: false, error: "TypeScript binary missing — run npm install" };
  }
  const r = spawnSync(process.execPath, [tsc, "--noEmit"], { cwd: root, encoding: "utf8" });
  if (r.status !== 0) {
    return { ok: false, error: (r.stdout || r.stderr || "").slice(0, 2000) };
  }
  return { ok: true };
}

function runNodeScript(scriptPath) {
  const r = spawnSync(process.execPath, [join(root, scriptPath)], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    return { ok: false, error: (r.stderr || r.stdout || "").slice(0, 2000) };
  }
  return { ok: true, output: r.stdout };
}

function runLocalHealthcheck() {
  const tsx = join(root, "node_modules/tsx/dist/cli.mjs");
  const runner = join(root, "scripts/deploy/health-runner.ts");
  if (!existsSync(tsx)) {
    return { ok: false, error: "tsx missing — cannot run local healthcheck" };
  }
  const r = spawnSync(process.execPath, [tsx, runner], { cwd: root, encoding: "utf8" });
  if (!r.stdout?.trim()) {
    return { ok: false, error: r.stderr || "empty healthcheck output", status: "unhealthy" };
  }
  try {
    const body = JSON.parse(r.stdout.trim());
    return { ok: body.status !== "unhealthy", status: body.status, body, source: "local" };
  } catch {
    return { ok: false, error: "invalid healthcheck JSON", status: "unhealthy" };
  }
}

function recordBuild(entry) {
  mkdirSync(logDir, { recursive: true });
  let builds = [];
  if (existsSync(buildsFile)) {
    try {
      builds = JSON.parse(readFileSync(buildsFile, "utf8"));
    } catch {
      builds = [];
    }
  }
  builds.unshift(entry);
  writeFileSync(buildsFile, JSON.stringify(builds.slice(0, 10), null, 2), "utf8");
}

async function deployViaVercelApi(env) {
  const created = await triggerProductionDeploy(env);
  const deploymentId = created.id || created.uid;
  if (!deploymentId) {
    throw new Error("Vercel deploy response missing deployment id");
  }

  log(`Vercel deployment created: ${deploymentId}`);
  const ready = await waitForDeploymentReady(deploymentId, env);
  if (!ready.ok) {
    throw new Error(ready.error || "Vercel build failed");
  }

  const alias = await assignProductionAlias(deploymentId, env);
  return {
    deploymentId,
    url: alias.url,
    inspectorUrl: created.inspectorUrl ?? ready.deployment?.inspectorUrl,
  };
}

/** Fallback — existing GitHub-push deploy script (unchanged). */
async function deployViaGitHubScript() {
  const deployScript = join(root, "scripts/deploy-vercel-production.mjs");
  if (!existsSync(deployScript)) {
    return { ok: false, error: "No Vercel token and no GitHub deploy script" };
  }
  const r = spawnSync(process.execPath, [deployScript], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  return r.status === 0
    ? { ok: true, url: "https://medscopeglobal.com", via: "github-push" }
    : { ok: false, error: `github deploy exited ${r.status ?? 1}` };
}

/** Run full V17 production deploy pipeline. */
export async function runProductionDeploy() {
  log("=== V17 Production Deploy ===");
  const env = loadDeployEnv();

  if (!skipGates) {
    log("→ run-predeploy-gates");
    const gates = spawnSync(process.execPath, [join(root, "scripts", "run-predeploy-gates.mjs")], {
      cwd: root,
      encoding: "utf8",
      stdio: "inherit",
    });
    if (gates.status !== 0) {
      log("✗ run-predeploy-gates");
      return {
        deployed: false,
        status: "aborted",
        phase: "validation",
        error: "Pre-deploy gates failed",
      };
    }
    log("✓ run-predeploy-gates");
  }

  const health = runLocalHealthcheck();
  log(`Health (${health.source ?? "local"}): ${health.status ?? "unknown"}`);

  if (health.status === "unhealthy") {
    log("Deploy stopped — healthcheck unhealthy");
    const err = new Error("Healthcheck unhealthy");
    err.health = health.body ?? health.error;
    throw err;
  }

  if (health.status === "degraded") {
    log("⚠ Health degraded — continuing deploy");
  }

  try {
    let result;
    if (env.VERCEL_TOKEN) {
      result = await deployViaVercelApi(env);
    } else {
      log("VERCEL_TOKEN missing — falling back to deploy-vercel-production.mjs");
      const fb = await deployViaGitHubScript();
      if (!fb.ok) {
        return { deployed: false, status: "failed", phase: "deploy", error: fb.error };
      }
      result = { url: fb.url, deploymentId: null, via: fb.via };
    }

    const entry = {
      id: result.deploymentId || `build-${Date.now()}`,
      timestamp: new Date().toISOString(),
      url: result.url,
      healthStatus: health.status,
      status: "deployed",
    };
    recordBuild(entry);
    log(`=== Deploy complete → ${result.url} ===`);

    return {
      deployed: true,
      url: result.url,
      deploymentId: result.deploymentId,
      health: health.status,
      warning: health.status === "degraded" ? "health was degraded" : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Deploy failed: ${message}`);
    return { deployed: false, status: "failed", phase: "deploy", error: message };
  }
}

const __filename = fileURLToPath(import.meta.url);
const isMain =
  (process.argv[1] && resolve(process.argv[1]) === resolve(__filename)) ||
  process.argv[1]?.includes("vercel_production.mjs");

if (isMain) {
  runProductionDeploy()
    .then((result) => {
      console.log(JSON.stringify(result));
      if (!result.deployed) process.exit(1);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      log(`Fatal: ${message}`);
      console.log(JSON.stringify({ deployed: false, error: message }));
      process.exit(1);
    });
}
