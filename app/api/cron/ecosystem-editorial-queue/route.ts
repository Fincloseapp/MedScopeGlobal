import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { runEditorialQueueCron } from "@/lib/ecosystem/editorial";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily editorial queue — wired from cloudflare-cron.yml and /api/ecosystem/autonomous */
export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    const result = await runEditorialQueueCron();
    const schedule = AUTONOMOUS_SCHEDULE["editorial-queue"];
    return NextResponse.json({
      ...result,
      description: schedule.description,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Editorial queue cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
