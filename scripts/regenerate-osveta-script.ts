#!/usr/bin/env npx tsx
/**
 * Regenerate osvěta video script (+ optional TTS) by slug.
 * Usage: npx tsx scripts/regenerate-osveta-script.ts mozek-zdravi-2026-07-04 [--tts]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { queueOpenAiTtsRender } from "@/lib/academy/ai/video-providers/openai-tts-video";
import { isEdgeTtsAvailable } from "@/lib/tts/edge-tts-czech";
import { buildVideoEditorialMetadataPatch, prepareVideoScriptForSpeech } from "@/lib/editorial/video-units";
import { generateOsvetaScript } from "@/lib/verejnost/osveta/daily-generator";
import { createServiceRoleClient } from "@/lib/supabase/service";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const slug = process.argv[2]?.trim();
const withTts = process.argv.includes("--tts");

if (!slug) {
  console.error("Usage: npx tsx scripts/regenerate-osveta-script.ts <slug> [--tts]");
  process.exit(1);
}

async function main() {
  const admin = createServiceRoleClient();
  const { data: row, error } = await admin
    .from("public_health_videos")
    .select("id, title, script, avatar_type, duration_seconds, metadata, topic:public_health_topics(category, description)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    console.error(`No osvěta video found for slug: ${slug}`);
    process.exit(1);
  }

  const topic = row.topic as { category?: string; description?: string } | null;
  const category = topic?.category ?? "prevence";
  const description = topic?.description ?? row.title;

  console.log(`Regenerating script: ${row.title} (${slug})`);

  const { script, duration, fallback } = await generateOsvetaScript(row.title, category, description);
  if (fallback) {
    console.warn("Warning: LLM fallback stub used — check API keys");
  }

  const editorialMeta = buildVideoEditorialMetadataPatch({
    audience: "osveta",
    slug,
    category,
    avatarType: row.avatar_type,
    aiAssisted: true,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  });

  const patch = {
    ...(row.metadata as Record<string, unknown>),
    ...editorialMeta,
    script_regenerated_at: new Date().toISOString(),
    script_fallback: fallback,
  };

  const { error: updateError } = await admin
    .from("public_health_videos")
    .update({
      script,
      duration_seconds: duration,
      metadata: patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updateError) throw new Error(updateError.message);

  console.log("Script updated:", script.slice(0, 200), "...");

  if (withTts) {
    if (!isEdgeTtsAvailable()) {
      console.warn("Edge TTS unavailable — skipping audio regen");
    } else {
      const speechText =
        prepareVideoScriptForSpeech({ title: row.title, script }) || script.trim().slice(0, 4096);

      const render = await queueOpenAiTtsRender({
        title: row.title,
        script: {
          script: speechText,
          storyboard: [],
          avatar_type: String(row.avatar_type ?? "friendly_doctor"),
          voice_type: "cs_female_professional",
          duration_estimate_seconds: duration,
        },
        videoAssetId: row.id,
      });

      if (render.status === "ready" && render.tts_audio_url) {
        await admin
          .from("public_health_videos")
          .update({
            video_url: render.tts_audio_url,
            metadata: {
              ...patch,
              tts_audio_url: render.tts_audio_url,
              tts_regenerated_at: new Date().toISOString(),
            },
            status: "published",
          })
          .eq("id", row.id);
        console.log("TTS OK:", render.tts_audio_url);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        slug,
        url: `https://medscopeglobal.com/verejnost/osveta/${slug}`,
        editorialUnit: editorialMeta.editorial_unit_primary,
        scriptLength: script.length,
        fallback,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
