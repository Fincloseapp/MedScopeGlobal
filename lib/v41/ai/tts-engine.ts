import { isOpenAiTtsConfigured } from "@/lib/academy/ai/video-providers/openai-tts-video";
import { generateVoice } from "@/lib/v40/ai/voice-openai";
import { resolveOpenAiKey } from "@/lib/ai/openai-key";

export type TtsRequest = {
  text: string;
  title?: string;
  stream?: boolean;
  voice?: string;
};

export type TtsResult = {
  ok: boolean;
  provider: "openai_tts" | "text_only" | "none";
  audioUrl?: string;
  text?: string;
  message?: string;
  openaiConfigured?: boolean;
};

const PROD_ORIGIN = "https://medscopeglobal.com";

function resolveCorsOrigin(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (process.env.NODE_ENV === "production") {
    return site && site.includes("medscopeglobal.com") ? site.replace(/\/$/, "") : PROD_ORIGIN;
  }
  return site?.replace(/\/$/, "") || "*";
}

export const TTS_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": resolveCorsOrigin(),
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "public, max-age=3600",
  "X-Content-Type-Options": "nosniff",
};

export function ttsResponseHeaders(contentType = "application/json"): Record<string, string> {
  return { ...TTS_CORS_HEADERS, "Content-Type": contentType };
}

export async function checkOpenAiTtsHealth(): Promise<{ valid: boolean; status: number; detail?: string }> {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) {
    return { valid: false, status: 0, detail: "OPENAI_API_KEY not set" };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts",
        input: ".",
        voice: process.env.OPENAI_TTS_VOICE?.trim() || "alloy",
        response_format: "mp3",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      await res.arrayBuffer().catch(() => null);
      return { valid: true, status: res.status };
    }

    if (res.status === 429) {
      return { valid: true, status: res.status, detail: "rate_limited" };
    }

    const errText = await res.text().catch(() => "");
    return { valid: false, status: res.status, detail: errText.slice(0, 200) };
  } catch (e) {
    return {
      valid: false,
      status: 0,
      detail: e instanceof Error ? e.message : "probe failed",
    };
  }
}

/** Stream OpenAI TTS audio (gpt-4o-mini-tts) */
export async function streamOpenAiAudio(text: string, voice?: string): Promise<Response | null> {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) return null;

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts",
      input: text.slice(0, 4096),
      voice: voice ?? (process.env.OPENAI_TTS_VOICE?.trim() || "alloy"),
      response_format: "mp3",
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok || !res.body) return null;
  return res;
}

export async function synthesizeTts(input: TtsRequest): Promise<TtsResult> {
  const text = input.text?.trim();
  if (!text) return { ok: false, provider: "none", message: "text required" };

  if (isOpenAiTtsConfigured()) {
    return { ok: true, provider: "openai_tts", message: "OpenAI TTS available", openaiConfigured: true };
  }

  return {
    ok: true,
    provider: "text_only",
    text,
    message: "No TTS provider — text-only mode",
    openaiConfigured: false,
  };
}

export async function generateTtsForVideo(text: string, title: string) {
  return generateVoice({ script: text, title });
}

export function getTtsEngineStatus() {
  return {
    openaiTtsConfigured: isOpenAiTtsConfigured(),
    model: process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts",
    voice: process.env.OPENAI_TTS_VOICE?.trim() || "alloy",
    fallbackChain: ["openai_tts", "text_only"],
  };
}
