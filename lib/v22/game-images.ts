import { loadImageRegistryLocal, loadImageReportAsync } from "@/lib/v25/images/persist";
import { isLegacyImageUrl, isPlaceholderImageUrl } from "@/lib/v25/images/legacy-images";

/** v25 image section for study games and medicina/hry quizzes. */
export const STUDY_GAME_IMAGE_SECTION = "quizzes";

/** Curated European medical study photo (white-gloved hands, clinical). */
const CURATED_QUIZ_PHOTO =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp";

function sigForSlug(slug: string): string {
  const n = Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 999);
  return `&sig=${n}`;
}

function pickQuizImageUrl(slug: string, registryUrl?: string | null): string {
  const url = registryUrl?.trim();
  if (url && !isLegacyImageUrl(url) && !isPlaceholderImageUrl(url)) return url;
  return `${CURATED_QUIZ_PHOTO}${sigForSlug(slug)}`;
}

/** Prefer v25 registry raster; never return v25.1 SVG placeholder render URLs. */
export async function resolveStudyGameImageUrl(slug: string): Promise<string> {
  const report = await loadImageReportAsync();
  const reg = report?.images?.find((i) => i.section === STUDY_GAME_IMAGE_SECTION && i.slug === slug);
  return pickQuizImageUrl(slug, reg?.publicUrl);
}

export function resolveStudyGameImageUrlSync(slug: string): string {
  const registry = loadImageRegistryLocal();
  const reg = registry.find((i) => i.section === STUDY_GAME_IMAGE_SECTION && i.slug === slug);
  return pickQuizImageUrl(slug, reg?.publicUrl);
}

/** @deprecated Use resolveStudyGameImageUrlSync */
export function studyGameRenderUrl(slug: string): string {
  return resolveStudyGameImageUrlSync(slug);
}

export const STUDY_GAME_IMAGE_FALLBACK = CURATED_QUIZ_PHOTO;
