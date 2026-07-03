import { randomUUID } from "crypto";

import { generateVideoThumbnailPlaceholder } from "@/lib/academy/storage/video-thumbnail";
import { buildVideoEditorialMetadataPatch, prepareVideoScriptForSpeech } from "@/lib/editorial/video-units";
import type { QueueRenderInput, QueueRenderResult } from "@/lib/academy/ai/video-providers/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  CZECH_EDGE_VOICES,
  isEdgeTtsAvailable,
  synthesizeCzechEdgeTts,
  type CzechEdgeGender,
} from "@/lib/tts/edge-tts-czech";

const BUCKET = "media";
const AUDIO_PREFIX = "academy/audio";

/** Branded static avatar for AI lektor audio lessons (European medical lecturer). */
const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1584515930387-285e4804f4cb?w=640&h=640&fit=crop&q=85&auto=format&fm=webp";

export function isOpenAiTtsConfigured(): boolean {
  return isEdgeTtsAvailable();
}

function estimateAudioDurationSeconds(script: string): number {
  const words = script.split(/\s+/).filter(Boolean).length;
  return Math.max(60, Math.min(900, Math.round((words / 140) * 60)));
}

function resolveCzechVoice(): { voice: string; gender: CzechEdgeGender } {
  const envVoice = process.env.EDGE_TTS_VOICE?.trim();
  if (envVoice?.startsWith("cs-CZ")) {
    const gender: CzechEdgeGender = /antonin/i.test(envVoice) ? "male" : "female";
    return { voice: envVoice, gender };
  }
  const envGender = process.env.EDGE_TTS_GENDER?.trim()?.toLowerCase();
  const gender: CzechEdgeGender = envGender === "male" ? "male" : "female";
  return { voice: CZECH_EDGE_VOICES[gender], gender };
}

/** Generate Czech narration via Microsoft Edge TTS (Vlasta/Antonin neural) — NOT English OpenAI voice. */
export async function queueOpenAiTtsRender(input: QueueRenderInput): Promise<QueueRenderResult> {
  if (!isEdgeTtsAvailable()) {
    return {
      provider: "placeholder",
      status: "ready",
      message: "Edge TTS unavailable — use browser Web Speech for Czech playback",
    };
  }

  const rawScript = input.script.script.slice(0, 4096);
  const scriptText = prepareVideoScriptForSpeech({ title: input.title, script: rawScript }) || rawScript;
  const { voice, gender } = resolveCzechVoice();

  try {
    const audioBuffer = await synthesizeCzechEdgeTts(scriptText, { voice, gender });

    const slug = input.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 48);
    const storagePath = `${AUDIO_PREFIX}/${slug}-${Date.now()}.mp3`;

    const admin = createServiceRoleClient();
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: false,
    });

    if (uploadError) {
      return {
        provider: "openai_tts",
        status: "failed",
        message: `Supabase audio upload failed: ${uploadError.message}`,
      };
    }

    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
    const ttsAudioUrl = urlData.publicUrl;
    const durationSeconds = estimateAudioDurationSeconds(scriptText);
    const thumb = await generateVideoThumbnailPlaceholder(input.title, durationSeconds);
    const avatarImageUrl = thumb.thumbnail_url ?? DEFAULT_AVATAR_URL;

    return {
      provider: "openai_tts",
      status: "ready",
      public_url: ttsAudioUrl,
      tts_audio_url: ttsAudioUrl,
      avatar_image_url: avatarImageUrl,
      lesson_format: "audio_lesson",
      message: "Czech Edge TTS audio lesson ready (cs-CZ neural voice)",
      metadata_patch: {
        tts_audio_url: ttsAudioUrl,
        avatar_image_url: avatarImageUrl,
        lesson_format: "audio_lesson",
        audio_storage_path: storagePath,
        tts_voice: voice,
        tts_provider: "edge_tts",
        tts_language: "cs-CZ",
        duration_seconds: durationSeconds,
        thumbnail_url: avatarImageUrl,
        heygen_video_id: null,
        pending_external_render: false,
        render_status: "ready",
        generated: true,
        language: "cs",
        ...buildVideoEditorialMetadataPatch({
          avatarType: input.script.avatar_type,
          audience: "academy",
          aiAssisted: true,
        }),
      },
    };
  } catch (e) {
    return {
      provider: "openai_tts",
      status: "failed",
      message: e instanceof Error ? e.message : "Edge TTS Czech synthesis failed",
    };
  }
}

/** Upload raw audio buffer (used by pipeline retries). */
export async function uploadTtsAudioBuffer(
  buffer: Buffer,
  title: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const storagePath = `${AUDIO_PREFIX}/${randomUUID()}.mp3`;
  const admin = createServiceRoleClient();
  const { error } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "audio/mpeg",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl };
}
