import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runDailyAutopublishJob } from "@/lib/v6/autopilot-runner";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;
  try {
    const result = await runDailyAutopublishJob();
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
