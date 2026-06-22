#!/usr/bin/env node
/**
 * V18 production deploy — Vercel API + alias (409 not_modified = success).
 */
import {
  assignProductionAlias,
  loadDeployEnv,
  triggerProductionDeploy,
  waitForDeploymentReady,
} from "./vercel-api.mjs";

export async function runV18Deploy() {
  const env = loadDeployEnv();
  const created = await triggerProductionDeploy(env);
  const deploymentId = created.id || created.uid;
  if (!deploymentId) {
    throw new Error("Vercel deploy response missing deployment id");
  }

  const ready = await waitForDeploymentReady(deploymentId, env);
  if (!ready.ok) {
    throw new Error(ready.error || "Vercel build failed");
  }

  const alias = await assignProductionAlias(deploymentId, env);
  return {
    deployed: true,
    deploymentId,
    url: alias.url,
    alias: alias.alias,
  };
}

const isMain = process.argv[1]?.includes("vercel_v18.mjs");
if (isMain) {
  runV18Deploy()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      console.log(JSON.stringify({ deployed: false, error: message }));
      process.exit(1);
    });
}
