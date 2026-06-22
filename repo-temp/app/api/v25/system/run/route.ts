import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { runV25PostPipeline } from "@/lib/v25/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized — přihlaste se v /admin/login" }, { status: 401 });
  }

  const url = new URL(request.url);
  const modeParam = url.searchParams.get("mode");
  const mode =
    modeParam === "full" ? "full" : modeParam === "suite" ? "suite" : "quick";

  try {
    const result = await runV25PostPipeline({ mode });
    return NextResponse.json({ ...result, mode });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Pipeline selhala";
    return NextResponse.json({ error: message, ok: false }, { status: 500 });
  }
}
