import { NextResponse } from "next/server";
import { getPacientSession } from "@/lib/medipacient/session";
import { getPacientDashboard, dashboardNextVisit } from "@/lib/medipacient/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getPacientSession();
  const dash = await getPacientDashboard(session.userId);
  return NextResponse.json({ nextVisit: dashboardNextVisit(dash) });
}
