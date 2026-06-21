#!/usr/bin/env node
/**
 * GROQ + Wikimedia: match each slide image to slide text.
 * Usage: node scripts/match-slide-images-to-text.mjs [--lesson=orientace-v-tele] [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";
import {
  resolveSlideImageFromQuery,
  matchGranularTopic,
  relevanceScore,
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
const groqKey = env.GROQ_API_KEY;
const dryRun = process.argv.includes("--dry-run");
const lessonFilter = process.argv.find((a) => a.startsWith("--lesson="))?.split("=")[1];

if (!BASE || !KEY) {
  console.error("Missing SUPABASE_URL / SERVICE_ROLE_KEY");
  process.exit(1);
}

const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function sbGet(table, query) {
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, { headers: H });
  if (!res.ok) throw new Error(`${table} GET ${res.status}`);
  return res.json();
}

async function sbPatch(table, query, body) {
  if (dryRun) return;
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${table} PATCH ${res.status} ${await res.text()}`);
}

const MATCH_SYSTEM = `Vrať JSON: {"imageSearchQuery":"specific English 5-12 words","imageAlt":"Czech alt text","wikimediaSearchTerm":"English 3-6 words for Wikimedia"}
Musí odpovídat slide textu — anatomie, kostra, roviny, orgány. NE jídlo/sport.`;

async function groqSlideQuery(input, attempt = 0) {
  if (!groqKey) return fallbackQuery(input);
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.GROQ_MODEL_PRIMARY || env.AI_MODEL || "llama-3.1-70b-versatile",
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MATCH_SYSTEM },
        {
          role: "user",
          content: `Kurz: ${input.courseTopic}\nLekce: ${input.lessonTitle}\nSlide: ${input.slideTitle}\n${input.slideBody.slice(0, 500)}`,
        },
      ],
    }),
  });
  if (res.status === 429 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
    return groqSlideQuery(input, attempt + 1);
  }
  if (!res.ok) return fallbackQuery(input);
  const data = await res.json();
  try {
    const p = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    return {
      imageSearchQuery: p.imageSearchQuery ?? p.wikimediaSearchTerm ?? "",
      imageAlt: p.imageAlt ?? input.slideTitle,
      wikimediaSearchTerm: p.wikimediaSearchTerm ?? p.imageSearchQuery ?? "",
    };
  } catch {
    return fallbackQuery(input);
  }
}

function fallbackQuery(input) {
  const topic = matchGranularTopic(
    `${input.courseTopic} ${input.lessonTitle} ${input.slideTitle} ${input.slideBody}`
  );
  const terms = {
    anatomical_planes: "anatomical planes sagittal frontal transverse diagram",
    orientation: "human body anatomical position regions diagram",
    skeleton: "human skeleton anterior view anatomy",
    skeleton_anterior: "human skeleton anterior view anatomy education",
    muscle: "human muscle anatomy diagram",
    heart: "human heart anatomy diagram",
    circulation: "circulatory system anatomy diagram",
    brain: "human brain anatomy sagittal",
    lung: "human lungs anatomy diagram",
    cell: "animal cell structure diagram",
    default: "human anatomy medical education diagram",
  };
  const term = terms[topic] ?? terms.default;
  return {
    imageSearchQuery: term,
    imageAlt: input.slideTitle,
    wikimediaSearchTerm: term,
  };
}

async function matchSlide(input) {
  const query = await groqSlideQuery(input);
  const resolved = await resolveSlideImageFromQuery({
    ...query,
    slideTitle: input.slideTitle,
    slideBody: input.slideBody,
    lessonTitle: input.lessonTitle,
    courseTopic: input.courseTopic,
  });
  return {
    ...query,
    imageUrl: resolved.imageUrl,
    source: resolved.source,
    relevance: relevanceScore(input.slideTitle + " " + input.slideBody.slice(0, 80), query.imageAlt),
  };
}

async function refreshSlideshow(slideshow, lessonTitle, courseTopic) {
  if (!slideshow?.slides?.length) return slideshow;
  const slides = [];
  for (let i = 0; i < slideshow.slides.length; i++) {
    const s = slideshow.slides[i];
    if (i > 0) await new Promise((r) => setTimeout(r, 800));
    const m = await matchSlide({
      slideTitle: s.title,
      slideBody: s.body,
      lessonTitle,
      courseTopic,
    });
    slides.push({
      ...s,
      imageUrl: m.imageUrl,
      imageAlt: m.imageAlt,
      imageDescription: m.imageAlt,
      imageKeywords: [m.wikimediaSearchTerm].filter(Boolean),
      imageSource: m.source,
    });
    console.log(`    slide ${i + 1}: ${m.source} → ${m.imageUrl.slice(0, 70)}…`);
  }
  return { ...slideshow, slides };
}

console.log(`\n=== Match slide images to text ${dryRun ? "(dry-run)" : ""} ===\n`);

let lessonQuery = "select=id,title,content,content_json,slug,course_id&status=eq.published";
if (lessonFilter) lessonQuery += `&slug=eq.${lessonFilter}`;
const lessons = await sbGet("lessons", lessonQuery);
const courses = await sbGet("courses", "select=id,title,slug");
const courseMap = new Map(courses.map((c) => [c.id, c]));

let lessonCount = 0;
let slideCount = 0;
const report = [];

for (const lesson of lessons) {
  const course = courseMap.get(lesson.course_id);
  const courseTopic = course?.title ?? "MedScope Academy";
  const cj = { ...(lesson.content_json ?? {}) };
  let slideshow = cj.slideshow ?? null;

  if (!slideshow?.slides?.length) {
    const paragraphs = (lesson.content || "")
      .replace(/[#*]/g, "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15)
      .slice(0, 8);
    slideshow = {
      title: lesson.title,
      topic: courseTopic,
      slides:
        paragraphs.length > 0
          ? paragraphs.map((body, i) => ({
              title: i === 0 ? lesson.title : `${lesson.title} — ${i + 1}`,
              body: body.slice(0, 400),
              durationSeconds: 12,
            }))
          : [{ title: lesson.title, body: (lesson.content || lesson.title).slice(0, 280), durationSeconds: 10 }],
      alignmentScore: 0.85,
      ttsMode: "web_speech_api",
      generatedAt: new Date().toISOString(),
      provider: "static",
    };
  }

  console.log(`→ ${lesson.slug} (${slideshow.slides.length} slides)`);
  slideshow = await refreshSlideshow(slideshow, lesson.title, courseTopic);
  const listenText = [lesson.title, lesson.content, ...slideshow.slides.map((s) => `${s.title}. ${s.body}`)].join("\n\n");

  await sbPatch("lessons", `id=eq.${lesson.id}`, {
    content_json: { ...cj, slideshow, slides: slideshow.slides, voiceover_text: listenText },
    updated_at: new Date().toISOString(),
  });

  lessonCount += 1;
  slideCount += slideshow.slides.length;
  report.push({
    slug: lesson.slug,
    course: course?.slug,
    slides: slideshow.slides.map((s) => ({
      title: s.title,
      imageUrl: s.imageUrl,
      imageAlt: s.imageAlt,
      source: s.imageSource,
    })),
  });
  console.log(`✓ ${lesson.slug}\n`);
}

let osvetaCount = 0;
try {
  const osvetaVideos = await sbGet("public_health_videos", "select=id,title,script,metadata,slug");
  for (const video of osvetaVideos.slice(0, 10)) {
    const topic = video.metadata?.topic_title ?? "Zdravotní osvěta";
    const meta = { ...(video.metadata ?? {}) };
    let slideshow = meta.slideshow ?? null;
    if (!slideshow?.slides?.length) {
      const paragraphs = (video.script || video.title || "")
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 15)
        .slice(0, 6);
      slideshow = {
        title: video.title,
        topic,
        slides: paragraphs.map((body, i) => ({
          title: i === 0 ? video.title : `${video.title} — ${i + 1}`,
          body: body.slice(0, 280),
          durationSeconds: 10,
        })),
      };
    }
    console.log(`→ osveta ${video.slug ?? video.id}`);
    slideshow = await refreshSlideshow(slideshow, video.title, topic);
    meta.slideshow = slideshow;
    await sbPatch("public_health_videos", `id=eq.${video.id}`, { metadata: meta, updated_at: new Date().toISOString() });
    osvetaCount += 1;
    slideCount += slideshow.slides.length;
    console.log(`✓ osveta ${video.slug ?? video.id}\n`);
  }
} catch (e) {
  console.warn("Osveta skip:", e.message);
}

fs.mkdirSync(path.join(root, ".data"), { recursive: true });
fs.writeFileSync(
  path.join(root, ".data", "slide-image-match-report.json"),
  JSON.stringify({ lessonCount, osvetaCount, slideCount, dryRun, report, at: new Date().toISOString() }, null, 2)
);

console.log(`\nDone: ${lessonCount} lessons, ${osvetaCount} osveta, ${slideCount} slides matched\n`);
