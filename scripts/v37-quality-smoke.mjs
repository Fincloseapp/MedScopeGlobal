#!/usr/bin/env node
/** MedScope v37 — quality engine smoke */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const base = (process.argv[2] ?? env.PRODUCTION_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DELAY = 2000;

console.log(`\n=== v37 quality smoke @ ${base} ===\n`);
const failed = [];

async function check(name, fn) {
  await sleep(DELAY);
  try {
    const ok = await fn();
    console.log(`${ok ? "✓" : "✗"} ${name}`);
    if (!ok) failed.push(name);
  } catch (e) {
    console.log(`✗ ${name} — ${e.message}`);
    failed.push(name);
  }
}

await check("v37 health ok", async () => {
  const res = await fetch(`${base}/api/v37/health`, { signal: AbortSignal.timeout(30000) });
  const json = await res.json();
  return res.ok && json.version === "v37.0" && json.ok === true;
});

await check("footer v37 label", async () => {
  const res = await fetch(`${base}/`, { signal: AbortSignal.timeout(45000) });
  const text = await res.text();
  return res.ok && text.includes("v37.0");
});

await check("admin quality page", async () => {
  const res = await fetch(`${base}/admin/academy/quality`, {
    signal: AbortSignal.timeout(45000),
    redirect: "follow",
  });
  const text = await res.text();
  return res.status < 500 && (/Quality Engine|v37|Kvalita obsahu/i.test(text) || /admin\/login/i.test(text));
});

console.log(failed.length ? `\n✗ Failed: ${failed.join(", ")}` : "\n✓ v37 smoke passed");
process.exit(failed.length ? 1 : 0);
