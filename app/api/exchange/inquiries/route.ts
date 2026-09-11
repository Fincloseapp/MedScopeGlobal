import { NextResponse } from "next/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { getAdvertiserContext } from "@/lib/exchange/session";
import { entitlementsFor } from "@/lib/exchange/monetization";
import { listDemoInquiries } from "@/lib/exchange/inquiries";
import { createDataClient } from "@/lib/supabase/data";
import { redactInquiry, type ExchangeInquiry } from "@/lib/exchange/inquiries";
import type { AvailabilityRegion } from "@/lib/exchange/regions";
import { recordExchangeMetric } from "@/lib/exchange/observability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_inquiries" });
  if (!guard.ok) return guard.response;

  const ctx = await getAdvertiserContext(request);
  const access = entitlementsFor(ctx.plan);
  const url = new URL(request.url);
  const region = url.searchParams.get("region");

  const supabase = await createDataClient();
  let items: ExchangeInquiry[] = listDemoInquiries(ctx.plan, ctx.organizationId);
  let source: "db" | "demo" = "demo";

  if (supabase && ctx.organizationId && !ctx.demo) {
    const { data } = await supabase
      .from("exchange_contacts")
      .select("*, exchange_listings(slug, title)")
      .eq("organization_id", ctx.organizationId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) {
      source = "db";
      items = data.map((row) => {
        const listing = row.exchange_listings as { slug?: string; title?: string } | null;
        const inquiry: ExchangeInquiry = {
          id: String(row.id),
          listingId: String(row.listing_id),
          listingSlug: listing?.slug ?? "",
          listingTitle: listing?.title ?? "",
          organizationId: String(row.organization_id ?? ""),
          buyerOrganization: String(row.buyer_organization),
          buyerName: row.buyer_name as string,
          buyerEmail: row.buyer_email as string,
          buyerPhone: (row.buyer_phone as string | null) ?? null,
          message: String(row.message),
          locale: (row.locale as string | null) ?? null,
          region: (row.region as AvailabilityRegion | null) ?? null,
          premium: Boolean(row.premium),
          createdAt: String(row.created_at),
          redacted: false,
        };
        return redactInquiry(inquiry, ctx.plan);
      });
    }
  }

  if (region && access.canUseRegionalInbox) {
    items = items.filter((item) => !item.region || item.region === region || item.region === "Global");
  }

  recordExchangeMetric(access.canSeeContacts ? "inquiry_full_view" : "inquiry_redacted_view", {
    plan: ctx.plan,
  });

  return NextResponse.json({
    plan: ctx.plan,
    paid: access.paid,
    canSeeContacts: access.canSeeContacts,
    canReply: access.canReply,
    source,
    items,
  });
}
