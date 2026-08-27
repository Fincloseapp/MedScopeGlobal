/**
 * Resolve article hero cover URLs for reading UX.
 * Food / meal lifestyle pieces often have mismatched clinical AI stock in v25-images —
 * prefer curated meal photography for those titles.
 */

import { CURATED_ASSET_POOL } from "./sources";

const FOOD_TITLE_RE =
  /tal[ií][rř]|st[rř]edo\s*mo[rř]|stredomorsk|kuchyn|strav|j[ií]dl|meal|diet|v[yý][zž]iv|sal[aá]t|olive|zelenin|protein|b[ií]lkovin|hydrat|pitn[eé]/i;

const CLINICAL_STOCK_RE =
  /\/v25-images\/|\/media\/v25-images\//i;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function isBrokenCoverUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes("placeholder") ||
    lower.includes("via.placeholder") ||
    lower.includes("placehold.co") ||
    lower.includes("checkerboard") ||
    (lower.endsWith(".svg") && lower.includes("empty"))
  );
}

function isFoodLifestyleTitle(title: string, slug?: string): boolean {
  const hay = `${title} ${slug ?? ""}`;
  return FOOD_TITLE_RE.test(hay);
}

function pickCuratedMealCover(seed: string): string {
  const meals = CURATED_ASSET_POOL.lifestyle.filter((c) =>
    c.keywords.some((k) =>
      /salad|meal|food|j[ií]dl|strav|nutrition|vegetables/i.test(k)
    )
  );
  const pool = meals.length ? meals : CURATED_ASSET_POOL.lifestyle;
  return pool[hashString(seed) % pool.length]!.url;
}

/**
 * Prefer topic-matched curated meal art when a food article still points at
 * generic clinical v25 stock (doctor-phone selfies, etc.).
 */
export function resolveArticleCoverUrl(input: {
  title: string;
  slug?: string;
  coverImageUrl?: string | null;
}): string | null {
  const raw = input.coverImageUrl?.trim() || null;
  if (isBrokenCoverUrl(raw)) return null;

  if (
    raw &&
    isFoodLifestyleTitle(input.title, input.slug) &&
    CLINICAL_STOCK_RE.test(raw)
  ) {
    return pickCuratedMealCover(input.slug || input.title);
  }

  return raw;
}
