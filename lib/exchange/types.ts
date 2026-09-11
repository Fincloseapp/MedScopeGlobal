import type { AvailabilityRegion } from "@/lib/exchange/regions";
import type { ExchangeRole } from "@/lib/exchange/roles";

export const LISTING_KINDS = ["product", "service", "demand"] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

export const LISTING_STATUSES = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "archived",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const ORG_KINDS = [
  "company",
  "clinic",
  "hospital",
  "laboratory",
  "university",
  "research",
  "telemedicine",
] as const;
export type OrgKind = (typeof ORG_KINDS)[number];

export const CERTIFICATION_CODES = ["CE", "FDA", "ISO"] as const;
export type CertificationCode = (typeof CERTIFICATION_CODES)[number];

export const EXCHANGE_PLANS = ["basic", "pro", "enterprise"] as const;
export type ExchangePlan = (typeof EXCHANGE_PLANS)[number];

export const AD_FORMATS = ["banner", "sponsored_article", "newsletter"] as const;
export type ExchangeAdFormat = (typeof AD_FORMATS)[number];

export type ExchangeOrganization = {
  id: string;
  slug: string;
  legalName: string;
  tradeName: string;
  kind: OrgKind;
  registrationId: string;
  vatId?: string | null;
  countryCode: string;
  website?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  contactPerson: string;
  availabilityRegions: AvailabilityRegion[];
  verified: boolean;
  plan: ExchangePlan;
  sourceLocale: string;
  description: string;
  logoUrl?: string | null;
  micrositeEnabled?: boolean;
  apiImportEnabled?: boolean;
  adCredits?: number;
  createdAt: string;
};

export type ExchangeListing = {
  id: string;
  slug: string;
  kind: ListingKind;
  status: ListingStatus;
  organizationId: string;
  organization?: Pick<
    ExchangeOrganization,
    "slug" | "legalName" | "tradeName" | "kind" | "verified" | "website"
  >;
  category: string;
  sourceLocale: string;
  title: string;
  summary: string;
  description: string;
  /** Required primary region (ENUM). */
  availabilityRegion: AvailabilityRegion;
  /** Multi-select; always includes availabilityRegion. Global is exclusive. */
  availabilityRegions: AvailabilityRegion[];
  certifications: CertificationCode[];
  certificationNotes?: string | null;
  certificationNotApplicable: boolean;
  priceHint?: string | null;
  currency?: string | null;
  imageUrl?: string | null;
  documentationUrl?: string | null;
  featured: boolean;
  featuredUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type ExchangeContactInquiry = {
  listingId: string;
  listingSlug: string;
  buyerOrganization: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  message: string;
  locale: string;
  region?: AvailabilityRegion | null;
};

export type ExchangeAdPlacement = {
  id: string;
  slug: string;
  format: ExchangeAdFormat;
  title: string;
  body: string;
  targetUrl: string;
  imageUrl?: string | null;
  availabilityRegions: AvailabilityRegion[];
  active: boolean;
  impressions: number;
  clicks: number;
};

export type ExchangeExpertContent = {
  id: string;
  slug: string;
  kind: "article" | "legislation" | "clinical_analysis";
  title: string;
  excerpt: string;
  locale: string;
  subscriptionRequired: boolean;
  href: string;
};

export type ExchangeSession = {
  role: ExchangeRole;
  userId?: string | null;
  organizationId?: string | null;
};
