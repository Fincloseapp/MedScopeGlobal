import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { loadArenaDashboard } from "@/lib/growth/arena/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dash = await loadArenaDashboard();
  return NextResponse.json(dash);
}
