import { logAiEvent } from "@/lib/academy/ai/controller";
import { createLesson } from "@/lib/academy/db";
import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";
import { createServiceRoleClient } from "@/lib/supabase/service";

type LessonOutline = {
  slug: string;
  title: string;
  content: string;
  duration_minutes?: number;
  sort_order?: number;
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

export async function runLessonGeneratorStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  const courseId = payload.course_id as string | undefined;
  const topic = String(payload.topic ?? payload.title ?? "Lekce");
  const persist = payload.persist !== false;

  let courseTitle = topic;
  if (courseId) {
    const admin = createServiceRoleClient();
    const { data } = await admin.from("courses").select("title").eq("id", courseId).maybeSingle();
    if (data?.title) courseTitle = data.title;
  }

  const { data, provider, fallback } = await academyGenerateJson<LessonOutline>({
    system:
      "Jsi autor lekcí pro české studenty medicíny. Piš srozumitelně, strukturovaně. Odpovídej pouze validním JSON.",
    user: `Napiš lekci pro kurz "${courseTitle}" na téma "${topic}".
JSON: { "slug": "kebab-case", "title": "...", "content": "3-6 odstavců markdown textu", "duration_minutes": number, "sort_order": number }`,
    maxTokens: 4000,
  });

  if (fallback || !data) {
    await logAiEvent({
      taskId,
      worker: "lesson-generator",
      level: "warn",
      message: "Lesson generator fallback",
      payload: { course_id: courseId, provider },
    });

    return {
      stub: true,
      provider,
      course_id: courseId ?? null,
      message: "Lekce budou vygenerovány po nastavení LLM API klíče.",
    };
  }

  const outline: LessonOutline = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title || topic),
    title: data.title?.trim() || topic,
    content: data.content?.trim() || "",
    sort_order: data.sort_order ?? 1,
    duration_minutes: data.duration_minutes ?? 15,
  };

  await logAiEvent({
    taskId,
    worker: "lesson-generator",
    message: `Lesson generated via ${provider}`,
    payload: { slug: outline.slug, provider },
  });

  if (!persist || !courseId) {
    return { stub: false, provider, outline, persisted: false };
  }

  try {
    const lesson = await createLesson({
      course_id: courseId,
      slug: outline.slug,
      title: outline.title,
      content: outline.content,
      sort_order: outline.sort_order,
      duration_minutes: outline.duration_minutes,
      status: "draft",
    });

    return {
      stub: false,
      provider,
      persisted: true,
      lesson_id: lesson.id,
      course_id: courseId,
      title: lesson.title,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Persist failed";
    return { stub: false, provider, outline, persisted: false, error: msg };
  }
}
