import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { queueGenerateCourse } from "@/lib/academy/ai/controller";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      topic?: string;
      level?: string;
      lessonCount?: number;
    };

    if (!body.topic?.trim()) {
      return NextResponse.json({ error: "topic je povinný" }, { status: 400 });
    }

    const task = await queueGenerateCourse({
      topic: body.topic.trim(),
      level: body.level,
      lessonCount: body.lessonCount,
    });

    return NextResponse.json(
      {
        ok: true,
        task,
        message: "Úloha zařazena do fronty ai_tasks (fáze 1 stub).",
      },
      { status: 202 }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
