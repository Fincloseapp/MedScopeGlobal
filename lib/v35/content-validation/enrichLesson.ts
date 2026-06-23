import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export type LessonEnrichment = {
  summary: string;
  key_points: string[];
  description: string;
};

function staticEnrichment(title: string, content: string): LessonEnrichment {
  const sentences = content
    .replace(/[#*]/g, "")
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 3);

  const summary =
    sentences[0] ??
    `V této lekci se naučíte základy tématu „${title}" v rámci MedScope Academy.`;

  const key_points = sentences.length
    ? sentences.map((s) => s.slice(0, 120))
    : [`Pochopení tématu: ${title}`, "Příprava na přijímačky a studium medicíny", "Procvičení s AI lektorem"];

  return {
    summary,
    key_points,
    description: summary,
  };
}

export async function enrichLessonContent(input: {
  title: string;
  content: string;
  existing?: Partial<LessonEnrichment>;
}): Promise<LessonEnrichment> {
  const hasAll =
    input.existing?.summary &&
    input.existing?.description &&
    Array.isArray(input.existing?.key_points) &&
    input.existing.key_points.length > 0;

  if (hasAll) {
    return {
      summary: input.existing!.summary!,
      key_points: input.existing!.key_points!,
      description: input.existing!.description!,
    };
  }

  if (!isLlmConfigured()) {
    const fallback = staticEnrichment(input.title, input.content);
    return {
      summary: input.existing?.summary ?? fallback.summary,
      key_points: input.existing?.key_points?.length ? input.existing.key_points : fallback.key_points,
      description: input.existing?.description ?? fallback.description,
    };
  }

  try {
    const text = await generateTextFromLlm({
      system:
        'Odpověz JSON: {"summary":"2 věty cs","key_points":["3-5 bodů"],"description":"1 věta cs"}',
      user: `Lekce: ${input.title}\n\n${input.content.slice(0, 2000)}`,
      maxTokens: 400,
      temperature: 0.4,
    });
    if (!text) return staticEnrichment(input.title, input.content);
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as LessonEnrichment;
    return {
      summary: input.existing?.summary ?? parsed.summary ?? staticEnrichment(input.title, input.content).summary,
      key_points:
        (input.existing?.key_points?.length ?? 0) > 0
          ? input.existing!.key_points!
          : Array.isArray(parsed.key_points)
            ? parsed.key_points
            : staticEnrichment(input.title, input.content).key_points,
      description:
        input.existing?.description ?? parsed.description ?? staticEnrichment(input.title, input.content).description,
    };
  } catch {
    return staticEnrichment(input.title, input.content);
  }
}

export function extractLessonMetadata(contentJson: Record<string, unknown> | null | undefined): Partial<LessonEnrichment> {
  if (!contentJson) return {};
  return {
    summary: typeof contentJson.summary === "string" ? contentJson.summary : undefined,
    key_points: Array.isArray(contentJson.key_points) ? (contentJson.key_points as string[]) : undefined,
    description: typeof contentJson.description === "string" ? contentJson.description : undefined,
  };
}
