import {
  classifyCoverTopic,
  isBrokenCoverUrl,
  isDeniedStockUrl,
  pickCuratedCover,
  type CoverVisualTopic,
} from "@/lib/ecosystem/editorial/images/cover";
import { MAGAZINE } from "@/lib/brand/magazine";

const SKINCARE_RE =
  /spf|retinoid|ple[tť]|kosmetik|hautpflege|skincare|dermocosm|soin de la peau|bari[eé]r|fotoprotek|lichtschutz/i;

const SECTION_TOPIC: Record<string, CoverVisualTopic> = {
  legislativa: "research",
  leky: "clinical",
  univerzity: "research",
  studie: "research",
  clanky: "calm",
  "digital-health": "tech",
  doporucujeme: "calm",
};

export function isUsableNewsletterImage(url?: string | null): boolean {
  const value = String(url ?? "").trim();
  if (!value) return false;
  if (isBrokenCoverUrl(value) || isDeniedStockUrl(value)) return false;
  if (/unsplash\.com|images\.unsplash/i.test(value)) return false;
  if (/^\/assets\/(covers|magazine|newsletter|marketing)\//i.test(value)) return true;
  if (/\/assets\/(covers|magazine|newsletter|marketing)\//i.test(value)) return true;
  return false;
}

/** Rewrite leftover Unsplash / denied stock in stored HTML so fallback markup stays local. */
export function remapNewsletterHtmlImages(html: string): string {
  return html.replace(/<img\b([^>]*?)>/gi, (full, attrs: string) => {
    const src = /src=["']([^"']+)["']/i.exec(attrs)?.[1];
    if (isUsableNewsletterImage(src)) return full;
    const alt = /alt=["']([^"']*)["']/i.exec(attrs)?.[1] ?? "";
    const url = newsletterTopicCover({ title: alt, seed: alt || src || "nl" });
    if (/src=["'][^"']+["']/i.test(attrs)) {
      return `<img${attrs.replace(/src=["'][^"']+["']/i, `src="${url}"`)}>`;
    }
    return `<img src="${url}"${attrs}>`;
  });
}

export function newsletterVisualTopic(input: {
  sectionId?: string | null;
  title?: string | null;
  excerpt?: string | null;
  publicTopic?: string | null;
}): CoverVisualTopic {
  const title = String(input.title ?? "");
  if (SKINCARE_RE.test(title) || SKINCARE_RE.test(String(input.excerpt ?? ""))) {
    return "skincare";
  }
  const classified = classifyCoverTopic({
    title,
    slug: title,
    excerpt: input.excerpt,
    publicTopic: input.publicTopic,
  });
  if (classified === "skincare") return "skincare";
  if (classified !== "research" || !input.sectionId) return classified;
  return SECTION_TOPIC[input.sectionId] ?? classified;
}

export function newsletterTopicCover(input: {
  sectionId?: string | null;
  title?: string | null;
  excerpt?: string | null;
  publicTopic?: string | null;
  seed?: string | null;
}): string {
  const title = String(input.title ?? "");
  const excerpt = String(input.excerpt ?? "");
  if (SKINCARE_RE.test(title) || SKINCARE_RE.test(excerpt)) {
    return "/assets/covers/skincare.webp";
  }
  const topic = newsletterVisualTopic(input);
  const seed = String(input.seed ?? input.title ?? input.sectionId ?? "week");
  return pickCuratedCover(topic, seed);
}

export function newsletterImageCaption(sectionTitle: string, itemTitle?: string | null): string {
  const item = String(itemTitle ?? "").trim();
  if (item) return `${item} — ${sectionTitle}, ${MAGAZINE.name}`;
  return `${sectionTitle} — ${MAGAZINE.name}`;
}
