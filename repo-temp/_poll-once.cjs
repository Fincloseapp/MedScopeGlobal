const fs = require("fs");
const path = "D:/medscope.local/.env.local";
const env = {};
for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}
const { VERCEL_TOKEN, VERCEL_PROJECT_ID } = env;
const targetSha = "58e2b1c";
async function poll() {
  for (let i = 0; i < 60; i++) {
    const url = "https://api.vercel.com/v6/deployments?projectId=" + VERCEL_PROJECT_ID + "&limit=10";
    const r = await fetch(url, { headers: { Authorization: "Bearer " + VERCEL_TOKEN } });
    const j = await r.json();
    const d = (j.deployments || []).find(x => {
      const sha = x.meta?.githubCommitSha || "";
      const msg = x.meta?.githubCommitMessage || "";
      return sha.startsWith(targetSha) || msg.includes("lf.osu.cz");
    }) || j.deployments?.[0];
    if (d) {
      console.log("DEPLOY", d.uid, d.state, d.readyState, d.meta?.githubCommitSha?.slice(0,7), d.url);
      if (d.readyState === "READY" && d.state === "READY") {
        console.log("READY_OK");
        return;
      }
      if (d.readyState === "ERROR" || d.state === "ERROR" || d.state === "CANCELED") {
        console.log("DEPLOY_FAILED");
        process.exit(1);
      }
    } else {
      console.log("no deployment yet", i);
    }
    await new Promise(r => setTimeout(r, 15000));
  }
  console.log("TIMEOUT");
  process.exit(1);
}
poll();
