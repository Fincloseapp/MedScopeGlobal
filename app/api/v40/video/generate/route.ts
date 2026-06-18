import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { runVideoPipeline } from "@/lib/v40/video/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      topic?: string;
      lessonContent?: string;
      courseTitle?: string;
      level?: string;
      useAvatar?: boolean;
    };

    if (!body.topic?.trim()) {
      return NextResponse.json({ error: "topic je povinný" }, { status: 400 });
    }

    const result = await runVideoPipeline({
      topic: body.topic.trim(),
      lessonContent: body.lessonContent,
      courseTitle: body.courseTitle,
      level: body.level,
      useAvatar: body.useAvatar,
    });

    return NextResponse.json({ ok: result.ok, version: "v40.0", ...result }, { status: result.ok ? 200 : 500 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
