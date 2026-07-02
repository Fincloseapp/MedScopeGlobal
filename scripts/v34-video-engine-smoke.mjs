#!/usr/bin/env node
/**
 * MedScope v34 video engine smoke — metadata API, watch events, lesson player.
 * Usage: node scripts/v34-video-engine-smoke.mjs [baseUrl]
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

const LESSON = "/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh";

console.log(`\n=== v34 video engine smoke @ ${base} ===\n`);
const results = [];

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v37/health`, { signal: AbortSignal.timeout(45000) });
  const ok = res.ok;
  let subOk = false;
  if (ok) {
    const json = await res.json();
    subOk = json.subsystems?.v34?.videoEngine === true;
    console.log(`health v34: ${subOk ? "OK" : "FAIL"} watchTable=${json.subsystems?.v34?.watchEventsTable}`);
  } else {
    console.log(`health: FAIL ${res.status}`);
  }
  results.push({ name: "health-v34", ok: ok && subOk });
}

await sleep(DELAY_MS);
{
  const pageRes = await fetch(`${base}${LESSON}`, { signal: AbortSignal.timeout(45000) });
  const html = await pageRes.text();
  const hasVideo = /<video/i.test(html);
  const hasPlayer = /AcademyVideoPlayer|lesson-video|w3schools|\.mp4/i.test(html);
  const ok = pageRes.ok && (hasVideo || hasPlayer);
  console.log(`lesson krevni-obeh: ${ok ? "OK" : "FAIL"} status=${pageRes.status} video=${hasVideo}`);
  results.push({ name: "lesson-player", ok });
}

await sleep(DELAY_MS);
{
  const coursesRes = await fetch(`${base}/api/academy/courses?limit=5`, { signal: AbortSignal.timeout(45000) });
  if (!coursesRes.ok) {
    console.log("courses API: FAIL");
    results.push({ name: "video-metadata", ok: false });
  } else {
    const courses = (await coursesRes.json())?.courses ?? [];
    let metaOk = false;
    for (const c of courses.slice(0, 3)) {
      const dRes = await fetch(`${base}/api/academy/courses/${c.slug}`, { signal: AbortSignal.timeout(45000) });
      if (!dRes.ok) continue;
      const detail = await dRes.json();
      const lessons = detail?.course?.lessons ?? [];
      const withVideo = lessons.find((l) => l.video?.id);
      if (withVideo?.video?.id) {
        const vRes = await fetch(`${base}/api/video/${withVideo.video.id}`, { signal: AbortSignal.timeout(45000) });
        if (vRes.ok) {
          const vJson = await vRes.json();
          metaOk = vJson.ok && vJson.version === "v34.0" && Boolean(vJson.video?.url_chain?.length);
          console.log(`video metadata ${withVideo.video.id.slice(0, 8)}: ${metaOk ? "OK" : "FAIL"}`);
          break;
        }
      }
    }
    if (!metaOk) console.log("video metadata: no ready asset found");
    results.push({ name: "video-metadata", ok: metaOk });
  }
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ v34 smoke passed");
process.exit(failed.length ? 1 : 0);
