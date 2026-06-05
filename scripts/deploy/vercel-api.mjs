/**
 * Shared Vercel API helpers for V17 production deploy/rollback.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadDeployEnv() {
  const merged = { ...process.env };
  if (merged.GH_TOKEN && !merged.GITHUB_TOKEN) {
    merged.GITHUB_TOKEN = merged.GH_TOKEN;
  }
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!merged[key]) merged[key] = value;
    }
  }
  return merged;
}

export function getVercelConfig(env = loadDeployEnv()) {
  const token = env.VERCEL_TOKEN;
  const projectId =
    env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
  const teamId = env.VERCEL_ORG_ID || env.VERCEL_TEAM_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
  const productionDomain = env.VERCEL_PRODUCTION_DOMAIN || "medscopeglobal.com";

  if (!token) {
    throw new Error("Missing VERCEL_TOKEN");
  }

  return { token, projectId, teamId, productionDomain };
}

export async function vercelFetch(path, { method = "GET", body, env } = {}) {
  const { token, teamId } = getVercelConfig(env);
  let url = `https://api.vercel.com${path}`;
  if (teamId && !path.includes("teamId=")) {
    url += path.includes("?") ? `&teamId=${encodeURIComponent(teamId)}` : `?teamId=${encodeURIComponent(teamId)}`;
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Vercel API ${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
  }

  return data;
}

/** Trigger a production deployment from GitHub main. */
export async function triggerProductionDeploy(env = loadDeployEnv()) {
  const { projectId } = getVercelConfig(env);
  const ref = env.VERCEL_GIT_REF || "main";
  const owner = env.GITHUB_OWNER || "Fincloseapp";
  const repo = env.GITHUB_REPO || "MedScopeGlobal";

  const payload = {
    name: "medscopeglobal",
    project: projectId,
    target: "production",
    gitSource: env.GITHUB_REPO_ID
      ? {
          type: "github",
          repoId: Number(env.GITHUB_REPO_ID),
          ref,
        }
      : {
          type: "github",
          org: owner,
          repo,
          ref,
        },
  };

  return vercelFetch("/v13/deployments", { method: "POST", body: payload, env });
}

/** Poll deployment until READY or ERROR (max ~10 min). */
export async function waitForDeploymentReady(deploymentId, env = loadDeployEnv()) {
  const maxAttempts = 40;
  for (let i = 0; i < maxAttempts; i++) {
    const data = await vercelFetch(`/v13/deployments/${deploymentId}`, { env });
    const state = data.readyState ?? data.state;
    if (state === "READY") return { ok: true, deployment: data };
    if (state === "ERROR" || state === "CANCELED") {
      return { ok: false, deployment: data, error: `deployment ${state}` };
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }
  return { ok: false, error: "deployment timeout" };
}

/** Assign production alias to a deployment. */
export async function assignProductionAlias(deploymentId, env = loadDeployEnv()) {
  const { productionDomain } = getVercelConfig(env);
  try {
    await vercelFetch(`/v2/deployments/${deploymentId}/aliases`, {
      method: "POST",
      body: { alias: productionDomain },
      env,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Domain already points at this deployment — treat as success.
    if (!message.includes("not_modified") && !message.includes("409")) {
      throw error;
    }
  }
  return {
    alias: productionDomain,
    url: `https://${productionDomain}`,
  };
}

/** List recent production deployments from Vercel API. */
export async function listRecentProductionDeployments(limit = 3, env = loadDeployEnv()) {
  const { projectId, teamId } = getVercelConfig(env);
  const qs = new URLSearchParams({
    projectId,
    limit: String(limit),
    target: "production",
  });
  if (teamId) qs.set("teamId", teamId);

  const data = await vercelFetch(`/v6/deployments?${qs.toString()}`, { env });
  return data.deployments ?? [];
}
