#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const team = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;
const qs = team ? `?teamId=${team}&limit=3` : "?limit=3";
const r = await fetch(`https://api.vercel.com/v6/deployments${qs}&projectId=${env.VERCEL_PROJECT_ID}&target=production`, {
  headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
});
const d = await r.json();
console.log(JSON.stringify((d.deployments || []).slice(0, 3).map((x) => ({ sha: x.meta?.githubCommitSha?.slice(0, 7), state: x.readyState })), null, 2));
