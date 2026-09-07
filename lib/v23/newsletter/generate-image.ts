import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";
import {
  isUsableNewsletterImage,
  newsletterImageCaption,
  newsletterTopicCover,
} from "@/lib/v23/newsletter/topic-covers";

/** Lokální fallback — public/assets/newsletter/fallback.webp */
export const NEWSLETTER_IMAGE_FALLBACK = "/assets/newsletter/fallback.webp";

export type NewsletterImageSection =
  | "legislativa"
  | "leky"
  | "univerzity"
  | "studie"
  | "clanky"
  | "digital-health"
  | "doporucujeme";

const SECTION_FALLBACK: Record<NewsletterImageSection, string> = {
  legislativa: V21_MEDICAL_IMAGES.legislation,
  leky: V21_MEDICAL_IMAGES.drug,
  univerzity: V21_MEDICAL_IMAGES.university,
  studie: V21_MEDICAL_IMAGES.study,
  clanky: V21_MEDICAL_IMAGES.hero,
  "digital-health": "/assets/covers/tech.webp",
  doporucujeme: V21_MEDICAL_IMAGES.medicina,
};

function normalizeSection(section: string): NewsletterImageSection {
  const map: Record<string, NewsletterImageSection> = {
    legislativa: "legislativa",
    leky: "leky",
    univerzity: "univerzity",
    studie: "studie",
    clanky: "clanky",
    "digital-health": "digital-health",
    doporucujeme: "doporucujeme",
  };
  return map[section] ?? "doporucujeme";
}

/** Topic-matched local cover — no Unsplash, no dead stock. */
export function generateNewsletterImage(section: string, title: string): string {
  const key = normalizeSection(section);
  const fromTopic = newsletterTopicCover({
    sectionId: key,
    title,
    seed: `${key}-${title}`,
  });
  if (isUsableNewsletterImage(fromTopic)) return fromTopic;
  return SECTION_FALLBACK[key] ?? NEWSLETTER_IMAGE_FALLBACK;
}

export function newsletterImageAlt(sectionTitle: string, itemTitle: string): string {
  return newsletterImageCaption(sectionTitle, itemTitle);
}

export function resolveNewsletterItemImage(opts: {
  sectionId: string;
  sectionTitle: string;
  itemTitle: string;
  excerpt?: string | null;
  existingUrl?: string | null;
  index?: number;
}): { url: string; alt: string; isLocal: boolean } {
  const alt = newsletterImageAlt(opts.sectionTitle, opts.itemTitle);
  if (isUsableNewsletterImage(opts.existingUrl)) {
    return { url: opts.existingUrl!.trim(), alt, isLocal: !opts.existingUrl!.startsWith("http") || opts.existingUrl!.includes("/assets/") };
  }
  const generated = generateNewsletterImage(
    opts.sectionId,
    `${opts.itemTitle}-${opts.excerpt ?? ""}-${opts.index ?? 0}`
  );
  return { url: generated || NEWSLETTER_IMAGE_FALLBACK, alt, isLocal: true };
}

export function generateNewsletterSectionImage(sectionId: string, seed: string): string {
  return generateNewsletterImage(sectionId, `section-${seed}`);
}
