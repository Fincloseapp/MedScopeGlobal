import { NextResponse } from "next/server";
import reasoningJob from "@/jobs/v17/reasoningJob";

const JOB = "reason" as const;
const READY_MESSAGE = "V17 endpoint ready. Use POST to run the job.";

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

    const result = await reasoningJob(input);
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
