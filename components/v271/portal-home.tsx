import Image from "next/image";
import Link from "next/link";
import type { DisplayArticle } from "@/lib/queries/articles";
import { APP_PRODUCTS } from "@/lib/apps/catalog";
import {
  getPortalNewsNote,
  getPortalPhilosophy,
} from "@/lib/v271/portal";
import { NEWS_DESKS, splitNewsDesks, type NewsDeskId } from "@/lib/v271/news-desks";
import { NewsArticleThumb, NewsDeskFallback, NewsHeadlineRow } from "@/components/articles/news-article-card";
import { PortalSearch } from "@/components/v271/portal-search";
import { WriterAgentsStrip } from "@/components/editorial/writer-agents-strip";
import {
  LongevityProtocolsSection,
  HomepageAffiliateSection,
} from "@/components/ecosystem/magazine-sections";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";
import { AppOpenLink } from "@/components/apps/app-origin-bar";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { ArrowRight } from "lucide-react";
import { getPortalUi, formatPortal } from "@/lib/i18n/portal-copy";
import type { LocaleCode } from "@/lib/i18n/config";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

/** Marketing display names — keep OrdiZapis consistent with product/nav */
const APP_MARKETING_NAME: Record<string, string> = {
  mediflow: "MediFlow",
  medipacient: "MeDipacient",
  ordizapis: "OrdiZapis",
  mediprep: "MeDiprep",
};

function DeskColumn({
  desk,
  articles,
  featured,
  locale,
}: {
  desk: NewsDeskId;
  articles: DisplayArticle[];
  featured?: boolean;
  locale?: string;
}) {
  const def = NEWS_DESKS.find((item) => item.id === desk)!;
  const ui = getPortalUi(locale);
  const labels: Record<NewsDeskId, { label: string; more: string }> = {
    novinky: { label: ui.deskNews, more: ui.moreNews },
    verejnost: { label: ui.deskPublic, more: ui.morePublic },
    dlouhovekost: { label: ui.deskLongevity, more: ui.moreLongevity },
    clanky: { label: ui.deskArticles, more: ui.moreArticles },
  };
  const copy = labels[desk];
  const lead = featured ? articles[0] : null;
  const rows = featured ? articles.slice(1, 4) : articles.slice(0, 4);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005B96]">{copy.label}</h3>
        <Link href={def.href} className="text-[11px] font-medium text-[#005B96] hover:underline">
          {copy.more} →
        </Link>
      </div>
      {lead ? (
        <Link href={`/article/${lead.slug}`} className="group mb-2 block">
          <NewsArticleThumb article={lead} large sizes="(max-width: 768px) 100vw, 40vw" />
          <h4 className="mt-2 font-display text-base font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96]">
            {lead.title}
          </h4>
          {lead.excerpt ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{lead.excerpt}</p>
          ) : null}
        </Link>
      ) : null}
      <div className="divide-y divide-slate-100 border-t border-slate-200">
        {rows.length > 0
          ? rows.map((article) => <NewsHeadlineRow key={article.id} article={article} />)
          : !lead
            ? <NewsDeskFallback desk={desk} />
            : null}
      </div>
    </div>
  );
}

function PortalNewsFeed({ articles, locale }: { articles: DisplayArticle[]; locale?: string }) {
  const desks = splitNewsDesks(articles);
  const ui = getPortalUi(locale);

  return (
    <>
      <nav aria-label={ui.desksAria} className="mb-4 flex flex-wrap gap-x-4 gap-y-1 border-b border-slate-200 pb-3">
        {[
          { label: ui.deskNews, href: "/novinky" },
          { label: ui.deskPublic, href: "/verejnost/clanky" },
          { label: ui.deskLongevity, href: "/verejnost/clanky?topic=dlouhovekost" },
          { label: ui.deskArticles, href: "/articles" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#005B96]"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-500">{getPortalNewsNote()}</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <DeskColumn desk="novinky" articles={desks.novinky} featured locale={locale} />
        <DeskColumn desk="verejnost" articles={desks.verejnost} featured locale={locale} />
        <DeskColumn desk="dlouhovekost" articles={desks.dlouhovekost} featured locale={locale} />
        <DeskColumn desk="clanky" articles={desks.clanky} featured locale={locale} />
      </div>
    </>
  );
}

function HeroPhones({ locale }: { locale?: string }) {
  const ui = getPortalUi(locale);
  return (
    <div className="portal-hero-phones relative mx-auto h-[min(58vh,420px)] w-full max-w-md lg:mx-0 lg:h-[min(72vh,520px)] lg:max-w-none">
      <div className="portal-phone portal-phone-a absolute left-[2%] top-[6%] w-[48%] overflow-hidden rounded-[1.75rem] shadow-[0_28px_70px_rgba(2,29,51,0.55)] ring-1 ring-white/15">
        <Image
          src={APP_MARKETING_IMAGE.mediflow}
          alt={ui.altMediflow}
          width={480}
          height={960}
          className="h-auto w-full object-cover"
          priority
          sizes="(max-width: 1024px) 40vw, 220px"
        />
      </div>
      <div className="portal-phone portal-phone-b absolute right-0 top-[14%] w-[54%] overflow-hidden rounded-[1.75rem] shadow-[0_32px_80px_rgba(2,29,51,0.6)] ring-1 ring-white/15">
        <Image
          src={APP_MARKETING_IMAGE.ordizapis}
          alt={ui.altOrdizapis}
          width={480}
          height={960}
          className="h-auto w-full object-cover"
          priority
          sizes="(max-width: 1024px) 45vw, 260px"
        />
      </div>
      <div className="portal-phone portal-phone-c absolute bottom-0 left-[18%] w-[44%] overflow-hidden rounded-[1.5rem] shadow-[0_22px_56px_rgba(2,29,51,0.5)] ring-1 ring-white/10">
        <Image
          src={APP_MARKETING_IMAGE.medipacient}
          alt={ui.altMedipacient}
          width={480}
          height={960}
          className="h-auto w-full object-cover"
          sizes="(max-width: 1024px) 35vw, 200px"
        />
      </div>
    </div>
  );
}

function AppsShowcase({ locale }: { locale?: string }) {
  const featured = APP_PRODUCTS.filter((a) => a.id !== "mediprep");
  const legacy = APP_PRODUCTS.find((a) => a.id === "mediprep");
  const ui = getPortalUi(locale);
  const taglines: Record<string, string> = {
    mediflow: ui.appMediflowTagline,
    medipacient: ui.appMedipacientTagline,
    ordizapis: ui.appOrdizapisTagline,
  };

  return (
    <div className="space-y-8">
      <ul className="grid gap-6 md:grid-cols-3">
        {featured.map((app, i) => {
          const name = APP_MARKETING_NAME[app.id] ?? app.shortName;
          return (
            <li key={app.id} className="portal-reveal" style={{ animationDelay: `${0.08 * (i + 1)}s` }}>
              <AppOpenLink
                href={app.appPath}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 transition hover:border-[#005B96]/35 hover:bg-white"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#e8f3fb] to-slate-100">
                  <Image
                    src={APP_MARKETING_IMAGE[app.id]}
                    alt=""
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold text-[#021d33]">{name}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">
                    {taglines[app.id] ?? app.tagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#005B96]">
                    {ui.openApp}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </AppOpenLink>
            </li>
          );
        })}
      </ul>

      <div className="portal-reveal grid gap-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-[#fff8eb] via-white to-[#e8f3fb] p-6 sm:grid-cols-[1.2fr_1fr] sm:items-center sm:p-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">{ui.vipEyebrow}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-[#021d33] sm:text-3xl">
            {ui.vipHeading}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
            {ui.vipBody}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/vip/protokoly"
              className="inline-flex items-center gap-2 rounded-lg bg-[#021d33] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005B96]"
            >
              {ui.viewVip}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/predplatne?trial=1"
              className="inline-flex rounded-lg border border-[#021d33]/20 px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:border-[#005B96] hover:text-[#005B96]"
            >
              {ui.trial14}
            </Link>
          </div>
        </div>
        <div className="relative mx-auto hidden h-48 w-full max-w-xs sm:block">
          <Image
            src={APP_MARKETING_IMAGE.mediflow}
            alt=""
            fill
            className="object-contain object-bottom drop-shadow-xl"
            sizes="240px"
          />
        </div>
      </div>

      {legacy ? (
        <p className="text-center text-xs text-slate-500">
          {formatPortal(ui.legacyNote, { name: legacy.shortName })}{" "}
          <AppOpenLink href={legacy.appPath} className="font-medium text-[#005B96] hover:underline">
            {ui.legacyOpen}
          </AppOpenLink>
          .
        </p>
      ) : null}
    </div>
  );
}

export function PortalHome({
  articles,
  philosophy,
  locale = "cs",
}: {
  articles: DisplayArticle[];
  philosophy: ReturnType<typeof getPortalPhilosophy>;
  locale?: LocaleCode | string;
}) {
  const brand = philosophy.magazineName ?? "VitaScope";
  const ui = getPortalUi(locale);

  return (
    <div className="border-b border-slate-200">
      {/* 1 — Hero: VitaScope only (first viewport) */}
      <section
        aria-label={formatPortal(ui.heroAria, { brand })}
        className="portal-hero relative isolate min-h-[100svh] overflow-hidden text-white"
      >
        <div className="portal-hero-atmosphere absolute inset-0" aria-hidden />
        <div className="portal-hero-pattern absolute inset-0 opacity-40" aria-hidden />

        <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-20">
          <div className="portal-hero-copy max-w-xl">
            <p className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {brand}
            </p>
            <h1 className="mt-5 font-display text-2xl font-semibold leading-snug text-white/95 sm:text-3xl lg:text-[2.15rem]">
              {philosophy.claim}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
              {philosophy.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#021d33] transition hover:bg-[#e8f3fb]"
              >
                {ui.readMagazine}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <AppOpenLink
                href="/app/mediflow"
                className="inline-flex items-center rounded-lg border border-white/35 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
              >
                {ui.openMediFlow}
              </AppOpenLink>
            </div>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
              {philosophy.eyebrow}
            </p>
          </div>

          <div className="portal-hero-visual min-w-0">
            <HeroPhones locale={locale} />
          </div>
        </div>
      </section>

      {/* 2 — Magazine / news */}
      <section aria-labelledby="portal-magazine-heading" className="bg-[#f3f7fb]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="portal-reveal max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">{ui.newsEyebrow}</p>
            <h2 id="portal-magazine-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33] sm:text-4xl">
              {brand} — {ui.magazineHeading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              {ui.magazineIntro}
            </p>
          </div>

          <div className="portal-reveal mt-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <PortalSearch locale={locale} />
          </div>

          <div className="portal-reveal mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-[#021d33]">{ui.currentDesks}</h3>
              <Link href="/articles" className="text-sm font-semibold text-[#005B96] hover:underline">
                {ui.allArticles} →
              </Link>
            </div>
            <PortalNewsFeed articles={articles} locale={locale} />
          </div>

          <div className="mt-6">
            <WriterAgentsStrip />
          </div>

          {/* Display ads — empty until NEXT_PUBLIC_ADS_ENABLED + provider keys */}
          <div className="portal-reveal mt-8">
            <GlobalAdSlot placement="in-content" locale={locale as GlobalLocaleCode} />
          </div>
        </div>
      </section>

      {/* 3 — Apps + VIP */}
      <section aria-labelledby="portal-apps-heading" className="bg-gradient-to-b from-white via-[#f7fafc] to-[#eef4f9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="portal-reveal mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">{ui.platformEyebrow}</p>
            <h2 id="portal-apps-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33] sm:text-4xl">
              MediFlow · MeDipacient · OrdiZapis
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              {ui.platformIntro}
            </p>
          </div>
          <div className="mt-10">
            <AppsShowcase locale={locale} />
          </div>
        </div>
      </section>

      {/* 4 — VIP protocols depth + affiliate */}
      <section aria-label={ui.vipSectionAria} className="bg-[#f3f7fb]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-2">
          <LongevityProtocolsSection locale={locale} />
          <HomepageAffiliateSection locale={locale} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <GlobalAdSlot placement="footer" locale={locale as GlobalLocaleCode} />
      </div>

      {/* 5 — Closing CTA */}
      <section className="relative overflow-hidden bg-[#021d33] text-white">
        <div className="portal-cta-glow absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 sm:py-16">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              {formatPortal(ui.startWith, { brand })}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
              {ui.ctaBody}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/articles"
              className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#021d33] hover:bg-[#e8f3fb]"
            >
              {ui.readArticles}
            </Link>
            <Link
              href="/predplatne?trial=1"
              className="inline-flex rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:border-white/60"
            >
              {ui.trial14}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
