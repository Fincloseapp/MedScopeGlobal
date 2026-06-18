#!/usr/bin/env node
/**
 * Parallel coordination audit — production checks only.
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

const base = "https://medscopeglobal.com";
const DELAY = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probeMedia(url) {
  for (const init of [{ method: "HEAD" }, { method: "GET", headers: { Range: "bytes=0-0" } }]) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(25_000), redirect: "follow" });
      const ct = res.headers.get("content-type") ?? "";
      const ok = res.status >= 200 && res.status < 400;
      const isMedia = /video|audio|octet-stream|mpeg/i.test(ct) || /\.mp4/i.test(url);
      if (ok && (isMedia || res.status === 206)) return { ok: true, status: res.status, ct, method: init.method };
      if (res.status === 403 && /\.mp4/i.test(url)) return { ok: true, status: 403, ct, cdnBlocked: true };
    } catch (e) {
      if (init.method === "GET") return { ok: false, error: e.message };
    }
  }
  return { ok: false, status: 0 };
}

function extractVideoUrl(html) {
  const patterns = [
    /data-video-url="([^"]+)"/i,
    /"public_url"\s*:\s*"([^"]+)"/i,
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

function hasVideoMarker(html) {
  return /<video[\s>]/i.test(html) || /LessonVideoPlayer/i.test(html) || /data-video-url/i.test(html);
}

const out = { base, timestamp: new Date().toISOString(), vercel: [], github: null, health: {}, videos: [], navbar: {}, smokes: [] };

// Vercel queue
const token = env.VERCEL_TOKEN;
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
if (token) {
  const qs = new URLSearchParams({ teamId, projectId, limit: "6" });
  const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  out.vercel = (data.deployments ?? []).map((d) => ({
    sha: (d.meta?.githubCommitSha ?? "").slice(0, 7),
    fullSha: d.meta?.githubCommitSha ?? "",
    message: (d.meta?.githubCommitMessage ?? "").slice(0, 80),
    state: d.readyState ?? d.state,
    url: d.url,
    target: d.target,
    created: d.created,
  }));
  const building = out.vercel.filter((d) => ["BUILDING", "QUEUED", "INITIALIZING"].includes(d.state));
  out.vercelBuilding = building.length;
  out.prodSha = out.vercel.find((d) => d.state === "READY" && d.target === "production")?.sha ?? out.vercel[0]?.sha;
}

// GitHub main SHA
const ghToken = env.GITHUB_TOKEN || env.GH_TOKEN;
if (ghToken) {
  const res = await fetch("https://api.github.com/repos/Fincloseapp/MedScopeGlobal/commits/main", {
    headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" },
  });
  if (res.ok) {
    const j = await res.json();
    out.github = { sha: j.sha?.slice(0, 7), fullSha: j.sha, message: j.commit?.message?.split("\n")[0] };
  }
}

await sleep(DELAY);

// Health endpoints
for (const route of ["/api/v29/health", "/api/v33/health", "/api/academy/health", "/api/v32/health", "/api/v30/health"]) {
  await sleep(DELAY);
  try {
    const res = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(20_000) });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* */
    }
    out.health[route] = { status: res.status, ok: res.ok, json };
  } catch (e) {
    out.health[route] = { status: 0, ok: false, error: e.message };
  }
}

await sleep(DELAY);

// Homepage navbar
const homeRes = await fetch(`${base}/`, { signal: AbortSignal.timeout(30_000) });
const homeHtml = await homeRes.text();
const navHrefs = ["/studenti", "/lekari", "/verejnost", "/firmy", "/academy", "/predplatne", "/aktualni-zpravy", "/studium"];
out.navbar = {
  status: homeRes.status,
  versionLabels: {
    v29: homeHtml.includes("v29"),
    v32: homeHtml.includes("v32"),
    v33: homeHtml.includes("v33"),
  },
  links: Object.fromEntries(navHrefs.map((h) => [h, homeHtml.includes(h)])),
  hasViceMenu: /Více|overflow|more-menu/i.test(homeHtml),
  stickyHeader: /sticky|fixed.*top/i.test(homeHtml.slice(0, 15000)),
};

// Video lessons
const lessons = [
  { slug: "fyziologie-zaklady-uchazece", lesson: "krevni-obeh", label: "krevni-obeh" },
];
// Add 3 more from prep courses API
try {
  const coursesRes = await fetch(`${base}/api/academy/courses?category=prijimacky`, { signal: AbortSignal.timeout(30_000) });
  const coursesJson = await coursesRes.json();
  const courses = (coursesJson.courses ?? []).filter((c) => c.has_video || c.video_lesson_count > 0).slice(0, 4);
  for (const c of courses) {
    if (lessons.some((l) => l.slug === c.slug)) continue;
    lessons.push({ slug: c.slug, lesson: null, label: c.slug });
    if (lessons.length >= 4) break;
  }
} catch {
  /* */
}

for (const item of lessons.slice(0, 4)) {
  await sleep(DELAY);
  let lessonSlug = item.lesson;
  const courseUrl = `${base}/academy/courses/${item.slug}`;
  const courseRes = await fetch(courseUrl, { signal: AbortSignal.timeout(30_000) });
  const courseHtml = await courseRes.text();
  if (!lessonSlug) {
    const m = courseHtml.match(new RegExp(`/academy/courses/${item.slug}/lessons/([^"'\\s>]+)`, "i"));
    lessonSlug = m?.[1] ?? null;
  }
  if (!lessonSlug) {
    out.videos.push({ label: item.label, ok: false, error: "no lesson slug" });
    continue;
  }
  await sleep(DELAY);
  const lessonUrl = `${base}/academy/courses/${item.slug}/lessons/${lessonSlug}`;
  const lessonRes = await fetch(lessonUrl, { signal: AbortSignal.timeout(30_000) });
  const lessonHtml = await lessonRes.text();
  const src = extractVideoUrl(lessonHtml);
  let media = { ok: false };
  if (src) {
    await sleep(500);
    media = await probeMedia(src);
  }
  out.videos.push({
    label: item.label,
    lessonUrl,
    pageStatus: lessonRes.status,
    hasVideoTag: hasVideoMarker(lessonHtml),
    src: src?.slice(0, 120) ?? null,
    mediaOk: media.ok,
    mediaStatus: media.status,
    mediaCt: media.ct,
    cdnBlocked: media.cdnBlocked,
    ok: lessonRes.status === 200 && hasVideoMarker(lessonHtml) && (media.ok || !src),
  });
}

// Sequential smoke summaries (lightweight inline)
const smokeRoutes = [
  { name: "homepage", route: "/" },
  { name: "academy", route: "/academy" },
  { name: "predplatne", route: "/predplatne" },
  { name: "prijimacky", route: "/studium/prijimacky" },
  { name: "stripe-webhook", route: "/api/stripe/webhook", method: "POST", expect: [400, 401] },
];
for (const s of smokeRoutes) {
  await sleep(DELAY);
  try {
    const res = await fetch(`${base}${s.route}`, {
      method: s.method ?? "GET",
      signal: AbortSignal.timeout(25_000),
    });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 3000));
    const expectOk = s.expect ? s.expect.includes(res.status) : res.status >= 200 && res.status < 400 && !appErr;
    out.smokes.push({ name: s.name, route: s.route, status: res.status, ok: expectOk, appErr });
  } catch (e) {
    out.smokes.push({ name: s.name, route: s.route, ok: false, error: e.message });
  }
}

// Local v33 state
out.local = {
  v33Version: fs.existsSync(path.join(root, "lib/v33/version.ts")),
  v33Health: fs.existsSync(path.join(root, "lib/v33/version.ts")) && fs.existsSync(path.join(root, "app/api/v33/health/route.ts")),
  v33Smoke: fs.existsSync(path.join(path.join(root, "scripts"), "v33-ui-smoke.mjs")),
  mediaSrcCsp: fs.existsSync(path.join(root, "lib/v30/security/headers.ts"))
    ? /media-src/.test(fs.readFileSync(path.join(root, "lib/v30/security/headers.ts"), "utf8"))
    : false,
};

console.log(JSON.stringify(out, null, 2));
