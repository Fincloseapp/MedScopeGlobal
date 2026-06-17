#!/usr/bin/env node
/**
 * Backfill Academy video renders — repair missing public_url, link lessons, retry placeholders.
 * Usage: node scripts/academy-backfill-video-renders.mjs [--dry-run] [--limit N]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

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

const dryRun = process.argv.includes("--dry-run");
const limit = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 50);

const PLACEHOLDER_MP4S = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
];

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

function pickPlaceholder(i) {
  return PLACEHOLDER_MP4S[i % PLACEHOLDER_MP4S.length];
}

async function repairMissingPublicUrls() {
  const { data: assets, error } = await admin
    .from("video_assets")
    .select("id, title, metadata, status")
    .limit(limit);
  if (error) throw new Error(error.message);

  let fixed = 0;
  for (let i = 0; i < (assets ?? []).length; i++) {
    const row = assets[i];
    const meta = { ...(row.metadata ?? {}) };
    if (meta.public_url || meta.tts_audio_url) continue;
    const patch = {
      ...meta,
      public_url: pickPlaceholder(i),
      generated: true,
      render_status: "ready",
      generation_provider: "placeholder",
    };
    console.log(`[repair] ${row.id} — set public_url`);
    if (!dryRun) {
      await admin.from("video_assets").update({ metadata: patch, status: "ready" }).eq("id", row.id);
    }
    fixed += 1;
  }
  return fixed;
}

async function linkPrepCourseFirstLessons() {
  const { data: courses } = await admin
    .from("courses")
    .select("id, slug, title, metadata, cover_image_url")
    .eq("status", "published")
    .contains("metadata", { prep_course: true });

  let linked = 0;
  for (let i = 0; i < (courses ?? []).length; i++) {
    const course = courses[i];
    const { data: lessons } = await admin
      .from("lessons")
      .select("id, slug, title, video_asset_id, sort_order")
      .eq("course_id", course.id)
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(1);
    const lesson = lessons?.[0];
    if (!lesson || lesson.video_asset_id) continue;

    const assetId = `b100${String(i + 1).padStart(4, "0")}-0000-4000-8000-000000000001`;
    const meta = {
      public_url: pickPlaceholder(i),
      thumbnail_url: course.cover_image_url ?? pickPlaceholder(i),
      generated: true,
      render_status: "ready",
      generation_provider: "placeholder",
      avatar_type: "european_medical_lecturer",
      lesson_format: "video",
    };

    console.log(`[prep] ${course.slug} / ${lesson.slug} → asset ${assetId}`);
    if (!dryRun) {
      await admin.from("video_assets").upsert({
        id: assetId,
        title: `${lesson.title} — AI lekce`,
        storage_path: `academy/videos/prep/${course.slug}/${lesson.slug}.mp4`,
        duration_seconds: 480,
        status: "ready",
        metadata: meta,
      });
      await admin.from("lessons").update({ video_asset_id: assetId }).eq("id", lesson.id);
      await admin
        .from("courses")
        .update({
          metadata: {
            ...(course.metadata ?? {}),
            has_video: true,
            ai_lecturer: true,
            audience: "prijimacky",
            prep_course: true,
          },
        })
        .eq("id", course.id);
    }
    linked += 1;
  }
  return linked;
}

async function report() {
  const { count: videoLessons } = await admin
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .not("video_asset_id", "is", null);
  const { count: prepCourses } = await admin
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .contains("metadata", { prep_course: true });
  console.log(`\nSummary: videoLessons=${videoLessons ?? 0}, prepCourses=${prepCourses ?? 0}`);
}

console.log(`\n=== Academy video backfill ${dryRun ? "(dry-run)" : ""} ===\n`);
const repaired = await repairMissingPublicUrls();
const linked = await linkPrepCourseFirstLessons();
await report();
console.log(`\nDone: repaired=${repaired}, prepLinked=${linked}\n`);
