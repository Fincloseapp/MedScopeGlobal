#!/usr/bin/env node
/**
 * Expand academy lessons (GROQ), attach slide images (free sources), sync durations.
 * Usage:
 *   node scripts/academy-expand-lessons.mjs [--course=anatomie-zaklady-uchazece] [--all] [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";
import {
  DEFAULT_SLIDE_IMAGE,
  KEYWORD_IMAGES,
  ensureWorkingImageUrl,
  isBrokenSlideImageUrl,
} from "../lib/v25/video/slide-image-urls.mjs";

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
const CZECH_WPM = 150;

const dryRun = process.argv.includes("--dry-run");
const allLessons = process.argv.includes("--all");
const courseArg = process.argv.find((a) => a.startsWith("--course="));
const courseSlug = courseArg?.split("=")[1] ?? "anatomie-zaklady-uchazece";

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

function countWords(text) {
  return (text ?? "").replace(/[#*_\[\]()]/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(text) {
  const w = countWords(text);
  return Math.max(1, Math.ceil(w / CZECH_WPM));
}

function lessonListenText(lesson, slides) {
  return [lesson.title, lesson.content, ...slides.map((s) => `${s.title}. ${s.body}`)]
    .filter(Boolean)
    .join("\n\n");
}

const CS_MAP = [
  [/orientac|poloh|roviny|anatom|těl/i, "orientation"],
  [/kost|skelet|kostern/i, "skeleton"],
  [/krev|oběh|cirkul/i, "circulation"],
  [/srdce|kardi|ekg|srdeční/i, "heart"],
  [/buněk|buně|biolog|genet|dna/i, "cell"],
  [/sval|myolog/i, "muscle"],
  [/mozek|neurolog|nerv/i, "brain"],
  [/plic|respir|dých/i, "lung"],
];

function matchKey(haystack) {
  const h = haystack.toLowerCase();
  for (const [re, key] of CS_MAP) {
    if (re.test(h)) return key;
  }
  for (const key of Object.keys(KEYWORD_IMAGES)) {
    if (key !== "default" && h.includes(key)) return key;
  }
  return "default";
}

async function searchWikimedia(keywords) {
  const q = encodeURIComponent(keywords.slice(0, 80));
  try {
    const res = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=3&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      const url = page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url;
      if (url?.startsWith("http")) {
        const ok = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) }).then((r) => r.ok).catch(() => false);
        if (ok) return url;
      }
    }
  } catch {
    /* skip */
  }
  return null;
}

async function resolveSlideImage(slide, topic, i) {
  const kw = Array.isArray(slide.imageKeywords) ? slide.imageKeywords.join(" ") : slide.imageKeywords ?? "";
  const haystack = [topic, slide.title, slide.body, slide.imageDescription, kw].filter(Boolean).join(" ");
  const key = matchKey(haystack);
  const curated = KEYWORD_IMAGES[key] ?? KEYWORD_IMAGES.default;
  const stored = isBrokenSlideImageUrl(slide.imageUrl) ? null : slide.imageUrl;

  if (stored) {
    const verified = await ensureWorkingImageUrl(stored, curated);
    if (verified) return verified;
  }

  const verifiedCurated = await ensureWorkingImageUrl(curated, DEFAULT_SLIDE_IMAGE);
  if (verifiedCurated && verifiedCurated !== DEFAULT_SLIDE_IMAGE) return verifiedCurated;

  const wikiQuery = kw || `${key} anatomy medical education`;
  const wiki = await searchWikimedia(wikiQuery);
  if (wiki) return wiki;

  const keys = Object.keys(KEYWORD_IMAGES).filter((k) => k !== "default");
  return (await ensureWorkingImageUrl(KEYWORD_IMAGES[keys[i % keys.length]], DEFAULT_SLIDE_IMAGE)) ?? DEFAULT_SLIDE_IMAGE;
}

async function groqChat(messages, maxTokens = 8192) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL_PRIMARY || env.AI_MODEL || "llama-3.1-70b-versatile",
        temperature: 0.4,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages,
      }),
    });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) return { error: res.status };
    const data = await res.json();
    return { content: data.choices?.[0]?.message?.content };
  }
  return { error: 429 };
}

async function groqExpand(lessonTitle, lessonBody, courseTitle, targetMinutes) {
  if (!groqKey) return null;
  const targetWords = targetMinutes * CZECH_WPM;
  const result = await groqChat([
    {
      role: "system",
      content: `Jsi tým medicínských expertů (editor, klinik, pedagog). Vrať JSON:
{"content":"markdown cs — MINIMÁLNĚ ${targetWords} slov, 5+ odstavců","slides":[{"title":"","body":"3-5 vět","imageDescription":"","imageKeywords":["english","terms"],"durationSeconds":12}],"voiceoverText":""}
6-10 slidů, imageKeywords anglicky, odborná spisovná čeština. NEZKRACUJ — rozšiř stávající text.`,
    },
    {
      role: "user",
      content: `Kurz: ${courseTitle}\nLekce: ${lessonTitle}\nCíl: ${targetMinutes} min (~${targetWords} slov)\n\n${lessonBody.slice(0, 3500)}`,
    },
  ]);
  if (result.error) {
    console.warn(`  Groq ${result.error} for ${lessonTitle}`);
    return null;
  }
  if (!result.content) return null;
  return JSON.parse(result.content);
}

async function groqImageKeywords(slide, lessonTitle, topic) {
  if (!groqKey) return inferKeywords(slide, topic);
  try {
    const result = await groqChat(
      [
        {
          role: "system",
          content: 'Vrať JSON {"imageKeywords":["2-5 english medical/educational search terms"]}',
        },
        {
          role: "user",
          content: `Lekce: ${lessonTitle}\nTéma: ${topic}\nSlide: ${slide.title}\n${slide.body}`,
        },
      ],
      256
    );
    if (result.error) return inferKeywords(slide, topic);
    const parsed = JSON.parse(result.content ?? "{}");
    return parsed.imageKeywords?.length ? parsed.imageKeywords : inferKeywords(slide, topic);
  } catch {
    return inferKeywords(slide, topic);
  }
}

function inferKeywords(slide, topic) {
  const h = `${topic} ${slide.title} ${slide.body}`.toLowerCase();
  const out = [];
  for (const [re, key] of CS_MAP) {
    if (re.test(h)) out.push(key);
  }
  return out.length ? out : [matchKey(h)];
}

console.log(`\n=== Academy expand + images ${dryRun ? "(dry-run)" : ""} ===`);
console.log(`Course filter: ${allLessons ? "ALL" : courseSlug}\n`);

const courses = await sbGet("courses", "select=id,slug,title,duration_minutes&status=eq.published");
const targetCourses = allLessons ? courses : courses.filter((c) => c.slug === courseSlug);
if (!targetCourses.length) {
  console.error(`No course found: ${courseSlug}`);
  process.exit(1);
}

const courseIds = targetCourses.map((c) => c.id);
const courseMap = new Map(courses.map((c) => [c.id, c]));

let lessonQuery = "select=id,title,content,content_json,slug,course_id,duration_minutes&status=eq.published";
if (!allLessons) {
  lessonQuery += `&course_id=in.(${courseIds.join(",")})`;
}
const lessons = await sbGet("lessons", lessonQuery);

// Unpublish duplicate diacritic slug when ASCII variant exists (orientace-v-těle vs orientace-v-tele)
const dupLesson = lessons.find((l) => l.slug === "orientace-v-těle");
const canonLesson = lessons.find((l) => l.slug === "orientace-v-tele");
if (dupLesson && canonLesson && dupLesson.course_id === canonLesson.course_id) {
  console.log("→ unpublish duplicate lesson orientace-v-těle (keeping orientace-v-tele)");
  await sbPatch("lessons", `id=eq.${dupLesson.id}`, {
    status: "draft",
    updated_at: new Date().toISOString(),
  });
}

const activeLessons =
  dupLesson && canonLesson ? lessons.filter((l) => l.id !== dupLesson.id) : lessons;

const report = [];
const courseTotals = new Map();

for (const lesson of activeLessons) {
  const course = courseMap.get(lesson.course_id);
  if (!allLessons && course?.slug !== courseSlug) continue;

  const topic = course?.title ?? "MedScope Academy";
  const cj = { ...(lesson.content_json ?? {}) };
  let content = lesson.content ?? "";
  let slideshow = cj.slideshow ?? null;
  const beforeWords = countWords(lessonListenText(lesson, slideshow?.slides ?? []));
  const actualMin = readingMinutes(lessonListenText(lesson, slideshow?.slides ?? []));
  const beforeMin = actualMin;

  const courseTarget = Math.max(20, course?.duration_minutes || 22);
  const lessonsInCourse = activeLessons.filter((l) => l.course_id === lesson.course_id).length || 4;
  const perLessonTarget = Math.max(5, Math.round(courseTarget / lessonsInCourse));
  const wordTarget = perLessonTarget * CZECH_WPM;
  const needsExpand = beforeWords < wordTarget * 0.85;

  if (needsExpand && groqKey) {
    console.log(`→ expand ${lesson.slug} (${beforeWords} words / ${beforeMin} min → target ~${perLessonTarget} min)`);
    const expanded = await groqExpand(lesson.title, content, topic, perLessonTarget);
    if (expanded?.content) {
      const expandedWords = countWords(expanded.content);
      if (expandedWords >= Math.max(beforeWords + 30, wordTarget * 0.35)) {
        content = expanded.content;
        slideshow = {
          title: lesson.title,
          topic,
          script: expanded.voiceoverText ?? content,
          voiceoverText: expanded.voiceoverText ?? content,
          slides: expanded.slides ?? [],
          alignmentScore: 0.9,
          ttsMode: "web_speech_api",
          generatedAt: new Date().toISOString(),
          provider: "groq",
        };
      } else {
        console.warn(`  skip short Groq output (${expandedWords} words) for ${lesson.slug}`);
      }
    }
  }

  if (!slideshow?.slides?.length) {
    const paragraphs = content
      .replace(/[#*]/g, "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15)
      .slice(0, 8);
    slideshow = {
      title: lesson.title,
      topic,
      script: paragraphs.join(" "),
      voiceoverText: paragraphs.join(" "),
      slides:
        paragraphs.length > 0
          ? paragraphs.map((body, i) => ({
              title: i === 0 ? lesson.title : `${lesson.title} — ${i + 1}`,
              body: body.slice(0, 400),
              imageDescription: topic,
              durationSeconds: 12,
            }))
          : [{ title: lesson.title, body: content.slice(0, 280), imageDescription: topic, durationSeconds: 10 }],
      alignmentScore: 0.85,
      ttsMode: "web_speech_api",
      generatedAt: new Date().toISOString(),
      provider: needsExpand ? "groq" : "static",
    };
  }

  slideshow.slides = await Promise.all(
    slideshow.slides.map(async (s, i) => {
      const imageKeywords = inferKeywords(s, topic);
      if (groqKey && i === 0) {
        await new Promise((r) => setTimeout(r, 500));
      }
      const imageUrl = await resolveSlideImage({ ...s, imageKeywords }, topic, i);
      return {
        ...s,
        imageKeywords,
        imageUrl,
        imageDescription: s.imageDescription || s.title,
      };
    })
  );

  const estMin = readingMinutes(lessonListenText({ ...lesson, content }, slideshow.slides));
  const afterWords = countWords(lessonListenText({ ...lesson, content }, slideshow.slides));
  const listenText = lessonListenText({ ...lesson, content }, slideshow.slides);

  await sbPatch("lessons", `id=eq.${lesson.id}`, {
    content,
    content_json: {
      ...cj,
      slideshow,
      slides: slideshow.slides,
      voiceover_text: listenText,
      alignment_score: slideshow.alignmentScore ?? 0.85,
    },
    duration_minutes: estMin,
    updated_at: new Date().toISOString(),
  });

  courseTotals.set(lesson.course_id, (courseTotals.get(lesson.course_id) ?? 0) + estMin);
  report.push({
    slug: lesson.slug,
    beforeMin,
    afterMin: estMin,
    beforeWords,
    afterWords,
    slideCount: slideshow.slides.length,
    images: slideshow.slides.map((s) => Boolean(s.imageUrl)),
  });
  console.log(`✓ ${lesson.slug}: ${beforeMin}→${estMin} min, ${slideshow.slides.length} slides, ${afterWords} words`);
}

for (const [cid, total] of courseTotals) {
  await sbPatch("courses", `id=eq.${cid}`, { duration_minutes: total, updated_at: new Date().toISOString() });
  console.log(`  course ${courseMap.get(cid)?.slug}: ${total} min total`);
}

fs.writeFileSync(
  path.join(root, ".data", "academy-expand-report.json"),
  JSON.stringify({ courseSlug, allLessons, dryRun, report, at: new Date().toISOString() }, null, 2)
);

console.log(`\nDone: ${report.length} lessons\n`);
