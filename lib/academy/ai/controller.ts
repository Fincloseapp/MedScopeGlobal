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

export async function dispatchAiTask(
  taskId: string
): Promise<{ ok: boolean; message: string; result?: Record<string, unknown> }> {
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
    const payload = task.payload as Record<string, unknown>;
    let result: Record<string, unknown> = { stub: true };

    switch (task.task_type) {
      case "course-creator": {
        const { runCourseCreatorStub } = await import("@/lib/academy/ai/workers/course-creator");
        result = await runCourseCreatorStub(payload, taskId);
        break;
      }
      case "lesson-generator": {
        const { runLessonGeneratorStub } = await import("@/lib/academy/ai/workers/lesson-generator");
        result = await runLessonGeneratorStub(payload, taskId);
        break;
      }
      case "quiz-builder": {
        const { runQuizBuilderStub } = await import("@/lib/academy/ai/workers/quiz-builder");
        result = await runQuizBuilderStub(payload, taskId);
        break;
      }
      case "expert-review": {
        const { runExpertReview } = await import("@/lib/academy/ai/workers/expert-review");
        result = (await runExpertReview(payload, taskId)) as unknown as Record<string, unknown>;
        break;
      }
      case "video-producer": {
        const { runVideoProducerStub } = await import("@/lib/academy/ai/workers/video-producer");
        result = await runVideoProducerStub(payload, taskId);
        break;
      }
      case "simulation-builder": {
        const { runSimulationBuilderStub } = await import("@/lib/academy/ai/workers/simulation-builder");
        result = await runSimulationBuilderStub(payload, taskId);
        break;
      }
      case "textbook-writer": {
        const { runTextbookWriterStub } = await import("@/lib/academy/ai/workers/textbook-writer");
        result = await runTextbookWriterStub(payload, taskId);
        break;
      }
      case "mentoring-coordinator": {
        const { runMentoringCoordinatorStub } = await import("@/lib/academy/ai/workers/mentoring-coordinator");
        result = await runMentoringCoordinatorStub(payload, taskId);
        break;
      }
      case "marketplace-publisher": {
        const { runMarketplacePublisherStub } = await import("@/lib/academy/ai/workers/marketplace-publisher");
        result = await runMarketplacePublisherStub(payload, taskId);
        break;
      }
      case "testing-runner": {
        const { runTestingRunnerStub } = await import("@/lib/academy/ai/workers/testing-runner");
        result = await runTestingRunnerStub(payload, taskId);
        break;
      }
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
      message: result.stub ? "Task completed (fallback)" : "Task completed",
      payload: result,
    });

    return { ok: true, message: "completed", result };
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

export async function queueExpertReview(payload: {
  course_id?: string;
  lesson_id?: string;
  quiz_id?: string;
  auto_publish?: boolean;
  min_score?: number;
}): Promise<AiTask> {
  return enqueueAiTask({
    taskType: "expert-review",
    payload,
    priority: 2,
  });
}

export async function queueGenerateVideo(payload: {
  lesson_id: string;
  title?: string;
}): Promise<AiTask> {
  return enqueueAiTask({
    taskType: "video-producer",
    payload,
    priority: 2,
  });
}
