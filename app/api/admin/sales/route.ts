import { NextResponse } from "next/server";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { requireAdminAccess } from "@/lib/auth/require-admin-access";
import { fallbackSalesSnapshot, loadSalesSnapshot } from "@/lib/sales/snapshot";

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
  try {
    const snapshot = await Promise.race([
      loadSalesSnapshot(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("sales_snapshot_timeout")), 12_000);
      }),
    ]);
    return NextResponse.json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : "sales_snapshot_failed";
    return NextResponse.json(fallbackSalesSnapshot(message));
  }
}
