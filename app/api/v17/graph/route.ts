import { NextResponse } from "next/server";
import graphBuildJob from "@/jobs/v17/graphBuildJob";

const JOB = "graph" as const;
const READY_MESSAGE = "V17 MKG endpoint ready. Use POST with { input } to build the knowledge graph.";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    job: JOB,
    message: READY_MESSAGE,
  });
}

export async function POST(request: Request) {
  try {
    let input = "";
    try {
      const body = await request.json();
      if (typeof body?.input === "string") input = body.input;
    } catch {
      /* optional JSON body */
    }

    const result = await graphBuildJob(input);
    return NextResponse.json({
      status: "ok",
      job: JOB,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        job: JOB,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
