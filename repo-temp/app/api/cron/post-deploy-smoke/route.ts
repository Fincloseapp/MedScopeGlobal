import { NextResponse } from "next/server";
import { isGroqConfigured, resolveAiModel, AI_MODEL_PROVIDER } from "@/lib/ai/groq-client";
import { isLlmConfigured } from "@/lib/ai/chat-json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SMOKE_PATHS = [
  "/api/v47/health",
  "/api/v40/health",
  "/api/academy/health",
  "/api/v29/health",
  "/api/tts",
];

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://medscopeglobal.com";

  const checks: Array<{ path: string; ok: boolean; status: number }> = [];

  for (const path of SMOKE_PATHS) {
    try {
      const res = await fetch(`${origin}${path}`, {
        signal: AbortSignal.timeout(30_000),
        headers: path === "/api/tts" ? {} : { Accept: "application/json" },
        method: path === "/api/tts" ? "GET" : "GET",
      });
      checks.push({ path, ok: res.ok, status: res.status });
    } catch {
      checks.push({ path, ok: false, status: 0 });
    }
  }

  const allOk = checks.every((c) => c.ok);

  return NextResponse.json({
    ok: allOk,
    provider: AI_MODEL_PROVIDER,
    model: resolveAiModel(),
    llmConfigured: isLlmConfigured(),
    groqConfigured: isGroqConfigured(),
    checks,
    generatedAt: new Date().toISOString(),
  });
}
