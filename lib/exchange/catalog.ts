import { createDataClient } from "@/lib/supabase/data";
import { listingMatchesRegions, parseAvailabilityRegions, type AvailabilityRegion } from "@/lib/exchange/regions";
import {
  DEMO_ADS,
  DEMO_CONTENT,
  DEMO_LISTINGS,
  DEMO_ORGANIZATIONS,
  demoListingBySlug,
  demoListingsForOrg,
  demoOrganizationBySlug,
  filterDemoListings,
} from "@/lib/exchange/seed";
import type {
  ExchangeAdPlacement,
  ExchangeExpertContent,
  ExchangeListing,
  ExchangeOrganization,
  ListingKind,
} from "@/lib/exchange/types";
import { publicListing, publicListings, publicOrganization } from "@/lib/exchange/public-surface";

export type ListingQuery = {
  q?: string;
  kind?: ListingKind | "any";
  category?: string;
  regions?: AvailabilityRegion[];
  locale?: string;
  limit?: number;
};

function mapListing(row: Record<string, unknown>, org?: Record<string, unknown> | null): ExchangeListing {
  const regions = parseAvailabilityRegions(row.availability_regions ?? row.availability_region);
  return {
    id: String(row.id),
    slug: String(row.slug),
    kind: row.kind as ExchangeListing["kind"],
    status: (row.status as ExchangeListing["status"]) ?? "approved",
    organizationId: String(row.organization_id),
    organization: org
      ? {
          slug: String(org.slug),
          legalName: String(org.legal_name ?? org.legalName ?? ""),
          tradeName: String(org.trade_name ?? org.tradeName ?? ""),
          kind: org.kind as ExchangeOrganization["kind"],
          verified: Boolean(org.verified),
          website: (org.website as string | null) ?? null,
        }
      : undefined,
    category: String(row.category),
    sourceLocale: String(row.source_locale ?? "en"),
    title: String(row.title),
    summary: String(row.summary),
    description: String(row.description),
    availabilityRegion: (row.availability_region as AvailabilityRegion) ?? regions[0] ?? "Global",
    availabilityRegions: regions,
    certifications: Array.isArray(row.certifications) ? (row.certifications as ExchangeListing["certifications"]) : [],
    certificationNotes: (row.certification_notes as string | null) ?? null,
    certificationNotApplicable: Boolean(row.certification_not_applicable),
    priceHint: (row.price_hint as string | null) ?? null,
    currency: (row.currency as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    documentationUrl: (row.documentation_url as string | null) ?? null,
    featured: Boolean(row.featured),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapOrg(row: Record<string, unknown>): ExchangeOrganization {
  return {
    id: String(row.id),
    slug: String(row.slug),
    legalName: String(row.legal_name),
    tradeName: String(row.trade_name),
    kind: row.kind as ExchangeOrganization["kind"],
    registrationId: String(row.registration_id),
    vatId: (row.vat_id as string | null) ?? null,
    countryCode: String(row.country_code),
    website: (row.website as string | null) ?? null,
    contactEmail: String(row.contact_email),
    contactPhone: (row.contact_phone as string | null) ?? null,
    contactPerson: String(row.contact_person),
    availabilityRegions: parseAvailabilityRegions(row.availability_regions),
    verified: Boolean(row.verified),
    plan: (row.plan as ExchangeOrganization["plan"]) ?? "basic",
    sourceLocale: String(row.source_locale ?? "en"),
    description: String(row.description ?? ""),
    logoUrl: (row.logo_url as string | null) ?? null,
    micrositeEnabled: Boolean(row.microsite_enabled),
    apiImportEnabled: Boolean(row.api_import_enabled),
    adCredits: Number(row.ad_credits ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function listExchangeListings(query: ListingQuery = {}): Promise<{
  items: ExchangeListing[];
  source: "db" | "demo";
}> {
  const limit = query.limit ?? 48;
  const supabase = await createDataClient();
  if (supabase) {
    try {
      let q = supabase
        .from("exchange_listings")
        .select("*, exchange_organizations(*)")
        .eq("status", "approved")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (query.kind && query.kind !== "any") q = q.eq("kind", query.kind);
      if (query.category) q = q.eq("category", query.category);
      const { data, error } = await q;
      if (!error && data) {
        let items = data.map((row) => {
          const rec = row as Record<string, unknown>;
          return mapListing(rec, rec.exchange_organizations as Record<string, unknown> | null);
        });
        if (query.regions?.length) {
          items = items.filter((item) => listingMatchesRegions(item.availabilityRegions, query.regions!));
        }
        if (query.q?.trim()) {
          const needle = query.q.trim().toLowerCase();
          items = items.filter((item) =>
            `${item.title} ${item.summary} ${item.organization?.tradeName ?? ""}`.toLowerCase().includes(needle)
          );
        }
        if (items.length > 0) return { items: publicListings(items), source: "db" };
      }
    } catch {
      // degrade to demo
    }
  }
  return { items: publicListings(filterDemoListings(query).slice(0, limit)), source: "demo" };
}

export async function getExchangeListing(slug: string): Promise<{
  listing: ExchangeListing | null;
  source: "db" | "demo";
}> {
  const supabase = await createDataClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("exchange_listings")
        .select("*, exchange_organizations(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (!error && data) {
        const rec = data as Record<string, unknown>;
        return {
          listing: publicListing(mapListing(rec, rec.exchange_organizations as Record<string, unknown> | null)),
          source: "db",
        };
      }
    } catch {
      // demo
    }
  }
  const demo = demoListingBySlug(slug);
  return { listing: demo ? publicListing(demo) : null, source: "demo" };
}

export async function getExchangeOrganization(slug: string): Promise<{
  organization: ExchangeOrganization | null;
  listings: ExchangeListing[];
  source: "db" | "demo";
}> {
  const supabase = await createDataClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("exchange_organizations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!error && data) {
        const org = mapOrg(data as Record<string, unknown>);
        const { data: listingRows } = await supabase
          .from("exchange_listings")
          .select("*")
          .eq("organization_id", org.id)
          .eq("status", "approved");
        return {
          organization: publicOrganization(org),
          listings: publicListings((listingRows ?? []).map((row) => mapListing(row as Record<string, unknown>))),
          source: "db",
        };
      }
    } catch {
      // demo
    }
  }
  const organization = demoOrganizationBySlug(slug) ?? null;
  return {
    organization: organization ? publicOrganization(organization) : null,
    listings: organization ? publicListings(demoListingsForOrg(organization.id)) : [],
    source: "demo",
  };
}

export async function listExchangeAds(regions?: AvailabilityRegion[]): Promise<ExchangeAdPlacement[]> {
  const supabase = await createDataClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("exchange_ads").select("*").eq("active", true);
      if (!error && data && data.length) {
        const items = data.map((row) => {
          const rec = row as Record<string, unknown>;
          return {
            id: String(rec.id),
            slug: String(rec.slug),
            format: rec.format as ExchangeAdPlacement["format"],
            title: String(rec.title),
            body: String(rec.body),
            targetUrl: String(rec.target_url),
            imageUrl: (rec.image_url as string | null) ?? null,
            availabilityRegions: parseAvailabilityRegions(rec.availability_regions),
            active: Boolean(rec.active),
            impressions: Number(rec.impressions ?? 0),
            clicks: Number(rec.clicks ?? 0),
          } satisfies ExchangeAdPlacement;
        });
        if (!regions?.length) return items;
        return items.filter((item) => listingMatchesRegions(item.availabilityRegions, regions));
      }
    } catch {
      // demo
    }
  }
  if (!regions?.length) return DEMO_ADS;
  return DEMO_ADS.filter((item) => listingMatchesRegions(item.availabilityRegions, regions));
}

export function listExchangeContent(locale?: string): ExchangeExpertContent[] {
  if (!locale) return DEMO_CONTENT;
  const primary = locale.split("-")[0];
  const localized = DEMO_CONTENT.filter((item) => item.locale === locale || item.locale.startsWith(primary ?? ""));
  return localized.length ? localized : DEMO_CONTENT;
}

export function listDemoOrganizations(): ExchangeOrganization[] {
  return DEMO_ORGANIZATIONS.map(publicOrganization);
}
