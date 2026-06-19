import { NextResponse } from "next/server";
import { isGroqConfigured, resolveAiModel, AI_MODEL_PROVIDER } from "@/lib/ai/groq-client";

export function v47Json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    {
      ok: status < 400,
      provider: AI_MODEL_PROVIDER,
      model: resolveAiModel(),
      llmConfigured: isGroqConfigured(),
      version: "v47.0",
      ...data,
    },
    { status }
  );
}

export async function parseV47Body<T extends Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
