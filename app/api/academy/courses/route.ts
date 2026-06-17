import { NextRequest, NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createCourse, getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";
import type { CreateCourseInput } from "@/types/academy";

export const dynamic = "force-dynamic";

function parseFilter(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const audience = searchParams.get("audience") ?? undefined;
  const level = searchParams.get("level") ?? undefined;
  const prepOnly =
    searchParams.get("prep") === "true" ||
    category === "prijimacky" ||
    audience === "prijimacky";

  return { category, audience, level, prepOnly: prepOnly || undefined };
}

export async function GET(request: NextRequest) {
  try {
    const filter = parseFilter(request);
    const courses = await listPublishedCourses(100, filter);
    const flags = await getCourseVideoFlags(courses.map((c) => c.id));
    const enriched = courses.map((c) => ({
      ...c,
      has_video: flags[c.id]?.hasVideo ?? false,
      video_lesson_count: flags[c.id]?.videoLessonCount ?? 0,
    }));
    return NextResponse.json({
      ok: true,
      courses: enriched,
      count: enriched.length,
      filter,
    });
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
