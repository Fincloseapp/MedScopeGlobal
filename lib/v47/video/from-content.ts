import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";

export async function generateVideoFromContent(input: {
  title: string;
  content: string;
  type?: "article" | "course";
}) {
  if (!isGroqConfigured()) {
    return {
      ok: false as const,
      scaffold: true,
      error: "GROQ_API_KEY not configured",
      videoUrl: V33_FALLBACK_MP4_URL,
      script: input.content.slice(0, 500),
    };
  }

  const raw = await groqCompleteJson({
    system: "Medical video scriptwriter. Return JSON: {\"script\":\"...\",\"scenes\":[{\"narration\":\"...\",\"visual\":\"...\"}]}",
    user: `Title: ${input.title}\nType: ${input.type ?? "article"}\nContent:\n${input.content.slice(0, 8000)}`,
  });

  if (!raw) {
    return {
      ok: true as const,
      scaffold: true,
      videoUrl: V33_FALLBACK_MP4_URL,
      script: input.content.slice(0, 2000),
      message: "Fallback w3schools/placeholder video",
    };
  }

  try {
    const data = JSON.parse(raw) as { script?: string; scenes?: unknown[] };
    return {
      ok: true as const,
      script: data.script ?? input.content.slice(0, 2000),
      scenes: data.scenes ?? [],
      videoUrl: V33_FALLBACK_MP4_URL,
      storage: "supabase_stub",
      model: resolveAiModel(),
      provider: "groq" as const,
    };
  } catch {
    return { ok: false as const, error: "Invalid video script JSON" };
  }
}
