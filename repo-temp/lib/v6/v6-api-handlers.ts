import { NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/v6/call-edge-function";
import type { AutopilotJobSlug } from "@/lib/v6/autopilot-log";
import { runAutopilotJob } from "@/lib/v6/run-job";

export type V6JobSlug = "pubmed" | "regulatory" | "autopublish" | "trends" | "guidelines";

type V6RouteEntry = {
  job: V6JobSlug;
  edgeFunction: string;
  autopilotJob: AutopilotJobSlug;
};

const AVAILABLE_MESSAGE = "Endpoint is available. Use POST to run the job.";

/** Canonical V6 API route → edge function → local autopilot job mapping. */
export const V6_ROUTE_CONFIG: Record<V6JobSlug, V6RouteEntry> = {
  pubmed: {
    job: "pubmed",
    edgeFunction: "pubmed-monitor",
    autopilotJob: "hourly_pubmed_monitor",
  },
  regulatory: {
    job: "regulatory",
    edgeFunction: "regulatory-monitor",
    autopilotJob: "daily_regulatory_monitor",
  },
  autopublish: {
    job: "autopublish",
    edgeFunction: "autopublish",
    autopilotJob: "daily_autopublish",
  },
  trends: {
    job: "trends",
    edgeFunction: "trend-analysis",
    autopilotJob: "weekly_trend_analysis",
  },
  guidelines: {
    job: "guidelines",
    edgeFunction: "guideline-update",
    autopilotJob: "monthly_guideline_update",
  },
};

function v6ErrorResponse(job: V6JobSlug, error: unknown, status = 500) {
  return NextResponse.json(
    {
      status: "error" as const,
      job,
      message: error instanceof Error ? error.message : String(error),
    },
    { status }
  );
}

function assertJobMapping(entry: V6RouteEntry) {
  if (!entry.edgeFunction?.trim()) {
    throw new Error(`Missing edge function for job ${entry.job}`);
  }
  if (!entry.autopilotJob?.trim()) {
    throw new Error(`Missing autopilot job for ${entry.job}`);
  }
}

export function createV6RouteHandlers(slug: V6JobSlug) {
  const entry = V6_ROUTE_CONFIG[slug];
  const { job, edgeFunction, autopilotJob } = entry;

  async function GET() {
    return NextResponse.json({
      status: "ok",
      job,
      message: AVAILABLE_MESSAGE,
    });
  }

  async function PUT() {
    try {
      assertJobMapping(entry);
      return NextResponse.json({
        status: "ok",
        job,
        message: `Endpoint configured. Edge: ${edgeFunction}, autopilot: ${autopilotJob}. Use POST to run.`,
      });
    } catch (error) {
      return v6ErrorResponse(job, error);
    }
  }

  async function POST() {
    try {
      assertJobMapping(entry);
      try {
        const result = await callEdgeFunction(edgeFunction);
        return NextResponse.json({ status: "ok", job, result });
      } catch {
        const result = await runAutopilotJob(autopilotJob);
        return NextResponse.json({
          status: "ok",
          job,
          result,
          message: `Edge function unavailable; executed local autopilot job ${autopilotJob}.`,
        });
      }
    } catch (error) {
      return v6ErrorResponse(job, error);
    }
  }

  return { GET, PUT, POST };
}
