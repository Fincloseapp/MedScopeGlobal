import { logAiEvent } from "@/lib/academy/ai/controller";

/** Phase 1 stub — logs intent; Phase 2 wires OpenAI course generation */
export async function runCourseCreatorStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "course-creator",
    message: "Course creator stub executed",
    payload,
  });

  return {
    stub: true,
    topic: payload.topic ?? "unknown",
    message: "Kurz bude vygenerován ve fázi 2 (OpenAI pipeline).",
  };
}
