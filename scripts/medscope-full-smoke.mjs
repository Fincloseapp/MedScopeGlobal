#!/usr/bin/env node
/**
 * MedScope full production smoke — API, videos, courses, academy, marketplace, v47.
 * Usage: node scripts/medscope-full-smoke.mjs [baseUrl]
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
const DELAY_MS = 1200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

async function check(name, fn) {
  await sleep(DELAY_MS);
  try {
    const ok = await fn();
    results.push({ name, ok });
    console.log(`${name}: ${ok ? "OK" : "FAIL"}`);
    return ok;
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
    console.log(`${name}: FAIL — ${e.message}`);
    return false;
  }
}

console.log(`\n=== MedScope full smoke @ ${base} ===\n`);

await check("v47-health", async () => {
  const res = await fetch(`${base}/api/v47/health`, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) return false;
  const json = await res.json();
  return json.ok && json.llm?.provider === "groq";
});

await check("v40-health", async () => {
  const res = await fetch(`${base}/api/v40/health`, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) return false;
  const json = await res.json();
  return json.ok && json.subsystems?.v40?.videoEngine === true;
});

await check("academy-health", async () => {
  const res = await fetch(`${base}/api/academy/health`, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) return false;
  const json = await res.json();
  return json.version && typeof json.courseCount === "number";
});

await check("tts-browser-mode", async () => {
  const res = await fetch(`${base}/api/tts`, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) return false;
  const json = await res.json();
  return json.mode === "browser" || json.provider === "web_speech_api";
});

await check("video-stream-range", async () => {
  const sample =
    "https://www.w3schools.com/html/mov_bbb.mp4";
  const res = await fetch(`${base}/api/video/stream?url=${encodeURIComponent(sample)}`, {
    method: "GET",
    headers: { Range: "bytes=0-1023" },
    signal: AbortSignal.timeout(45000),
  });
  return res.status === 206 || res.status === 200;
});

await check("course-generate-auth", async () => {
  const res = await fetch(`${base}/api/course/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Smoke" }),
    signal: AbortSignal.timeout(45000),
  });
  return res.status === 401 || res.status === 403;
});

await check("v47-translate-scaffold", async () => {
  const res = await fetch(`${base}/api/v47/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Hello", targetLocale: "cs" }),
    signal: AbortSignal.timeout(60000),
  });
  const json = await res.json();
  return res.ok ? json.ok || json.scaffold : res.status === 503;
});

await check("marketplace-stripe-health", async () => {
  const res = await fetch(`${base}/api/v29/health`, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) return false;
  const json = await res.json();
  return Boolean(json.stripe);
});

await check("academy-simulations-route", async () => {
  const res = await fetch(`${base}/api/academy/simulations`, { signal: AbortSignal.timeout(45000) });
  return res.ok || res.status === 404;
});

await check("academy-quizzes-route", async () => {
  const res = await fetch(`${base}/api/academy/quizzes`, { signal: AbortSignal.timeout(45000) });
  return res.ok;
});

await check("lesson-page", async () => {
  const res = await fetch(
    `${base}/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh`,
    { signal: AbortSignal.timeout(45000) }
  );
  return res.ok || res.status === 307 || res.status === 308;
});

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);

console.log(`\n=== SUMMARY: ${passed}/${results.length} passed ===`);
if (failed.length) {
  console.log("Failed:", failed.map((f) => f.name).join(", "));
  process.exit(1);
}
console.log("ALL SMOKE CHECKS PASSED");
process.exit(0);
