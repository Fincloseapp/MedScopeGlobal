import type { AvailabilityRegion } from "@/lib/exchange/regions";
import { entitlementsFor } from "@/lib/exchange/monetization";
import type { ExchangePlan } from "@/lib/exchange/types";

export type ExchangeInquiry = {
  id: string;
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  organizationId: string;
  buyerOrganization: string;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  message: string;
  locale: string | null;
  region: AvailabilityRegion | null;
  premium: boolean;
  createdAt: string;
  redacted: boolean;
};

export const DEMO_INQUIRIES: ExchangeInquiry[] = [
  {
    id: "inq-1",
    listingId: "aaaaaaa1-1111-4111-8111-111111111111",
    listingSlug: "ce-poc-immunoassay-analyzer",
    listingTitle: "CE-marked POC immunoassay analyzer",
    organizationId: "11111111-1111-4111-8111-111111111111",
    buyerOrganization: "Fakultní nemocnice Morava",
    buyerName: "Ing. Petra Nováková",
    buyerEmail: "procurement@fn-morava.example",
    buyerPhone: "+420 555 010 111",
    message: "Prosím o CE technical file index a pokrytí servisu v ČR/SK.",
    locale: "cs",
    region: "EU",
    premium: false,
    createdAt: "2026-09-11T08:00:00.000Z",
    redacted: false,
  },
  {
    id: "inq-2",
    listingId: "aaaaaaa2-2222-4222-8222-222222222222",
    listingSlug: "asia-specialty-lab-panel",
    listingTitle: "Specialty immunology panels for Asia-Pacific trials",
    organizationId: "22222222-2222-4222-8222-222222222222",
    buyerOrganization: "Pacific Trial Coordinating Centre",
    buyerName: "Wei Tan",
    buyerEmail: "trials@ptcc.example",
    buyerPhone: "+65 6000 1200",
    message: "Need chain-of-custody for 12 APAC sites, bilingual reports, Q4 start.",
    locale: "en",
    region: "Asia",
    premium: true,
    createdAt: "2026-09-11T09:30:00.000Z",
    redacted: false,
  },
  {
    id: "inq-3",
    listingId: "aaaaaaa4-4444-4333-8333-444444444444",
    listingSlug: "telemedicine-oncology-second-opinion",
    listingTitle: "Oncology second-opinion network for hospitals",
    organizationId: "11111111-1111-4111-8111-111111111111",
    buyerOrganization: "Nordic Oncology Network",
    buyerName: "Dr. Lena Hartmann",
    buyerEmail: "board@non.example",
    buyerPhone: "+49 30 000001",
    message: "Institution-to-institution tumour board capacity for Q1. B2B only.",
    locale: "de",
    region: "EU",
    premium: false,
    createdAt: "2026-09-11T10:15:00.000Z",
    redacted: false,
  },
];

export function redactInquiry(inquiry: ExchangeInquiry, plan: ExchangePlan): ExchangeInquiry {
  const access = entitlementsFor(plan);
  if (inquiry.premium && !access.premiumInquiries && plan !== "enterprise") {
    return {
      ...inquiry,
      buyerName: null,
      buyerEmail: null,
      buyerPhone: null,
      message: "Premium inquiry — available on Enterprise.",
      redacted: true,
    };
  }
  if (access.canSeeContacts) return { ...inquiry, redacted: false };
  return {
    ...inquiry,
    buyerName: null,
    buyerEmail: null,
    buyerPhone: null,
    message: inquiry.message.slice(0, 80).replace(/\S+@\S+/g, "[email]") + "…",
    redacted: true,
  };
}

export function listDemoInquiries(plan: ExchangePlan, organizationId?: string): ExchangeInquiry[] {
  const rows = organizationId
    ? DEMO_INQUIRIES.filter((item) => item.organizationId === organizationId)
    : DEMO_INQUIRIES;
  return rows.map((item) => redactInquiry(item, plan));
}
