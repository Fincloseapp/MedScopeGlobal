import { NextResponse } from "next/server";
import { createDataClient } from "@/lib/supabase/data";
import { contactInquirySchema } from "@/lib/exchange/validation";
import { getExchangeListing } from "@/lib/exchange/catalog";
import { sanitizeText } from "@/lib/security/sanitize";
import { withApiGuard } from "@/lib/security/api-guard";
import { regionFromCountry } from "@/lib/exchange/regions";
import { requestCountry } from "@/lib/growth/request-country";

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
  };

  const supabase = await createDataClient();
  if (supabase) {
    const { error } = await supabase.from("exchange_contacts").insert(payload);
    if (error) {
      return NextResponse.json({ ok: true, demo: true, advertiserEmail: listing.organization?.contactEmail ?? null });
    }
  }

  return NextResponse.json({
    ok: true,
    commission: 0,
    advertiserEmail: listing.organization?.contactEmail ?? null,
    advertiserPhone: listing.organization?.contactPhone ?? null,
    message: "Introduction recorded. The advertiser receives this enquiry directly.",
  });
}
