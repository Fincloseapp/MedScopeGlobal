#!/usr/bin/env npx tsx
/**
 * Regenerate Czech Edge TTS for a single osvěta video by slug.
 * Usage: npx tsx scripts/regenerate-osveta-slug.ts mozek-zdravi-2026-07-04
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { queueOpenAiTtsRender } from "@/lib/academy/ai/video-providers/openai-tts-video";
import { isEdgeTtsAvailable, synthesizeCzechEdgeTts } from "@/lib/tts/edge-tts-czech";
import { prepareVideoScriptForSpeech } from "@/lib/editorial/video-units";
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
if (!slug) {
  console.error("Usage: npx tsx scripts/regenerate-osveta-slug.ts <slug>");
  process.exit(1);
}

async function main() {
  if (!isEdgeTtsAvailable()) {
    console.error("Edge TTS unavailable — requires Node with WebSocket");
    process.exit(1);
  }

  await synthesizeCzechEdgeTts("Test českého hlasu.", { gender: "female" });

  const admin = createServiceRoleClient();
  const { data: row, error } = await admin
    .from("public_health_videos")
    .select("id, title, script, avatar_type, metadata")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    console.error(`No osvěta video found for slug: ${slug}`);
    process.exit(1);
  }

  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const speechText =
    prepareVideoScriptForSpeech({ title: row.title, script: row.script }) ||
    row.script.trim().slice(0, 4096);

  console.log(`Regenerating: ${row.title} (${slug})`);

  const render = await queueOpenAiTtsRender({
    title: row.title,
    script: {
      script: speechText,
      storyboard: [],
      avatar_type: String(row.avatar_type ?? meta.avatar_type ?? "friendly_doctor"),
      voice_type: "cs_female_professional",
      duration_estimate_seconds: 75,
    },
    videoAssetId: row.id,
  });

  if (render.status !== "ready" || !render.tts_audio_url) {
    console.error("Render failed:", render.message ?? render.status);
    process.exit(1);
  }

  const patch = {
    ...meta,
    ...(render.metadata_patch ?? {}),
    tts_audio_url: render.tts_audio_url,
    lesson_format: "audio_lesson",
    render_provider: "openai_tts",
    render_status: "ready",
    language: "cs",
    tts_language: "cs-CZ",
    tts_provider: "edge_tts",
    tts_regenerated_at: new Date().toISOString(),
  };

  const { error: updateError } = await admin
    .from("public_health_videos")
    .update({
      video_url: render.tts_audio_url,
      metadata: patch,
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updateError) throw new Error(updateError.message);

  console.log("OK:", render.tts_audio_url);
  console.log("voice:", render.metadata_patch?.tts_voice ?? "cs-CZ-VlastaNeural");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
