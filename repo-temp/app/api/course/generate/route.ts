import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { generateCourse } from "@/lib/v40/course/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      topic?: string;
      level?: string;
      targetAudience?: string;
      target_audience?: string;
      lessonCount?: number;
    };

    if (!body.topic?.trim()) {
      return NextResponse.json({ error: "topic je povinný" }, { status: 400 });
    }

    const result = await generateCourse({
      topic: body.topic.trim(),
      level: body.level,
      targetAudience: body.targetAudience ?? body.target_audience,
      lessonCount: body.lessonCount,
    });

    return NextResponse.json({ ok: true, version: "v40.0", course: result }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
