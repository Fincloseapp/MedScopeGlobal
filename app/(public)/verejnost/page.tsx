import type { Metadata } from "next";
import Link from "next/link";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { DailyTipBanner } from "@/components/verejnost/daily-tip-banner";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import { hubTopicListingHref, VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatPublicDateTime } from "@/lib/i18n/format-date";
import { ArticleSubscribeNudge } from "@/components/monetization/article-subscribe-nudge";
import { shouldShowPublicSubscribeNudge } from "@/lib/monetization/revenue-mix";

export const revalidate = 45;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).publicHub;
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/verejnost",
    locale,
  });
}

const START_HREFS = ["/verejnost/temata", "/verejnost/clanky", "/ai-asistent/verejnost"] as const;
const FEATURED_DESKS = [
  { slug: "pohyb", cover: "/assets/covers/movement.webp" },
  { slug: "joga", cover: "/assets/covers/calm.webp" },
  { slug: "kosmetika", cover: "/assets/covers/seniors.webp" },
] as const;

export default async function VerejnostHubPage() {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).publicHub;
  const latest = await listPublicArticles({ limit: 18, locale, topic: "zivotni-styl" });
  const topics = VEREJNOST_HUB_TOPICS;
  const lastUpdate = latest[0]?.published_at ?? latest[0]?.created_at ?? null;
  const lastUpdateLabel = formatPublicDateTime(lastUpdate, locale);

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021d33] via-[#003d6b] to-[#005B96] px-4 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{copy.lead}</p>
          {lastUpdateLabel ? (
            <p className="mt-4 text-xs text-white/50">
              {copy.lastArticle} {lastUpdateLabel}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/app/pacient"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#005B96] shadow-sm transition hover:bg-white/90"
            >
              {copy.downloadApp}
            </Link>
            <Link
              href={localizePublicHref("/verejnost/temata", locale)}
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.findProblem}
            </Link>
            <Link
              href={localizePublicHref("/verejnost/clanky", locale)}
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.browseArticles}
            </Link>
            <Link
              href={localizePublicHref("/verejnost/osveta", locale)}
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.dailyTip}
            </Link>
            <Link
              href={localizePublicHref("/ai-asistent/verejnost", locale)}
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.askAi}
            </Link>
          </div>
        </div>
      </section>

      <DailyTipBanner />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PublicTrustDisclaimer className="mb-10" />

        <section className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.startEyebrow}</p>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.startTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {copy.steps.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#005B96]/10 text-sm font-bold text-[#005B96]">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-semibold text-[#021d33]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                <Link
                  href={localizePublicHref(START_HREFS[index] ?? "/verejnost", locale)}
                  className="mt-3 inline-block text-sm font-medium text-[#005B96] hover:underline"
                >
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {copy.featuredEyebrow}
          </p>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.featuredTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {FEATURED_DESKS.map((desk) => {
              const localized = copy.topics[desk.slug];
              return (
                <Link
                  key={desk.slug}
                  href={localizePublicHref(`/verejnost/clanky?topic=${desk.slug}`, locale)}
                  prefetch
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-[#005B96]/40 hover:shadow-md"
                >
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    <img
                      src={desk.cover}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-[#021d33]">{localized?.label ?? desk.slug}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {localized?.description ?? ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.linksEyebrow}</p>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.linksTitle}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {copy.quick.map((l) => (
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
        </section>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.topicsEyebrow}</p>
              <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.topicsTitle}</h2>
            </div>
            <Link
              href={localizePublicHref("/verejnost/temata", locale)}
              className="shrink-0 text-sm font-medium text-[#005B96] hover:underline"
            >
              {copy.allTopics}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => {
              const localized = copy.topics[t.slug];
              return (
                <Link
                  key={t.slug}
                  href={localizePublicHref(hubTopicListingHref(t.slug, t.backendTopic), locale)}
                  prefetch
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-sm"
                >
                  <p className="font-semibold text-[#021d33]">{localized?.label ?? t.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {localized?.description ?? t.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-12">
          <ListingAffiliateBox locale={locale as GlobalLocaleCode} topic="dlouhovekost" />
        </div>

        {shouldShowPublicSubscribeNudge("public", false) ? (
          <div className="mt-12">
            <ArticleSubscribeNudge locale={locale} />
          </div>
        ) : null}

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                medscopeglobal.com
              </p>
              <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.latestTitle}</h2>
            </div>
            <Link
              href={localizePublicHref("/verejnost/clanky", locale)}
              className="shrink-0 text-sm font-medium text-[#005B96] hover:underline"
            >
              {copy.showAll}
            </Link>
          </div>

          {latest.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((item) => (
                <VerejnostArticleCard key={item.id} article={item} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              <p>{copy.empty}</p>
              <p className="mt-2 text-xs">{copy.emptyHint}</p>
            </div>
          )}
        </section>

        <p className="mt-14 text-center">
          <PublicTrustDisclaimer variant="inline" />
        </p>
      </div>
    </div>
  );
}
