import type { AvailabilityRegion } from "@/lib/exchange/regions";
import type {
  ExchangeAdPlacement,
  ExchangeExpertContent,
  ExchangeListing,
  ExchangeOrganization,
} from "@/lib/exchange/types";

const now = "2026-09-10T00:00:00.000Z";

export const DEMO_ORGANIZATIONS: ExchangeOrganization[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "nordic-diagnostics",
    legalName: "Nordic Diagnostics GmbH",
    tradeName: "Nordic Diagnostics",
    kind: "company",
    registrationId: "HRB 184920",
    vatId: "DE813492001",
    countryCode: "DE",
    website: "https://medscopeglobal.com/exchange",
    contactEmail: "partners@medscopeglobal.com",
    contactPhone: "+49 30 000000",
    contactPerson: "Dr. Lena Hartmann",
    availabilityRegions: ["EU"],
    verified: true,
    plan: "pro",
    sourceLocale: "de",
    description:
      "IVD and point-of-care diagnostics for hospital laboratories. CE-marked devices, B2B supply only.",
    createdAt: now,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "pacific-lab-network",
    legalName: "Pacific Lab Network Pte. Ltd.",
    tradeName: "Pacific Lab Network",
    kind: "laboratory",
    registrationId: "201938472K",
    countryCode: "SG",
    website: "https://medscopeglobal.com/exchange",
    contactEmail: "labs@medscopeglobal.com",
    contactPerson: "Wei Tan",
    availabilityRegions: ["Asia", "Global"],
    verified: true,
    plan: "enterprise",
    sourceLocale: "en",
    description:
      "Reference laboratory network offering specialty assays and clinical-trial sample logistics across Asia.",
    micrositeEnabled: true,
    apiImportEnabled: true,
    adCredits: 8,
    createdAt: now,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "university-hospital-morava",
    legalName: "Fakultní nemocnice Morava, p.o.",
    tradeName: "FN Morava",
    kind: "hospital",
    registrationId: "00843989",
    countryCode: "CZ",
    contactEmail: "procurement@medscopeglobal.com",
    contactPerson: "Ing. Petra Nováková",
    availabilityRegions: ["EU"],
    verified: true,
    plan: "basic",
    sourceLocale: "cs",
    description: "Tertiary hospital procurement and investigator-initiated research partnerships.",
    createdAt: now,
  },
];

export const DEMO_LISTINGS: ExchangeListing[] = [
  {
    id: "aaaaaaa1-1111-4111-8111-111111111111",
    slug: "ce-poc-immunoassay-analyzer",
    kind: "product",
    status: "approved",
    organizationId: DEMO_ORGANIZATIONS[0].id,
    organization: {
      slug: DEMO_ORGANIZATIONS[0].slug,
      legalName: DEMO_ORGANIZATIONS[0].legalName,
      tradeName: DEMO_ORGANIZATIONS[0].tradeName,
      kind: DEMO_ORGANIZATIONS[0].kind,
      verified: true,
      website: DEMO_ORGANIZATIONS[0].website,
    },
    category: "diagnostics",
    sourceLocale: "en",
    title: "CE-marked POC immunoassay analyzer",
    summary: "Hospital-grade point-of-care immunoassay platform with EU MDR documentation pack.",
    description:
      "Compact immunoassay analyzer for emergency and outpatient labs. Supplied B2B with CE technical file, ISO 13485 QMS and installation training. Direct contract with the manufacturer — MedScopeGlobal only introduces the parties.",
    availabilityRegion: "EU",
    availabilityRegions: ["EU"],
    certifications: ["CE", "ISO"],
    certificationNotApplicable: false,
    priceHint: "B2B on request",
    currency: "EUR",
    featured: true,
    createdAt: now,
  },
  {
    id: "aaaaaaa2-2222-4222-8222-222222222222",
    slug: "asia-specialty-lab-panel",
    kind: "service",
    status: "approved",
    organizationId: DEMO_ORGANIZATIONS[1].id,
    organization: {
      slug: DEMO_ORGANIZATIONS[1].slug,
      legalName: DEMO_ORGANIZATIONS[1].legalName,
      tradeName: DEMO_ORGANIZATIONS[1].tradeName,
      kind: DEMO_ORGANIZATIONS[1].kind,
      verified: true,
      website: DEMO_ORGANIZATIONS[1].website,
    },
    category: "lab-analysis",
    sourceLocale: "en",
    title: "Specialty immunology panels for Asia-Pacific trials",
    summary: "Central-lab immunology and biomarker panels with chain-of-custody across APAC sites.",
    description:
      "Reference-lab service for sponsors running multi-country trials in Asia. Includes sample logistics, validated assays and bilingual reports. Not a consumer lab and not a public test marketplace.",
    availabilityRegion: "Asia",
    availabilityRegions: ["Asia", "Global"],
    certifications: ["ISO"],
    certificationNotApplicable: false,
    priceHint: "Per panel / protocol",
    featured: true,
    createdAt: now,
  },
  {
    id: "aaaaaaa3-3333-4333-8333-333333333333",
    slug: "hospital-ultrasound-rfp-eu",
    kind: "demand",
    status: "approved",
    organizationId: DEMO_ORGANIZATIONS[2].id,
    organization: {
      slug: DEMO_ORGANIZATIONS[2].slug,
      legalName: DEMO_ORGANIZATIONS[2].legalName,
      tradeName: DEMO_ORGANIZATIONS[2].tradeName,
      kind: DEMO_ORGANIZATIONS[2].kind,
      verified: true,
    },
    category: "procurement",
    sourceLocale: "cs",
    title: "Poptávka: 4 prenatální ultrazvukové systémy (EU)",
    summary: "Fakultní nemocnice hledá CE dodavatele čtyř prenatálních UZ systémů včetně servisu.",
    description:
      "Poptávka je určena pouze B2B dodavatelům se statusem CE a servisní sítí v EU. Nemocnice uzavírá smlouvu přímo. MedScopeGlobal nezpracovává platbu ani dodání.",
    availabilityRegion: "EU",
    availabilityRegions: ["EU"],
    certifications: ["CE"],
    certificationNotApplicable: false,
    featured: false,
    createdAt: now,
  },
  {
    id: "aaaaaaa4-4444-4333-8333-444444444444",
    slug: "telemedicine-oncology-second-opinion",
    kind: "service",
    status: "approved",
    organizationId: DEMO_ORGANIZATIONS[0].id,
    organization: {
      slug: DEMO_ORGANIZATIONS[0].slug,
      legalName: DEMO_ORGANIZATIONS[0].legalName,
      tradeName: DEMO_ORGANIZATIONS[0].tradeName,
      kind: DEMO_ORGANIZATIONS[0].kind,
      verified: true,
    },
    category: "telemedicine",
    sourceLocale: "en",
    title: "Oncology second-opinion network for hospitals",
    summary: "Institution-to-institution tumor-board second opinions. No direct-to-patient care.",
    description:
      "B2B telemedicine for hospitals and cancer centers. Cases stay inside the requesting institution’s record. Marketplace contact is the only MedScopeGlobal involvement.",
    availabilityRegion: "Global",
    availabilityRegions: ["Global"],
    certifications: ["ISO"],
    certificationNotApplicable: false,
    featured: false,
    createdAt: now,
  },
];

export const DEMO_ADS: ExchangeAdPlacement[] = [
  {
    id: "ad-banner-eu",
    slug: "eu-diagnostics-spotlight",
    format: "banner",
    title: "EU diagnostics spotlight",
    body: "Reach hospital procurement teams filtering for CE-marked supply in the EU.",
    targetUrl: "/exchange/catalog?regions=EU&kind=product",
    availabilityRegions: ["EU"],
    active: true,
    impressions: 1240,
    clicks: 38,
  },
  {
    id: "ad-nl-asia",
    slug: "apac-lab-newsletter",
    format: "newsletter",
    title: "APAC laboratory briefing",
    body: "Sponsored placement in the regional professional brief for Asia.",
    targetUrl: "/exchange/catalog?regions=Asia&kind=service",
    availabilityRegions: ["Asia"],
    active: true,
    impressions: 410,
    clicks: 19,
  },
];

export const DEMO_CONTENT: ExchangeExpertContent[] = [
  {
    id: "ex-leg-1",
    slug: "eu-mdr-b2b-listing-checklist",
    kind: "legislation",
    title: "EU MDR listing checklist for B2B device offers",
    excerpt: "What a manufacturer must disclose before a CE-marked device can appear on MedScope Exchange.",
    locale: "en",
    subscriptionRequired: false,
    href: "/exchange/content/eu-mdr-b2b-listing-checklist",
  },
  {
    id: "ex-clin-1",
    slug: "poc-immunoassay-procurement-brief",
    kind: "clinical_analysis",
    title: "POC immunoassay procurement brief for hospital labs",
    excerpt: "Clinical and operational criteria used by EU hospital labs when shortlisting analyzers.",
    locale: "en",
    subscriptionRequired: true,
    href: "/exchange/content/poc-immunoassay-procurement-brief",
  },
  {
    id: "ex-art-1",
    slug: "why-healthcare-b2b-needs-regional-filters",
    kind: "article",
    title: "Why regional availability is a safety control, not a marketing filter",
    excerpt: "A device cleared in one region is not automatically lawful to offer in another.",
    locale: "en",
    subscriptionRequired: false,
    href: "/exchange/content/why-healthcare-b2b-needs-regional-filters",
  },
];

export function demoListingBySlug(slug: string): ExchangeListing | undefined {
  return DEMO_LISTINGS.find((item) => item.slug === slug);
}

export function demoOrganizationBySlug(slug: string): ExchangeOrganization | undefined {
  return DEMO_ORGANIZATIONS.find((item) => item.slug === slug);
}

export function demoListingsForOrg(orgId: string): ExchangeListing[] {
  return DEMO_LISTINGS.filter((item) => item.organizationId === orgId);
}

export function filterDemoListings(opts: {
  q?: string;
  kind?: string;
  category?: string;
  regions?: AvailabilityRegion[];
}): ExchangeListing[] {
  const q = opts.q?.trim().toLowerCase();
  return DEMO_LISTINGS.filter((item) => {
    if (opts.kind && opts.kind !== "any" && item.kind !== opts.kind) return false;
    if (opts.category && item.category !== opts.category) return false;
    if (opts.regions?.length) {
      const hit =
        item.availabilityRegions.includes("Global") ||
        opts.regions.includes("Global") ||
        item.availabilityRegions.some((region) => opts.regions!.includes(region));
      if (!hit) return false;
    }
    if (!q) return true;
    const hay = `${item.title} ${item.summary} ${item.description} ${item.organization?.tradeName ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}
