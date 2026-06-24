import { NextResponse } from "next/server";
import { listPublicHealthVideos } from "@/lib/verejnost/osveta/db";
import type { PublicHealthCategory } from "@/types/public-osveta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const offset = Number(url.searchParams.get("offset") ?? 0);
  const category = url.searchParams.get("category") as PublicHealthCategory | null;

  try {
    const videos = await listPublicHealthVideos({
      limit,
      offset,
      category: category ?? undefined,
    });
    return NextResponse.json({ ok: true, videos, count: videos.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
