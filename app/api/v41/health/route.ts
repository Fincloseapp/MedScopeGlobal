import { NextResponse } from "next/server";
import { V41_UI_VERSION, V41_UI_BUILD_STAMP, V41_COMPOSITE_LABEL } from "@/lib/v41/version";
import { getTtsEngineStatus, checkElevenLabsHealth } from "@/lib/v41/ai/tts-engine";
import { validateElevenLabsKey } from "@/lib/v40/ai/voice-elevenlabs";

export const dynamic = "force-dynamic";

export async function GET() {
  const elevenHealth = await checkElevenLabsHealth();
  const tts = getTtsEngineStatus();

  return NextResponse.json({
    status: elevenHealth.valid ? "ok" : "degraded",
    ok: true,
    version: V41_UI_VERSION,
    composite: V41_COMPOSITE_LABEL,
    buildStamp: V41_UI_BUILD_STAMP,
    tts: {
      ...tts,
      elevenlabsValid: elevenHealth.valid,
      elevenlabsStatus: elevenHealth.status,
      fallbackActive: !elevenHealth.valid,
      routes: ["/api/tts", "/api/voice", "/api/video/voice"],
    },
    blockers: elevenHealth.status === 401
      ? ["ELEVENLABS_API_KEY invalid (401) — regenerate at elevenlabs.io; OpenAI TTS or text-only active"]
      : [],
    generatedAt: new Date().toISOString(),
  });
}
