import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env.local"), "utf8");
const token = env.match(/^VERCEL_TOKEN=(.+)$/m)?.[1]?.trim();
const projectId = env.match(/^VERCEL_PROJECT_ID=(.+)$/m)?.[1]?.trim();

const listRes = await fetch(
  `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const dep = (await listRes.json()).deployments?.[0];
console.log("deployment", dep?.uid, dep?.readyState);

let cursor;
const lines = [];
for (let page = 0; page < 20; page++) {
  const url = new URL(`https://api.vercel.com/v2/deployments/${dep.uid}/events`);
  url.searchParams.set("limit", "100");
  url.searchParams.set("direction", "backward");
  if (cursor) url.searchParams.set("until", cursor);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const events = await res.json();
  if (!events?.length) break;

  for (const e of events) {
    const text = (e.payload?.text ?? e.text ?? "").trimEnd();
    if (text) lines.unshift(text);
  }
  cursor = events[events.length - 1]?.created;
  if (events.length < 100) break;
}

const failIdx = lines.findIndex((l) => /failed|error|✗|Error:/i.test(l));
const slice = lines.slice(Math.max(0, failIdx - 15), failIdx + 25);
console.log(slice.join("\n"));
