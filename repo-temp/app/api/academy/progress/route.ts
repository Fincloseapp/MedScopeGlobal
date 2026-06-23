import { NextResponse } from "next/server";
import { getUserProgress } from "@/lib/academy/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: "Přihlášení vyžadováno" }, { status: 401 });
    }

    const courseId = new URL(request.url).searchParams.get("course_id") ?? undefined;
    const progress = await getUserProgress(auth.user.id, courseId);
    return NextResponse.json({ ok: true, progress });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
