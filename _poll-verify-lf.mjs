import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync("D:/medscope.local/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}
const { VERCEL_TOKEN, VERCEL_PROJECT_ID } = env;
const targetSha = "0c98ec8";

async function pollDeploy() {
  for (let i = 0; i < 40; i++) {
    const url = `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=10`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } });
    const j = await r.json();
    const d =
      (j.deployments || []).find((x) => (x.meta?.githubCommitSha || "").startsWith(targetSha)) ??
      j.deployments?.[0];
    if (d) {
      console.log(
        "DEPLOY",
        d.uid,
        d.state,
        d.readyState,
        (d.meta?.githubCommitSha || "").slice(0, 7),
        d.url
      );
      if (d.readyState === "READY" && d.state === "READY") {
        console.log("READY_OK");
        return;
      }
      if (["ERROR", "CANCELED"].includes(d.readyState) || ["ERROR", "CANCELED"].includes(d.state)) {
        console.log("DEPLOY_FAILED");
        process.exit(1);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
  console.log("TIMEOUT");
  process.exit(1);
}

async function verifyPage(path) {
  const r = await fetch(`https://medscopeglobal.com${path}`, {
    headers: { "User-Agent": "medscope-verify/1.0" },
  });
  const html = await r.text();
  const hasLfOsu = html.includes("https://lf.osu.cz/");
  const hasOldOsu = html.includes("https://www.osu.cz/lf") || html.includes("https://www.lf.osu.cz");
  const osuLinks = [...html.matchAll(/href="([^"]*osu[^"]*)"/gi)].map((m) => m[1]);
  console.log(`PAGE ${path} status=${r.status} has_lf_osu_cz=${hasLfOsu} has_old=${hasOldOsu}`);
  console.log(`PAGE ${path} osu_links=${JSON.stringify([...new Set(osuLinks)])}`);
  return hasLfOsu && !hasOldOsu;
}

await pollDeploy();
const okPrijimacky = await verifyPage("/studium/prijimacky");
const okUniverzity = await verifyPage("/studium/univerzity");
const okDetail = await verifyPage("/studium/univerzity/lf-os");
if (!okPrijimacky || !okUniverzity || !okDetail) process.exit(1);
console.log("VERIFY_OK");
