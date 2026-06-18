import { isOpenAiTtsConfigured } from "@/lib/academy/ai/video-providers/openai-tts-video";
import {
  generateVoice,
  isElevenLabsConfigured,
  validateElevenLabsKey,
} from "@/lib/v40/ai/voice-elevenlabs";

export type TtsRequest = {
  text: string;
  title?: string;
  stream?: boolean;
};

export type TtsResult = {
  ok: boolean;
  provider: "elevenlabs" | "openai_tts" | "text_only" | "none";
  audioUrl?: string;
  text?: string;
  message?: string;
  elevenlabsValid?: boolean;
};

export const TTS_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

export function ttsResponseHeaders(contentType = "application/json"): Record<string, string> {
  return { ...TTS_CORS_HEADERS, "Content-Type": contentType };
}

/** Validate ElevenLabs via TTS probe (not /v1/user — no user_read required) */
export async function checkElevenLabsHealth(): Promise<{ valid: boolean; status: number; detail?: string }> {
  const r = await validateElevenLabsKey();
  return { valid: r.valid, status: r.status, detail: r.detail };
}

/** Stream ElevenLabs audio directly (returns Response body stream or null) */
export async function streamElevenLabsAudio(text: string): Promise<Response | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return null;

  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM";
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.slice(0, 5000),
      model_id: modelId,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok || !res.body) return null;
  return res;
}

/** OpenAI TTS streaming fallback */
export async function streamOpenAiAudio(text: string): Promise<Response | null> {
  const { resolveOpenAiKey } = await import("@/lib/ai/openai-key");
  const apiKey = resolveOpenAiKey();
  if (!apiKey) return null;

  const voice = process.env.OPENAI_TTS_VOICE?.trim() || "nova";
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text.slice(0, 4096),
      voice,
      response_format: "mp3",
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok || !res.body) return null;
  return res;
}

/** Full fallback chain: ElevenLabs stream → OpenAI stream → text-only JSON */
export async function synthesizeTts(input: TtsRequest): Promise<TtsResult> {
  const text = input.text?.trim();
  if (!text) return { ok: false, provider: "none", message: "text required" };

  const elevenHealth = isElevenLabsConfigured() ? await validateElevenLabsKey() : { valid: false, status: 0 };

  if (elevenHealth.valid) {
    return { ok: true, provider: "elevenlabs", message: "ElevenLabs available", elevenlabsValid: true };
  }

  if (isOpenAiTtsConfigured()) {
    return { ok: true, provider: "openai_tts", message: "OpenAI TTS fallback available", elevenlabsValid: false };
  }

  return {
    ok: true,
    provider: "text_only",
    text,
    message: !elevenHealth.valid
      ? `ElevenLabs unavailable (${elevenHealth.detail ?? elevenHealth.status}) — text-only mode`
      : "No TTS provider — text-only mode",
    elevenlabsValid: elevenHealth.valid,
  };
}

/** Non-streaming voice generation for video pipeline reuse */
export async function generateTtsForVideo(text: string, title: string) {
  return generateVoice({ script: text, title });
}

export function getTtsEngineStatus() {
  return {
    elevenlabsConfigured: isElevenLabsConfigured(),
    openaiTtsConfigured: isOpenAiTtsConfigured(),
    fallbackChain: ["elevenlabs", "openai_tts", "text_only"],
  };
}
