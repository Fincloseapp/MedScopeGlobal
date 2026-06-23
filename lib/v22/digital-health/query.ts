import { getDigitalHealthList } from "@/lib/queries/v4c/digital-health";
import { getCached, setCached, cacheKey } from "@/lib/v20/server-cache";
import { V22_DIGITAL_HEALTH_ARTICLES, getV22DigitalHealthBySlug } from "@/lib/v22/digital-health/curated";
import { enrichDigitalHealthRow } from "@/lib/v22/digital-health/enrich";
import type { V22DigitalHealthArticle } from "@/lib/v22/digital-health/types";
import { isEnglishDominant } from "@/lib/v21/enrich";

const TTL = 120_000;

function isValidArticle(a: V22DigitalHealthArticle): boolean {
  return a.title.length > 10 && a.summaryCs.length > 40 && !isEnglishDominant(a.summaryCs);
}

export async function getV22DigitalHealthList(limit = 12): Promise<V22DigitalHealthArticle[]> {
  const ck = cacheKey({ route: "v22-dh-list", limit });
  const hit = getCached<V22DigitalHealthArticle[]>(ck, TTL);
  if (hit) return hit;

  const rows = await getDigitalHealthList(limit * 2);
  const curatedSlugs = new Set(V22_DIGITAL_HEALTH_ARTICLES.map((a) => a.slug));
  const enriched = rows
    .filter((r) => !curatedSlugs.has(r.slug))
    .map(enrichDigitalHealthRow)
    .filter(isValidArticle);

  const merged = [...V22_DIGITAL_HEALTH_ARTICLES, ...enriched].slice(0, limit);
  setCached(ck, merged);
  return merged;
}

export async function getV22DigitalHealthArticle(slug: string): Promise<V22DigitalHealthArticle | null> {
  const curated = getV22DigitalHealthBySlug(slug);
  if (curated) return curated;

  const ck = cacheKey({ route: "v22-dh-slug", slug });
  const hit = getCached<V22DigitalHealthArticle>(ck, TTL);
  if (hit) return hit;

  const { getDigitalHealthBySlug } = await import("@/lib/queries/v4c/digital-health");
  const row = await getDigitalHealthBySlug(slug);
  if (!row) return null;
  const article = enrichDigitalHealthRow(row);
  if (!isValidArticle(article)) return null;
  setCached(ck, article);
  return article;
}
