#!/usr/bin/env node
import fs from "node:fs";
import { projectPath } from "../lib/config/paths.mjs";

const env = {};
for (const line of fs.readFileSync(projectPath(".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const token = env.VERCEL_TOKEN;
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const sha = (process.argv[2] ?? "ff243cc").slice(0, 7);

const qs = new URLSearchParams({ teamId, projectId, limit: "5" });
const list = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await list.json();
const dep =
  data.deployments?.find((d) => (d.meta?.githubCommitSha ?? "").startsWith(sha)) ?? data.deployments?.[0];
console.log("dep", dep?.readyState, dep?.url, dep?.id);

const events = await fetch(
  `https://api.vercel.com/v2/deployments/${dep.id}/events?teamId=${teamId}&limit=50&direction=backward`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const evData = await events.json();
const items = Array.isArray(evData) ? evData : evData.events ?? [];
for (const ev of items.reverse().slice(-30)) {
  const text = ev.payload?.text ?? ev.text ?? JSON.stringify(ev).slice(0, 200);
  if (text) console.log(text.slice(0, 400));
}
