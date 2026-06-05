import { NextResponse } from "next/server";
import { runProductionAcp } from "@/lib/v17/production/run-production-acp";
import type { AcpRequest } from "@/lib/v17/acp/types";
import { getV17VersionInfo } from "@/lib/v17/versioning/version";

const JOB = "acp" as const;
const READY_MESSAGE =
  "V17 ACP endpoint ready. Use POST with { input, metadata?, clinicalContext? }.";

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    job: JOB,
    message: READY_MESSAGE,
    version: getV17VersionInfo(),
  });
}

export async function POST(request: Request) {
  try {
    const acpRequest: AcpRequest = {};

    try {
      const body = await request.json();
      if (typeof body?.input === "string") acpRequest.text = body.input;
      if (typeof body?.text === "string") acpRequest.text = body.text;
      if (body?.metadata && typeof body.metadata === "object") {
        acpRequest.metadata = body.metadata;
      }
      if (body?.clinicalContext && typeof body.clinicalContext === "object") {
        acpRequest.clinicalContext = body.clinicalContext;
      }
    } catch {
      /* optional JSON body */
    }

    const production = await runProductionAcp(acpRequest, {
      ip: clientIp(request),
      requestId:
        typeof acpRequest.metadata?.requestId === "string"
          ? acpRequest.metadata.requestId
          : undefined,
    });

    if (production.status === "error") {
      const status = production.code === "rate_limited" ? 429 : 400;
      return NextResponse.json(
        {
          status: "error",
          job: JOB,
          code: production.code,
          issues: production.issues,
          formatted: production.formatted,
        },
        { status }
      );
    }

    return NextResponse.json({
      status: "ok",
      job: JOB,
      version: getV17VersionInfo(),
      fallbackApplied: production.fallbackApplied ?? false,
      safetyIssues: production.safetyIssues,
      result: production.result,
      formatted: production.formatted,
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
