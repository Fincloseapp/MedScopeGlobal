import { NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/v6/call-edge-function";

export type V6JobSlug = "pubmed" | "regulatory" | "autopublish" | "trends" | "guidelines";

const AVAILABLE_MESSAGE = "Endpoint is available. Use POST to run the job.";

/** Canonical V6 API route → Supabase Edge Function mapping. */
export const V6_ROUTE_CONFIG: Record<V6JobSlug, { job: V6JobSlug; edgeFunction: string }> = {
  pubmed: { job: "pubmed", edgeFunction: "pubmed-monitor" },
  regulatory: { job: "regulatory", edgeFunction: "regulatory-monitor" },
  autopublish: { job: "autopublish", edgeFunction: "autopublish" },
  trends: { job: "trends", edgeFunction: "trend-analysis" },
  guidelines: { job: "guidelines", edgeFunction: "guideline-update" },
};

export function createV6RouteHandlers(slug: V6JobSlug) {
  const { job, edgeFunction } = V6_ROUTE_CONFIG[slug];

  async function GET() {
    return NextResponse.json({
      status: "ok",
      job,
      message: AVAILABLE_MESSAGE,
    });
  }

  async function POST() {
    try {
      const result = await callEdgeFunction(edgeFunction);
      return NextResponse.json({ status: "ok", job, result });
    } catch (error) {
      return NextResponse.json(
        {
          status: "error",
          job,
          message: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }

  return { GET, POST };
}
