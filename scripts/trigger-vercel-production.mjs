#!/usr/bin/env node
/**
 * Trigger Vercel production deploy from GitHub main (when Git hook missed).
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assignProductionAlias,
  loadDeployEnv,
  triggerProductionDeploy,
  waitForDeploymentReady,
} from "./deploy/vercel-api.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = loadDeployEnv();

console.log("Applying Supabase migrations…");
const mig = spawnSync(process.execPath, [join(root, "scripts/apply-migrations.mjs")], {
  cwd: root,
  stdio: "inherit",
});
if (mig.status !== 0) {
  console.error("Supabase migrations failed — run: npm run db:setup");
  process.exit(mig.status || 1);
}

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
