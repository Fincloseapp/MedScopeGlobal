import { NextResponse } from "next/server";
import {
  runProductionJob,
  type V17ProductionJobSlug,
} from "@/lib/v17/production/run-production-job";
import { getV17VersionInfo } from "@/lib/v17/versioning/version";

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function parseV17Input(request: Request): Promise<string> {
  try {
    const body = await request.json();
    if (typeof body?.input === "string") return body.input;
    if (typeof body?.text === "string") return body.text;
  } catch {
    /* optional JSON body */
  }
  return "";
}

export function createV17ProductionRoute(
  job: V17ProductionJobSlug,
  runJob: (input: string) => Promise<unknown>,
  readyMessage: string
) {
  async function GET() {
    return NextResponse.json({
      status: "ok",
      job,
      message: readyMessage,
      version: getV17VersionInfo(),
    });
  }

  async function POST(request: Request) {
    try {
      const input = await parseV17Input(request);
      const production = await runProductionJob(job, input, runJob, {
        ip: clientIp(request),
      });

      if (production.status === "error") {
        const status =
          production.code === "rate_limited"
            ? 429
            : production.code === "validation"
              ? 400
              : 500;
        return NextResponse.json(
          {
            status: "error",
            job,
            code: production.code,
            issues: production.issues,
            requestId: production.requestId,
          },
          { status }
        );
      }

      return NextResponse.json({
        status: "ok",
        job,
        requestId: production.requestId,
        version: getV17VersionInfo(),
        result: production.result,
      });
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
