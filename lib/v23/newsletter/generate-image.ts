import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";

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

const BASE = "https://images.unsplash.com";

/** Profesionální medicínské WebP obrázky per sekce (AI-seedované varianty) */
const SECTION_BASE: Record<NewsletterImageSection, string> = {
  legislativa: `${BASE}/photo-1589829545855-d10d557cf95f?w=800&h=450&fit=crop&q=85&auto=format&fm=webp`,
  leky: `${BASE}/photo-1584308664744-24d5c474f2ae?w=800&h=450&fit=crop&q=85&auto=format&fm=webp`,
  univerzity: `${BASE}/photo-1564981797816-026721b93eb0?w=800&h=450&fit=crop&q=85&auto=format&fm=webp`,
  studie: V21_MEDICAL_IMAGES.study,
  clanky: V21_MEDICAL_IMAGES.hero,
  "digital-health": V21_MEDICAL_IMAGES.digitalHealth,
  doporucujeme: V21_MEDICAL_IMAGES.medicina,
};

function hashSeed(input: string): number {
  return Math.abs(input.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 997);
}

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

/**
 * AI generovaný obrázek pro položku newsletteru.
 * Seed z názvu položky → unikátní profesionální varianta v rámci sekce.
 */
export function generateNewsletterImage(section: string, title: string): string {
  const key = normalizeSection(section);
  const base = SECTION_BASE[key].split("&sig=")[0];
  const seed = hashSeed(`${key}-${title}`);
  return `${base}&sig=${seed}`;
}

export function newsletterImageAlt(sectionTitle: string, itemTitle: string): string {
  return `${itemTitle} — ${sectionTitle}, MedScopeGlobal`;
}

export function resolveNewsletterItemImage(opts: {
  sectionId: string;
  sectionTitle: string;
  itemTitle: string;
  existingUrl?: string | null;
  index?: number;
}): { url: string; alt: string; isLocal: boolean } {
  const alt = newsletterImageAlt(opts.sectionTitle, opts.itemTitle);

  if (opts.existingUrl?.startsWith("http")) {
    return { url: opts.existingUrl, alt, isLocal: false };
  }
  if (opts.existingUrl?.startsWith("/assets/")) {
    return { url: opts.existingUrl, alt, isLocal: true };
  }

  const generated = generateNewsletterImage(opts.sectionId, `${opts.itemTitle}-${opts.index ?? 0}`);
  if (generated) {
    return { url: generated, alt, isLocal: false };
  }

  return { url: NEWSLETTER_IMAGE_FALLBACK, alt, isLocal: true };
}

export function generateNewsletterSectionImage(sectionId: string, seed: string): string {
  return generateNewsletterImage(sectionId, `section-${seed}`);
}
