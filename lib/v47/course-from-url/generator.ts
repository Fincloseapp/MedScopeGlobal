import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";

export async function generateCourseFromUrl(input: { url: string; title?: string }) {
  if (!isGroqConfigured()) {
    return {
      ok: false as const,
      scaffold: true,
      error: "GROQ_API_KEY not configured",
      course: { title: input.title ?? "Course", lessons: [] },
    };
  }

  let pageText = "";
  try {
    const res = await fetch(input.url, { signal: AbortSignal.timeout(20_000) });
    if (res.ok) {
      const html = await res.text();
      pageText = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").slice(0, 6000);
    }
  } catch {
    pageText = `URL: ${input.url}`;
  }

  const raw = await groqCompleteJson({
    system: "Medical course designer. Return JSON: {\"title\":\"...\",\"lessons\":[{\"title\":\"...\",\"objectives\":[\"...\"]}]}",
    user: `Create course outline from:\n${pageText}`,
  });

  if (!raw) return { ok: false as const, error: "Course generation failed" };

  try {
    const course = JSON.parse(raw);
    return { ok: true as const, course, sourceUrl: input.url, model: resolveAiModel(), provider: "groq" as const };
  } catch {
    return { ok: false as const, error: "Invalid course JSON" };
  }
}
