#!/usr/bin/env node
/** MedScope v34 — video engine smoke */
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

console.log(`\n=== v34 video engine smoke @ ${base} ===\n`);
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

await check("academy health videoProvider", async () => {
  const res = await fetch(`${base}/api/academy/health`, { signal: AbortSignal.timeout(30000) });
  const json = await res.json();
  return res.ok && json.videoProvider;
});

await check("lesson page has video element", async () => {
  const res = await fetch(`${base}/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh`, {
    signal: AbortSignal.timeout(45000),
  });
  const text = await res.text();
  return res.ok && (/<video[\s>]/i.test(text) || /aspect-video/i.test(text));
});

await check("v37 health v34 subsystem", async () => {
  const res = await fetch(`${base}/api/v37/health`, { signal: AbortSignal.timeout(30000) });
  const json = await res.json();
  return res.ok && json.subsystems?.v34?.videoEngine === true;
});

console.log(failed.length ? `\n✗ Failed: ${failed.join(", ")}` : "\n✓ v34 smoke passed");
process.exit(failed.length ? 1 : 0);
