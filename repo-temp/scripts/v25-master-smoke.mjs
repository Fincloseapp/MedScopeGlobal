#!/usr/bin/env node
/**
 * V25 master smoke — GROQ health, free video, courses, simulations, tests, mobile.
 * Usage: node scripts/v25-master-smoke.mjs [baseUrl]
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
const DELAY = 1200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

async function check(name, fn) {
  await sleep(DELAY);
  try {
    const ok = await fn();
    results.push({ name, ok });
    console.log(`${name}: ${ok ? "OK" : "FAIL"}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`${name}: FAIL — ${e.message}`);
  }
}

console.log(`\n=== V25 master smoke @ ${base} ===\n`);

await check("v25-health-groq", async () => {
  const res = await fetch(`${base}/api/v25/health`, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) return false;
  const j = await res.json();
  return j.ok && j.llm?.provider === "groq";
});

await check("tts-web-speech", async () => {
  const res = await fetch(`${base}/api/tts`, { signal: AbortSignal.timeout(30000) });
  const j = await res.json();
  return res.ok && (j.mode === "browser" || j.provider === "web_speech_api");
});

await check("video-stream-range", async () => {
  const url = "https://www.w3schools.com/html/mov_bbb.mp4";
  const res = await fetch(`${base}/api/video/stream?url=${encodeURIComponent(url)}`, {
    headers: { Range: "bytes=0-1023" },
    signal: AbortSignal.timeout(45000),
  });
  return res.status === 206 || res.status === 200;
});

await check("academy-health", async () => {
  const res = await fetch(`${base}/api/academy/health`, { signal: AbortSignal.timeout(45000) });
  const j = await res.json();
  return res.ok && j.llmProvider === "groq";
});

await check("course-progress-auth", async () => {
  const res = await fetch(`${base}/api/academy/progress/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course_id: "test" }),
    signal: AbortSignal.timeout(30000),
  });
  return res.status === 401;
});

await check("simulations-list", async () => {
  const res = await fetch(`${base}/api/academy/simulations`, { signal: AbortSignal.timeout(45000) });
  return res.ok;
});

await check("simulation-interact", async () => {
  const res = await fetch(`${base}/api/academy/simulations/interact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ simulationSlug: "demo", message: "Dobrý den" }),
    signal: AbortSignal.timeout(60000),
  });
  const j = await res.json();
  return res.ok && j.ok;
});

await check("tests-evaluate", async () => {
  const res = await fetch(`${base}/api/academy/tests/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "kardiologie", mode: "mcq" }),
    signal: AbortSignal.timeout(60000),
  });
  const j = await res.json();
  return res.ok && j.ok;
});

await check("quizzes-api", async () => {
  const res = await fetch(`${base}/api/academy/quizzes`, { signal: AbortSignal.timeout(45000) });
  return res.ok;
});

await check("mobile-viewport-home", async () => {
  const res = await fetch(`${base}/`, {
    headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" },
    signal: AbortSignal.timeout(45000),
  });
  return res.ok;
});

await check("lesson-page", async () => {
  const res = await fetch(
    `${base}/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh`,
    { signal: AbortSignal.timeout(45000) }
  );
  return res.ok || res.status === 307;
});

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log(`\n=== ${passed}/${results.length} passed ===`);
if (failed.length) {
  console.log("Failed:", failed.map((f) => f.name).join(", "));
  process.exit(1);
}
process.exit(0);
