import { publishNewsletterIssue } from "@/lib/v23/newsletter/engine";
import { revalidateNewsletterSurfaces } from "@/lib/v23/newsletter/revalidate";

/** v23.1 — automatická generace a publikace newsletteru (cron + admin). */
export async function generateNewsletterIssue() {
  const result = await publishNewsletterIssue();
  revalidateNewsletterSurfaces(result.slug);
  return { id: result.id, slug: result.slug };
}
