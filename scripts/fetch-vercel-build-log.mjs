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
const sha = (process.argv[2] ?? "4342f83").slice(0, 7);

const list = await fetch(
  `https://api.vercel.com/v6/deployments?teamId=${teamId}&projectId=${projectId}&limit=10`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const data = await list.json();
const dep = (data.deployments ?? []).find((d) =>
  (d.meta?.githubCommitSha ?? "").startsWith(sha)
);
if (!dep?.uid && !dep?.id) {
  console.log("deployments:", (data.deployments ?? []).map((d) => [(d.meta?.githubCommitSha ?? "").slice(0, 7), d.readyState]));
  process.exit(1);
}
const id = dep.uid ?? dep.id;
console.log("dep", sha, dep.readyState, id);

const events = await fetch(
  `https://api.vercel.com/v2/deployments/${id}/events?teamId=${teamId}&limit=300&direction=backward`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const evData = await events.json();
const items = Array.isArray(evData) ? evData : evData.events ?? [];
for (const ev of items.reverse()) {
  const t = ev.payload?.text ?? ev.text ?? "";
  if (t) console.log(t.slice(0, 1000));
}
