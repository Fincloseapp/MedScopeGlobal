#!/usr/bin/env node
/**
 * Trigger Vercel production deployment from GitHub ref.
 * Usage: node scripts/trigger-production-deploy.mjs [ref]
 */
import {
  triggerProductionDeploy,
  waitForDeploymentReady,
  loadDeployEnv,
} from "./deploy/vercel-api.mjs";

const ref = process.argv[2] ?? "main";
const env = loadDeployEnv();
env.VERCEL_GIT_REF = ref;

console.log(`Triggering production deploy from ref: ${ref}`);
const deployment = await triggerProductionDeploy(env);
const id = deployment.id ?? deployment.uid;
const sha = deployment.meta?.githubCommitSha ?? deployment.gitSource?.sha ?? null;

console.log(JSON.stringify({ id, sha, url: deployment.url, state: deployment.readyState }, null, 2));

if (id) {
  console.log("Waiting for deployment to become READY...");
  const result = await waitForDeploymentReady(id, env);
  if (result.ok) {
    console.log(`DEPLOY_READY=https://${result.deployment.url}`);
    console.log(`DEPLOY_SHA=${result.deployment.meta?.githubCommitSha ?? sha ?? "unknown"}`);
  } else {
    console.error("Deploy failed:", result.error);
    process.exit(1);
  }
}
