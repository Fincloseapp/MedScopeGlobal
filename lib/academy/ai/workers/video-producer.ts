import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runVideoProducerStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "video-producer",
    message: "Video producer stub executed",
    payload,
  });

  return { stub: true, status: "pending", title: payload.title ?? "Video (stub)" };
}
