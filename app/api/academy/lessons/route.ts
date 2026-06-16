import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
