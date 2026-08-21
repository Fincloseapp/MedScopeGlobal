/**
 * Cover URL for news desks: keep a real raster when present, otherwise a topic fallback.
 * Native <img> (SafeArticleImage) — do not rely on Next image optimization on Workers.
 */
import { MARKETING_VISUALS } from "@/lib/brand/marketing-visuals";
import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";
import { isLegacyImageUrl, isPlaceholderImageUrl } from "@/lib/v25/images/legacy-images";

type CoverHint = {
  title?: string | null;
  category?: string | null;
  excerpt?: string | null;
  coverUrl?: string | null;
};

function blob(hint: CoverHint): string {
  return `${hint.title ?? ""} ${hint.category ?? ""} ${hint.excerpt ?? ""}`.toLowerCase();
}

function isUsableCover(url?: string | null): url is string {
  const value = url?.trim();
  if (!value) return false;
  if (value.startsWith("/assets/")) return true;
  if (isPlaceholderImageUrl(value) || isLegacyImageUrl(value)) return false;
  return /^https?:\/\//i.test(value);
}

export function resolveTopicFallbackCover(hint: CoverHint): string {
  const text = blob(hint);
  if (/dlouhověk|dlouhovek|longevity|healthspan|stárnut|starnut|spánek|spanek/.test(text)) {
    return MARKETING_VISUALS.medipacient;
  }
  if (/novink|zpráv|zprav|ema\b|súkl|sukl|epidem|who\b/.test(text)) {
    return MARKETING_VISUALS.mediktor;
  }
  if (/veřejn|verejn|prevenc|životní|zivotni|pacient/.test(text)) {
    return MARKETING_VISUALS.medipacient;
  }
  if (/příprav|priprav|studium|univerzit|přijímač|prijimac/.test(text)) {
    return MARKETING_VISUALS.mediprep;
  }
  if (/lék|lek\b|farmak|spc\b/.test(text)) {
    return V21_MEDICAL_IMAGES.drug;
  }
  return MARKETING_VISUALS.mediprep;
}

export function resolveDisplayCover(hint: CoverHint): string {
  if (isUsableCover(hint.coverUrl)) return hint.coverUrl.trim();
  return resolveTopicFallbackCover(hint);
}
