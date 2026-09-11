import { NextResponse } from "next/server";
import { snapshotExchangeMetrics } from "@/lib/exchange/observability";
import { EXCHANGE_COMMISSION } from "@/lib/exchange/monetization";
import { withApiGuard } from "@/lib/security/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_observability" });
  if (!guard.ok) return guard.response;

  return NextResponse.json({
    ok: true,
    revenueModel: EXCHANGE_COMMISSION.revenueModel,
    ...snapshotExchangeMetrics(),
    monitors: [
      "uptime",
      "api_latency",
      "error_rate",
      "subscription_conversion",
      "inquiry_volume",
      "region_usage",
      "language_usage",
    ],
    logs: ["audit", "api", "auth", "subscription", "inquiry", "error", "security"],
  });
}
