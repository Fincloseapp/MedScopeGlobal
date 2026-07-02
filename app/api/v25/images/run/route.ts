import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { runV25ImagePipeline } from "@/lib/v25/images/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized — přihlaste se v /admin/login" }, { status: 401 });
  }

  let maxGenerate = 24;
  try {
    const body = await request.json();
    if (typeof body?.maxGenerate === "number") maxGenerate = body.maxGenerate;
  } catch {
    /* default */
  }

  const result = await runV25ImagePipeline({ maxGenerate });
  return NextResponse.json(result);
}
