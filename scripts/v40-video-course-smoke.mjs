#!/usr/bin/env node
/**
 * MedScope v40 video + course smoke — health, audit, course gen auth, playback.
 * Usage: node scripts/v40-video-course-smoke.mjs [baseUrl]
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
const DELAY_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LESSON = "/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh";

console.log(`\n=== v40 video + course smoke @ ${base} ===\n`);
const results = [];

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v40/health`, { signal: AbortSignal.timeout(45000) });
  let ok = res.ok;
  if (ok) {
    const json = await res.json();
    ok = json.ok && json.version === "v40.0" && json.subsystems?.v40?.videoEngine === true;
    console.log(`v40 health: ${ok ? "OK" : "FAIL"} composite=${json.composite}`);
  } else {
    console.log(`v40 health: FAIL ${res.status}`);
  }
  results.push({ name: "v40-health", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v40/audit/report`, { signal: AbortSignal.timeout(60000) });
  let ok = res.ok;
  if (ok) {
    const json = await res.json();
    ok = json.ok && json.report?.summary?.score >= 0;
    console.log(`audit report: ${ok ? "OK" : "FAIL"} score=${json.report?.summary?.score}`);
  } else {
    console.log(`audit report: FAIL ${res.status}`);
  }
  results.push({ name: "audit-report", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/course/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Smoke test" }),
    signal: AbortSignal.timeout(45000),
  });
  const ok = res.status === 401 || res.status === 403;
  console.log(`course generate auth gate: ${ok ? "OK" : "FAIL"} status=${res.status}`);
  results.push({ name: "course-generate-auth", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v40/video/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Smoke test video" }),
    signal: AbortSignal.timeout(45000),
  });
  const ok = res.status === 401 || res.status === 403;
  console.log(`video generate auth gate: ${ok ? "OK" : "FAIL"} status=${res.status}`);
  results.push({ name: "video-generate-auth", ok });
}

await sleep(DELAY_MS);
{
  const pageRes = await fetch(`${base}${LESSON}`, { signal: AbortSignal.timeout(45000) });
  const html = await pageRes.text();
  const hasVideo = /<video/i.test(html);
  const hasPlayer = /lesson-video|w3schools|\.mp4|audio/i.test(html);
  const ok = pageRes.ok && (hasVideo || hasPlayer);
  console.log(`lesson playback page: ${ok ? "OK" : "FAIL"} status=${pageRes.status}`);
  results.push({ name: "lesson-playback", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/admin/academy/audit`, { signal: AbortSignal.timeout(45000) });
  const html = await res.text();
  const ok = res.ok && /audit|v40/i.test(html);
  console.log(`admin audit page: ${ok ? "OK" : "FAIL"} status=${res.status}`);
  results.push({ name: "admin-audit", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v38/health`, { signal: AbortSignal.timeout(45000) });
  const ok = res.ok;
  console.log(`v38 compat health: ${ok ? "OK" : "FAIL"}`);
  results.push({ name: "v38-compat", ok });
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n=== ${passed}/${results.length} passed ===\n`);
process.exit(passed === results.length ? 0 : 1);
