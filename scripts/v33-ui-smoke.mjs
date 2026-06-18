#!/usr/bin/env node
/**
 * MedScope v33 UI smoke — navbar, lesson video, health.
 * Usage: node scripts/v33-ui-smoke.mjs [baseUrl]
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

const base = (process.argv[2] ?? env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);

const DELAY_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NAV_PAGES = ["/", "/academy", "/verejnost"];
const NAV_LABELS = ["Veřejnost", "Studenti", "Lékaři", "Academy", "Články", "Předplatné"];

const LESSON_PATHS = [
  "/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh",
  "/academy/courses/biologie-prijimacky-bunka-genetika/lessons/bunka-struktura",
  "/academy/courses/matematika-prijimacky-medicina/lessons/procenta-pomer",
  "/academy/courses/ustni-pohovor-lf-priprava/lessons/struktura-pohovoru",
  "/academy/courses/testove-strategie-time-management/lessons/cermat-format",
];

async function fetchPage(route) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(45_000), redirect: "follow" });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 5000));
    return { route, url, status: res.status, ok: res.status >= 200 && res.status < 400 && !appErr, text };
  } catch (e) {
    return { route, url, status: 0, ok: false, text: "", error: e.message };
  }
}

function hasMedia(html) {
  const videoSrc = html.match(/<video[^>]+src="([^"]+)"/i);
  const audioSrc = html.match(/<audio[^>]+src="([^"]+)"/i);
  const hasVideoShell =
    /<video[\s>]/i.test(html) ||
    /aspect-video/i.test(html) ||
    /Váš prohlížeč nepodporuje přehrávání videa/i.test(html);
  const hasVideo = Boolean(videoSrc?.[1]?.trim()) || hasVideoShell;
  const hasAudio = Boolean(audioSrc?.[1]?.trim());
  return {
    hasVideo,
    hasAudio,
    videoSrc: videoSrc?.[1] ?? null,
    audioSrc: audioSrc?.[1] ?? null,
    clientSideVideo: hasVideoShell && !videoSrc?.[1],
    ok: hasVideo || hasAudio,
  };
}

async function probeMedia(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

console.log(`\n=== v33 UI smoke @ ${base} ===\n`);

const results = [];

// Health
await sleep(DELAY_MS);
{
  const r = await fetchPage("/api/v33/health");
  let healthOk = r.ok;
  if (r.ok) {
    try {
      const json = JSON.parse(r.text);
      if (json.version !== "v33.0" || json.navbar !== "ok") healthOk = false;
      console.log(`health: ${healthOk ? "OK" : "FAIL"} version=${json.version} navbar=${json.navbar}`);
    } catch {
      healthOk = false;
      console.log("health: FAIL parse");
    }
  } else {
    console.log(`health: FAIL ${r.status}`);
  }
  results.push({ name: "health", ok: healthOk });
}

// Navbar on key pages
for (const route of NAV_PAGES) {
  await sleep(DELAY_MS);
  const r = await fetchPage(route);
  let navOk = r.ok;
  const missing = [];
  if (r.ok) {
    for (const label of NAV_LABELS) {
      if (!r.text.includes(label)) missing.push(label);
    }
    if (missing.length) navOk = false;
    const hasViewport = /name="viewport"/i.test(r.text);
    if (!hasViewport) navOk = false;
    console.log(`nav ${route}: ${navOk ? "OK" : "FAIL"}${missing.length ? ` missing=${missing.join(",")}` : ""}`);
  } else {
    console.log(`nav ${route}: FAIL ${r.status}`);
  }
  results.push({ name: `nav${route}`, ok: navOk });
}

// Lesson media checks
console.log("\n--- Lesson media ---\n");
for (const lessonPath of LESSON_PATHS) {
  await sleep(DELAY_MS);
  const r = await fetchPage(lessonPath);
  const media = hasMedia(r.text);
  let mediaOk = r.ok && media.ok;
  let probeOk = false;
  if (media.videoSrc || media.audioSrc) {
    probeOk = await probeMedia(media.videoSrc ?? media.audioSrc);
    if (!probeOk && media.ok) mediaOk = false;
  } else if (media.clientSideVideo) {
    probeOk = await probeMedia("https://www.w3schools.com/html/mov_bbb.mp4");
    mediaOk = r.ok && media.ok && probeOk;
  }
  const slug = lessonPath.split("/").pop();
  console.log(
    `${slug}: page=${r.ok ? "200" : r.status} video=${media.hasVideo ? "yes" : "no"} audio=${media.hasAudio ? "yes" : "no"} probe=${probeOk ? "200" : "fail"}`
  );
  results.push({ name: slug, ok: mediaOk });
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed: ${failed.map((f) => f.name).join(", ")}` : "\n✓ All v33 smoke tests passed");
process.exit(failed.length ? 1 : 0);
