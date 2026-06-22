#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
const token = env.VERCEL_TOKEN || process.env.VERCEL_TOKEN;
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";

if (!token) {
  console.log("NO_VERCEL_TOKEN");
  process.exit(0);
}

const qs = new URLSearchParams({
  teamId,
  projectId,
  limit: "8",
});

const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
if (!res.ok) {
  console.error("API error", res.status, JSON.stringify(data).slice(0, 800));
  process.exit(1);
}

for (const d of data.deployments || []) {
  const sha = d.meta?.githubCommitSha?.slice(0, 8) ?? "-";
  const msg = (d.meta?.githubCommitMessage || "").split("\n")[0].slice(0, 60);
  console.log(
    `${d.readyState ?? d.state}\t${sha}\t${d.url}\t${msg}`
  );
}
