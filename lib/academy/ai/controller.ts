import { createServiceRoleClient } from "@/lib/supabase/service";
import type { AiTask } from "@/types/academy";

export type AiWorkerType = "course-creator" | "lesson-generator" | "quiz-builder" | "expert-review";

export async function logAiEvent(opts: {
  taskId?: string | null;
  worker: string;
  level?: "debug" | "info" | "warn" | "error";
  message: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const admin = createServiceRoleClient();
  await admin.from("ai_logs").insert({
    task_id: opts.taskId ?? null,
    worker: opts.worker,
    level: opts.level ?? "info",
    message: opts.message,
    payload: opts.payload ?? {},
  });
}

export async function enqueueAiTask(opts: {
  taskType: AiWorkerType | string;
  payload?: Record<string, unknown>;
  priority?: number;
  scheduledAt?: string | null;
}): Promise<AiTask> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("ai_tasks")
    .insert({
      task_type: opts.taskType,
      status: "queued",
      payload: opts.payload ?? {},
      priority: opts.priority ?? 0,
      scheduled_at: opts.scheduledAt ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await logAiEvent({
    taskId: data.id,
    worker: "controller",
    message: `Task queued: ${opts.taskType}`,
    payload: opts.payload,
  });

  return data as AiTask;
}

export async function dispatchAiTask(taskId: string): Promise<{ ok: boolean; message: string }> {
  const admin = createServiceRoleClient();
  const { data: task, error } = await admin.from("ai_tasks").select("*").eq("id", taskId).single();
  if (error || !task) return { ok: false, message: "Task not found" };

  await admin
    .from("ai_tasks")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", taskId);

  await logAiEvent({
    taskId,
    worker: "controller",
    message: `Dispatching ${task.task_type}`,
  });

  try {
    const { runCourseCreatorStub } = await import("@/lib/academy/ai/workers/course-creator");
    const { runLessonGeneratorStub } = await import("@/lib/academy/ai/workers/lesson-generator");

    let result: Record<string, unknown> = { stub: true };

    switch (task.task_type) {
      case "course-creator":
        result = await runCourseCreatorStub(task.payload as Record<string, unknown>, taskId);
        break;
      case "lesson-generator":
        result = await runLessonGeneratorStub(task.payload as Record<string, unknown>, taskId);
        break;
      default:
        result = { stub: true, task_type: task.task_type };
    }

    await admin
      .from("ai_tasks")
      .update({
        status: "completed",
        result,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    await logAiEvent({
      taskId,
      worker: "controller",
      message: "Task completed (stub)",
      payload: result,
    });

    return { ok: true, message: "completed" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await admin
      .from("ai_tasks")
      .update({
        status: "failed",
        error_message: msg,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    await logAiEvent({
      taskId,
      worker: "controller",
      level: "error",
      message: msg,
    });

    return { ok: false, message: msg };
  }
}

export async function queueGenerateCourse(payload: {
  topic: string;
  level?: string;
  lessonCount?: number;
}): Promise<AiTask> {
  return enqueueAiTask({
    taskType: "course-creator",
    payload,
    priority: 1,
  });
}
