import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";

export async function generateSlides(input: { topic: string; slideCount?: number }) {
  if (!isGroqConfigured()) {
    return { ok: false as const, scaffold: true, slides: [], error: "GROQ_API_KEY not configured" };
  }

  const raw = await groqCompleteJson({
    system: "Medical slide deck author. Return JSON: {\"slides\":[{\"title\":\"...\",\"bullets\":[\"...\"]}]}",
    user: `Topic: ${input.topic}\nSlides: ${input.slideCount ?? 8}`,
  });

  if (!raw) return { ok: false as const, error: "Slide generation failed" };

  try {
    const data = JSON.parse(raw) as { slides?: unknown[] };
    return { ok: true as const, slides: data.slides ?? [], model: resolveAiModel(), provider: "groq" as const };
  } catch {
    return { ok: false as const, error: "Invalid slide JSON" };
  }
}
