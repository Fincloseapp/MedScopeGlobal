import { NextResponse } from "next/server";
import { getMediFlowSession } from "@/lib/mediflow/session";
import { getMediFlowDashboard, seedMediFlowDefaults } from "@/lib/mediflow/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getMediFlowSession();
  if (session.userId) {
    await seedMediFlowDefaults(session.userId);
  }
  const dashboard = await getMediFlowDashboard(session.userId);
  return NextResponse.json({ session, dashboard });
}
