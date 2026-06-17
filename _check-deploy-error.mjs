import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync("D:/medscope.local/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const team = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;
const qs = team ? `?teamId=${team}` : "";
const r = await fetch(
  `https://api.vercel.com/v6/deployments${qs}&projectId=${env.VERCEL_PROJECT_ID}&target=production&limit=1`,
  { headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` } }
);
const d = await r.json();
const dep = d.deployments?.[0];
console.log("id", dep?.uid, "state", dep?.readyState, "sha", dep?.meta?.githubCommitSha?.slice(0, 7));
const id = dep?.uid;
const e = await fetch(`https://api.vercel.com/v2/deployments/${id}/events${qs}`, {
  headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
});
const ev = await e.json();
for (const x of ev ?? []) console.log(x.text ?? JSON.stringify(x));
