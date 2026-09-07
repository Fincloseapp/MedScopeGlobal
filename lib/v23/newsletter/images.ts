import { MAGAZINE } from "@/lib/brand/magazine";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import {
  generateNewsletterImage,
  generateNewsletterSectionImage,
  NEWSLETTER_IMAGE_FALLBACK,
  newsletterImageAlt,
  resolveNewsletterItemImage,
} from "@/lib/v23/newsletter/generate-image";
import { isUsableNewsletterImage } from "@/lib/v23/newsletter/topic-covers";
import type { V23NewsletterItem, V23NewsletterLayout, V23NewsletterSection } from "@/lib/v23/newsletter/types";

export { generateNewsletterImage, NEWSLETTER_IMAGE_FALLBACK, newsletterImageAlt, resolveNewsletterItemImage };

/** Každá rubrika vydání má diplomatický lokální obrázek u položky. */
export const V23_ITEM_IMAGE_SECTIONS = new Set([
  "legislativa",
  "leky",
  "univerzity",
  "studie",
  "clanky",
  "digital-health",
  "doporucujeme",
]);

export function heroNewsletterImage(_seed: string): string {
  return isUsableNewsletterImage(V23_NEWSLETTER_IMAGE)
    ? V23_NEWSLETTER_IMAGE
    : NEWSLETTER_IMAGE_FALLBACK;
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

export function attachItemImages(sectionId: string, items: V23NewsletterItem[], sectionTitle: string): V23NewsletterItem[] {
  return items.map((item, i) => {
    const resolved = resolveNewsletterItemImage({
      sectionId,
      sectionTitle,
      itemTitle: item.title,
      excerpt: item.summary,
      existingUrl: item.imageUrl,
      index: i,
    });
    return {
      ...item,
      imageUrl: resolved.url,
      imageAlt: item.imageAlt ?? resolved.alt,
    };
  });
}

export function attachSectionImages(
  sections: Array<Omit<V23NewsletterSection, "imageUrl" | "imageAlt"> & Partial<Pick<V23NewsletterSection, "imageUrl" | "imageAlt">>>,
  issueDate: string
): V23NewsletterSection[] {
  return sections.map((s) => {
    const seed = `${s.id}-${issueDate}`;
    const items = attachItemImages(s.id, s.items, s.title);
    return {
      ...s,
      items,
      imageUrl: isUsableNewsletterImage(s.imageUrl) ? s.imageUrl! : sectionImageUrl(s.id, seed),
      imageAlt: s.imageAlt ?? `${s.title} — ${MAGAZINE.name}`,
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
      imageUrl: s.imageUrl,
      imageAlt: s.imageAlt,
    })),
    issueDate
  );

  return {
    ...layout,
    heroImageUrl: isUsableNewsletterImage(layout.heroImageUrl)
      ? layout.heroImageUrl
      : heroNewsletterImage(issueDate),
    heroImageAlt: layout.heroImageAlt ?? `${MAGAZINE.name} — ${MAGAZINE.positioning.en}`,
    sections,
    recommended: attachItemImages(
      "doporucujeme",
      layout.recommended ?? [],
      MAGAZINE.name
    ),
  };
}
