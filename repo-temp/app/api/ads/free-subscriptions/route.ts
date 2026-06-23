import { NextResponse } from "next/server";
import { PRICING } from "@/lib/config/site";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "calculate";

  if (action === "calculate") {
    const { campaignPriceCzk, plan = "vip" } = (await request.json()) as {
      campaignPriceCzk?: number;
      plan?: "basic" | "vip";
    };

    const price = Number(campaignPriceCzk);
    if (!price || price <= 0) {
      return NextResponse.json({ error: "Invalid campaign price" }, { status: 400 });
    }

    const monthly = plan === "basic" ? PRICING.basicMonthlyCzk : PRICING.vipMonthlyCzk;
    const freeSlots = Math.floor(price / monthly);

    return NextResponse.json({
      campaignPriceCzk: price,
      monthlySubscriptionCzk: monthly,
      freeSubscriptions: freeSlots,
      formula: "free_subscriptions = campaign_price / monthly_subscription",
    });
  }

  if (action === "assign") {
    const gate = await requireAdmin();
    if (!gate.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user_id, campaign_id, ends_at } = (await request.json()) as {
      user_id: string;
      campaign_id?: string;
      ends_at?: string;
    };

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { error } = await admin.from("free_subscriptions").insert({
      user_id,
      campaign_id: campaign_id ?? null,
      active: true,
      ends_at: ends_at ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await admin.from("vip_subscriptions").upsert({
      user_id,
      active: true,
      ends_at: ends_at ?? null,
    });

    return NextResponse.json({ ok: true, user_id });
  }

  if (action === "expire") {
    const gate = await requireAdmin();
    if (!gate.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaign_id } = (await request.json()) as { campaign_id?: string };
    const admin = createServiceRoleClient();

    let q = admin.from("free_subscriptions").update({ active: false }).eq("active", true);

    if (campaign_id) {
      q = q.eq("campaign_id", campaign_id);
    }

    const { data, error } = await q.select("user_id");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const row of data ?? []) {
      await admin.from("vip_subscriptions").update({ active: false }).eq("user_id", row.user_id);
    }

    return NextResponse.json({ ok: true, expired: data?.length ?? 0 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}
