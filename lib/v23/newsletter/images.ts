import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import {
  generateNewsletterImage,
  generateNewsletterSectionImage,
  NEWSLETTER_IMAGE_FALLBACK,
  newsletterImageAlt,
  resolveNewsletterItemImage,
} from "@/lib/v23/newsletter/generate-image";
import type { V23NewsletterItem, V23NewsletterLayout, V23NewsletterSection } from "@/lib/v23/newsletter/types";

export { generateNewsletterImage, NEWSLETTER_IMAGE_FALLBACK, newsletterImageAlt, resolveNewsletterItemImage };

/** Sekce s povinným obrázkem u každé položky */
export const V23_ITEM_IMAGE_SECTIONS = new Set(["legislativa", "leky", "univerzity"]);

function hashSeed(input: string): number {
  return Math.abs(input.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 997);
}

export function heroNewsletterImage(seed: string): string {
  return `${V23_NEWSLETTER_IMAGE.split("&sig=")[0]}&sig=${hashSeed(`hero-${seed}`)}`;
}

export function sectionImageUrl(sectionId: string, seed: string): string {
  try {
    return generateNewsletterSectionImage(sectionId, seed);
  } catch {
    return NEWSLETTER_IMAGE_FALLBACK;
  }
}

export function itemImageUrl(sectionId: string, itemTitle: string, index = 0): string {
  return resolveNewsletterItemImage({
    sectionId,
    sectionTitle: sectionId,
    itemTitle,
    index,
  }).url;
}

export function itemImageAlt(sectionTitle: string, itemTitle: string): string {
  return newsletterImageAlt(sectionTitle, itemTitle);
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  return url.startsWith("https://") || url.startsWith("http://") || url.startsWith("/assets/");
}

export function attachItemImages(sectionId: string, items: V23NewsletterItem[], sectionTitle: string): V23NewsletterItem[] {
  if (!V23_ITEM_IMAGE_SECTIONS.has(sectionId)) return items;
  return items.map((item, i) => {
    const resolved = resolveNewsletterItemImage({
      sectionId,
      sectionTitle,
      itemTitle: item.title,
      existingUrl: item.imageUrl,
      index: i,
    });
    return {
      ...item,
      imageUrl: isValidImageUrl(item.imageUrl) ? item.imageUrl! : resolved.url,
      imageAlt: item.imageAlt ?? resolved.alt,
    };
  });
}

export function attachSectionImages(
  sections: Omit<V23NewsletterSection, "imageUrl" | "imageAlt">[],
  issueDate: string
): V23NewsletterSection[] {
  return sections.map((s) => {
    const seed = `${s.id}-${issueDate}`;
    const items = attachItemImages(s.id, s.items, s.title);
    return {
      ...s,
      items,
      imageUrl: sectionImageUrl(s.id, seed),
      imageAlt: `${s.title} — MedScopeGlobal Newsletter`,
    };
  });
}

export function ensureLayoutImages(layout: V23NewsletterLayout, issueDate: string): V23NewsletterLayout {
  const sections = attachSectionImages(
    layout.sections.map((s) => ({
      id: s.id,
      title: s.title,
      intro: s.intro,
      items: s.items,
    })),
    issueDate
  );

  return {
    ...layout,
    heroImageUrl: isValidImageUrl(layout.heroImageUrl) ? layout.heroImageUrl : heroNewsletterImage(issueDate),
    heroImageAlt: layout.heroImageAlt ?? "MedScopeGlobal Newsletter — odborný medicínský přehled",
    sections,
  };
}
