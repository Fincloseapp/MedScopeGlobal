import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync("D:/medscope.local/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}
const { VERCEL_TOKEN, VERCEL_PROJECT_ID } = env;

const r = await fetch(`https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=5&target=production`, {
  headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
});
const j = await r.json();
for (const d of j.deployments || []) {
  console.log(
    (d.meta?.githubCommitSha || "").slice(0, 7),
    d.readyState,
    d.state,
    (d.meta?.githubCommitMessage || "").slice(0, 60)
  );
}
