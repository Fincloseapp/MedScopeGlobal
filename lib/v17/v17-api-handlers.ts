import { NextResponse } from "next/server";
import clinicalJob from "@/jobs/v17/clinicalJob";
import graphBuildJob from "@/jobs/v17/graphBuildJob";
import guidelineJob from "@/jobs/v17/guidelineJob";
import reasoningJob from "@/jobs/v17/reasoningJob";
import summarizationJob from "@/jobs/v17/summarizationJob";

export type V17JobSlug = "reason" | "summarize" | "clinical" | "graph" | "guideline";

export const V17_JOB_SLUGS: V17JobSlug[] = [
  "reason",
  "summarize",
  "clinical",
  "graph",
  "guideline",
];

const READY_MESSAGE = "V17 endpoint ready. Use POST to run the job.";

const JOB_RUNNERS: Record<V17JobSlug, () => Promise<unknown>> = {
  reason: () => reasoningJob(),
  summarize: summarizationJob,
  clinical: () => clinicalJob(),
  graph: () => graphBuildJob(),
  guideline: guidelineJob,
};

function v17ErrorResponse(job: V17JobSlug, error: unknown, status = 500) {
  return NextResponse.json(
    {
      status: "error" as const,
      job,
      message: error instanceof Error ? error.message : String(error),
    },
    { status }
  );
}

export function createV17RouteHandlers(slug: V17JobSlug) {
  const runJob = JOB_RUNNERS[slug];

  async function GET() {
    return NextResponse.json({
      status: "ok",
      job: slug,
      message: READY_MESSAGE,
    });
  }

  async function POST() {
    try {
      const result = await runJob();
      return NextResponse.json({
        status: "ok",
        job: slug,
        ...(result != null && result !== undefined
          ? { result }
          : { message: "Job completed (skeleton)." }),
      });
    } catch (error) {
      return v17ErrorResponse(slug, error);
    }
  }

  return { GET, POST };
}
