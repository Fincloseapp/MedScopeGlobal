import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";

export type TextbookInput = {
  topic: string;
  level?: "student" | "physician";
  chapters?: number;
};

export async function generateTextbook(input: TextbookInput) {
  if (!isGroqConfigured()) {
    return {
      ok: false as const,
      error: "GROQ_API_KEY not configured",
      scaffold: true,
      outline: { title: input.topic, chapters: [] },
    };
  }

  const raw = await groqCompleteJson({
    system: "Medical textbook author. Return JSON: {\"title\":\"...\",\"chapters\":[{\"title\":\"...\",\"sections\":[\"...\"]}]}",
    user: `Topic: ${input.topic}\nLevel: ${input.level ?? "student"}\nChapters: ${input.chapters ?? 5}`,
    maxTokens: 4096,
  });

  if (!raw) return { ok: false as const, error: "Generation failed" };

  try {
    const outline = JSON.parse(raw);
    return { ok: true as const, outline, model: resolveAiModel(), provider: "groq" as const };
  } catch {
    return { ok: false as const, error: "Invalid JSON from model" };
  }
}
