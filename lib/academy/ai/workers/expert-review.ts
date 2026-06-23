import { logAiEvent } from "@/lib/academy/ai/controller";
import { getCourseByIdOrSlug, getLessonById, getQuizById, updateCourse, updateLesson, updateQuiz } from "@/lib/academy/db";
import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { ExpertReviewResult } from "@/types/academy";

type ReviewDraft = {
  score: number;
  approved: boolean;
  issues: string[];
  recommendations: string[];
};

const FALLBACK_REVIEW: ReviewDraft = {
  score: 70,
  approved: false,
  issues: ["Expertní revize vyžaduje nastavení LLM API klíče."],
  recommendations: ["Nastavte GROQ_API_KEY, GEMINI_API_KEY nebo OPENAI_API_KEY."],
};

async function loadTargetContent(payload: Record<string, unknown>): Promise<{
  target_type: ExpertReviewResult["target_type"];
  target_id: string;
  text: string;
} | null> {
  if (payload.course_id) {
    const course = await getCourseByIdOrSlug(String(payload.course_id));
    if (!course) return null;
    return {
      target_type: "course",
      target_id: course.id,
      text: `${course.title}\n${course.description}\n${course.summary ?? ""}`,
    };
  }
  if (payload.lesson_id) {
    const lesson = await getLessonById(String(payload.lesson_id));
    if (!lesson) return null;
    return {
      target_type: "lesson",
      target_id: lesson.id,
      text: `${lesson.title}\n${lesson.content}`,
    };
  }
  if (payload.quiz_id) {
    const quiz = await getQuizById(String(payload.quiz_id), true);
    if (!quiz) return null;
    const qText = quiz.questions.map((q) => q.question_text).join("\n");
    return {
      target_type: "quiz",
      target_id: quiz.id,
      text: `${quiz.title}\n${qText}`,
    };
  }
  return null;
}

/** Reviews course/lesson/quiz content via LLM; optional auto-publish when approved. */
export async function runExpertReview(
  payload: Record<string, unknown>,
  taskId: string
): Promise<ExpertReviewResult & { stub?: boolean; auto_published?: boolean }> {
  const target = await loadTargetContent(payload);
  if (!target) {
    throw new Error("course_id, lesson_id nebo quiz_id je povinné a musí existovat");
  }

  const autoPublish = payload.auto_publish === true;
  const minScore = Number(payload.min_score ?? 75);

  const { data, provider, fallback } = await academyGenerateJson<ReviewDraft>({
    system:
      "Jsi seniorní lékařský pedagog. Hodnoť vzdělávací obsah pro české studenty medicíny. Odpovídej pouze validním JSON.",
    user: `Zkontroluj tento obsah (${target.target_type}):\n\n${target.text.slice(0, 6000)}\n\nJSON: { "score": 0-100, "approved": boolean, "issues": ["..."], "recommendations": ["..."] }`,
    maxTokens: 2000,
  });

  const review = fallback || !data ? FALLBACK_REVIEW : data;
  const approved = review.approved && review.score >= minScore;

  await logAiEvent({
    taskId,
    worker: "expert-review",
    message: fallback
      ? "Expert review fallback (no LLM)"
      : `Review score ${review.score} via ${provider}`,
    payload: { target_type: target.target_type, target_id: target.target_id, score: review.score },
  });

  let autoPublished = false;
  if (autoPublish && approved && !fallback) {
    if (target.target_type === "course") {
      await updateCourse(target.target_id, { status: "published" });
      autoPublished = true;
    } else if (target.target_type === "lesson") {
      await updateLesson(target.target_id, { status: "published" });
      autoPublished = true;
    } else if (target.target_type === "quiz") {
      await updateQuiz(target.target_id, { status: "published" });
      autoPublished = true;
    }
  }

  const admin = createServiceRoleClient();
  await admin.from("ai_expert_reviews").insert({
    task_id: taskId,
    expert_type: `${target.target_type}-review`,
    status: approved ? "approved" : "revision",
    score: review.score,
    feedback: (review.issues ?? []).join("; ") || null,
    metadata: {
      recommendations: review.recommendations ?? [],
      provider: fallback ? "none" : provider,
      target_type: target.target_type,
      target_id: target.target_id,
      auto_published: autoPublished,
    },
  });

  return {
    target_type: target.target_type,
    target_id: target.target_id,
    score: review.score,
    approved,
    issues: review.issues ?? [],
    recommendations: review.recommendations ?? [],
    provider: fallback ? "none" : provider,
    stub: fallback,
    auto_published: autoPublished,
  };
}
