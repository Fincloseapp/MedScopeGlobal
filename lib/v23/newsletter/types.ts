export type V23NewsletterItem = {
  title: string;
  summary: string;
  href?: string;
};

export type V23NewsletterSection = {
  id: string;
  title: string;
  intro: string;
  imageUrl: string;
  imageAlt: string;
  items: V23NewsletterItem[];
};

export type V23NewsletterLayout = {
  version: "v23.1";
  heroImageUrl: string;
  heroImageAlt: string;
  headline: string;
  intro: string;
  sections: V23NewsletterSection[];
  recommended: V23NewsletterItem[];
  manualTopics: string[];
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
