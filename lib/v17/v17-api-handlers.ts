import { NextResponse } from "next/server";
import clinicalJob from "@/jobs/v17/clinicalJob";
import graphBuildJob from "@/jobs/v17/graphBuildJob";
import guidelineJob from "@/jobs/v17/guidelineJob";
import reasoningJob from "@/jobs/v17/reasoningJob";
import summarizationJob from "@/jobs/v17/summarizationJob";

export type V17JobSlug = "reason" | "summarize" | "clinical" | "graph" | "guideline";

const READY_MESSAGE = "V17 endpoint ready. Use POST to run the job.";

export const V17_ROUTE_CONFIG: Record<
  V17JobSlug,
  { job: V17JobSlug; edgeModule: string }
> = {
  reason: { job: "reason", edgeModule: "reasoning-edge" },
  summarize: { job: "summarize", edgeModule: "summarization-edge" },
  clinical: { job: "clinical", edgeModule: "clinical-edge" },
  graph: { job: "graph", edgeModule: "graph-edge" },
  guideline: { job: "guideline", edgeModule: "guideline-edge" },
};

const JOB_RUNNERS: Record<V17JobSlug, () => Promise<void>> = {
  reason: reasoningJob,
  summarize: summarizationJob,
  clinical: clinicalJob,
  graph: graphBuildJob,
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
  const { job } = V17_ROUTE_CONFIG[slug];
  const runJob = JOB_RUNNERS[slug];

  async function GET() {
    return NextResponse.json({
      status: "ok",
      job,
      message: READY_MESSAGE,
    });
  }

  async function POST() {
    try {
      await runJob();
      return NextResponse.json({
        status: "ok",
        job,
        message: "Job completed (skeleton).",
      });
    } catch (error) {
      return v17ErrorResponse(job, error);
    }
  }

  return { GET, POST };
}
