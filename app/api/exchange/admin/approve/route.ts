import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createDataClient } from "@/lib/supabase/data";
import { adminDecisionSchema } from "@/lib/exchange/validation";
import { withApiGuard } from "@/lib/security/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_admin_list" });
  if (!guard.ok) return guard.response;
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const supabase = await createDataClient();
  if (!supabase) return NextResponse.json({ items: [], source: "demo" });
  const { data } = await supabase
    .from("exchange_listings")
    .select("id, slug, title, kind, status, availability_region, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(100);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_admin_approve" });
  if (!guard.ok) return guard.response;
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = adminDecisionSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const supabase = await createDataClient();
  if (!supabase) return NextResponse.json({ ok: true, demo: true });
  const { error } = await supabase
    .from("exchange_listings")
    .update({
      status: parsed.data.decision,
      review_reason: parsed.data.reason ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.user?.id ?? null,
    })
    .eq("id", parsed.data.listingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
