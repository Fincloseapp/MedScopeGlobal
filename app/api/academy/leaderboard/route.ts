import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/academy/db";
import type { LeaderboardPeriod } from "@/types/academy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const period = (url.searchParams.get("period") ?? "all_time") as LeaderboardPeriod;
  const limit = Number(url.searchParams.get("limit") ?? 20);

  try {
    const entries = await getLeaderboard(period, limit);
    return NextResponse.json({ ok: true, period, entries });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
