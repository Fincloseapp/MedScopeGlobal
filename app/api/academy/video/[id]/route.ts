import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = (await request.json()) as {
      title?: string;
      storage_path?: string;
      status?: string;
      duration_seconds?: number;
    };

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("video_assets")
      .update(body)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, video: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
