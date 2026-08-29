import {
  ALLOWED_UNSPLASH_IDS,
  hasBannedCoverId,
  isBannedCoverUrl,
  resolveEditorialCover,
} from "@/lib/editorial/image-policy";

function isAllowedUnsplash(url: string): boolean {
  if (hasBannedCoverId(url)) return false;
  return ALLOWED_UNSPLASH_IDS.some((id) => url.includes(id));
}

function isProductionCover(url: string): boolean {
  if (isBannedCoverUrl(url)) return false;
  if (/\.svg(\?|$)/i.test(url)) return false;
  if (/\/api\/v25\/images\/render/i.test(url)) return false;
  if (/Neutral\s*·\s*European/i.test(url)) return false;
  if (/\/assets\/(covers|medscopeglobal|magazine|ai|marketing)\//i.test(url)) return true;
  if (
    /supabase\.co\/storage\/v1\/object\/public\/media\/v25-images\/.*\.(jpg|jpeg|png|webp)(\?|$)/i.test(
      url
    )
  ) {
    return true;
  }
  if (/unsplash\.com/i.test(url)) return isAllowedUnsplash(url);
  return false;
}

export function resolveVerejnostCoverUrl(article: {
  slug: string;
  cover_image_url?: string | null;
  public_topic?: string | null;
  title?: string | null;
  excerpt?: string | null;
}): string {
  const url = article.cover_image_url?.trim();
  const gated = url && isProductionCover(url) ? url : null;
  return resolveEditorialCover({
    coverUrl: gated,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    public_topic: article.public_topic,
  });
}
