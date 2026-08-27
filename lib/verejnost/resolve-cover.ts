import { hasBadUnsplashId } from "@/lib/v25/images/bad-unsplash-ids";
import {
  classifyCoverTopic,
  pickCuratedCover,
  resolveArticleCoverUrl,
} from "@/lib/ecosystem/editorial/images/cover";

/** Curated European medical stock — clinical hands, equipment, no portraits. */
const CURATED_PHOTOS: Record<string, string> = {
  medicina: "/assets/covers/clinical.webp",
  study: "/assets/covers/research.webp",
  hero: "/assets/covers/vitals.webp",
  university: "/assets/covers/clinical-2.webp",
  verejnost: "/assets/covers/clinical.webp",
};

const TOPIC_MODULE: Record<string, keyof typeof CURATED_PHOTOS> = {
  "zivotni-styl": "medicina",
  nemoci: "study",
  prevence: "hero",
  rozhovory: "university",
};

function isProductionCover(url: string): boolean {
  if (/\.svg(\?|$)/i.test(url)) return false;
  if (/\/api\/v25\/images\/render/i.test(url)) return false;
  if (/Neutral\s*·\s*European/i.test(url)) return false;
  if (hasBadUnsplashId(url)) return false;
  if (/\/assets\/covers\//i.test(url)) return true;
  if (/supabase\.co\/storage\/v1\/object\/public\/media\/v25-images\/.*\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)) {
    // v25 stock is heavily duplicated — display layer rewrites via resolveArticleCoverUrl
    return false;
  }
  if (/unsplash\.com/i.test(url)) return false;
  return false;
}

export function resolveVerejnostCoverUrl(article: {
  slug: string;
  title?: string | null;
  excerpt?: string | null;
  cover_image_url?: string | null;
  public_topic?: string | null;
}): string {
  const resolved = resolveArticleCoverUrl({
    title: article.title ?? article.slug,
    slug: article.slug,
    excerpt: article.excerpt,
    publicTopic: article.public_topic,
    coverImageUrl: article.cover_image_url,
    preferCurated: true,
  });
  if (resolved) return resolved;

  const url = article.cover_image_url?.trim();
  if (url && isProductionCover(url)) return url;

  const topic = article.public_topic ?? "zivotni-styl";
  const coverModule = TOPIC_MODULE[topic] ?? "verejnost";
  const visual = classifyCoverTopic({
    title: article.title,
    slug: article.slug,
    publicTopic: article.public_topic,
  });
  return (
    CURATED_PHOTOS[coverModule] ??
    pickCuratedCover(visual, article.slug)
  );
}
