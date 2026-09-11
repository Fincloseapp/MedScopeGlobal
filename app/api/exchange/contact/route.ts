import { NextResponse } from "next/server";
import { createDataClient } from "@/lib/supabase/data";
import { contactInquirySchema } from "@/lib/exchange/validation";
import { getExchangeListing } from "@/lib/exchange/catalog";
import { sanitizeText } from "@/lib/security/sanitize";
import { withApiGuard } from "@/lib/security/api-guard";
import { regionFromCountry } from "@/lib/exchange/regions";
import { requestCountry } from "@/lib/growth/request-country";
import { EXCHANGE_COMMISSION } from "@/lib/exchange/monetization";
import { logAdminEvent } from "@/lib/logging";
import { recordExchangeMetric } from "@/lib/exchange/observability";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_contact" });
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = contactInquirySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { listing } = await getExchangeListing(parsed.data.listingSlug);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const region = regionFromCountry(requestCountry(request.headers));
  const payload = {
    listing_id: listing.id,
    organization_id: listing.organizationId,
    buyer_organization: sanitizeText(parsed.data.buyerOrganization, 200),
    buyer_name: sanitizeText(parsed.data.buyerName, 120),
    buyer_email: parsed.data.buyerEmail.trim().toLowerCase(),
    buyer_phone: parsed.data.buyerPhone ? sanitizeText(parsed.data.buyerPhone, 40) : null,
    message: sanitizeText(parsed.data.message, 4000),
    locale: parsed.data.locale ?? "en",
    region,
    premium: false,
  };

  const supabase = await createDataClient();
  if (supabase) {
    await supabase.from("exchange_contacts").insert(payload);
    await supabase.from("exchange_audit_events").insert({
      action: "inquiry_created",
      organization_id: listing.organizationId,
      details: { listingSlug: listing.slug, locale: payload.locale, region },
    });
  }

  await logAdminEvent("exchange_inquiry", {
    listingSlug: listing.slug,
    region,
    locale: payload.locale,
  });
  recordExchangeMetric("inquiry_created", { region, locale: payload.locale });

  return NextResponse.json({
    ok: true,
    commission: EXCHANGE_COMMISSION.dealCommissionPercent,
    advertiserNotified: true,
    message: "Inquiry recorded. Paying advertisers receive the buyer contact in their inbox.",
  });
}
