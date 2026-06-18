#!/usr/bin/env node
/**
 * MedScope v36 video analytics smoke.
 * Usage: node scripts/v36-analytics-smoke.mjs [baseUrl]
 */
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
const DELAY_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\n=== v36 analytics smoke @ ${base} ===\n`);
const results = [];

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v37/health`, { signal: AbortSignal.timeout(45000) });
  let ok = false;
  if (res.ok) {
    const json = await res.json();
    ok = json.subsystems?.v36?.analytics === true;
    console.log(`health v36: ${ok ? "OK" : "FAIL"}`);
  }
  results.push({ name: "health-v36", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/academy/analytics/dashboard`, { signal: AbortSignal.timeout(45000) });
  let ok = false;
  if (res.ok) {
    const json = await res.json();
    ok = json.ok === true || Array.isArray(json.videos) || typeof json.summary === "object";
    console.log(`dashboard API: ${ok ? "OK" : "FAIL"}`);
  } else {
    console.log(`dashboard API: FAIL ${res.status}`);
  }
  results.push({ name: "dashboard-api", ok });
}

await sleep(DELAY_MS);
{
  const coursesRes = await fetch(`${base}/api/academy/courses?limit=5`, { signal: AbortSignal.timeout(45000) });
  let videoOk = false;
  if (coursesRes.ok) {
    const courses = (await coursesRes.json())?.courses ?? [];
    outer: for (const c of courses) {
      const dRes = await fetch(`${base}/api/academy/courses/${c.slug}`, { signal: AbortSignal.timeout(45000) });
      if (!dRes.ok) continue;
      const lessons = (await dRes.json())?.course?.lessons ?? [];
      for (const l of lessons) {
        if (!l.video?.id) continue;
        const aRes = await fetch(`${base}/api/academy/analytics/video/${l.video.id}`, {
          signal: AbortSignal.timeout(45000),
        });
        if (aRes.ok) {
          const aJson = await aRes.json();
          videoOk = aJson.ok === true || typeof aJson.stats === "object";
          console.log(`video analytics: ${videoOk ? "OK" : "FAIL"}`);
          break outer;
        }
      }
    }
  }
  if (!videoOk) console.log("video analytics: no asset tested");
  results.push({ name: "video-analytics", ok: videoOk });
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ v36 smoke passed");
process.exit(failed.length ? 1 : 0);
