import { isGroqConfigured, resolveAiModel, AI_MODEL_PROVIDER } from "@/lib/ai/groq-client";
import { getTtsEngineStatus } from "@/lib/v41/ai/tts-engine";
import { isLlmConfigured } from "@/lib/ai/chat-json";

export const dynamic = "force-dynamic";

export async function GET() {
  const tts = getTtsEngineStatus();
  return Response.json({
    status: isGroqConfigured() ? "ok" : "degraded",
    ok: true,
    version: "v25.0",
    llm: {
      provider: AI_MODEL_PROVIDER,
      model: resolveAiModel(),
      configured: isLlmConfigured(),
    },
    tts: { ...tts, freeOnly: true },
    video: {
      pipeline: "slideshow",
      routes: ["/api/v25/video/slideshow/generate"],
      ffmpegAvailable: Boolean(process.env.FFMPEG_PATH?.trim()),
      fallbackMp4: true,
    },
    features: [
      "groq-text-only",
      "web-speech-tts",
      "slideshow-video-pipeline",
      "courses-progress",
      "simulations-groq",
      "tests-groq",
    ],
    generatedAt: new Date().toISOString(),
  });
}
