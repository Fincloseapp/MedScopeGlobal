import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getV21UpcomingCongresses } from "@/lib/v21/congresses";
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
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/kongresy",
    locale,
  });
}

export default async function KongresyPage() {
  const locale = await getServerLocale();
  const copy = getKongresyHubCopy(locale);
  const events = await getV21UpcomingCongresses(12);
  const topAds = await getActiveAdsByPlacement("congress_top", 1);

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      ctaHref={localizePublicHref("/kongresy/kalendar", locale)}
      ctaLabel={copy.calendar}
    >
      <AdPlacement ads={topAds} variant="banner" />
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href={localizePublicHref("/kongresy/kalendar", locale)}
          className="rounded-full border border-[#8dc4ea] px-4 py-2 text-[#005B96] font-semibold"
        >
          {copy.calendar}
        </Link>
        <Link
          href={localizePublicHref("/kongresy/pridat", locale)}
          className="rounded-full bg-[#005B96] px-4 py-2 text-white font-semibold"
        >
          {copy.add}
        </Link>
      </div>
      <div className="mt-8 space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-600">{copy.empty}</p>
        ) : (
          events.map((ev) => (
            <Link
              key={ev.id}
              href={localizePublicHref(`/kongresy/${ev.slug}`, locale)}
              className="block rounded-2xl border border-[#cfe1f3] bg-white p-5 hover:shadow-md"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-[#021d33]">{ev.title}</h3>
                {ev.starts_at ? (
                  <time className="text-xs text-[#005B96] font-semibold">
                    {formatPublicDate(ev.starts_at, locale, {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                    })}
                  </time>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">{[ev.location, ev.organizer].filter(Boolean).join(" · ")}</p>
              {ev.summary ? <p className="mt-2 text-sm text-slate-600 line-clamp-2">{ev.summary}</p> : null}
            </Link>
          ))
        )}
      </div>
    </ModulePageShell>
  );
}
