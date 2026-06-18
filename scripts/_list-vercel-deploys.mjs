#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targetSha = (process.argv[2] ?? "").slice(0, 7);

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
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;
const projectId = env.VERCEL_PROJECT_ID;

const qs = new URLSearchParams({ teamId, projectId, limit: "10" });
const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
for (const d of data.deployments ?? []) {
  const sha = (d.meta?.githubCommitSha ?? "").slice(0, 7);
  console.log(`${d.readyState ?? d.state} ${sha} ${d.url} ${d.createdAt}`);
  if (targetSha && sha.startsWith(targetSha)) {
    console.log(`MATCH uid=${d.uid} state=${d.readyState ?? d.state}`);
  }
}
