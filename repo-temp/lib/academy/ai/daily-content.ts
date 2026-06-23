import { isLlmConfigured } from "@/lib/ai/chat-json";
import { dispatchAiTask, enqueueAiTask } from "@/lib/academy/ai/controller";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const DEMO_COURSE_SLUG = "uvod-do-anatomie";

export type DailyContentResult = {
  skipped: boolean;
  reason?: string;
  lesson?: { taskId: string; ok: boolean; message: string };
  quiz?: { taskId: string; ok: boolean; message: string };
};

/** Generates one AI lesson and one quiz for the demo course when an LLM key is set. */
export async function runDailyDemoContentGeneration(): Promise<DailyContentResult> {
  if (!isLlmConfigured()) {
    return { skipped: true, reason: "no_llm_key" };
  }

  const admin = createServiceRoleClient();
  const { data: course } = await admin
    .from("courses")
    .select("id, title")
    .eq("slug", DEMO_COURSE_SLUG)
    .maybeSingle();

  if (!course?.id) {
    return { skipped: true, reason: "demo_course_missing" };
  }

  const day = new Date().getUTCDate();
  const topic = `Denní lekce ${day}: ${course.title}`;

  const lessonTask = await enqueueAiTask({
    taskType: "lesson-generator",
    payload: {
      course_id: course.id,
      topic,
      persist: true,
    },
    priority: 1,
  });

  const quizTask = await enqueueAiTask({
    taskType: "quiz-builder",
    payload: {
      course_id: course.id,
      title: `Denní kvíz ${day}: ${course.title}`,
      questionCount: 5,
      persist: true,
    },
    priority: 1,
  });

  const [lessonResult, quizResult] = await Promise.all([
    dispatchAiTask(lessonTask.id),
    dispatchAiTask(quizTask.id),
  ]);

  return {
    skipped: false,
    lesson: { taskId: lessonTask.id, ok: lessonResult.ok, message: lessonResult.message },
    quiz: { taskId: quizTask.id, ok: quizResult.ok, message: quizResult.message },
  };
}
