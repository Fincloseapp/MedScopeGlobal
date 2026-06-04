import { NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/v6/call-edge-function";

export async function POST() {
  try {
    const data = await callEdgeFunction("guideline-update");
    return NextResponse.json({ status: "ok", job: "guidelines", result: data });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        job: "guidelines",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
