import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { listQueuedVideoJobs } from "@/lib/v40/video/pipeline";
import { processQueuedVideoJob } from "@/lib/v40/video/composer";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const jobs = await listQueuedVideoJobs(10);
  const results: { job_id: string; status: string; message?: string }[] = [];

  for (const job of jobs) {
    const result = await processQueuedVideoJob(job.id);
    results.push({ job_id: job.id, status: result.status, message: result.message });
  }

  return NextResponse.json({
    ok: true,
    phase: "v40.0-video-daily",
    processed: results.length,
    results,
    generatedAt: new Date().toISOString(),
  });
}
