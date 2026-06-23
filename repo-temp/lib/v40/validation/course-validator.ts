import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type CourseValidationResult = {
  valid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  repairs: Array<{ field: string; action: string; safe: boolean }>;
  applied: string[];
};

const GUIDELINE_REFS = "WHO, ESC, EULAR, CDC, ČLS JEP, ESMO, NICE";

function staticValidate(input: {
  title: string;
  description: string;
  lessonCount: number;
  hasQuizzes: boolean;
}): CourseValidationResult {
  const issues: string[] = [];
  if (!input.title || input.title.length < 5) issues.push("Krátký nebo chybějící titulek");
  if (!input.description || input.description.length < 20) issues.push("Popis kurzu je příliš krátký");
  if (input.lessonCount < 1) issues.push("Kurz nemá žádné lekce");
  if (!input.hasQuizzes) issues.push("Chybí kvízy pro ověření znalostí");

  const score = Math.max(0, 100 - issues.length * 15);
  return {
    valid: issues.length === 0,
    score,
    issues,
    suggestions: issues.length
      ? ["Doplňte strukturovaný obsah s úvodem a závěrem.", "Přidejte kvízy ke každé lekci."]
      : ["Kurz splňuje základní strukturu."],
    repairs: [],
    applied: [],
  };
}

async function llmValidate(body: string): Promise<Omit<CourseValidationResult, "applied"> | null> {
  if (!isLlmConfigured()) return null;
  try {
    const text = await generateTextFromLlm({
      system: `Validuj medicínský kurz MedScope. Kontroluj: správnost tématu, konzistenci obsahu, strukturu, flow lekcí, přesnost kvízů. JSON: {"valid":bool,"score":0-100,"issues":["cs"],"suggestions":["cs"],"repairs":[{"field":"...","action":"...","safe":bool}]}`,
      user: body.slice(0, 3000),
      maxTokens: 600,
      temperature: 0.2,
    });
    if (!text) return null;
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as Omit<CourseValidationResult, "applied">;
  } catch {
    return null;
  }
}

export async function validateCourse(courseId: string, applySafeFixes = false): Promise<CourseValidationResult> {
  const admin = createServiceRoleClient();
  const { data: course } = await admin
    .from("courses")
    .select("id, title, description, summary, metadata, lessons(id, title, content, order_index)")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    return { valid: false, score: 0, issues: ["Kurz nenalezen"], suggestions: [], repairs: [], applied: [] };
  }

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const { count: quizCount } = await admin
    .from("quizzes")
    .select("id", { count: "exact", head: true })
    .in("lesson_id", lessons.map((l: { id: string }) => l.id));

  const base = staticValidate({
    title: course.title,
    description: course.description ?? "",
    lessonCount: lessons.length,
    hasQuizzes: (quizCount ?? 0) > 0,
  });

  const llmBody = `Kurz: ${course.title}\nPopis: ${course.description}\nLekce:\n${lessons
    .map((l: { title: string; content: string }) => `- ${l.title}: ${(l.content ?? "").slice(0, 200)}`)
    .join("\n")}\nGuidelines: ${GUIDELINE_REFS}`;

  const llm = await llmValidate(llmBody);
  const result: CourseValidationResult = llm
    ? { ...llm, applied: [] }
    : base;

  if (applySafeFixes && result.repairs?.length) {
    for (const repair of result.repairs.filter((r) => r.safe)) {
      if (repair.field === "summary" && !course.summary) {
        await admin.from("courses").update({ summary: course.description?.slice(0, 200) }).eq("id", courseId);
        result.applied.push("summary");
      }
      if (repair.field === "metadata.key_points") {
        const meta = (course.metadata ?? {}) as Record<string, unknown>;
        if (!meta.key_points) {
          await admin
            .from("courses")
            .update({ metadata: { ...meta, key_points: result.suggestions.slice(0, 3) } })
            .eq("id", courseId);
          result.applied.push("metadata.key_points");
        }
      }
    }
  }

  return result;
}
