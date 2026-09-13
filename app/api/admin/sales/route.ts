import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/require-admin-access";
import { loadSalesSnapshot } from "@/lib/sales/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminAccess();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snapshot = await loadSalesSnapshot();
  return NextResponse.json(snapshot);
}
