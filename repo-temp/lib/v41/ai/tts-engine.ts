import { generateVoice } from "@/lib/v40/ai/voice-openai";

export type TtsRequest = {
  text: string;
  title?: string;
  stream?: boolean;
  voice?: string;
};

export type TtsProvider = "web_speech_api" | "edge_tts" | "text_only" | "none";

export type TtsResult = {
  ok: boolean;
  provider: TtsProvider;
  audioUrl?: string;
  text?: string;
  message?: string;
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

/** Optional edge TTS stub — set EDGE_TTS_URL template with {text} placeholder. */
function resolveEdgeTtsUrl(text: string): string | null {
  const template = process.env.EDGE_TTS_URL?.trim();
  if (!template || !template.includes("{text}")) return null;
  return template.replace("{text}", encodeURIComponent(text.slice(0, 4096)));
}

export async function checkTtsHealth(): Promise<{ valid: boolean; provider: TtsProvider; detail?: string }> {
  return {
    valid: true,
    provider: "web_speech_api",
    detail: "Browser Web Speech API — no server-side TTS key required",
  };
}

/** @deprecated use checkTtsHealth */
export async function checkOpenAiTtsHealth(): Promise<{ valid: boolean; status: number; detail?: string }> {
  const health = await checkTtsHealth();
  return { valid: health.valid, status: health.valid ? 200 : 503, detail: health.detail };
}

export async function synthesizeTts(input: TtsRequest): Promise<TtsResult> {
  const text = input.text?.trim();
  if (!text) return { ok: false, provider: "none", message: "text required" };

  const edgeUrl = resolveEdgeTtsUrl(text);
  if (edgeUrl) {
    return { ok: true, provider: "edge_tts", audioUrl: edgeUrl, message: "Edge TTS stub" };
  }

  return {
    ok: true,
    provider: "web_speech_api",
    text,
    message: "Web Speech API fallback — client synthesizes audio",
  };
}

export async function generateTtsForVideo(text: string, title: string) {
  return generateVoice({ script: text, title });
}

export function getTtsEngineStatus() {
  return {
    provider: "web_speech_api" as const,
    edgeTtsConfigured: Boolean(process.env.EDGE_TTS_URL?.trim()),
    fallbackChain: ["edge_tts", "web_speech_api", "text_only"],
  };
}
