import { NextResponse } from "next/server";
import { getTtsEngineStatus, checkTtsHealth } from "@/lib/v41/ai/tts-engine";
import { isGroqConfigured, resolveAiModel, AI_MODEL_PROVIDER } from "@/lib/ai/groq-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const ttsHealth = await checkTtsHealth();
  const tts = getTtsEngineStatus();

  return NextResponse.json({
    status: isGroqConfigured() ? "ok" : "degraded",
    ok: true,
    version: "v41.0",
    llm: { provider: AI_MODEL_PROVIDER, model: resolveAiModel(), configured: isGroqConfigured() },
    tts: {
      ...tts,
      ...ttsHealth,
      freeOnly: true,
      routes: ["/api/tts", "/api/voice", "/api/video/voice"],
    },
    blockers: !isGroqConfigured() ? ["GROQ_API_KEY not set on Vercel"] : [],
    generatedAt: new Date().toISOString(),
  });
}
