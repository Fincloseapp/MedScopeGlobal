import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runQuizBuilderStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "quiz-builder",
    message: "Quiz builder stub executed",
    payload,
  });

  return {
    stub: true,
    title: payload.title ?? "Kvíz (stub)",
    question_count: payload.questionCount ?? 5,
  };
}
