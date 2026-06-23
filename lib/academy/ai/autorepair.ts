import { checkAcademyTables, runSystemTest } from "@/lib/academy/db";
import { processQueuedTasks } from "@/lib/academy/ai/workflow";
import { logAiEvent } from "@/lib/academy/ai/controller";

export async function runAcademyAutorepair(): Promise<{
  ok: boolean;
  tables: Record<string, boolean>;
  systemTest: unknown;
  tasksProcessed: number;
}> {
  const tables = await checkAcademyTables();
  const allOk = Object.values(tables).every(Boolean);

  await logAiEvent({
    worker: "autorepair",
    level: allOk ? "info" : "warn",
    message: allOk ? "All academy tables OK" : "Some academy tables missing",
    payload: { tables },
  });

  let tasksProcessed = 0;
  if (allOk) {
    const { processed } = await processQueuedTasks(3);
    tasksProcessed = processed;
  }

  const systemTest = await runSystemTest("academy-v35-autorepair");

  return {
    ok: allOk && (systemTest as { status?: string }).status === "passed",
    tables,
    systemTest,
    tasksProcessed,
  };
}
