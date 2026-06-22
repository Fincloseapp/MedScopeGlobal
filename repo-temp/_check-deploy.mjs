import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync("D:/medscope.local/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}
const { VERCEL_TOKEN } = env;
const uid = "dpl_Fz4TucRMAG4Vcs2GsXBUCv9gAHW7";

const r = await fetch(`https://api.vercel.com/v13/deployments/${uid}`, {
  headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
});
const d = await r.json();
console.log("state", d.readyState, d.state, d.errorMessage, d.errorCode);
console.log("meta", d.meta?.githubCommitSha, d.meta?.githubCommitMessage);

const ev = await fetch(`https://api.vercel.com/v2/deployments/${uid}/events?limit=50&direction=backward`, {
  headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
});
const events = await ev.json();
for (const e of events.slice(0, 30)) {
  if (e.type === "stderr" || e.type === "stdout" || e.payload?.text) {
    console.log(e.type, e.payload?.text?.slice(0, 500));
  }
}
