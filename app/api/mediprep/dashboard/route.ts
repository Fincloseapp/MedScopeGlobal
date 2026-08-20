import { NextResponse } from "next/server";
import { getPrepDashboard } from "@/lib/mediprep/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPrepDashboard());
}
