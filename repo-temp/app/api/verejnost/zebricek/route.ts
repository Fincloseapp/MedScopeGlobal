import { NextResponse } from "next/server";
import { getPublicOsvetaLeaderboard } from "@/lib/verejnost/osveta/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 20);

  try {
    const entries = await getPublicOsvetaLeaderboard(limit);
    return NextResponse.json({ ok: true, entries });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
