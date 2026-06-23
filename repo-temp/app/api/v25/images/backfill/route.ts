import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { runLegacyImageBackfill } from "@/lib/v25/images/backfill-legacy";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let maxItems = 64;
  try {
    const body = await request.json();
    if (typeof body?.maxItems === "number") maxItems = body.maxItems;
  } catch {
    /* default */
  }

  const result = await runLegacyImageBackfill(maxItems);
  return NextResponse.json({ ok: true, ...result });
}
