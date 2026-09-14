export type MarketplaceKind = "offer" | "demand" | "question";
export type MarketplaceStatus = "visible" | "answered" | "rejected";
export type MarketplaceSource = "form" | "email" | "paid" | "sample" | "catalog" | "loop";

export type MarketplaceListing = {
  id: string;
  kind: MarketplaceKind;
  status: MarketplaceStatus;
  company: string;
  title: string;
  summary: string;
  category: string | null;
  region: string | null;
  cert: string | null;
  contact_name: string | null;
  contact_email: string | null;
  phone: string | null;
  source: MarketplaceSource;
  auto_replied_at: string | null;
  reply_topic: string | null;
  published_at: string | null;
  created_at: string;
};

export type MarketplaceMessage = {
  id: string;
  listing_id: string | null;
  direction: "inbound" | "outbound";
  from_email: string | null;
  to_email: string | null;
  subject: string | null;
  body: string | null;
  topic: string | null;
  created_at: string;
};

export type MarketplacePublicCard = {
  id: string;
  kind: "offer" | "demand";
  title: string;
  summary: string;
  category: string;
  region: string;
  cert: string;
  companyLabel: string;
  badge: string;
  href?: string;
  image?: string;
  contactHidden: boolean;
  sample?: boolean;
};

export type MarketplaceBoard = {
  offers: MarketplacePublicCard[];
  demands: MarketplacePublicCard[];
  inbox: string;
};

export type MarketplaceMailHealth = {
  ready: boolean;
  transport: "cloudflare" | "sendgrid" | "smtp" | "none";
  resend: boolean;
  inbox: string;
  adminNotify: string;
};

export type MarketplaceIntakeInput = {
  kind: MarketplaceKind;
  company: string;
  title: string;
  summary: string;
  category?: string;
  region?: string;
  cert?: string;
  contactName?: string;
  contactEmail: string;
  phone?: string;
  source: "form" | "email" | "loop";
};
