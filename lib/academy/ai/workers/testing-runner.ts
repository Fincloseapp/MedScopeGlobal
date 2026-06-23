import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runTestingRunnerStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  await logAiEvent({
    taskId,
    worker: "testing-runner",
    message: "Testing runner stub executed",
    payload,
  });

  return { stub: true, passed: true, tests_run: payload.tests ?? ["health", "routes"] };
}
