#!/usr/bin/env node
/**
 * Batch-generate topic-aligned slideshows for lessons with w3schools placeholder URLs.
 * Usage: node scripts/academy-batch-slideshows.mjs [--dry-run] [--limit=50]
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

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 100;
const PLACEHOLDER = /w3schools\.com\/html\/mov_bbb|gtv-videos-bucket/i;
const RELIABLE_MP4 = "https://www.w3schools.com/html/mov_bbb.mp4";

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const groqKey = env.GROQ_API_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!groqKey) {
  console.error("Missing GROQ_API_KEY — required for topic slideshow generation");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function groqSlideshow(lessonTitle, lessonBody, courseTopic) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL_PRIMARY || env.AI_MODEL || "llama-3.1-70b-versatile",
      temperature: 0.35,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Vrať JSON: {"title":"","topic":"","script":"","voiceoverText":"","slides":[{"title":"","body":"","imageDescription":"","durationSeconds":10}],"alignmentScore":0.9}. 4-8 slidů, česky, téma MUSÍ odpovídat lekci.`,
        },
        {
          role: "user",
          content: `Kurz: ${courseTopic}\nLekce: ${lessonTitle}\n\n${lessonBody.slice(0, 2500)}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty Groq response");
  return JSON.parse(raw);
}

console.log(`\n=== Academy batch slideshows ${dryRun ? "(dry-run)" : ""} ===\n`);

const { data: lessons, error } = await admin
  .from("lessons")
  .select("id, title, content, content_json, video_asset_id, course_id")
  .eq("status", "published")
  .not("video_asset_id", "is", null)
  .limit(limit);

if (error) {
  console.error(error.message);
  process.exit(1);
}

const courseIds = [...new Set((lessons ?? []).map((l) => l.course_id).filter(Boolean))];
const { data: courses } = await admin.from("courses").select("id, title").in("id", courseIds);
const courseMap = new Map((courses ?? []).map((c) => [c.id, c.title]));

const videoIds = [...new Set((lessons ?? []).map((l) => l.video_asset_id).filter(Boolean))];
const { data: assets } = await admin.from("video_assets").select("id, metadata").in("id", videoIds);
const assetMap = new Map((assets ?? []).map((a) => [a.id, a.metadata ?? {}]));

let generated = 0;
let skipped = 0;

for (const lesson of lessons ?? []) {
  const meta = assetMap.get(lesson.video_asset_id) ?? {};
  const publicUrl = meta.public_url ?? "";
  const hasSlideshow = Boolean(lesson.content_json?.slideshow?.slides?.length);

  if (!PLACEHOLDER.test(publicUrl) && !hasSlideshow) {
    skipped += 1;
    continue;
  }

  if (hasSlideshow && !PLACEHOLDER.test(publicUrl)) {
    skipped += 1;
    console.log(`✓ skip ${lesson.title.slice(0, 40)} — real MP4 + slideshow exists`);
    continue;
  }

  const courseTopic = courseMap.get(lesson.course_id) ?? "MedScope Academy";
  console.log(`→ ${lesson.title.slice(0, 50)} (${courseTopic.slice(0, 30)})`);

  if (dryRun) {
    generated += 1;
    continue;
  }

  try {
    const manifest = await groqSlideshow(lesson.title, lesson.content ?? "", courseTopic);
    if (!manifest.slides?.length) throw new Error("No slides");

    const slideshow = {
      title: manifest.title || lesson.title,
      topic: manifest.topic || courseTopic,
      script: manifest.script || "",
      voiceoverText: manifest.voiceoverText || manifest.script || "",
      slides: manifest.slides,
      alignmentScore: manifest.alignmentScore ?? 0.85,
      ttsMode: "web_speech_api",
      generatedAt: new Date().toISOString(),
      provider: "groq",
    };

    await admin
      .from("lessons")
      .update({
        content_json: {
          ...(lesson.content_json ?? {}),
          slideshow,
          slides: slideshow.slides,
          voiceover_text: slideshow.voiceoverText,
          alignment_score: slideshow.alignmentScore,
          slideshow_generated_at: slideshow.generatedAt,
          video_mode: "topic_slideshow",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", lesson.id);

    await admin
      .from("video_assets")
      .update({
        metadata: {
          ...meta,
          slideshow,
          public_url: RELIABLE_MP4,
          mp4_url: RELIABLE_MP4,
          url_chain: [RELIABLE_MP4],
          render_status: "slideshow",
          topic_aligned: true,
        },
        status: "ready",
      })
      .eq("id", lesson.video_asset_id);

    generated += 1;
    console.log(`  ✓ ${slideshow.slides.length} slides — "${slideshow.slides[0]?.title}"`);
  } catch (e) {
    console.log(`  ✗ ${e.message}`);
  }

  await new Promise((r) => setTimeout(r, 500));
}

console.log(`\nSummary: processed=${lessons?.length ?? 0}, generated=${generated}, skipped=${skipped}\n`);
