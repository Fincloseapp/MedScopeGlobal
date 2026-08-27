import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { runSyndicateArticlesCron } from "@/lib/ecosystem/editorial";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Enqueue syndication candidates into article_syndications + editorial_queue */
export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const limitPerHub = Number(url.searchParams.get("limit") ?? 3);
    const result = await runSyndicateArticlesCron({
      limitPerHub: Number.isFinite(limitPerHub) ? limitPerHub : 3,
    });
    const schedule = AUTONOMOUS_SCHEDULE["syndicate-articles"];
    return NextResponse.json({
      ...result,
      description: schedule.description,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Syndicate articles cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
