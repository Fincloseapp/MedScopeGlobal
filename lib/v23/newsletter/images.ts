import { V21_MEDICAL_IMAGES, v21ImageForModule } from "@/lib/v21/images";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import type { V23NewsletterItem, V23NewsletterLayout, V23NewsletterSection } from "@/lib/v23/newsletter/types";

const BASE = "https://images.unsplash.com";

/** Ověřené WebP obrázky pro newsletter sekce (legislativa / léky / univerzity) */
export const V23_NEWSLETTER_SECTION_IMAGES: Record<string, string> = {
  studie: V21_MEDICAL_IMAGES.study,
  clanky: V21_MEDICAL_IMAGES.hero,
  legislativa: `${BASE}/photo-1589829545855-d10d557cf95f?w=800&h=450&fit=crop&q=85&auto=format&fm=webp`,
  "digital-health": V21_MEDICAL_IMAGES.digitalHealth,
  leky: `${BASE}/photo-1584308664744-24d5c474f2ae?w=800&h=450&fit=crop&q=85&auto=format&fm=webp`,
  univerzity: `${BASE}/photo-1564981797816-026721b93eb0?w=800&h=450&fit=crop&q=85&auto=format&fm=webp`,
  doporucujeme: V21_MEDICAL_IMAGES.medicina,
};

const SECTION_MODULE: Record<string, keyof typeof V21_MEDICAL_IMAGES> = {
  studie: "study",
  clanky: "hero",
  legislativa: "legislation",
  "digital-health": "digitalHealth",
  leky: "drug",
  univerzity: "university",
  doporucujeme: "medicina",
};

/** Sekce s povinným obrázkem u každé položky */
export const V23_ITEM_IMAGE_SECTIONS = new Set(["legislativa", "leky", "univerzity"]);

function hashSeed(input: string): number {
  return Math.abs(input.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 997);
}

export function sectionImageUrl(sectionId: string, seed: string): string {
  const dedicated = V23_NEWSLETTER_SECTION_IMAGES[sectionId];
  if (dedicated) return `${dedicated.split("&sig=")[0]}&sig=${hashSeed(`${sectionId}-${seed}`)}`;
  const key = SECTION_MODULE[sectionId] ?? "hero";
  return v21ImageForModule(key, `${sectionId}-${seed}`);
}

export function heroNewsletterImage(seed: string): string {
  return `${V23_NEWSLETTER_IMAGE.split("&sig=")[0]}&sig=${hashSeed(`hero-${seed}`)}`;
}

export function itemImageUrl(sectionId: string, itemTitle: string, index = 0): string {
  const base =
    V23_NEWSLETTER_SECTION_IMAGES[sectionId] ??
    v21ImageForModule(SECTION_MODULE[sectionId] ?? "hero", sectionId);
  const clean = base.split("&sig=")[0];
  return `${clean}&sig=${hashSeed(`${sectionId}-${itemTitle}-${index}`)}`;
}

export function itemImageAlt(sectionTitle: string, itemTitle: string): string {
  return `${itemTitle} — ${sectionTitle}, MedScopeGlobal`;
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  return url.startsWith("https://") || url.startsWith("http://");
}

export function attachItemImages(sectionId: string, items: V23NewsletterItem[], sectionTitle: string): V23NewsletterItem[] {
  if (!V23_ITEM_IMAGE_SECTIONS.has(sectionId)) return items;
  return items.map((item, i) => ({
    ...item,
    imageUrl: isValidImageUrl(item.imageUrl) ? item.imageUrl! : itemImageUrl(sectionId, item.title, i),
    imageAlt: item.imageAlt ?? itemImageAlt(sectionTitle, item.title),
  }));
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
