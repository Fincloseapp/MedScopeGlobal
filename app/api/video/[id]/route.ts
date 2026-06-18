import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gateVideoMetadata,
  mapUserToVideoRole,
} from "@/lib/v34/video-engine/access";
import { extractVideoMetadata } from "@/lib/v34/video-engine/metadata";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { VideoAsset } from "@/types/academy";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("video_assets").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPhysician = false;
  let isStudent = false;
  if (user) {
    const { data: profile } = await supabase
      .from("app_users")
      .select("role, access_level")
      .eq("id", user.id)
      .maybeSingle();
    const role = profile?.role ?? profile?.access_level ?? "";
    isPhysician = role === "physician" || role === "doctor" || role === "admin";
    isStudent = role === "student" || Boolean(user);
  }

  const userRole = mapUserToVideoRole({
    isAuthenticated: Boolean(user),
    isPhysician,
    isStudent,
  });

  const meta = extractVideoMetadata(data as VideoAsset);
  const gated = gateVideoMetadata(meta, userRole);
  if (!gated) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    video: gated,
    signed: false,
    version: "v34.0",
  });
}
