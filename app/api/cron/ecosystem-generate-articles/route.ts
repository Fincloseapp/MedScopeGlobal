import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { runGenerateArticlesCron } from "@/lib/ecosystem/editorial";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Enqueue generate-articles work; production writers remain on /api/cron/public-articles */
export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    const result = await runGenerateArticlesCron();
    const schedule = AUTONOMOUS_SCHEDULE["generate-articles"];
    return NextResponse.json({
      ...result,
      description: schedule.description,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generate articles cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
