#!/usr/bin/env node
/**
 * MedScope Academy v35 FULL smoke — courses, videos, lesson pages, AI lektor, admin video.
 * Run sequentially after deploy to avoid 429: node scripts/academy-v35-full-smoke.mjs [baseUrl]
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(45_000), redirect: "follow" });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { res, text, json };
}

async function fetchPage(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(45_000), redirect: "follow" });
  const text = await res.text();
  const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 5000));
  return { res, text, appErr };
}

const results = [];
let failed = 0;

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  failed += 1;
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log(`\n=== Academy v35 FULL smoke @ ${base} ===\n`);

// 1. Health — courseCount >= 3, video lessons
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/health`);
  if (res.status !== 200 || !json?.ok) {
    fail("health", `status ${res.status}`);
  } else if ((json.courseCount ?? 0) < 3) {
    fail("health courseCount>=3", `got ${json.courseCount}`);
  } else if ((json.videoLessonCount ?? 0) < 1) {
    fail("health videoLessonCount>=1", `got ${json.videoLessonCount}`);
  } else {
    const vp = json.videoProvider ?? "?";
    const chain = (json.videoProviderChain ?? []).join("→") || vp;
    if (!json.videoProvider) {
      fail("health videoProvider", "missing");
    } else {
      pass("health", `courses=${json.courseCount}, videos=${json.videoLessonCount}, provider=${vp} (${chain})`);
    }
  }
}

// 2. Courses API — video flags
await sleep(1500);
let videoCourses = [];
let lessonPaths = [];
{
  const { res, json } = await fetchJson(`${base}/api/academy/courses`);
  if (res.status !== 200 || !json?.ok) {
    fail("courses API", `status ${res.status}`);
  } else {
    const courses = json.courses ?? [];
    videoCourses = courses.filter((c) => c.has_video || c.video_lesson_count > 0);
    if (courses.length < 3) fail("courses API count>=3", `got ${courses.length}`);
    else pass("courses API count>=3", String(courses.length));
    if (videoCourses.length < 1) fail("courses API has_video", "none");
    else pass("courses API has_video", `${videoCourses.length} videokurzů`);
  }
}

// 3. Video assets API
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/video`);
  const videos = json?.videos ?? [];
  const withUrl = videos.filter((v) => v.metadata?.public_url || v.metadata?.generated);
  if (res.status !== 200) fail("video API", `status ${res.status}`);
  else if (withUrl.length < 1) fail("video API assets", `ready=${videos.length}`);
  else pass("video API assets", `${withUrl.length} s URL/metadata`);
}

// 4. Lesson pages with video player + AI lektor
await sleep(1500);
const LESSON_ROUTES = [
  "/academy/courses/uvod-do-anatomie/lessons/kosterni-system",
  "/academy/courses/uvod-do-farmakologie/lessons/farmakokinetika",
  "/academy/courses/zaklady-kardiologie/lessons/ekg-zaklady",
  "/academy/courses/biologie-prijimacky-bunka-genetika/lessons/bunka-struktura",
];

for (const route of LESSON_ROUTES) {
  await sleep(2000);
  const { res, text, appErr } = await fetchPage(`${base}${route}`);
  const hasPlayer = /LessonVideoPlayer|aspect-video|AI lektor|AI video/i.test(text);
  const hasLecturer = /AI lektor|Zeptejte se na lekci/i.test(text);
  if (res.status !== 200 || appErr) {
    fail(`lesson page ${route}`, `status ${res.status}`);
  } else if (!hasLecturer) {
    fail(`lesson AI lektor ${route}`, "panel missing");
  } else {
    pass(`lesson page ${route}`, hasPlayer ? "video+lektor" : "lektor");
    lessonPaths.push(route);
  }
}

// 5. Course detail — lesson links
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/academy/courses/uvod-do-anatomie`);
  const hasLinks = /\/academy\/courses\/uvod-do-anatomie\/lessons\//.test(text);
  if (res.status !== 200 || appErr) fail("course detail", `status ${res.status}`);
  else if (!hasLinks) fail("course detail lesson links");
  else pass("course detail lesson links");
}

// 6. Mentoring page — AI chat UI
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/academy/mentoring`);
  const hasChat = /AI lektor|Zeptejte se/i.test(text);
  if (res.status !== 200 || appErr) fail("mentoring page", `status ${res.status}`);
  else if (!hasChat) fail("mentoring AI chat UI");
  else pass("mentoring AI chat UI");
}

// 7. Mentoring chat API
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/mentoring/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Co je kosterní systém?",
      lessonTitle: "Kosterní systém",
      courseTitle: "Úvod do anatomie",
    }),
  });
  if (res.status !== 200 || !json?.reply) fail("mentoring chat API", `status ${res.status}`);
  else pass("mentoring chat API", json.provider ?? "ok");
}

// 8. Admin video page (public may redirect — check 200 or 307 to login)
await sleep(1500);
{
  const { res, text } = await fetchPage(`${base}/admin/academy/video`);
  const ok = res.status === 200 || res.status === 307 || res.status === 302;
  const hasAdmin = /admin|video|AI video|Nahrát video/i.test(text) || res.status === 307;
  if (!ok) fail("admin video page", `status ${res.status}`);
  else if (res.status === 200 && !hasAdmin) fail("admin video page content");
  else pass("admin video route", `status ${res.status}`);
}

// 9. Homepage academy section — videokurz badge
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/`);
  const hasAcademy = /Videokurz|MedScope Academy|videokurz/i.test(text);
  if (res.status !== 200 || appErr) fail("homepage", `status ${res.status}`);
  else if (!hasAcademy) fail("homepage academy video section");
  else pass("homepage academy video section");
}

// 10. Generate-video API auth gate
await sleep(1500);
{
  const { res } = await fetchJson(`${base}/api/academy/ai/generate-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lesson_id: "00000000-0000-0000-0000-000000000001" }),
  });
  if (res.status === 401) pass("generate-video API auth");
  else fail("generate-video API auth", `expected 401, got ${res.status}`);
}

// 11. Video webhook probe (GET status + POST auth gate)
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/video/webhook`);
  if (res.status === 200 && json?.ok) {
    pass("video webhook status", `${json.provider ?? "ok"} chain=${(json.providerChain ?? []).join("→")}`);
  } else {
    fail("video webhook status", `status ${res.status}`);
  }

  const postRes = await fetchJson(`${base}/api/academy/video/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: "test" }),
  });
  if (postRes.res.status === 401 || postRes.res.status === 400) {
    pass("video webhook POST auth", `status ${postRes.res.status}`);
  } else {
    fail("video webhook POST auth", `expected 401/400, got ${postRes.res.status}`);
  }
}

// 11b. Mux webhook route exists
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/video/mux-webhook`);
  if (res.status === 200 && json?.ok) pass("mux webhook route", json.endpoint ?? "ok");
  else fail("mux webhook route", `status ${res.status}`);
}

// 12. Profile page (XP/badges shell)
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/academy/profile`);
  const hasProfile = /Academy profil|XP|Odznaky/i.test(text);
  if (res.status !== 200 || appErr) fail("profile page", `status ${res.status}`);
  else if (!hasProfile) fail("profile page content");
  else pass("profile page XP/badges");
}

// 13. Mobile sync video metadata
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/mobile/sync`);
  const hasVideo = (json?.videoCourseCount ?? 0) >= 1 || json?.courses?.some((c) => c.video_lessons?.length);
  if (res.status !== 200 || !json?.ok) fail("mobile sync", `status ${res.status}`);
  else if (!hasVideo) fail("mobile sync video metadata");
  else pass("mobile sync video metadata", `videoCourses=${json.videoCourseCount ?? "?"}`);
}

// 14. Prep courses — prijimacky category >= 10
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/courses?category=prijimacky`);
  const prep = json?.courses ?? [];
  if (res.status !== 200 || !json?.ok) fail("prep courses API", `status ${res.status}`);
  else if (prep.length < 10) fail("prep courses count>=10", `got ${prep.length}`);
  else pass("prep courses count>=10", String(prep.length));
}

// 15. Health prepCourseCount >= 10
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/health`);
  const prepCount = json?.prepCourseCount ?? 0;
  if (res.status !== 200 || !json?.ok) fail("health prepCourseCount", `status ${res.status}`);
  else if (prepCount < 10) fail("health prepCourseCount>=10", `got ${prepCount}`);
  else pass("health prepCourseCount>=10", String(prepCount));
}

// 16. Prijimacky page — prep CTA
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/studium/prijimacky`);
  const hasCta = /Přípravné kurzy MedScope Academy|prijimacky/i.test(text);
  if (res.status !== 200 || appErr) fail("prijimacky page", `status ${res.status}`);
  else if (!hasCta) fail("prijimacky prep CTA");
  else pass("prijimacky prep CTA");
}

// 17. Simulations count >= 3
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/simulations`);
  const count = (json?.simulations ?? []).length;
  if (res.status !== 200) fail("simulations API", `status ${res.status}`);
  else if (count < 3) fail("simulations count>=3", `got ${count}`);
  else pass("simulations count>=3", String(count));
}

// 18. Simulation detail page
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/academy/ai-simulations/akutni-bricho-triaz`);
  const hasPlayer = /Zpětná vazba|Simulace dokončena|Obtížnost/i.test(text);
  if (res.status !== 200 || appErr) fail("simulation detail page", `status ${res.status}`);
  else if (!hasPlayer) fail("simulation player UI");
  else pass("simulation detail page");
}

// 19. Textbook reader
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/academy/textbooks/anatomie-zaklady`);
  const hasReader = /Úvod do anatomie|Kosterní systém|kapitola/i.test(text);
  if (res.status !== 200 || appErr) fail("textbook reader", `status ${res.status}`);
  else if (!hasReader) fail("textbook reader content");
  else pass("textbook reader");
}

// 20. Certificates gallery
await sleep(1500);
{
  const { res, text, appErr } = await fetchPage(`${base}/academy/certificates`);
  const ok = res.status === 200 && !appErr && /Certifikát|Galerie certifikátů|Demo/i.test(text);
  if (!ok) fail("certificates page", `status ${res.status}`);
  else pass("certificates page", `status ${res.status}`);
}

// 21. Health — expert review cron + simulationCount
await sleep(1500);
{
  const { res, json } = await fetchJson(`${base}/api/academy/health`);
  if (res.status !== 200 || !json?.expertReviewCron?.enabled) {
    fail("health expertReviewCron", `status ${res.status}`);
  } else if ((json.simulationCount ?? 0) < 3) {
    fail("health simulationCount>=3", `got ${json.simulationCount}`);
  } else {
    pass(
      "health phase13 markers",
      `sims=${json.simulationCount}, cron=${json.expertReviewCron.schedule}`
    );
  }
}

console.log(`\n--- Summary: ${results.length - failed}/${results.length} passed ---\n`);
if (failed > 0) {
  console.error(`FAILED: ${failed} check(s)`);
  process.exit(1);
}
console.log("ALL PASS — Academy v35 full smoke OK\n");
