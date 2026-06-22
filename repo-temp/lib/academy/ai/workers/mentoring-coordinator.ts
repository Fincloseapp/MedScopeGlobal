import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runMentoringCoordinatorStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "mentoring-coordinator",
    message: "Mentoring coordinator stub executed",
    payload,
  });

  return { stub: true, session_type: payload.type ?? "general" };
}
