#!/usr/bin/env node
/**
 * V17 production rollback — switch alias to last known-good Vercel build.
 */
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assignProductionAlias,
  listRecentProductionDeployments,
  loadDeployEnv,
} from "./vercel-api.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const logDir = join(root, ".deploy-tmp");
const logFile = join(logDir, "production-rollback.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  mkdirSync(logDir, { recursive: true });
  appendFileSync(logFile, `${line}\n`, "utf8");
}

async function verifyDeploymentHealth(deployment) {
  const state = deployment.readyState ?? deployment.state;
  if (state === "READY") {
    return { ok: true, details: "deployment READY" };
  }
  if (state === "ERROR" || state === "CANCELED") {
    return { ok: false, details: `deployment ${state}` };
  }

  const url = process.env.V17_HEALTH_URL || "https://medscopeglobal.com/api/v17/health";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const body = await res.json();
    const ok = body.status === "healthy" || body.status === "degraded";
    return { ok, details: `remote health=${body.status}` };
  } catch (error) {
    return {
      ok: false,
      details: error instanceof Error ? error.message : "health probe failed",
    };
  }
}

/** Roll back production alias to previous healthy Vercel deployment. */
export async function runRollback() {
  log("=== V17 Production Rollback ===");
  const env = loadDeployEnv();

  if (!env.VERCEL_TOKEN) {
    return { status: "error", error: "Missing VERCEL_TOKEN for rollback" };
  }

  let candidates = [];
  try {
    candidates = await listRecentProductionDeployments(3, env);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "error", error: message };
  }

  if (!candidates.length) {
    return { status: "error", error: "no deployments found" };
  }

  log(`Candidates: ${candidates.map((d) => d.uid || d.id).join(", ")}`);

  let target = null;

  for (let i = 1; i < Math.min(candidates.length, 3); i++) {
    const build = candidates[i];
    const health = await verifyDeploymentHealth(build);
    const buildId = build.uid || build.id;
    if (health.ok) {
      target = build;
      log(`Selected build -${i}: ${buildId} (${health.details})`);
      break;
    }
    log(`Skipped ${buildId}: ${health.details}`);
  }

  if (!target && candidates[2]) {
    target = candidates[2];
    log(`Fallback to build -2: ${target.uid || target.id}`);
  }

  if (!target) {
    return { status: "error", error: "no rollback target available" };
  }

  const buildId = target.uid || target.id;
  const alias = await assignProductionAlias(buildId, env);

  const result = { rolledBackTo: buildId };

  writeFileSync(
    join(logDir, "last-rollback.json"),
    JSON.stringify(
      { ...result, timestamp: new Date().toISOString(), url: alias.url, alias: alias.alias },
      null,
      2
    ),
    "utf8"
  );
  log(`Rollback complete → ${buildId}`);

  return result;
}

if (process.argv[1]?.includes("vercel_rollback.mjs")) {
  runRollback()
    .then((result) => {
      console.log(JSON.stringify(result));
      if (!result.rolledBackTo) process.exit(1);
    })
    .catch((error) => {
      log(`Fatal: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}
