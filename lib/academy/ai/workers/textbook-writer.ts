import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runTextbookWriterStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "textbook-writer",
    message: "Textbook writer stub executed",
    payload,
  });

  return { stub: true, slug: payload.slug ?? "textbook-stub" };
}
