import { NextResponse } from "next/server";
import { listMentoringSessions } from "@/lib/academy/db";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const sessions = await listMentoringSessions(auth.user?.id, 50);
    return NextResponse.json({ ok: true, sessions });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: "Přihlášení vyžadováno" }, { status: 401 });
    }

    const body = (await request.json()) as {
      course_id?: string;
      scheduled_at?: string;
      notes?: string;
    };

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("mentoring_sessions")
      .insert({
        mentee_id: auth.user.id,
        course_id: body.course_id ?? null,
        scheduled_at: body.scheduled_at ?? null,
        notes: body.notes ?? null,
        status: "requested",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, session: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string; status?: string; mentor_id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "id je povinný" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("mentoring_sessions")
      .update({
        status: body.status,
        mentor_id: body.mentor_id,
      })
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, session: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
