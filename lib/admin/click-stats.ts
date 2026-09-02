export type AffiliateClickRow = {
  slug?: string | null;
  locale?: string | null;
  destination?: string | null;
  createdAt: string;
};

export type AffiliateClickAggregate = {
  last7: number;
  last30: number;
  top: { slug: string; count: number }[];
  byLocale: { locale: string; count: number }[];
};

const DAY_MS = 86_400_000;

export function aggregateAffiliateClicks(
  rows: AffiliateClickRow[],
  now = Date.now(),
  topLimit = 8
): AffiliateClickAggregate {
  const last7: AffiliateClickRow[] = [];
  const last30: AffiliateClickRow[] = [];
  for (const row of rows) {
    const at = Date.parse(row.createdAt);
    if (!Number.isFinite(at)) continue;
    const age = now - at;
    if (age <= 7 * DAY_MS) last7.push(row);
    if (age <= 30 * DAY_MS) last30.push(row);
  }

  const bySlug = new Map<string, number>();
  const byLocale = new Map<string, number>();
  for (const row of last30) {
    const slug = (row.slug ?? "").trim() || "neznamy";
    bySlug.set(slug, (bySlug.get(slug) ?? 0) + 1);
    const locale = (row.locale ?? "").trim() || "—";
    byLocale.set(locale, (byLocale.get(locale) ?? 0) + 1);
  }

  const top = [...bySlug.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "cs"))
    .slice(0, topLimit)
    .map(([slug, count]) => ({ slug, count }));

  const locales = [...byLocale.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "cs"))
    .map(([locale, count]) => ({ locale, count }));

  return { last7: last7.length, last30: last30.length, top, byLocale: locales };
}
