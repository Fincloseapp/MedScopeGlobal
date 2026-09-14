/** Autonomous B2B sales department — shared types. */

import type { SalesControlFinding } from "@/lib/sales/control";

export const SALES_STAGES = [
  "identified",
  "qualified",
  "outreach_queued",
  "contacted",
  "engaged",
  "offered",
  "negotiating",
  "contract_sent",
  "won",
  "fulfilling",
  "renewing",
  "past_due",
  "paused",
  "lost",
  "suppressed",
] as const;

export type SalesStage = (typeof SALES_STAGES)[number];

export const LEGAL_BASES = [
  "inquiry",
  "consent",
  "customer",
  "legitimate_interest",
  "none",
  "unverified_guess",
] as const;

export type SalesLegalBasis = (typeof LEGAL_BASES)[number];

export const CONTRACT_STATUSES = [
  "draft",
  "pending_payment",
  "active",
  "past_due",
  "paused",
  "cancelled",
  "expired",
] as const;

export type SalesContractStatus = (typeof CONTRACT_STATUSES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "sent",
  "paid",
  "overdue",
  "void",
] as const;

export type SalesInvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const OUTREACH_STATUSES = [
  "draft",
  "queued",
  "needs_approval",
  "approved",
  "sent",
  "skipped_legal",
  "failed",
  "replied",
] as const;

export type SalesOutreachStatus = (typeof OUTREACH_STATUSES)[number];

export const INQUIRY_STATUSES = [
  "received",
  "forwarded",
  "held_unpaid",
  "fulfilled",
  "overdue",
] as const;

export type SalesInquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type SalesAudience = "public" | "professional" | "both";

export type SalesIcpSector =
  | "clinic"
  | "pharmacy"
  | "medtech"
  | "diagnostics"
  | "pharma_otc"
  | "pharma_rx"
  | "education"
  | "congress"
  | "digital_health"
  | "lab"
  | "insurance"
  | "publisher";

export type SalesPackageId = "start" | "visible" | "magazine" | "clinical" | "partner";

export type SalesPackage = {
  id: SalesPackageId;
  name: string;
  tagline: string;
  priceCzkMonth: number;
  highlighted?: boolean;
  audience: SalesAudience;
  placements: string[];
  newsletter?: "header" | "mid" | "footer" | null;
  directory: boolean;
  dedicatedLanding: boolean;
  inquiryForward: boolean;
  slaHours: number | null;
  monthlyReport: boolean;
  sponsoredMention: boolean;
  features: string[];
};

export type SalesProspect = {
  id: string;
  company: string;
  slug: string;
  website: string | null;
  email: string | null;
  contact_name: string | null;
  phone: string | null;
  ico: string | null;
  dic: string | null;
  address: string | null;
  sector: SalesIcpSector;
  country: string;
  stage: SalesStage;
  legal_basis: SalesLegalBasis;
  score: number;
  notes: string | null;
  source: string;
  outreach_count: number;
  last_contacted_at: string | null;
  next_touch_at: string | null;
  approved_outreach_at: string | null;
  suppressed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesContract = {
  id: string;
  prospect_id: string;
  package_id: SalesPackageId;
  status: SalesContractStatus;
  monthly_czk: number;
  currency: string;
  period_start: string | null;
  period_end: string | null;
  offer_text: string | null;
  creative_url: string | null;
  target_url: string | null;
  landing_slug: string;
  portal_token: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_checkout_url: string | null;
  ads_ids: string[];
  paid_months: number;
  paid_total_czk: number;
  last_paid_at: string | null;
  grace_until: string | null;
  cancel_at: string | null;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesOutreach = {
  id: string;
  prospect_id: string;
  contract_id: string | null;
  status: SalesOutreachStatus;
  template: string;
  subject: string;
  body_html: string;
  legal_basis: SalesLegalBasis;
  skip_reason: string | null;
  sent_at: string | null;
  created_at: string;
};

export type SalesInvoice = {
  id: string;
  contract_id: string;
  prospect_id: string;
  number: string;
  variable_symbol: string;
  status: SalesInvoiceStatus;
  amount_czk: number;
  period_start: string;
  period_end: string;
  issued_at: string;
  due_at: string;
  paid_at: string | null;
  sent_at: string | null;
  payment_method: string | null;
  stripe_invoice_id: string | null;
  created_at: string;
};

export type SalesInquiry = {
  id: string;
  contract_id: string | null;
  prospect_id: string | null;
  landing_slug: string;
  company_name: string;
  sender_name: string;
  sender_email: string;
  message: string;
  status: SalesInquiryStatus;
  forwarded_at: string | null;
  sla_due_at: string | null;
  created_at: string;
};

export type SalesRun = {
  id: string;
  started_at: string;
  finished_at: string | null;
  ok: boolean;
  summary: Record<string, unknown>;
  error: string | null;
};

export type SalesTickResult = {
  ok: boolean;
  schemaOk: boolean;
  db: boolean;
  seeded: number;
  ingested: number;
  queued: number;
  sent: number;
  skippedLegal: number;
  invoicesIssued: number;
  invoicesSent: number;
  fulfilled: number;
  inquiriesForwarded: number;
  paused: number;
  errors: string[];
  startedAt: string;
  finishedAt: string;
  control: SalesControlFinding[];
};

export type SalesSnapshot = {
  generatedAt: string;
  db: boolean;
  schemaOk: boolean;
  kpis: {
    prospects: number;
    inPipeline: number;
    activeAdvertisers: number;
    pendingPayment: number;
    mrrCzk: number;
    paidThisMonthCzk: number;
    unpaidCzk: number;
    inquiriesThisMonth: number;
    forwardedThisMonth: number;
    outreachQueued: number;
    outreachNeedsApproval: number;
  };
  byStage: { stage: SalesStage; count: number }[];
  packages: SalesPackage[];
  prospects: SalesProspect[];
  contracts: Array<
    SalesContract & {
      company: string;
      email: string | null;
      inquiryCount: number;
      lastInvoiceStatus: SalesInvoiceStatus | null;
    }
  >;
  outreach: Array<SalesOutreach & { company: string; email: string | null }>;
  invoices: Array<SalesInvoice & { company: string }>;
  inquiries: Array<SalesInquiry & { advertiser: string }>;
  runs: SalesRun[];
  marketplace: {
    listings: Array<{
      id: string;
      kind: string;
      status: string;
      company: string;
      title: string;
      source: string;
      contact_email: string | null;
      auto_replied_at: string | null;
      created_at: string;
    }>;
    mail: {
      ready: boolean;
      transport: "cloudflare" | "sendgrid" | "smtp" | "none";
      resend: boolean;
      inbox: string;
      adminNotify: string;
    };
    control: SalesControlFinding[];
  };
  legal: {
    coldAutoSend: boolean;
    maxTouches: number;
    maxEmailsPerRun: number;
    termsPath: string;
    privacyPath: string;
    unsubscribePath: string;
  };
};
