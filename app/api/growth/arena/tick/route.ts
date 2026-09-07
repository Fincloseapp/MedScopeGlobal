import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { runArenaTick } from "@/lib/growth/arena/tick";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runArenaTick();
  return NextResponse.json(result, { status: result.ok ? 200 : 207 });
}

export async function GET(request: Request) {
  return POST(request);
}
