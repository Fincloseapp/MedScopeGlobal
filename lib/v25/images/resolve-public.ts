import { isLegacyImageUrl } from "@/lib/v25/images/legacy-images";
import { isWeakMagazineCover, resolveVerejnostCoverUrl } from "@/lib/verejnost/resolve-cover";

type ResolveInput = {
  section: string;
  slug: string;
  dbUrl?: string | null;
  title?: string | null;
  excerpt?: string | null;
};

function magazineCoverFor(input: ResolveInput): string {
  const topic = input.section.includes("univer")
    ? "rozhovory"
    : input.section.includes("verejnost")
      ? "zivotni-styl"
      : "prevence";
  return resolveVerejnostCoverUrl({
    slug: input.slug,
    title: input.title ?? input.slug,
    excerpt: input.excerpt,
    cover_image_url: input.dbUrl,
    public_topic: topic,
  });
}

/** Veřejná URL obálky — fotografické still-life, ne SVG rendery. */
export async function resolvePublicImageUrl(input: ResolveInput): Promise<string> {
  const { section, slug, dbUrl } = input;

  if (dbUrl && !isLegacyImageUrl(dbUrl) && !isWeakMagazineCover(dbUrl)) return dbUrl;

  const { loadImageReportAsync } = await import("@/lib/v25/images/persist");
  const report = await loadImageReportAsync();
  const reg = report?.images?.find((i) => i.section === section && i.slug === slug);
  if (reg?.publicUrl && !isLegacyImageUrl(reg.publicUrl) && !isWeakMagazineCover(reg.publicUrl)) {
    return reg.publicUrl;
  }

  return magazineCoverFor(input);
}

export function resolvePublicImageUrlSync(input: ResolveInput & { registryUrl?: string | null }): string {
  const { dbUrl, registryUrl } = input;
  if (dbUrl && !isLegacyImageUrl(dbUrl) && !isWeakMagazineCover(dbUrl)) return dbUrl;
  if (registryUrl && !isLegacyImageUrl(registryUrl) && !isWeakMagazineCover(registryUrl)) {
    return registryUrl;
  }
  return magazineCoverFor(input);
}

export { isLegacyImageUrl };
