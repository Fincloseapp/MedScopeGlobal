import { NextResponse } from "next/server";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { requireAdminAccess } from "@/lib/auth/require-admin-access";
import { loadSalesSnapshot } from "@/lib/sales/snapshot";

export const dynamic = "force-dynamic";

async function assertSalesAdmin() {
  if (await isAdminGateOpen()) return;
  await requireAdminAccess();
}

export async function GET() {
  try {
    await assertSalesAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snapshot = await loadSalesSnapshot();
  return NextResponse.json(snapshot);
}
