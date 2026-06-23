import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { AUTOPILOT_JOB_SLUGS, isAutopilotJobSlug, runAutopilotJob } from "@/lib/v6/run-job";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const bodySchema = z.object({
  job: z.enum([
    "hourly_pubmed_monitor",
    "daily_regulatory_monitor",
    "daily_autopublish",
    "weekly_trend_analysis",
    "monthly_guideline_update",
  ]),
});

/** Manual / admin trigger — same auth as cron (CRON_SECRET). */
export async function POST(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid body", jobs: AUTOPILOT_JOB_SLUGS },
      { status: 400 }
    );
  }

  if (!isAutopilotJobSlug(body.job)) {
    return NextResponse.json({ error: "Unknown job" }, { status: 400 });
  }

  try {
    const result = await runAutopilotJob(body.job);
    return NextResponse.json({ ok: true, job: body.job, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, job: body.job, error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    jobs: AUTOPILOT_JOB_SLUGS,
    usage: "POST with Authorization: Bearer CRON_SECRET and { \"job\": \"hourly_pubmed_monitor\" }",
  });
}
