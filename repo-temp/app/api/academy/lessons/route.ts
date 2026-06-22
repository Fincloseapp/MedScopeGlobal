import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createLesson } from "@/lib/academy/db";
import { createClient } from "@/lib/supabase/server";
import type { CreateLessonInput } from "@/types/academy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get("course_id");

  try {
    const supabase = await createClient();
    let query = supabase
      .from("lessons")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (courseId) query = query.eq("course_id", courseId);

    const { data, error } = await query.limit(100);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, lessons: data ?? [] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateLessonInput;
    if (!body.course_id || !body.slug?.trim() || !body.title?.trim()) {
      return NextResponse.json({ error: "course_id, slug a title jsou povinné" }, { status: 400 });
    }
    const lesson = await createLesson(body);
    return NextResponse.json({ ok: true, lesson }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
