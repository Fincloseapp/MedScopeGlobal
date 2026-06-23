import { randomUUID } from "crypto";

import { resolveOpenAiKey } from "@/lib/ai/openai-key";

import { generateVideoThumbnailPlaceholder } from "@/lib/academy/storage/video-thumbnail";

import type { QueueRenderInput, QueueRenderResult } from "@/lib/academy/ai/video-providers/types";

import { createServiceRoleClient } from "@/lib/supabase/service";



const BUCKET = "media";

const AUDIO_PREFIX = "academy/audio";



/** Branded static avatar for AI lektor audio lessons (European medical lecturer). */

const DEFAULT_AVATAR_URL =

  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=640&q=80";



export function isOpenAiTtsConfigured(): boolean {

  return Boolean(resolveOpenAiKey());

}



function estimateAudioDurationSeconds(script: string): number {

  const words = script.split(/\s+/).filter(Boolean).length;

  return Math.max(60, Math.min(900, Math.round((words / 140) * 60)));

}



/** Generate Czech narration via OpenAI TTS and store as playable audio lesson. */

export async function queueOpenAiTtsRender(input: QueueRenderInput): Promise<QueueRenderResult> {

  const apiKey = resolveOpenAiKey();

  if (!apiKey) {

    return {

      provider: "placeholder",

      status: "ready",

      message: "OPENAI_API_KEY not set — cannot generate TTS audio lesson",

    };

  }



  const scriptText = input.script.script.slice(0, 4096);

  const voice = process.env.OPENAI_TTS_VOICE?.trim() || "alloy";



  try {

    const res = await fetch("https://api.openai.com/v1/audio/speech", {

      method: "POST",

      headers: {

        Authorization: `Bearer ${apiKey}`,

        "Content-Type": "application/json",

      },

      body: JSON.stringify({

        model: process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts",

        voice,

        input: scriptText,

        response_format: "mp3",

      }),

      signal: AbortSignal.timeout(120_000),

    });



    if (!res.ok) {

      const errText = await res.text().catch(() => "");

      return {

        provider: "openai_tts",

        status: "failed",

        message: `OpenAI TTS HTTP ${res.status}: ${errText.slice(0, 200)}`,

      };

    }



    const audioBuffer = Buffer.from(await res.arrayBuffer());

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

      message: "OpenAI TTS audio lesson ready (AI lektor)",

      metadata_patch: {

        tts_audio_url: ttsAudioUrl,

        avatar_image_url: avatarImageUrl,

        lesson_format: "audio_lesson",

        audio_storage_path: storagePath,

        tts_voice: voice,

        tts_provider: "openai",

        duration_seconds: durationSeconds,

        thumbnail_url: avatarImageUrl,

        heygen_video_id: null,

        pending_external_render: false,

        render_status: "ready",

        generated: true,

      },

    };

  } catch (e) {

    return {

      provider: "openai_tts",

      status: "failed",

      message: e instanceof Error ? e.message : "OpenAI TTS request failed",

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


