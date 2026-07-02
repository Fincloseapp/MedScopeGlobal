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
const target = process.argv[2] ?? "b26ab6e";

const list = await fetch(
  `https://api.vercel.com/v6/deployments?teamId=${teamId}&projectId=${projectId}&limit=8`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const data = await list.json();

for (const dep of data.deployments ?? []) {
  const sha = (dep.meta?.githubCommitSha ?? "").slice(0, 7);
  if (!sha.startsWith(target.slice(0, 7)) && target !== "all") continue;
  console.log("\n===", sha, dep.readyState, dep.id, "===");
  const ev = await fetch(
    `https://api.vercel.com/v2/deployments/${dep.id}/events?teamId=${teamId}&limit=100&direction=backward`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const evData = await ev.json();
  const items = Array.isArray(evData) ? evData : evData.events ?? [];
  for (const e of items.reverse()) {
    const t = e.payload?.text ?? e.text ?? "";
    if (t) console.log(t.slice(0, 600));
  }
}
