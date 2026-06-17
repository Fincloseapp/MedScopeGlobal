import fs from "node:fs";
const env = {};
for (const line of fs.readFileSync("D:/medscope.local/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const team = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;
const qs = team ? `?teamId=${team}` : "";
const projectId = env.VERCEL_PROJECT_ID;
const r = await fetch(`https://api.vercel.com/v6/deployments${qs}&projectId=${projectId}&limit=5`, {
  headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
});
const d = await r.json();
for (const dep of d.deployments ?? []) {
  console.log(dep.readyState, dep.meta?.githubCommitSha?.slice(0, 7), dep.meta?.githubCommitMessage?.split("\n")[0]);
  if (dep.readyState === "ERROR") {
    const id = dep.uid;
    const ev = await fetch(`https://api.vercel.com/v2/deployments/${id}/events?limit=30`, {
      headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
    });
    const events = await ev.json();
    for (const e of events ?? []) {
      if (e.type === "stderr" || e.type === "stdout" || e.text?.includes("Error")) {
        console.log(e.type, e.text ?? e.payload?.text);
      }
    }
  }
}
