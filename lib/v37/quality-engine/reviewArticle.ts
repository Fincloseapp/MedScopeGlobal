import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export type QualityReview = {
  score: number;
  issues: string[];
  suggestions: string[];
};

function staticReview(title: string, body: string): QualityReview {
  const issues: string[] = [];
  if (!title || title.length < 5) issues.push("Krátký nebo chybějící titulek");
  if (!body || body.length < 100) issues.push("Obsah je příliš krátký");
  if (body.length > 0 && !body.includes(".")) issues.push("Chybí větná struktura");

  const score = Math.max(0, 100 - issues.length * 15);
  return {
    score,
    issues,
    suggestions: issues.length
      ? ["Doplňte strukturovaný obsah s úvodem a závěrem.", "Přidejte klíčové body pro studenty."]
      : ["Obsah splňuje základní kvalitu."],
  };
}

async function llmReview(kind: string, title: string, body: string): Promise<QualityReview | null> {
  if (!isLlmConfigured()) return null;
  try {
    const text = await generateTextFromLlm({
      system:
        'Hodnoť kvalitu obsahu MedScope. JSON: {"score":0-100,"issues":["cs"],"suggestions":["cs"]}',
      user: `Typ: ${kind}\nTitulek: ${title}\n\n${body.slice(0, 2500)}`,
      maxTokens: 400,
      temperature: 0.2,
    });
    if (!text) return null;
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as QualityReview;
  } catch {
    return null;
  }
}

export async function reviewArticle(input: { title: string; content: string }): Promise<QualityReview> {
  return (await llmReview("article", input.title, input.content)) ?? staticReview(input.title, input.content);
}

export async function reviewVideo(input: { title: string; description?: string; duration_seconds?: number }): Promise<QualityReview> {
  const body = `Popis: ${input.description ?? "—"}\nDélka: ${input.duration_seconds ?? 0}s`;
  const review = (await llmReview("video", input.title, body)) ?? staticReview(input.title, body);
  if (!input.description) review.issues.push("Chybí popis videa");
  if (!input.duration_seconds) review.suggestions.push("Doplňte duration_seconds do metadata.");
  return review;
}

export async function reviewCourse(input: { title: string; description: string; lessonCount: number }): Promise<QualityReview> {
  const body = `${input.description}\nPočet lekcí: ${input.lessonCount}`;
  const review = (await llmReview("course", input.title, body)) ?? staticReview(input.title, body);
  if (input.lessonCount < 1) review.issues.push("Kurz nemá žádné lekce");
  return review;
}
