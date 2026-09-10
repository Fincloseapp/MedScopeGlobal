import { NextResponse } from "next/server";
import { createDataClient } from "@/lib/supabase/data";
import { listingCreateSchema } from "@/lib/exchange/validation";
import { normalizeAvailabilityRegions, requireAvailabilityRegions } from "@/lib/exchange/regions";
import { slugifyExchange } from "@/lib/exchange/slug";
import { translateListingFields } from "@/lib/exchange/translate";
import { sanitizeText } from "@/lib/security/sanitize";
import { withApiGuard } from "@/lib/security/api-guard";
import { getSessionProfile } from "@/lib/auth/session";
import { EXCHANGE_TARGET_LOCALES } from "@/lib/exchange/locales";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_listing_create" });
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = listingCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  let regions;
  try {
    regions = normalizeAvailabilityRegions(
      requireAvailabilityRegions([body.availabilityRegion, ...(body.availabilityRegions ?? [])])
    );
  } catch {
    return NextResponse.json({ error: "availability_region_required" }, { status: 400 });
  }

  const { user } = await getSessionProfile();
  const slug = slugifyExchange(body.title);
  const row = {
    slug,
    kind: body.kind,
    status: "pending_review",
    organization_id: body.organizationId ?? null,
    category: body.category,
    source_locale: body.sourceLocale,
    title: sanitizeText(body.title, 180),
    summary: sanitizeText(body.summary, 400),
    description: sanitizeText(body.description, 8000),
    availability_region: body.availabilityRegion,
    availability_regions: regions,
    certifications: body.certifications,
    certification_notes: body.certificationNotes ? sanitizeText(body.certificationNotes, 500) : null,
    certification_not_applicable: Boolean(body.certificationNotApplicable),
    price_hint: body.priceHint ? sanitizeText(body.priceHint, 80) : null,
    currency: body.currency ?? null,
    image_url: body.imageUrl || null,
    documentation_url: body.documentationUrl || null,
    created_by: user?.id ?? null,
  };

  const supabase = await createDataClient();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      demo: true,
      slug,
      status: "pending_review",
      message: "Listing accepted in demo mode (database unavailable).",
    });
  }

  const { data, error } = await supabase.from("exchange_listings").insert(row).select("id, slug").single();
  if (error) {
    return NextResponse.json({
      ok: true,
      demo: true,
      slug,
      status: "pending_review",
      error: error.message,
    });
  }

  const targets = EXCHANGE_TARGET_LOCALES.filter((locale) => locale.split("-")[0] !== body.sourceLocale.split("-")[0]);
  void Promise.all(
    targets.map(async (locale) => {
      const translated = await translateListingFields({
        title: body.title,
        summary: body.summary,
        description: body.description,
        sourceLocale: body.sourceLocale,
        targetLocale: locale,
      });
      await supabase.from("exchange_listing_translations").insert({
        listing_id: data.id,
        locale,
        title: translated.title.translation,
        summary: translated.summary.translation,
        description: translated.description.translation,
        provider: translated.title.provider,
      });
    })
  ).catch(() => {});

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug, status: "pending_review" });
}
