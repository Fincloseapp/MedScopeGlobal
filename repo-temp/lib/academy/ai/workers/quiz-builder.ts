import { logAiEvent } from "@/lib/academy/ai/controller";
import { createQuizWithQuestions } from "@/lib/academy/db";
import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";

type QuizQuestionDraft = {
  question_text: string;
  question_type?: "multiple_choice" | "true_false" | "short_answer";
  options?: { label: string; value: string }[];
  correct_answer: { value: string };
  explanation?: string;
};

type QuizDraft = {
  title: string;
  passing_score?: number;
  questions: QuizQuestionDraft[];
};

export async function runQuizBuilderStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  const courseId = payload.course_id as string | undefined;
  const title = String(payload.title ?? "Kvíz");
  const questionCount = Number(payload.questionCount ?? 5);
  const persist = payload.persist !== false;

  const { data, provider, fallback } = await academyGenerateJson<QuizDraft>({
    system:
      "Jsi autor kvízů pro studenty medicíny v češtině. Odpovídej pouze validním JSON objektem.",
    user: `Vytvoř kvíz "${title}" s ${questionCount} otázkami typu multiple_choice.
JSON: { "title": "...", "passing_score": 70, "questions": [{ "question_text": "...", "question_type": "multiple_choice", "options": [{"label":"...","value":"a"}], "correct_answer": {"value":"a"}, "explanation": "..." }] }`,
    maxTokens: 4000,
  });

  if (fallback || !data?.questions?.length) {
    await logAiEvent({
      taskId,
      worker: "quiz-builder",
      level: "warn",
      message: "Quiz builder fallback",
      payload: { title, provider },
    });

    return {
      stub: true,
      provider,
      title,
      question_count: questionCount,
      message: "Kvíz bude vygenerován po nastavení LLM API klíče.",
    };
  }

  await logAiEvent({
    taskId,
    worker: "quiz-builder",
    message: `Quiz generated via ${provider} (${data.questions.length} questions)`,
    payload: { title: data.title, provider },
  });

  if (!persist || !courseId) {
    return {
      stub: false,
      provider,
      quiz: data,
      persisted: false,
      question_count: data.questions.length,
    };
  }

  try {
    const quiz = await createQuizWithQuestions({
      course_id: courseId,
      title: data.title || title,
      passing_score: data.passing_score ?? 70,
      status: "draft",
      questions: data.questions.map((q, i) => ({
        question_text: q.question_text,
        question_type: q.question_type ?? "multiple_choice",
        options: q.options ?? [],
        correct_answer: q.correct_answer,
        sort_order: i + 1,
        explanation: q.explanation ?? null,
      })),
    });

    return {
      stub: false,
      provider,
      persisted: true,
      quiz_id: quiz.id,
      question_count: data.questions.length,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Persist failed";
    return { stub: false, provider, quiz: data, persisted: false, error: msg };
  }
}
