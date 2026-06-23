import { publishNewsletterIssue } from "@/lib/v23/newsletter/engine";

/** v23.1 — automatická generace a publikace newsletteru (cron + admin). */
export async function generateNewsletterIssue() {
  const result = await publishNewsletterIssue();
  return { id: result.id, slug: result.slug };
}
