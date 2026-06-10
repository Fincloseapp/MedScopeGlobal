#!/usr/bin/env node
/**
 * Trigger Vercel production deploy from GitHub main (when Git hook missed).
 */
import {
  assignProductionAlias,
  loadDeployEnv,
  triggerProductionDeploy,
  waitForDeploymentReady,
} from "./deploy/vercel-api.mjs";

const env = loadDeployEnv();
console.log("Triggering Vercel production deploy from main…");
const dep = await triggerProductionDeploy(env);
const id = dep.id ?? dep.uid;
console.log("Deployment:", id, dep.url ?? dep.inspectorUrl);

const result = await waitForDeploymentReady(id, env);
if (!result.ok) {
  console.error("Deploy failed:", result.error ?? result.deployment?.errorMessage);
  process.exit(1);
}

const alias = await assignProductionAlias(id, env);
console.log("Production:", alias.url);
console.log("READY");
