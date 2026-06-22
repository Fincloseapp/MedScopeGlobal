import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { listAiLogs } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? "50");
    const logs = await listAiLogs(Math.min(limit, 200));
    return NextResponse.json({ ok: true, logs });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
