import { enqueueAiTask, dispatchAiTask } from "@/lib/academy/ai/controller";
import { runAcademyAutorepair } from "@/lib/academy/ai/autorepair";
import type { MonitorFailure } from "@/lib/v32/autopilot/monitor";

export async function runAutopilotRepair(failures: MonitorFailure[]): Promise<{
  ok: boolean;
  tasksCreated: number;
  tasksProcessed: number;
  autorepair?: Awaited<ReturnType<typeof runAcademyAutorepair>>;
}> {
  let tasksCreated = 0;
  let tasksProcessed = 0;

  for (const f of failures) {
    const task = await enqueueAiTask({
      taskType: "repair",
      payload: { endpoint: f.endpoint, status: f.status, error: f.error },
      priority: 10,
    });
    tasksCreated += 1;
    const result = await dispatchAiTask(task.id);
    if (result.ok) tasksProcessed += 1;
  }

  const autorepair = await runAcademyAutorepair();

  return {
    ok: autorepair.ok && failures.length === 0 ? true : tasksProcessed > 0 || autorepair.ok,
    tasksCreated,
    tasksProcessed,
    autorepair,
  };
}
