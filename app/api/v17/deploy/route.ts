import { NextResponse } from "next/server";
import { preDeployCheck } from "@/edge/v17/pre-deploy-check";
import { getVersion } from "@/lib/v17/versioning/version";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: getVersion(),
  });
}

export async function POST() {
  try {
    const result = await preDeployCheck();
    return NextResponse.json(result, { status: result.ready ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        issues: [error instanceof Error ? error.message : String(error)],
      },
      { status: 500 }
    );
  }
}
