import { NextResponse } from "next/server";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");

  if (!secret || (auth !== `Bearer ${secret}` && querySecret !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { data: schedule } = await admin
    .from("ingestion_schedule")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (schedule && !schedule.enabled) {
    return NextResponse.json({ ok: true, skipped: true, reason: "disabled" });
  }

  const maxArticles = schedule?.max_articles_per_run ?? Number(process.env.INGEST_MAX_ARTICLES ?? 80);

  try {
    const result = await runIngestionPipeline({
      triggeredBy: "cron",
      maxArticles,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
