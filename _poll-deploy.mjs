import fs from "node:fs";
const env = {};
for (const line of fs.readFileSync("D:/medscope.local/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const team = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;
const qs = team ? `?teamId=${team}` : "";
const pid = env.VERCEL_PROJECT_ID;
const targetSha = process.argv[2] ?? "930a501";
for (let i = 0; i < 60; i++) {
  const r = await fetch(`https://api.vercel.com/v6/deployments${qs}&projectId=${pid}&target=production&limit=3`, {
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
  });
  const d = await r.json();
  const dep = d.deployments?.find((x) => x.meta?.githubCommitSha?.startsWith(targetSha)) ?? d.deployments?.[0];
  const sha = dep?.meta?.githubCommitSha?.slice(0, 7);
  const state = dep?.readyState;
  const msg = dep?.meta?.githubCommitMessage?.split("\n")[0];
  console.log(new Date().toISOString(), state, sha, msg);
  if (state === "READY" && sha?.startsWith(targetSha.slice(0, 7))) {
    console.log("DEPLOY_READY");
    process.exit(0);
  }
  if (state === "ERROR" || state === "CANCELED") {
    console.log("DEPLOY_FAILED");
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 15000));
}
console.log("TIMEOUT");
process.exit(1);
