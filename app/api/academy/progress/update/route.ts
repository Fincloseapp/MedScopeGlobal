import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateUserProgress } from "@/lib/academy/db";
import type { UpdateProgressInput } from "@/types/academy";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Přihlášení je vyžadováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UpdateProgressInput;
    if (!body.course_id) {
      return NextResponse.json({ error: "course_id je povinné" }, { status: 400 });
    }

    const progress = await updateUserProgress(user.id, body);
    return NextResponse.json({ ok: true, progress });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
