#!/usr/bin/env node
/**
 * Attach topic-matched imageUrl to all academy lesson slideshows.
 * Usage: node scripts/academy-batch-slideshow-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
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

const TOPIC_IMAGES = {
  anatomy: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  orientace: "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  krev: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
};

function resolveImage(title, body, topic, index) {
  const h = `${topic} ${title} ${body}`.toLowerCase();
  if (/orientac|poloh|roviny|anatom/i.test(h)) return TOPIC_IMAGES.orientace;
  if (/krev|oběh|srde|kardi/i.test(h)) return TOPIC_IMAGES.krev;
  if (/anatom|kost/i.test(h)) return TOPIC_IMAGES.anatomy;
  return TOPIC_IMAGES.default;
}

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const { data: lessons, error } = await admin
  .from("lessons")
  .select("id, title, content, content_json, slug, course_id, duration_minutes")
  .eq("status", "published");

if (error) {
  console.error(error.message);
  process.exit(1);
}

const courseIds = [...new Set((lessons ?? []).map((l) => l.course_id))];
const { data: courses } = await admin.from("courses").select("id, title, duration_minutes").in("id", courseIds);
const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));

let fixed = 0;
const courseDurations = new Map();

for (const lesson of lessons ?? []) {
  const course = courseMap.get(lesson.course_id);
  const topic = course?.title ?? "MedScope Academy";
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
        : [{ title: lesson.title, body: lesson.content?.slice(0, 280) || lesson.title, imageDescription: topic, durationSeconds: 10 }];
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

  slideshow.slides = (slideshow.slides ?? []).map((s, i) => ({
    ...s,
    imageUrl: s.imageUrl || resolveImage(s.title, s.body, topic, i),
  }));

  const estMinutes = Math.max(lesson.duration_minutes || 0, Math.ceil((lesson.content?.length ?? 0) / 900));
  const listenText = [lesson.title, lesson.content, ...slideshow.slides.map((s) => `${s.title}. ${s.body}`)].join("\n\n");

  await admin
    .from("lessons")
    .update({
      content_json: {
        ...cj,
        slideshow,
        slides: slideshow.slides,
        voiceover_text: listenText,
        alignment_score: slideshow.alignmentScore ?? 0.85,
      },
      duration_minutes: estMinutes || 5,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lesson.id);

  courseDurations.set(lesson.course_id, (courseDurations.get(lesson.course_id) ?? 0) + (estMinutes || 5));
  fixed += 1;
  console.log(`✓ ${lesson.slug} — ${slideshow.slides.length} slides with images`);
}

for (const [courseId, totalMin] of courseDurations) {
  await admin.from("courses").update({ duration_minutes: totalMin, updated_at: new Date().toISOString() }).eq("id", courseId);
  const c = courseMap.get(courseId);
  console.log(`  course ${c?.title}: ${totalMin} min total`);
}

console.log(`\nBatch complete: ${fixed} lessons updated\n`);
