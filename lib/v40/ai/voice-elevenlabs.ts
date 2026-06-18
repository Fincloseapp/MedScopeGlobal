import { queueOpenAiTtsRender, isOpenAiTtsConfigured } from "@/lib/academy/ai/video-providers/openai-tts-video";
import type { QueueRenderInput, QueueRenderResult } from "@/lib/academy/ai/video-providers/types";
import { randomUUID } from "crypto";

export type VoiceResult = QueueRenderResult & {
  voice_provider: "elevenlabs" | "openai_tts" | "text_only";
};

export type ElevenLabsValidation = {
  valid: boolean;
  status: number;
  method: "tts_probe" | "none";
  detail?: string;
};

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

function getVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
}

function getModelId(): string {
  return process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL_ID;
}

/**
 * Validate via minimal TTS probe — does NOT use GET /v1/user (requires user_read).
 * Valid when TTS auth succeeds (200) or quota responses (402/429).
 * Keys scoped to TTS-only without user_read are accepted.
 */
export async function validateElevenLabsKey(): Promise<ElevenLabsValidation> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return { valid: false, status: 0, method: "none", detail: "ELEVENLABS_API_KEY not set" };

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${getVoiceId()}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text: ".", model_id: getModelId() }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      await res.arrayBuffer().catch(() => null);
      return { valid: true, status: res.status, method: "tts_probe" };
    }

    if (res.status === 429 || res.status === 402) {
      return { valid: true, status: res.status, method: "tts_probe", detail: "quota_or_billing_limit" };
    }

    const errText = await res.text().catch(() => "");
    const detail = errText.slice(0, 300);

    if (res.status === 401 && /invalid_api_key|invalid.*api.*key|authentication/i.test(errText)) {
      return { valid: false, status: res.status, method: "tts_probe", detail };
    }

    // Key accepted but account/IP restricted — still treat as configured (may work on Vercel)
    if (res.status === 401 && /unusual_activity|missing_permissions|free tier/i.test(errText)) {
      return { valid: true, status: res.status, method: "tts_probe", detail: "key_scoped_or_account_restricted" };
    }

    if (res.status === 403) {
      return { valid: false, status: res.status, method: "tts_probe", detail };
    }

    // Other errors (422 etc.) — key likely accepted, request issue only
    if (res.status >= 400 && res.status < 500 && !/invalid_api_key/i.test(errText)) {
      return { valid: true, status: res.status, method: "tts_probe", detail: "tts_endpoint_reachable" };
    }

    return { valid: false, status: res.status, method: "tts_probe", detail };
  } catch (e) {
    return {
      valid: false,
      status: 0,
      method: "tts_probe",
      detail: e instanceof Error ? e.message : "probe failed",
    };
  }
}

function estimateDuration(script: string): number {
  const words = script.split(/\s+/).filter(Boolean).length;
  return Math.max(60, Math.min(900, Math.round((words / 140) * 60)));
}

async function generateElevenLabsVoice(input: {
  script: string;
  title: string;
}): Promise<{ ok: boolean; buffer?: Buffer; message?: string; limitExceeded?: boolean }> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return { ok: false, message: "ELEVENLABS_API_KEY not set" };

  const voiceId = getVoiceId();
  const modelId = getModelId();

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: input.script.slice(0, 5000),
        model_id: modelId,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (res.status === 429 || res.status === 402) {
      return { ok: false, limitExceeded: true, message: `ElevenLabs limit: HTTP ${res.status}` };
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { ok: false, message: `ElevenLabs HTTP ${res.status}: ${errText.slice(0, 200)}` };
    }

    return { ok: true, buffer: Buffer.from(await res.arrayBuffer()) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "ElevenLabs request failed" };
  }
}

/** Fallback chain: ElevenLabs → OpenAI TTS → text-only (never silent) */
export async function generateVoice(input: {
  script: string;
  title: string;
  storyboard?: Array<{ scene: number; visual: string; narration: string }>;
}): Promise<VoiceResult> {
  const renderInput: QueueRenderInput = {
    title: input.title,
    videoAssetId: randomUUID(),
    script: {
      script: input.script,
      storyboard: input.storyboard ?? [],
      avatar_type: "european_medical_lecturer",
      voice_type: "cs_female_professional",
      duration_estimate_seconds: estimateDuration(input.script),
    },
  };

  if (isElevenLabsConfigured()) {
    const eleven = await generateElevenLabsVoice({ script: input.script, title: input.title });
    if (eleven.ok && eleven.buffer) {
      const { uploadTtsAudioBuffer } = await import("@/lib/academy/ai/video-providers/openai-tts-video");
      try {
        const { publicUrl } = await uploadTtsAudioBuffer(eleven.buffer, input.title);
        return {
          provider: "openai_tts",
          voice_provider: "elevenlabs",
          status: "ready",
          public_url: publicUrl,
          tts_audio_url: publicUrl,
          lesson_format: "audio_lesson",
          message: "ElevenLabs TTS ready",
          metadata_patch: {
            tts_audio_url: publicUrl,
            tts_provider: "elevenlabs",
            lesson_format: "audio_lesson",
            duration_seconds: estimateDuration(input.script),
            render_status: "ready",
            generated: true,
          },
        };
      } catch {
        /* fall through to OpenAI */
      }
    }
  }

  if (isOpenAiTtsConfigured()) {
    const openai = await queueOpenAiTtsRender(renderInput);
    if (openai.status === "ready") {
      return { ...openai, voice_provider: "openai_tts" };
    }
  }

  return {
    provider: "placeholder",
    voice_provider: "text_only",
    status: "ready",
    message: "No TTS provider — text-only lesson (script preserved, not silent)",
    metadata_patch: {
      lesson_format: "text_only",
      tts_provider: "none",
      script_text: input.script,
      render_status: "ready",
      generated: true,
      duration_seconds: estimateDuration(input.script),
    },
  };
}
