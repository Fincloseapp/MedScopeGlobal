import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runSalesDepartmentTick } from "@/lib/sales/runner";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;
  const result = await runSalesDepartmentTick();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}
