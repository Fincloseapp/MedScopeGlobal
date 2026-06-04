import { NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/v6/call-edge-function";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    job: "pubmed",
    message: "Endpoint is available. Use POST to run the job.",
  });
}

export async function POST() {
  try {
    const data = await callEdgeFunction("pubmed-monitor");
    return NextResponse.json({ status: "ok", job: "pubmed", result: data });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        job: "pubmed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
