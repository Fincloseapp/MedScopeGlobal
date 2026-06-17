import { NextResponse } from "next/server";
import { dispatchAiTask, enqueueAiTask } from "@/lib/academy/ai/controller";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { lesson_id?: string; dispatch?: boolean };
    if (!body.lesson_id?.trim()) {
      return NextResponse.json({ error: "lesson_id je povinný" }, { status: 400 });
    }

    const task = await enqueueAiTask({
      taskType: "video-producer",
      payload: { lesson_id: body.lesson_id.trim() },
      priority: 2,
    });

    if (body.dispatch !== false) {
      const result = await dispatchAiTask(task.id);
      return NextResponse.json(
        {
          ok: result.ok,
          task,
          result: result.result,
          message: result.ok
            ? "Video script vygenerován a video asset vytvořen."
            : result.message,
        },
        { status: result.ok ? 200 : 500 }
      );
    }

    return NextResponse.json(
      { ok: true, task, message: "Úloha video-producer zařazena do fronty." },
      { status: 202 }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
