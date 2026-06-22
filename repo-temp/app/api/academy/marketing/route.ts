import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("marketing_events")
      .select("*")
      .order("scheduled_at", { ascending: true })
      .limit(50);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, events: data ?? [] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      event_type?: string;
      payload?: Record<string, unknown>;
      scheduled_at?: string;
    };

    if (!body.event_type?.trim()) {
      return NextResponse.json({ error: "event_type je povinný" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("marketing_events")
      .insert({
        event_type: body.event_type.trim(),
        payload: body.payload ?? {},
        scheduled_at: body.scheduled_at ?? null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, event: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
