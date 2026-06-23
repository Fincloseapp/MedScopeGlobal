/** Curated European medical stock — white-gloved hands, clinical settings. */
const CURATED_PHOTOS: Record<string, string> = {
  medicina:
    "https://images.unsplash.com/photo-1584515930387-285e4804f4cb?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  study:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  hero:
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  university:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  verejnost:
    "https://images.unsplash.com/photo-1584515930387-285e4804f4cb?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
};

const TOPIC_MODULE: Record<string, keyof typeof CURATED_PHOTOS> = {
  "zivotni-styl": "medicina",
  nemoci: "study",
  prevence: "hero",
  rozhovory: "university",
};

function sigForSlug(slug: string): string {
  const n = Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 999);
  return `&sig=${n}`;
}

function isProductionCover(url: string): boolean {
  if (/\.svg(\?|$)/i.test(url)) return false;
  if (/\/api\/v25\/images\/render/i.test(url)) return false;
  if (/Neutral\s*·\s*European/i.test(url)) return false;
  if (/supabase\.co\/storage\/v1\/object\/public\/media\/v25-images\/.*\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)) {
    return true;
  }
  if (/unsplash\.com/i.test(url)) return true;
  return false;
}

export function resolveVerejnostCoverUrl(article: {
  slug: string;
  cover_image_url?: string | null;
  public_topic?: string | null;
}): string {
  const url = article.cover_image_url?.trim();
  if (url && isProductionCover(url)) return url;

  const topic = article.public_topic ?? "zivotni-styl";
  const coverModule = TOPIC_MODULE[topic] ?? "verejnost";
  const base = CURATED_PHOTOS[coverModule] ?? CURATED_PHOTOS.verejnost;
  return `${base}${sigForSlug(article.slug)}`;
}
