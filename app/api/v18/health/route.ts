import { NextResponse } from "next/server";
import { runV18Healthcheck } from "@/lib/v18/health";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = runV18Healthcheck();
    const status = result.status === "unhealthy" ? 503 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        engine: "v18",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
