#!/usr/bin/env node
/** Trigger a production deployment from a git ref (default: deploy/audit-phase1). */
import { loadDeployEnv, vercelFetch, waitForDeploymentReady } from "./deploy/vercel-api.mjs";

const env = loadDeployEnv();
const ref = process.argv[2] || "deploy/audit-phase1";
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const owner = env.GITHUB_OWNER || "Fincloseapp";
const repo = env.GITHUB_REPO || "MedScopeGlobal";

const payload = {
  name: "medscopeglobal",
  project: projectId,
  target: "production",
  gitSource: env.GITHUB_REPO_ID
    ? { type: "github", repoId: Number(env.GITHUB_REPO_ID), ref }
    : { type: "github", org: owner, repo, ref },
};

const dep = await vercelFetch("/v13/deployments", { method: "POST", body: payload, env });
const id = dep.id || dep.uid;
console.log("Triggered production deploy:", id, dep.url ? `https://${dep.url}` : "");
console.log("ref:", ref, "inspector:", dep.inspectorUrl || "");

const result = await waitForDeploymentReady(id, env);
console.log(JSON.stringify({
  id,
  readyState: result.deployment?.readyState,
  url: result.deployment?.url ? `https://${result.deployment.url}` : null,
  ok: result.ok,
  error: result.error,
}, null, 2));
process.exit(result.ok ? 0 : 1);
