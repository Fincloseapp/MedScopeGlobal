import { V25_PROD_BASE } from "@/lib/v25/config";
import { isLegacyImageUrl } from "@/lib/v25/images/legacy-images";

type ResolveInput = {
  section: string;
  slug: string;
  dbUrl?: string | null;
};

/** Veřejná URL obrázku — preferuje v25 SVG, legacy Unsplash nahradí asset/render API. */
export async function resolvePublicImageUrl(input: ResolveInput): Promise<string> {
  const { section, slug, dbUrl } = input;
  const base = V25_PROD_BASE.replace(/\/$/, "");

  if (dbUrl && !isLegacyImageUrl(dbUrl)) return dbUrl;

  const { loadImageReportAsync } = await import("@/lib/v25/images/persist");
  const report = await loadImageReportAsync();
  const reg = report?.images?.find((i) => i.section === section && i.slug === slug);
  if (reg?.publicUrl && !isLegacyImageUrl(reg.publicUrl)) return reg.publicUrl;

  const safeSection = section.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const safeSlug = slug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  return `${base}/api/v25/images/render?section=${encodeURIComponent(safeSection)}&slug=${encodeURIComponent(safeSlug)}`;
}

export function resolvePublicImageUrlSync(input: ResolveInput & { registryUrl?: string | null }): string {
  const { section, slug, dbUrl, registryUrl } = input;
  const base = V25_PROD_BASE.replace(/\/$/, "");

  if (dbUrl && !isLegacyImageUrl(dbUrl)) return dbUrl;
  if (registryUrl && !isLegacyImageUrl(registryUrl)) return registryUrl;

  const safeSection = section.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const safeSlug = slug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  return `${base}/api/v25/images/render?section=${encodeURIComponent(safeSection)}&slug=${encodeURIComponent(safeSlug)}`;
}

export { isLegacyImageUrl };
