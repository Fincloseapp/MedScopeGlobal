#!/usr/bin/env node
/** MedScope v35 — course platform + validation smoke */
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

console.log(`\n=== v35 course smoke @ ${base} ===\n`);
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

await check("courses count >= 17", async () => {
  const res = await fetch(`${base}/api/academy/health`, { signal: AbortSignal.timeout(30000) });
  const json = await res.json();
  return res.ok && (json.courseCount ?? 0) >= 17;
});

await check("prep courses >= 12", async () => {
  const res = await fetch(`${base}/api/academy/health`, { signal: AbortSignal.timeout(30000) });
  const json = await res.json();
  return res.ok && (json.prepCourseCount ?? 0) >= 12;
});

await check("lesson metadata block", async () => {
  const res = await fetch(`${base}/academy/courses/biologie-prijimacky-bunka-genetika/lessons/bunka-struktura`, {
    signal: AbortSignal.timeout(45000),
  });
  const text = await res.text();
  return res.ok && (/Klíčové body|O lekci/i.test(text));
});

await check("course progress UI", async () => {
  const res = await fetch(`${base}/academy/courses/fyziologie-zaklady-uchazece`, {
    signal: AbortSignal.timeout(45000),
  });
  const text = await res.text();
  return res.ok && /Průběh kurzu/i.test(text);
});

console.log(failed.length ? `\n✗ Failed: ${failed.join(", ")}` : "\n✓ v35 smoke passed");
process.exit(failed.length ? 1 : 0);
