import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { runV25PostPipeline } from "@/lib/v25/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized — přihlaste se v /admin/login" }, { status: 401 });
  }

  const result = await runV25PostPipeline();
  return NextResponse.json(result);
}
