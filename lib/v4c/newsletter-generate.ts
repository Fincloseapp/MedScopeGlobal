import { publishNewsletterEditions } from "@/lib/v23/newsletter/engine";
import { revalidateNewsletterSurfaces } from "@/lib/v23/newsletter/revalidate";

/** v23.2 — publish one native web issue per configured locale desk. */
export async function generateNewsletterIssue() {
  const { editions, primary } = await publishNewsletterEditions();
  for (const edition of editions) {
    revalidateNewsletterSurfaces(edition.slug);
  }
  return {
    id: primary.id,
    slug: primary.slug,
    editions: editions.map((edition) => ({
      id: edition.id,
      slug: edition.slug,
      locale: edition.locale,
    })),
  };
}
