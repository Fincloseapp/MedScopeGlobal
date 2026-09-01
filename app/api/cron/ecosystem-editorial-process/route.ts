import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { processEditorialQueue } from "@/lib/ecosystem/editorial";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Consume editorial_queue — journalists ingest/rewrite, editors record review. */
export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    const result = await processEditorialQueue({ maxJobs: 2, maxArticles: 2 });
    const schedule = AUTONOMOUS_SCHEDULE["editorial-process"];
    return NextResponse.json({
      ...result,
      description: schedule.description,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Editorial process cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
