import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runSimulationBuilderStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "simulation-builder",
    message: "Simulation builder stub executed",
    payload,
  });

  return { stub: true, slug: payload.slug ?? "simulation-stub" };
}
