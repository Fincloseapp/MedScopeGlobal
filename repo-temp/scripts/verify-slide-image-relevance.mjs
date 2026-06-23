#!/usr/bin/env node
/** Verify slide title vs imageAlt relevance + image URL reachability + Czech alt for a lesson or all. */
import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";
import {
  relevanceScore,
  verifyImageUrl,
  isCzechText,
  topicRelevanceScore,
  isBrokenSlideImageUrl,
} from "../lib/v25/video/slide-image-matcher-core.mjs";

const root = MEDSCOPE_PROJECT_ROOT;
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const BASE = (env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const lessonSlug = process.argv.find((a) => a.startsWith("--lesson="))?.split("=")[1] ?? "orientace-v-tele";
const prodUrl = process.argv.includes("--prod");
const allLessons = process.argv.includes("--all");

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function sbGet(table, query) {
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, { headers: H });
  if (!res.ok) throw new Error(`${table} GET ${res.status}`);
  return res.json();
}

async function fetchProdLesson(slug) {
  const urls = [
    `https://medscopeglobal.com/api/academy/lessons/by-slug?slug=${slug}`,
    `https://medscopeglobal.com/api/academy/lessons/by-slug?slug=${slug}&course=anatomie-zaklady-uchazece`,
    `https://medscopeglobal.com/api/academy/lessons/by-slug?slug=${slug}&course=biologie-prijimacky-bunka-genetika`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return res.json();
    } catch {
      /* next */
    }
  }
  return null;
}

async function loadLessonSlides(slug) {
  if (prodUrl) {
    const prod = await fetchProdLesson(slug);
    if (prod?.content_json?.slideshow?.slides) {
      return { title: prod.title ?? slug, slides: prod.content_json.slideshow.slides };
    }
  }
  if (BASE && KEY) {
    const lessons = await sbGet("lessons", `select=title,content_json,slug&slug=eq.${slug}&status=eq.published`);
    const lesson = lessons[0];
    if (lesson) {
      return {
        title: lesson.title,
        slides: lesson.content_json?.slideshow?.slides ?? lesson.content_json?.slides ?? [],
      };
    }
  }
  const reportPath = path.join(root, ".data", "slide-image-match-report.json");
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const entry = report.report?.find((r) => r.slug === slug);
    if (entry) return { title: slug, slides: entry.slides };
  }
  return null;
}

async function verifyLesson(slug) {
  const loaded = await loadLessonSlides(slug);
  if (!loaded?.slides?.length) {
    console.error("No slides found for", slug);
    return null;
  }

  const { title: lessonTitle, slides } = loaded;
  const results = [];
  let pass = 0;

  console.log(`\n--- ${slug} (${lessonTitle}) ---\n`);

  for (const s of slides) {
    const alt = s.imageAlt ?? s.imageDescription ?? "";
    const headOk = s.imageUrl && !isBrokenSlideImageUrl(s.imageUrl) ? await verifyImageUrl(s.imageUrl) : false;
    const score = topicRelevanceScore(s.title, s.body ?? "", s.imageUrl, alt);
    const czechOk = isCzechText(alt) || isCzechText(s.captionCs ?? "");
    const ok = headOk && score >= 0.15 && czechOk;
    if (ok) pass += 1;
    results.push({
      title: s.title,
      imageAlt: alt,
      captionCs: s.captionCs ?? "",
      imageUrl: s.imageUrl,
      headStatus: headOk ? 200 : 0,
      relevanceScore: Math.round(score * 100) / 100,
      czechAlt: czechOk,
      pass: ok,
    });
    console.log(`${ok ? "PASS" : "WARN"} | ${s.title}`);
    console.log(`  alt: ${alt || "—"}`);
    console.log(`  caption: ${s.captionCs ?? "—"}`);
    console.log(`  url: ${s.imageUrl?.slice(0, 90) ?? "—"}`);
    console.log(`  URL: ${headOk ? "OK" : "FAIL"} | relevance: ${(score * 100).toFixed(0)}% | CS: ${czechOk ? "YES" : "NO"}\n`);
  }

  return { lessonSlug: slug, lessonTitle, results, pass, total: slides.length };
}

console.log(`\n=== Verify slide image relevance: ${allLessons ? "ALL" : lessonSlug} ===\n`);

const slugsToVerify = allLessons
  ? [
      ...(await sbGet("lessons", "select=slug&status=eq.published")).map((l) => l.slug),
    ]
  : [lessonSlug];

const summaries = [];
for (const slug of slugsToVerify) {
  const result = await verifyLesson(slug);
  if (result) summaries.push(result);
}

fs.mkdirSync(path.join(root, ".data"), { recursive: true });
const outPath = allLessons
  ? path.join(root, ".data", "verify-all-slides.json")
  : path.join(root, ".data", `verify-${lessonSlug}.json`);
fs.writeFileSync(
  outPath,
  JSON.stringify({ summaries, at: new Date().toISOString() }, null, 2)
);

const totalPass = summaries.reduce((a, s) => a + s.pass, 0);
const totalSlides = summaries.reduce((a, s) => a + s.total, 0);
console.log(`\nSummary: ${totalPass}/${totalSlides} slides pass across ${summaries.length} lessons\n`);
process.exit(0);
