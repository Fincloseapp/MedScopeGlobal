import type { QueueRenderResult } from "@/lib/academy/ai/video-providers/types";
import { randomUUID } from "crypto";

export type VoiceResult = QueueRenderResult & {
  voice_provider: "web_speech_api" | "text_only";
};

function estimateDuration(script: string): number {
  const words = script.split(/\s+/).filter(Boolean).length;
  return Math.max(60, Math.min(900, Math.round((words / 140) * 60)));
}

/** Voice generation for video pipeline — text-only + browser TTS (no OpenAI). */
export async function generateVoice(input: {
  script: string;
  title: string;
  storyboard?: Array<{ scene: number; visual: string; narration: string }>;
}): Promise<VoiceResult> {
  return {
    provider: "placeholder",
    voice_provider: "text_only",
    status: "ready",
    message: "Text-only lesson — browser Web Speech API on client",
    metadata_patch: {
      lesson_format: "text_only",
      tts_provider: "web_speech_api",
      script_text: input.script,
      render_status: "ready",
      generated: true,
      duration_seconds: estimateDuration(input.script),
      video_asset_id: randomUUID(),
      title: input.title,
    },
  };
}

export function isOpenAiTtsConfigured(): boolean {
  return false;
}
