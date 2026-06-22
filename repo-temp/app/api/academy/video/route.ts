import { NextResponse } from "next/server";
import { listVideoAssets } from "@/lib/academy/db";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videos = await listVideoAssets();
    return NextResponse.json({ ok: true, videos });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { title?: string; storage_path?: string };
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title je povinný" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("video_assets")
      .insert({
        title: body.title.trim(),
        storage_path: body.storage_path ?? null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, video: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
