import { NextResponse } from "next/server";
import { runHealthcheck } from "@/lib/v17/health/healthcheck";

export async function GET() {
  try {
    const result = await runHealthcheck();
    const httpStatus = result.status === "unhealthy" ? 503 : 200;
    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        version: "V17.0.0",
        checks: {},
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
