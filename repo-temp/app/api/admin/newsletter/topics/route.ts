import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { topic_text?: string };
    const topic_text = body.topic_text?.trim();
    if (!topic_text) {
      return NextResponse.json({ error: "topic_text required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("newsletter_topics")
      .insert({ topic_text, status: "pending" })
      .select("id, topic_text, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, topic: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
