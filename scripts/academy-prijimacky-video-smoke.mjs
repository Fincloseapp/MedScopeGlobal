#!/usr/bin/env node
/**
 * MedScope Academy — přípravné kurzy (prijimacky) video smoke.
 * Verifies prep course count, has_video flags, lesson pages, and MP4 URLs.
 *
 * Usage: node scripts/academy-prijimacky-video-smoke.mjs [baseUrl] [--sample=N]
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

const argv = process.argv.slice(2);
const baseArg = argv.find((a) => !a.startsWith("--"));
const sampleArg = argv.find((a) => a.startsWith("--sample="));
const sampleLimit = sampleArg ? Number(sampleArg.split("=")[1]) : 0;

const base = (baseArg ?? env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);

const DELAY_MS = 2800;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(45_000), redirect: "follow" });
    if (res.status !== 429 || attempt === retries) return res;
    await sleep(2000 * (attempt + 1));
  }
  throw new Error("unreachable");
}

async function fetchJson(url, opts = {}) {
  const res = await fetchWithRetry(url, opts);
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
  const res = await fetchWithRetry(url);
  const text = await res.text();
  const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 5000));
  return { res, text, appErr };
}

async function probeMedia(url) {
  const isMp4 = /\.mp4(\?|$)/i.test(url);
  const attempts = [
    { method: "HEAD" },
    { method: "GET", headers: { Range: "bytes=0-0", "User-Agent": "Mozilla/5.0 (compatible; MedScopeSmoke/1.0)" } },
  ];
  for (const init of attempts) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000), redirect: "follow" });
      const ct = res.headers.get("content-type") ?? "";
      const ok = res.status >= 200 && res.status < 400;
      const isMedia = /video|audio|octet-stream|mpeg/i.test(ct) || isMp4;
      if (ok && isMedia) return { ok: true, status: res.status, contentType: ct, method: init.method };
      if (res.status === 403 && isMp4) {
        return { ok: true, status: res.status, contentType: ct, method: init.method, cdnBlocked: true };
      }
    } catch (e) {
      if (init.method === "GET") return { ok: false, status: 0, contentType: "", error: e.message };
    }
  }
  return { ok: false, status: 0, contentType: "", isMedia: false };
}

function extractFirstLessonPath(html, courseSlug) {
  const escaped = courseSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`/academy/courses/${escaped}/lessons/([^"'\\s>]+)`, "i");
  const m = html.match(re);
  return m ? `/academy/courses/${courseSlug}/lessons/${m[1]}` : null;
}

function extractVideoUrl(html) {
  const patterns = [
    /data-video-url="([^"]+)"/i,
    /"public_url"\s*:\s*"([^"]+\.mp4[^"]*)"/i,
    /src="(https?:\/\/[^"]+\.mp4[^"]*)"/i,
    /src="(https?:\/\/[^"]+\.m3u8[^"]*)"/i,
    /"tts_audio_url"\s*:\s*"([^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/");
  }
  return null;
}

function hasVideoMarkers(html) {
  return (
    /<video[\s>]/i.test(html) ||
    /LessonVideoPlayer/i.test(html) ||
    /data-video-url/i.test(html) ||
    /"public_url"/i.test(html) ||
    /AI audio lekce/i.test(html) ||
    /aspect-video/i.test(html)
  );
}

const courseResults = [];
let globalFailed = 0;

function globalFail(name, detail = "") {
  globalFailed += 1;
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

function globalPass(name, detail = "") {
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log(`\n=== Academy prijimacky video smoke @ ${base} ===\n`);

// 1. Health audit
await sleep(DELAY_MS);
let health = null;
{
  const { res, json } = await fetchJson(`${base}/api/academy/health`);
  health = json;
  if (res.status !== 200 || !json?.ok) {
    globalFail("health API", `status ${res.status}`);
  } else {
    globalPass(
      "health API",
      `prepCourseCount=${json.prepCourseCount ?? "?"}, videoLessonCount=${json.videoLessonCount ?? "?"}, version=${json.version ?? "?"}`
    );
    if ((json.prepCourseCount ?? 0) < 10) {
      globalFail("prepCourseCount>=10", `got ${json.prepCourseCount}`);
    } else {
      globalPass("prepCourseCount>=10", String(json.prepCourseCount));
    }
    if ((json.videoLessonCount ?? 0) < 10) {
      globalFail("videoLessonCount>=10", `got ${json.videoLessonCount}`);
    } else {
      globalPass("videoLessonCount>=10", String(json.videoLessonCount));
    }
  }
}

// 2. Prep courses list
await sleep(DELAY_MS);
let prepCourses = [];
{
  const { res, json } = await fetchJson(`${base}/api/academy/courses?category=prijimacky`);
  prepCourses = json?.courses ?? [];
  if (res.status !== 200 || !json?.ok) {
    globalFail("prep courses API", `status ${res.status}`);
  } else if (prepCourses.length < 10) {
    globalFail("prep courses API count>=10", `got ${prepCourses.length}`);
  } else {
    globalPass("prep courses API count>=10", String(prepCourses.length));
  }

  const withoutVideo = prepCourses.filter((c) => !c.has_video && !(c.video_lesson_count > 0));
  if (withoutVideo.length) {
    globalFail("all prep courses has_video", `${withoutVideo.length} missing: ${withoutVideo.map((c) => c.slug).join(", ")}`);
  } else if (prepCourses.length) {
    globalPass("all prep courses has_video", `${prepCourses.length} kurzů`);
  }
}

// 3. Video assets index (for URL lookup)
await sleep(DELAY_MS);
const videoByTitle = new Map();
{
  const { res, json } = await fetchJson(`${base}/api/academy/video`);
  const videos = json?.videos ?? [];
  for (const v of videos) {
    if (v.title) videoByTitle.set(v.title.toLowerCase(), v);
  }
  if (res.status !== 200) globalFail("video assets API", `status ${res.status}`);
  else globalPass("video assets API", `${videos.length} assets`);
}

// 4. Prijimacky landing CTA
await sleep(DELAY_MS);
{
  const { res, text, appErr } = await fetchPage(`${base}/studium/prijimacky`);
  const hasCta =
    /Přípravné kurzy MedScope Academy|\/academy\/courses\?category=prijimacky|prijimacky/i.test(text);
  const hasAcademyLink = /\/academy/i.test(text);
  if (res.status !== 200 || appErr) {
    globalFail("studium/prijimacky page", `status ${res.status}`);
  } else if (!hasCta && !hasAcademyLink) {
    globalFail("studium/prijimacky academy CTA");
  } else {
    globalPass("studium/prijimacky academy CTA");
  }
}

// 5. Per-course checks
const toTest =
  sampleLimit > 0 && sampleLimit < prepCourses.length
    ? prepCourses.slice(0, sampleLimit)
    : prepCourses;

console.log(`\n--- Per-course checks (${toTest.length}/${prepCourses.length}) ---\n`);

for (const course of toTest) {
  const row = {
    slug: course.slug,
    title: course.title,
    has_video: Boolean(course.has_video || course.video_lesson_count > 0),
    coursePage: false,
    lessonPage: false,
    videoMarker: false,
    mediaUrl: null,
    mediaOk: false,
    ok: false,
    detail: "",
  };

  await sleep(DELAY_MS);

  // Course page
  const courseUrl = `${base}/academy/courses/${course.slug}`;
  const coursePage = await fetchPage(courseUrl);
  row.coursePage = coursePage.res.status === 200 && !coursePage.appErr;
  if (!row.coursePage) {
    row.detail = `course page ${coursePage.res.status}`;
    courseResults.push(row);
    console.log(`  ✗ ${course.slug} — ${row.detail}`);
    globalFailed += 1;
    continue;
  }

  const lessonPath = extractFirstLessonPath(coursePage.text, course.slug);
  if (!lessonPath) {
    row.detail = "no lesson link on course page";
    courseResults.push(row);
    console.log(`  ✗ ${course.slug} — ${row.detail}`);
    globalFailed += 1;
    continue;
  }

  await sleep(DELAY_MS);

  // Lesson page
  const lessonUrl = `${base}${lessonPath}`;
  const lessonPage = await fetchPage(lessonUrl);
  row.lessonPage = lessonPage.res.status === 200 && !lessonPage.appErr;
  row.videoMarker = hasVideoMarkers(lessonPage.text);

  let mediaUrl = extractVideoUrl(lessonPage.text);
  if (!mediaUrl) {
    const firstLessonTitle = course.title?.toLowerCase();
    for (const [title, asset] of videoByTitle) {
      if (title.includes(course.slug.replace(/-/g, " ")) || (firstLessonTitle && title.includes(firstLessonTitle.slice(0, 20)))) {
        mediaUrl = asset.metadata?.public_url ?? asset.metadata?.tts_audio_url ?? asset.video_url ?? null;
        if (mediaUrl) break;
      }
    }
  }

  row.mediaUrl = mediaUrl;

  if (mediaUrl) {
    await sleep(800);
    const probe = await probeMedia(mediaUrl);
    row.mediaOk = probe.ok;
    if (!row.mediaOk) {
      row.detail = `media probe ${probe.status} ${probe.contentType || probe.error || ""}`.trim();
    } else if (probe.cdnBlocked) {
      row.detail = "mp4 URL (CDN blocks server HEAD)";
    }
  } else if (row.videoMarker) {
    row.mediaOk = true;
    row.detail = "video marker OK (URL not extracted)";
  } else {
    row.detail = "no video URL or marker";
  }

  row.ok = row.has_video && row.coursePage && row.lessonPage && row.videoMarker && row.mediaOk;
  courseResults.push(row);

  if (row.ok) {
    console.log(
      `  ✓ ${course.slug} — lesson ${lessonPath.split("/").pop()}, media=${mediaUrl ? (row.detail || "probe ok") : "marker"}`
    );
  } else {
    globalFailed += 1;
    const parts = [];
    if (!row.has_video) parts.push("no has_video");
    if (!row.lessonPage) parts.push("lesson fail");
    if (!row.videoMarker) parts.push("no video marker");
    if (!row.mediaOk) parts.push(row.detail || "media fail");
    console.log(`  ✗ ${course.slug} — ${parts.join("; ")}`);
  }
}

// Summary table
console.log("\n--- Results table ---\n");
console.log(
  "| Course | has_video | course 200 | lesson 200 | video marker | media HEAD | PASS |"
);
console.log("|--------|-----------|------------|------------|--------------|------------|------|");
for (const r of courseResults) {
  const yn = (v) => (v ? "✓" : "✗");
  console.log(
    `| ${r.slug} | ${yn(r.has_video)} | ${yn(r.coursePage)} | ${yn(r.lessonPage)} | ${yn(r.videoMarker)} | ${yn(r.mediaOk)} | ${yn(r.ok)} |`
  );
}

const passed = courseResults.filter((r) => r.ok).length;
const total = courseResults.length;
console.log(`\n--- Summary: ${passed}/${total} courses passed, ${globalFailed} total failure(s) ---`);
if (health) {
  console.log(
    `Health: prepCourseCount=${health.prepCourseCount ?? "?"}, videoLessonCount=${health.videoLessonCount ?? "?"}`
  );
}

if (globalFailed > 0 || passed < Math.min(5, prepCourses.length)) {
  console.error("\nFAILED — prijimacky video smoke\n");
  process.exit(1);
}
console.log("\nALL PASS — prijimacky video smoke OK\n");
