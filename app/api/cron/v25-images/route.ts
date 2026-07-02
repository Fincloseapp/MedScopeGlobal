import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runImagesFetch } from "@/lib/v25/runners/images";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const result = await runImagesFetch({ maxGenerate: 32 });
  return NextResponse.json(result);
}
