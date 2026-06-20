#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const f of [".env.local", ".env"]) {
  const p = join(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const token = env.VERCEL_TOKEN;
const teamId = env.VERCEL_TEAM_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const sha = (process.argv[2] ?? "d4fb64c").slice(0, 7);

const qs = new URLSearchParams({ teamId, projectId, limit: "5" });
const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
const dep =
  (data.deployments ?? []).find((d) => (d.meta?.githubCommitSha ?? "").startsWith(sha)) ??
  data.deployments?.[0];

console.log("dep", dep?.uid, dep?.readyState, dep?.url);

if (dep?.uid) {
  const ev = await fetch(
    `https://api.vercel.com/v2/deployments/${dep.uid}/events?teamId=${teamId}&limit=80&direction=backward`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then((r) => r.json());

  for (const e of ev ?? []) {
    if (e.text && /error|failed|Error|Module not found/i.test(e.text)) {
      console.log(e.text.slice(0, 500));
    }
  }
}
