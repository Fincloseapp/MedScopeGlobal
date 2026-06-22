import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env.local"), "utf8");
const token = env.match(/^VERCEL_TOKEN=(.+)$/m)?.[1]?.trim();
const projectId = env.match(/^VERCEL_PROJECT_ID=(.+)$/m)?.[1]?.trim();
const wantMsg = process.argv[2] ?? "";

for (let i = 0; i < 60; i++) {
  const r = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const j = await r.json();
  for (const d of j.deployments ?? []) {
    const msg = (d.meta?.githubCommitMessage ?? "").split("\n")[0];
    console.log(`${d.readyState} | ${msg} | ${d.url}`);
    if (wantMsg && msg.includes(wantMsg) && d.readyState === "READY") {
      console.log("READY_MATCH");
      process.exit(0);
    }
  }
  const top = j.deployments?.[0];
  if (top?.readyState === "READY" && (!wantMsg || (top.meta?.githubCommitMessage ?? "").includes(wantMsg))) {
    console.log("READY_MATCH");
    process.exit(0);
  }
  if (top?.readyState === "ERROR") {
    console.log("DEPLOY_ERROR");
    process.exit(1);
  }
  await new Promise((res) => setTimeout(res, 20000));
}
console.log("TIMEOUT");
process.exit(1);
