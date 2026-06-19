import { NextResponse } from "next/server";
import { V41_UI_VERSION, V41_UI_BUILD_STAMP, V41_COMPOSITE_LABEL } from "@/lib/v41/version";
import { getTtsEngineStatus, checkOpenAiTtsHealth } from "@/lib/v41/ai/tts-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const openaiHealth = await checkOpenAiTtsHealth();
  const tts = getTtsEngineStatus();

  return NextResponse.json({
    status: openaiHealth.valid ? "ok" : "degraded",
    ok: true,
    version: V41_UI_VERSION,
    composite: V41_COMPOSITE_LABEL,
    buildStamp: V41_UI_BUILD_STAMP,
    tts: {
      ...tts,
      openaiValid: openaiHealth.valid,
      openaiStatus: openaiHealth.status,
      fallbackActive: !openaiHealth.valid,
      routes: ["/api/tts", "/api/voice", "/api/video/voice"],
    },
    blockers: !openaiHealth.valid
      ? [`OpenAI TTS probe: HTTP ${openaiHealth.status} — ${openaiHealth.detail ?? "check OPENAI_API_KEY"}`]
      : [],
    generatedAt: new Date().toISOString(),
  });
}
