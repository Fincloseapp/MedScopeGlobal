import { isGroqConfigured, resolveAiModel, AI_MODEL_PROVIDER } from "@/lib/ai/groq-client";
import { getTtsEngineStatus } from "@/lib/v41/ai/tts-engine";
import { V47_UI_VERSION, V47_COMPOSITE_LABEL } from "@/lib/v47/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const tts = getTtsEngineStatus();
  return Response.json({
    status: isGroqConfigured() ? "ok" : "degraded",
    ok: true,
    version: V47_UI_VERSION,
    composite: V47_COMPOSITE_LABEL,
    llm: {
      provider: AI_MODEL_PROVIDER,
      model: resolveAiModel(),
      configured: isGroqConfigured(),
    },
    tts,
    routes: [
      "/api/v47/translate",
      "/api/v47/textbook/generate",
      "/api/v47/slides/generate",
      "/api/v47/pdf/generate",
      "/api/v47/course/from-url",
      "/api/v47/video/from-content",
      "/api/v47/3d/generate",
      "/api/v47/xr/scenario",
      "/api/v47/social/publish",
      "/api/v47/seo/audit",
    ],
    generatedAt: new Date().toISOString(),
  });
}
