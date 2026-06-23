import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runMarketplacePublisherStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "marketplace-publisher",
    message: "Marketplace publisher stub executed",
    payload,
  });

  return { stub: true, price_czk: payload.price_czk ?? 0 };
}
