import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import {
  getAdsOverview,
  listMarketerActivityLog,
  getCategoryPerformanceBreakdown,
} from "@/lib/queries/marketing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const activityLimit = Number(url.searchParams.get("activityLimit") ?? 50);
  const includePartners = url.searchParams.get("partners") !== "0";

  try {
    const [overview, activity, categoryPerformance] = await Promise.all([
      getAdsOverview({ includePartners }),
      listMarketerActivityLog({ limit: activityLimit }),
      getCategoryPerformanceBreakdown(),
    ]);

    return NextResponse.json({
      ok: true,
      overview,
      activity,
      categoryPerformance,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
