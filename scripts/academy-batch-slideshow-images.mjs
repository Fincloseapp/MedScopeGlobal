#!/usr/bin/env node
/** Attach slide images + listen text to all published lessons (fetch-only, no deps). */
import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";

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
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${table} PATCH ${res.status} ${await res.text()}`);
}

const IMAGES = {
  anatomy: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  orientace: "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  krev: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
};

function imgFor(title, body, topic, i) {
  const h = `${topic} ${title} ${body}`.toLowerCase();
  if (/orientac|poloh|roviny|anatom/i.test(h)) return IMAGES.orientace;
  if (/krev|oběh|srde|kardi/i.test(h)) return IMAGES.krev;
  if (/anatom|kost/i.test(h)) return IMAGES.anatomy;
  return IMAGES.default;
}

const lessons = await sbGet("lessons", "select=id,title,content,content_json,slug,course_id,duration_minutes&status=eq.published");
const courses = await sbGet("courses", "select=id,title");
const courseMap = new Map(courses.map((c) => [c.id, c.title]));
const courseTotals = new Map();
let fixed = 0;

for (const lesson of lessons) {
  const topic = courseMap.get(lesson.course_id) ?? "MedScope Academy";
  const cj = { ...(lesson.content_json ?? {}) };
  let slideshow = cj.slideshow ?? null;

  if (!slideshow?.slides?.length) {
    const paragraphs = (lesson.content || "")
      .replace(/[#*]/g, "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15)
      .slice(0, 6);
    const slides =
      paragraphs.length > 0
        ? paragraphs.map((body, i) => ({
            title: i === 0 ? lesson.title : `${lesson.title} — ${i + 1}`,
            body: body.slice(0, 280),
            imageDescription: topic,
            durationSeconds: 10,
          }))
        : [{ title: lesson.title, body: (lesson.content || lesson.title).slice(0, 280), imageDescription: topic, durationSeconds: 10 }];
    slideshow = {
      title: lesson.title,
      topic,
      script: slides.map((s) => s.body).join(" "),
      voiceoverText: slides.map((s) => s.body).join(" "),
      slides,
      alignmentScore: 0.85,
      ttsMode: "web_speech_api",
      generatedAt: new Date().toISOString(),
      provider: "static",
    };
  }

  slideshow.slides = slideshow.slides.map((s, i) => ({
    ...s,
    imageUrl: s.imageUrl || imgFor(s.title, s.body, topic, i),
  }));

  const estMin = Math.max(lesson.duration_minutes || 0, Math.ceil((lesson.content?.length ?? 0) / 900)) || 5;
  const listenText = [lesson.title, lesson.content, ...slideshow.slides.map((s) => `${s.title}. ${s.body}`)].join("\n\n");

  await sbPatch("lessons", `id=eq.${lesson.id}`, {
    content_json: { ...cj, slideshow, slides: slideshow.slides, voiceover_text: listenText, alignment_score: 0.85 },
    duration_minutes: estMin,
    updated_at: new Date().toISOString(),
  });

  courseTotals.set(lesson.course_id, (courseTotals.get(lesson.course_id) ?? 0) + estMin);
  fixed += 1;
  console.log(`✓ ${lesson.slug}`);
}

for (const [cid, total] of courseTotals) {
  await sbPatch("courses", `id=eq.${cid}`, { duration_minutes: total, updated_at: new Date().toISOString() });
  console.log(`  course ${courseMap.get(cid)}: ${total} min`);
}

console.log(`\nDone: ${fixed} lessons\n`);
