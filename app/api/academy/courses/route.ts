import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createCourse, getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";
import type { CreateCourseInput } from "@/types/academy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = await listPublishedCourses();
    const flags = await getCourseVideoFlags(courses.map((c) => c.id));
    const enriched = courses.map((c) => ({
      ...c,
      has_video: flags[c.id]?.hasVideo ?? false,
      video_lesson_count: flags[c.id]?.videoLessonCount ?? 0,
    }));
    return NextResponse.json({ ok: true, courses: enriched, count: enriched.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateCourseInput;
    if (!body.slug?.trim() || !body.title?.trim()) {
      return NextResponse.json({ error: "slug a title jsou povinné" }, { status: 400 });
    }
    const course = await createCourse(body);
    return NextResponse.json({ ok: true, course }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
