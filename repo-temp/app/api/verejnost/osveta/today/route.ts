import { NextResponse } from "next/server";
import { getTodayPublicHealthVideo } from "@/lib/verejnost/osveta/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const video = await getTodayPublicHealthVideo();
    return NextResponse.json({ ok: true, video });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
