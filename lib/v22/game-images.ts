import { isLegacyImageUrl, isPlaceholderImageUrl } from "@/lib/v25/images/legacy-images";
import {
  STUDY_GAME_IMAGE_FALLBACK,
  STUDY_GAME_IMAGE_SECTION,
  sigForStudyGameSlug,
} from "@/lib/v22/study-game-image-constants";

function pickQuizImageUrl(slug: string, registryUrl?: string | null): string {
  const url = registryUrl?.trim();
  if (url && !isLegacyImageUrl(url) && !isPlaceholderImageUrl(url)) return url;
  return `${STUDY_GAME_IMAGE_FALLBACK}${sigForStudyGameSlug(slug)}`;
}

/** Prefer v25 registry raster; never return v25.1 SVG placeholder render URLs. */
export async function resolveStudyGameImageUrl(slug: string): Promise<string> {
  const { loadImageReportAsync } = await import("@/lib/v25/images/persist");
  const report = await loadImageReportAsync();
  const reg = report?.images?.find((i) => i.section === STUDY_GAME_IMAGE_SECTION && i.slug === slug);
  return pickQuizImageUrl(slug, reg?.publicUrl);
}

export async function resolveStudyGameImageUrlSync(slug: string): Promise<string> {
  const { loadImageRegistryLocal } = await import("@/lib/v25/images/persist");
  const registry = loadImageRegistryLocal();
  const reg = registry.find((i) => i.section === STUDY_GAME_IMAGE_SECTION && i.slug === slug);
  return pickQuizImageUrl(slug, reg?.publicUrl);
}

/** @deprecated Use resolveStudyGameImageUrlSync */
export async function studyGameRenderUrl(slug: string): Promise<string> {
  return resolveStudyGameImageUrlSync(slug);
}

export { STUDY_GAME_IMAGE_FALLBACK, STUDY_GAME_IMAGE_SECTION } from "@/lib/v22/study-game-image-constants";
