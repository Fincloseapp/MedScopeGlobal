import { NextResponse } from "next/server";
import { getV18MonitoringSnapshot } from "@/lib/v18/monitoring";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getV18MonitoringSnapshot(), { status: 200 });
}
