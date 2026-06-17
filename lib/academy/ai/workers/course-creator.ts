import { logAiEvent } from "@/lib/academy/ai/controller";
import { createCourse } from "@/lib/academy/db";
import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";

type CourseOutline = {
  slug: string;
  title: string;
  description: string;
  summary?: string;
  level?: "beginner" | "intermediate" | "advanced";
  category?: string;
  duration_minutes?: number;
  xp_reward?: number;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Generates a course via LLM when configured; falls back to stub output. */
export async function runCourseCreatorStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  const topic = String(payload.topic ?? "Úvod do anatomie");
  const level = String(payload.level ?? "beginner");
  const persist = payload.persist !== false;

  const { data, provider, fallback } = await academyGenerateJson<CourseOutline>({
    system:
      "Jsi autor medicínských kurzů pro české studenty lékařských fakult. Odpovídej pouze validním JSON objektem.",
    user: `Vytvoř osnovu kurzu na téma: "${topic}", úroveň: ${level}.
JSON schéma: { "slug": "kebab-case", "title": "...", "description": "2-3 věty", "summary": "1 věta", "level": "beginner|intermediate|advanced", "category": "...", "duration_minutes": number, "xp_reward": number }`,
  });

  if (fallback || !data) {
    await logAiEvent({
      taskId,
      worker: "course-creator",
      level: "warn",
      message: "Course creator fallback (no LLM key or parse error)",
      payload: { topic, provider },
    });

    return {
      stub: true,
      provider,
      topic,
      message: "Kurz bude vygenerován po nastavení GROQ_API_KEY, GEMINI_API_KEY nebo OPENAI_API_KEY.",
    };
  }

  const outline: CourseOutline = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title || topic),
    title: data.title?.trim() || topic,
    description: data.description?.trim() || "",
    level: data.level ?? (level as CourseOutline["level"]),
  };

  await logAiEvent({
    taskId,
    worker: "course-creator",
    message: `Course outline generated via ${provider}`,
    payload: { slug: outline.slug, provider },
  });

  if (!persist) {
    return { stub: false, provider, outline, persisted: false };
  }

  try {
    const course = await createCourse({
      ...outline,
      status: "draft",
      is_public: false,
    });

    return {
      stub: false,
      provider,
      persisted: true,
      course_id: course.id,
      slug: course.slug,
      title: course.title,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Persist failed";
    await logAiEvent({
      taskId,
      worker: "course-creator",
      level: "error",
      message: msg,
    });
    return { stub: false, provider, outline, persisted: false, error: msg };
  }
}
