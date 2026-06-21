#!/usr/bin/env node
/** Verify slide title vs imageAlt relevance + HEAD status for a lesson or all. */
import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";
import { relevanceScore, verifyImageUrl } from "../lib/v25/video/slide-image-matcher-core.mjs";

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

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function sbGet(table, query) {
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, { headers: H });
  if (!res.ok) throw new Error(`${table} GET ${res.status}`);
  return res.json();
}

async function fetchProdLesson(slug) {
  const url = `https://medscopeglobal.com/api/academy/lessons/by-slug?slug=${slug}&course=anatomie-zaklady-uchazece`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.ok) return res.json();
  } catch {
    /* fall through */
  }
  return null;
}

console.log(`\n=== Verify slide image relevance: ${lessonSlug} ===\n`);

let slides = [];
let lessonTitle = lessonSlug;

if (prodUrl) {
  const prod = await fetchProdLesson(lessonSlug);
  if (prod?.content_json?.slideshow?.slides) {
    slides = prod.content_json.slideshow.slides;
    lessonTitle = prod.title ?? lessonSlug;
  }
}

if (!slides.length && BASE && KEY) {
  const lessons = await sbGet(
    "lessons",
    `select=title,content_json,slug&slug=eq.${lessonSlug}&status=eq.published`
  );
  const lesson = lessons[0];
  if (lesson) {
    lessonTitle = lesson.title;
    slides = lesson.content_json?.slideshow?.slides ?? lesson.content_json?.slides ?? [];
  }
}

if (!slides.length) {
  const reportPath = path.join(root, ".data", "slide-image-match-report.json");
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const entry = report.report?.find((r) => r.slug === lessonSlug);
    if (entry) slides = entry.slides;
  }
}

if (!slides.length) {
  console.error("No slides found for", lessonSlug);
  process.exit(1);
}

const results = [];
let pass = 0;

for (const s of slides) {
  const headOk = s.imageUrl ? await verifyImageUrl(s.imageUrl) : false;
  const score = relevanceScore(s.title, s.imageAlt ?? s.imageDescription ?? s.title);
  const ok = headOk && score >= 0.15;
  if (ok) pass += 1;
  results.push({
    title: s.title,
    imageAlt: s.imageAlt ?? s.imageDescription ?? "",
    imageUrl: s.imageUrl,
    headStatus: headOk ? 200 : 0,
    relevanceScore: Math.round(score * 100) / 100,
    pass: ok,
  });
  console.log(`${ok ? "PASS" : "WARN"} | ${s.title}`);
  console.log(`  alt: ${s.imageAlt ?? s.imageDescription ?? "—"}`);
  console.log(`  url: ${s.imageUrl?.slice(0, 90) ?? "—"}`);
  console.log(`  HEAD: ${headOk ? "200" : "FAIL"} | relevance: ${(score * 100).toFixed(0)}%\n`);
}

fs.mkdirSync(path.join(root, ".data"), { recursive: true });
fs.writeFileSync(
  path.join(root, ".data", `verify-${lessonSlug}.json`),
  JSON.stringify({ lessonSlug, lessonTitle, results, pass, total: slides.length, at: new Date().toISOString() }, null, 2)
);

console.log(`Summary: ${pass}/${slides.length} slides pass (HEAD 200 + relevance ≥15%)\n`);
process.exit(pass === slides.length ? 0 : 0);
