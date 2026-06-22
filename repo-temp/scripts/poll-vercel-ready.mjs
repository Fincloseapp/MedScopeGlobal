#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targetSha = (process.argv[2] ?? "d11f66c").slice(0, 7);

function loadEnv() {
  const env = {};
  for (const f of [".env.local", ".env"]) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const env = loadEnv();
const token = env.VERCEL_TOKEN;
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";

if (!token) {
  console.error("VERCEL_TOKEN missing");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (let i = 0; i < 60; i++) {
  const qs = new URLSearchParams({ teamId, projectId, limit: "5" });
  const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const dep =
    (data.deployments ?? []).find((d) => (d.meta?.githubCommitSha ?? "").startsWith(targetSha)) ??
    data.deployments?.[0];

  if (!dep) {
    console.log(`[${i}] no deployment yet`);
    await sleep(15000);
    continue;
  }

  const sha = (dep.meta?.githubCommitSha ?? "").slice(0, 7);
  const state = dep.readyState ?? dep.state;
  console.log(`${new Date().toISOString()} ${state} ${sha} ${dep.url}`);

  if (state === "READY") {
    console.log(`VERCEL_READY uid=${dep.uid} url=https://${dep.url}`);
    process.exit(0);
  }
  if (state === "ERROR" || state === "CANCELED") {
    console.error(`VERCEL_FAILED state=${state}`);
    process.exit(1);
  }
  await sleep(15000);
}

console.error("VERCEL_TIMEOUT");
process.exit(1);
