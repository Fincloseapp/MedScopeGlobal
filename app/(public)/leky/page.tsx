import type { Metadata } from "next";
import Link from "next/link";
import { AdPlacement } from "@/components/ads/ad-placement";
import { DrugAgencyOverview } from "@/components/v4c/drug-agency-overview";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import { formatPublicDateTime } from "@/lib/i18n/format-date";
import { getLekyHubCopy } from "@/lib/i18n/leky-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { getDrugNewsGroupedByAgency, getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getLekyHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/leky",
    locale,
  });
}

export default async function LekyHubPage() {
  const locale = await getServerLocale();
  const copy = getLekyHubCopy(locale);
  const [latest, grouped, underTitleAds, sidebarAds] = await Promise.all([
    getDrugNewsList(),
    getDrugNewsGroupedByAgency(4),
    getActiveAdsByPlacement("drugs_under_title", 1),
    getActiveAdsByPlacement("drugs_sidebar", 2),
  ]);

  const preview = latest.slice(0, 6);
  const lastUpdate = latest[0]?.published_date ?? latest[0]?.created_at ?? null;
  const lastUpdateLabel = formatPublicDateTime(lastUpdate, locale);

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021d33] via-[#003d6b] to-[#005B96] px-4 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {copy.kicker}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{copy.lead}</p>
          {lastUpdateLabel ? (
            <p className="mt-4 text-xs text-white/50">
              {copy.lastSync} {lastUpdateLabel}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizePublicHref("/leky/novinky", locale)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#005B96] shadow-sm transition hover:bg-white/90"
            >
              {copy.allNews}
            </Link>
            <Link
              href={localizePublicHref("/leky/schvalene", locale)}
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.approved}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AdPlacement ads={underTitleAds} variant="banner" />
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            <DrugAgencyOverview byAgency={grouped} />

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {copy.links.map((l) => (
                <Link
                  key={l.href}
                  href={localizePublicHref(l.href, locale)}
                  prefetch
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-md"
                >
                  <p className="font-semibold text-[#021d33]">{l.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{l.desc}</p>
                </Link>
              ))}
            </div>

            <section className="mt-12">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    medscopeglobal.com
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#021d33]">
                    {copy.latestTitle}
                  </h2>
                </div>
                <Link
                  href={localizePublicHref("/leky/novinky", locale)}
                  className="shrink-0 text-sm font-medium text-[#005B96] hover:underline"
                >
                  {copy.seeAll}
                </Link>
              </div>

              {preview.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {preview.map((item) => (
                    <DrugNewsListCard key={item.id} item={item} variant="text-only" />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  <p>{copy.empty}</p>
                  <p className="mt-2 text-xs">{copy.emptyHint}</p>
                </div>
              )}
            </section>

            <DrugSourceAttribution className="mt-14" />
          </div>
          <AdPlacement ads={sidebarAds} variant="sidebar" />
        </div>
      </div>
    </div>
  );
}
