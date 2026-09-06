import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getCongressEvents } from "@/lib/queries/congresses";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getKongresyHubCopy } from "@/lib/i18n/kongresy-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getKongresyHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.calendarMetaTitle,
    description: copy.calendarLead,
    path: "/kongresy/kalendar",
    locale,
  });
}

export default async function KongresyKalendarPage() {
  const locale = await getServerLocale();
  const copy = getKongresyHubCopy(locale);
  const events = await getCongressEvents();
  const calAds = await getActiveAdsByPlacement("congress_calendar", 1);

  const byMonth = new Map<string, typeof events>();
  for (const ev of events) {
    const key = ev.starts_at
      ? formatPublicDate(ev.starts_at, locale, { year: "numeric", month: "long" }) ?? "—"
      : copy.noDate;
    const list = byMonth.get(key) ?? [];
    list.push(ev);
    byMonth.set(key, list);
  }

  return (
    <ModulePageShell
      eyebrow={copy.calendarEyebrow}
      title={copy.calendarTitle}
      description={copy.calendarLead}
      ctaHref={localizePublicHref("/kongresy/pridat", locale)}
      ctaLabel={copy.add}
    >
      <AdPlacement ads={calAds} variant="inline" />
      <div className="mt-8 space-y-10">
        {[...byMonth.entries()].map(([month, list]) => (
          <div key={month}>
            <h2 className="font-display text-lg font-semibold text-[#005B96]">{month}</h2>
            <ul className="mt-4 space-y-3 border-l-2 border-[#cfe1f3] pl-6">
              {list.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-[#005B96]" />
                  <Link
                    href={localizePublicHref(`/kongresy/${ev.slug}`, locale)}
                    className="font-semibold text-[#021d33] hover:underline"
                  >
                    {ev.title}
                  </Link>
                  <p className="text-xs text-slate-500">{ev.location}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href={localizePublicHref("/kongresy", locale)} className="mt-8 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
    </ModulePageShell>
  );
}
