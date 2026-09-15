import { publishNewsletterEditions } from "@/lib/v23/newsletter/engine";
import { revalidateNewsletterSurfaces } from "@/lib/v23/newsletter/revalidate";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

/** Monday UTC of the current ISO week, YYYY-MM-DD. */
export function isoWeekMondayUtcYmd(at = new Date()): string {
  const x = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
  const day = x.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setUTCDate(x.getUTCDate() + diff);
  return x.toISOString().slice(0, 10);
}

async function alreadyPublishedThisWeek(): Promise<boolean> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return false;
  const from = isoWeekMondayUtcYmd();
  const { data } = await admin
    .from("newsletters")
    .select("id")
    .eq("published", true)
    .gte("issue_date", from)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}

/** v23.2 — publish one native web issue per configured locale desk. Weekly unless force. */
export async function generateNewsletterIssue(options?: { force?: boolean }) {
  if (!options?.force && (await alreadyPublishedThisWeek())) {
    return { skipped: true as const, reason: "already_this_week" };
  }
  const { editions, primary } = await publishNewsletterEditions();
  for (const edition of editions) {
    revalidateNewsletterSurfaces(edition.slug);
  }
  return {
    skipped: false as const,
    id: primary.id,
    slug: primary.slug,
    editions: editions.map((edition) => ({
      id: edition.id,
      slug: edition.slug,
      locale: edition.locale,
    })),
  };
}
