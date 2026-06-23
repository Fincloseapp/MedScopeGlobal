import { NextResponse } from "next/server";
import { runDrugBodyBackfill, runDrugFeedIngest } from "@/lib/v4c/drug-feed-ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");

  if (!secret || (auth !== `Bearer ${secret}` && querySecret !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDrugFeedIngest({ maxItems: 48, refreshExisting: true });
    const backfill = await runDrugBodyBackfill();
    return NextResponse.json({ ok: true, ...result, backfill });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
