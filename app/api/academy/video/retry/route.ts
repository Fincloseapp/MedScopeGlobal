import { NextResponse } from "next/server";
import { retryVideoRender } from "@/lib/academy/ai/video-pipeline";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";

export const dynamic = "force-dynamic";

/** Admin: retry failed/placeholder video render for an asset. */
export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { video_asset_id?: string };
    if (!body.video_asset_id?.trim()) {
      return NextResponse.json({ error: "video_asset_id je povinný" }, { status: 400 });
    }

    const result = await retryVideoRender(body.video_asset_id.trim());
    return NextResponse.json(
      { ok: result.ok, result },
      { status: result.ok ? 200 : 500 }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
