import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runEditorialFreshness } from "@/lib/editorial/run-editorial-freshness";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 8);
    const result = await runEditorialFreshness({ limit });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, detail: message }, { status: 500 });
  }
}

export const POST = GET;
