import { NextResponse } from "next/server";
import { createDataClient } from "@/lib/supabase/data";
import { organizationOnboardSchema } from "@/lib/exchange/validation";
import { normalizeAvailabilityRegions, requireAvailabilityRegions } from "@/lib/exchange/regions";
import { slugifyExchange } from "@/lib/exchange/slug";
import { sanitizeText } from "@/lib/security/sanitize";
import { withApiGuard } from "@/lib/security/api-guard";
import { getSessionProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_onboard" });
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = organizationOnboardSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  let regions;
  try {
    regions = normalizeAvailabilityRegions(requireAvailabilityRegions(parsed.data.availabilityRegions));
  } catch {
    return NextResponse.json({ error: "availability_region_required" }, { status: 400 });
  }

  const { user } = await getSessionProfile();
  const slug = slugifyExchange(parsed.data.tradeName || parsed.data.legalName);
  const row = {
    slug,
    legal_name: sanitizeText(parsed.data.legalName, 200),
    trade_name: sanitizeText(parsed.data.tradeName || parsed.data.legalName, 200),
    kind: parsed.data.kind,
    registration_id: sanitizeText(parsed.data.registrationId, 40),
    vat_id: parsed.data.vatId ? sanitizeText(parsed.data.vatId, 40) : null,
    country_code: parsed.data.countryCode.toUpperCase(),
    website: parsed.data.website || null,
    contact_email: parsed.data.contactEmail.trim().toLowerCase(),
    contact_phone: parsed.data.contactPhone ? sanitizeText(parsed.data.contactPhone, 40) : null,
    contact_person: sanitizeText(parsed.data.contactPerson, 120),
    availability_regions: regions,
    verified: false,
    plan: "basic",
    source_locale: parsed.data.sourceLocale,
    description: sanitizeText(parsed.data.description, 4000),
    created_by: user?.id ?? null,
  };

  const supabase = await createDataClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true, slug, pending: true });
  }

  const { data, error } = await supabase.from("exchange_organizations").insert(row).select("id, slug").single();
  if (error) {
    return NextResponse.json({ ok: true, demo: true, slug, pending: true, error: error.message });
  }

  if (user?.id) {
    await supabase.from("exchange_memberships").insert({
      organization_id: data.id,
      user_id: user.id,
      role: parsed.data.kind === "company" || parsed.data.kind === "telemedicine" ? "company_admin" : "institution_admin",
    });
    await supabase.from("exchange_legal_acceptances").insert([
      { user_id: user.id, organization_id: data.id, document: "terms", locale: parsed.data.sourceLocale, version: "2026-09-10" },
      { user_id: user.id, organization_id: data.id, document: "privacy", locale: parsed.data.sourceLocale, version: "2026-09-10" },
    ]);
  }

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug, pending: true });
}
