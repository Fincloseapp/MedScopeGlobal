import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { dispatchAiTask, enqueueAiTask } from "@/lib/academy/ai/controller";
import { listRecentAiTasks } from "@/lib/academy/ai/workflow";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const tasks = await listRecentAiTasks(30);
    return NextResponse.json({ ok: true, tasks });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      task_type?: string;
      payload?: Record<string, unknown>;
      priority?: number;
    };

    if (!body.task_type?.trim()) {
      return NextResponse.json({ error: "task_type je povinný" }, { status: 400 });
    }

    const task = await enqueueAiTask({
      taskType: body.task_type.trim(),
      payload: body.payload,
      priority: body.priority,
    });

    return NextResponse.json({ ok: true, task }, { status: 202 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { task_id?: string };
    if (!body.task_id) {
      return NextResponse.json({ error: "task_id je povinný" }, { status: 400 });
    }

    const result = await dispatchAiTask(body.task_id);
    return NextResponse.json({ ok: result.ok, message: result.message, result: result.result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
