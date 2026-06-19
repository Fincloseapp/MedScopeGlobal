import { queueOpenAiTtsRender, isOpenAiTtsConfigured } from "@/lib/academy/ai/video-providers/openai-tts-video";
import type { QueueRenderInput, QueueRenderResult } from "@/lib/academy/ai/video-providers/types";
import { randomUUID } from "crypto";

export type VoiceResult = QueueRenderResult & {
  voice_provider: "openai_tts" | "text_only";
};

function estimateDuration(script: string): number {
  const words = script.split(/\s+/).filter(Boolean).length;
  return Math.max(60, Math.min(900, Math.round((words / 140) * 60)));
}

/** OpenAI TTS voice generation for video pipeline and /api/voice */
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
      tts_provider: "openai",
      script_text: input.script,
      render_status: "ready",
      generated: true,
      duration_seconds: estimateDuration(input.script),
    },
  };
}

export { isOpenAiTtsConfigured };
