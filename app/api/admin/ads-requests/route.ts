import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/require-admin-access";
import { applyAdsRequestsSchema } from "@/lib/ads/apply-ads-schema";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminAccess();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await applyAdsRequestsSchema();
  const admin = tryCreateServiceRoleClient();
  if (!admin) return NextResponse.json({ rows: [] });
  const { data } = await admin
    .from("ads_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);
  return NextResponse.json({ rows: data ?? [] });
}
