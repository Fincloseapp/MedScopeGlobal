import { NextResponse } from "next/server";
import { getV19MonitoringSnapshot } from "@/lib/v19/monitoring";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getV19MonitoringSnapshot(), { status: 200 });
}
