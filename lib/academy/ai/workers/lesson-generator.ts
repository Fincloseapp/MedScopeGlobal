import "server-only";

import { logAiEvent } from "@/lib/academy/ai/controller";

/** Phase 1 stub — logs intent; Phase 2 generates lesson content */
export async function runLessonGeneratorStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "lesson-generator",
    message: "Lesson generator stub executed",
    payload,
  });

  return {
    stub: true,
    course_id: payload.course_id ?? null,
    message: "Lekce budou vygenerovány ve fázi 2.",
  };
}
