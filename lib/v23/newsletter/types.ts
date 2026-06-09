export type V23NewsletterItem = {
  title: string;
  summary: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type V23NewsletterSection = {
  id: string;
  title: string;
  intro: string;
  imageUrl: string;
  imageAlt: string;
  items: V23NewsletterItem[];
};

export type V23NewsletterSourcesSnapshot = {
  studies: number;
  articles: number;
  legislation: number;
  digitalHealth: number;
  drugs: number;
  universities: number;
  pendingTopics: number;
};

export type V23NewsletterLayout = {
  version: "v23.1" | "v23.1.1" | "v23.1.2" | "v23.1.3";
  heroImageUrl: string;
  heroImageAlt: string;
  headline: string;
  intro: string;
  sections: V23NewsletterSection[];
  recommended: V23NewsletterItem[];
  manualTopics: string[];
  sourcesSnapshot?: V23NewsletterSourcesSnapshot;
  generatedAt: string;
};

export const V23_NEWSLETTER_SECTION_IDS = [
  "studie",
  "clanky",
  "legislativa",
  "digital-health",
  "leky",
  "univerzity",
  "doporucujeme",
] as const;
