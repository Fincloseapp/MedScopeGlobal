import { resolvePublicImageUrl } from "@/lib/v25/images/resolve-public";

export async function resolveManyImages<T extends { slug: string; image_url?: string | null }>(
  items: T[],
  section: string
): Promise<Array<T & { resolvedImageUrl: string }>> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      resolvedImageUrl: await resolvePublicImageUrl({
        section,
        slug: item.slug,
        dbUrl: item.image_url,
      }),
    }))
  );
}
