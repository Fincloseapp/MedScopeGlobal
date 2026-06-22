import { NextResponse } from "next/server";
import { runV4cDailyIngest } from "@/lib/v4c/daily-ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");

  if (!secret || (auth !== `Bearer ${secret}` && querySecret !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runV4cDailyIngest();
    const { runImagesFetch } = await import("@/lib/v25/runners/images");
    const images = await runImagesFetch({ maxGenerate: 12 });
    return NextResponse.json({ ok: true, result, images });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
