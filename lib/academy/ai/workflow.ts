import { createServiceRoleClient } from "@/lib/supabase/service";
import { dispatchAiTask, enqueueAiTask, logAiEvent } from "@/lib/academy/ai/controller";
import type { AiTask } from "@/types/academy";

export type WorkflowStep = "course" | "lessons" | "quiz" | "review" | "publish";

export async function runAcademyWorkflow(opts: {
  topic: string;
  level?: string;
  lessonCount?: number;
}): Promise<{ courseTask: AiTask; steps: WorkflowStep[] }> {
  const courseTask = await enqueueAiTask({
    taskType: "course-creator",
    payload: opts,
    priority: 2,
  });

  await logAiEvent({
    taskId: courseTask.id,
    worker: "workflow",
    message: "Workflow started",
    payload: { topic: opts.topic },
  });

  return {
    courseTask,
    steps: ["course", "lessons", "quiz", "review", "publish"],
  };
}

export async function processQueuedTasks(limit = 5): Promise<{ processed: number; results: { id: string; ok: boolean }[] }> {
  const admin = createServiceRoleClient();
  const { data: queued } = await admin
    .from("ai_tasks")
    .select("id")
    .eq("status", "queued")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  const results: { id: string; ok: boolean }[] = [];
  for (const task of queued ?? []) {
    const result = await dispatchAiTask(task.id);
    results.push({ id: task.id, ok: result.ok });
  }

  return { processed: results.length, results };
}

export async function listRecentAiTasks(limit = 20): Promise<AiTask[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("ai_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AiTask[];
}
