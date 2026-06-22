import { NextResponse } from "next/server";
import { getMonitoringSnapshot } from "@/lib/v17/monitoring/dashboard";
import { getVersion } from "@/lib/v17/versioning/version";

export async function GET() {
  try {
    return NextResponse.json(getMonitoringSnapshot(), { status: 200 });
  } catch {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        version: getVersion(),
        metrics: {
          requestsLastHour: 0,
          avgLatencyMs: 0,
          errorRate: 0,
          fallbackRate: 0,
          acpLatencyMs: 0,
          mkgLatencyMs: 0,
          auditQueueSize: 0,
          storageWritesLastHour: 0,
        },
        warning: "snapshot fallback — monitoring layer degraded",
      },
      { status: 200 }
    );
  }
}
