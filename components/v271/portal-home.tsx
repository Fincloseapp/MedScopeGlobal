import Image from "next/image";
import Link from "next/link";
import type { DisplayArticle } from "@/lib/queries/articles";
import { APP_PRODUCTS, type AppProductId } from "@/lib/apps/catalog";
import { V271_AUDIENCES } from "@/lib/v271/homepage";
import {
  getPortalChrome,
  getPortalNewsNote,
  PORTAL_PHILOSOPHY,
  PORTAL_SERVICES,
} from "@/lib/v271/portal";
import { getSurfaceCopy, isCzechSurface } from "@/lib/i18n/surface-copy";
import { type getMagazineCopy } from "@/lib/brand/magazine";
import { assignUniqueListingCovers } from "@/lib/ecosystem/editorial/images/unique-listing-covers";
import { NEWS_DESKS, newsDesksForLocale, splitNewsDesks, type NewsDeskId } from "@/lib/v271/news-desks";
import { NewsArticleThumb, NewsDeskFallback, NewsHeadlineRow } from "@/components/articles/news-article-card";
import { formatArticleDateLabel } from "@/lib/editorial/freshness";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { PortalSearch } from "@/components/v271/portal-search";
import { WriterAgentsStrip } from "@/components/editorial/writer-agents-strip";
import { AppOpenLink, isStandaloneAppHref } from "@/components/apps/app-origin-bar";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { VITASCOPE_DESK_LOGO } from "@/lib/brand/vitascope";
import { ViaLongeVitaMark } from "@/components/brand/vialongevita-mark";
import { BookOpen, Gift, GraduationCap, LayoutGrid, Newspaper, Pill, Sparkles } from "lucide-react";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildLocalePath } from "@/lib/i18n/locale-path";

function ServiceGlyph({ icon }: { icon?: string }) {
  const cls = "h-5 w-5";
  switch (icon) {
    case "book":
      return <BookOpen className={cls} aria-hidden />;
    case "news":
      return <Newspaper className={cls} aria-hidden />;
    case "spark":
      return <Sparkles className={cls} aria-hidden />;
    case "gift":
      return <Gift className={cls} aria-hidden />;
    case "pill":
      return <Pill className={cls} aria-hidden />;
    case "school":
      return <GraduationCap className={cls} aria-hidden />;
    default:
      return <LayoutGrid className={cls} aria-hidden />;
  }
}

function Box({
  title,
  href,
  moreLabel,
  children,
}: {
  title: React.ReactNode;
  href?: string;
  moreLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 bg-[#f7fafc] px-3 py-2">
        <h2 className="text-sm font-bold text-[#021d33]">{title}</h2>
        {href ? (
          <Link href={href} className="text-xs font-medium text-[#005B96] hover:underline">
            {moreLabel}
          </Link>
        ) : null}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function DeskColumn({
  desk,
  articles,
  featured,
  desks,
  locale,
}: {
  desk: NewsDeskId;
  articles: DisplayArticle[];
  featured?: boolean;
  desks: typeof NEWS_DESKS;
  locale: string;
}) {
  const def = desks.find((item) => item.id === desk) ?? NEWS_DESKS.find((item) => item.id === desk)!;
  const lead = featured ? articles[0] : null;
  const leadDate = lead ? formatArticleDateLabel(lead, locale) : null;
  const rows = featured ? articles.slice(1, 4) : articles.slice(0, 4);
  const longevity = desk === "dlouhovekost";

  return (
    <div
      className={
        longevity
          ? "rounded-xl bg-gradient-to-b from-[#e8f3fb] via-white to-white p-3 ring-1 ring-[#005B96]/15"
          : undefined
      }
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-[#050b1d]">
            <Image
              src={VITASCOPE_DESK_LOGO[desk]}
              alt=""
              fill
              className="object-cover"
              sizes="28px"
            />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005B96]">{def.label}</h3>
            {longevity ? (
              <p className="text-[10px] font-medium leading-4 text-slate-500">{def.kicker}</p>
            ) : null}
          </div>
        </div>
        <Link href={localizePublicHref(def.href, locale)} className="shrink-0 text-[11px] font-medium text-[#005B96] hover:underline">
          {def.more} →
        </Link>
      </div>
      {lead ? (
        <Link href={buildLocalePath(locale, `/article/${lead.slug}`)} className="group mb-2 block">
          <NewsArticleThumb article={lead} large sizes="(max-width: 768px) 100vw, 40vw" />
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
            {def.kicker}
          </p>
          <h4 className="mt-0.5 font-display text-base font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96]">
            {lead.title}
          </h4>
          {lead.excerpt ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{lead.excerpt}</p>
          ) : null}
          {leadDate ? (
            <p className="mt-1 text-[11px] text-slate-500">
              <time dateTime={leadDate.dateTime}>{leadDate.text}</time>
            </p>
          ) : null}
        </Link>
      ) : null}
      <div className="divide-y divide-slate-100 border-t border-slate-200">
        {rows.length > 0
          ? rows.map((article) => (
              <NewsHeadlineRow key={article.id} article={article} locale={locale} />
            ))
          : !lead
            ? <NewsDeskFallback desk={desk} desks={desks} locale={locale} />
            : null}
      </div>
    </div>
  );
}

function PortalNewsFeed({
  articles,
  chrome,
  desks,
  locale,
  todayNote,
}: {
  articles: DisplayArticle[];
  chrome: ReturnType<typeof getPortalChrome>;
  desks: ReturnType<typeof newsDesksForLocale>;
  locale: string;
  todayNote: string;
}) {
  const raw = splitNewsDesks(articles, {}, locale);
  const uniqueVisible = assignUniqueListingCovers([
    ...raw.novinky,
    ...raw.verejnost,
    ...raw.dlouhovekost,
    ...raw.clanky,
  ]);
  const byId = new Map(uniqueVisible.map((article) => [article.id, article]));
  const remap = (list: typeof raw.novinky) =>
    list.map((article) => byId.get(article.id) ?? article);
  const split = {
    novinky: remap(raw.novinky),
    verejnost: remap(raw.verejnost),
    dlouhovekost: remap(raw.dlouhovekost),
    clanky: remap(raw.clanky),
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {chrome.newsTabs.map((tab) => (
          <Link
            key={tab.href}
            href={localizePublicHref(tab.href, locale)}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-[#e8f3fb] hover:text-[#005B96]"
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-slate-500">{todayNote}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <DeskColumn desk="novinky" articles={split.novinky} featured desks={desks} locale={locale} />
        <DeskColumn desk="verejnost" articles={split.verejnost} featured desks={desks} locale={locale} />
        <DeskColumn desk="dlouhovekost" articles={split.dlouhovekost} featured desks={desks} locale={locale} />
        <DeskColumn desk="clanky" articles={split.clanky} featured desks={desks} locale={locale} />
      </div>
    </>
  );
}

export function PortalHome({
  articles,
  copy,
  locale = "cs",
}: {
  articles: DisplayArticle[];
  copy?: ReturnType<typeof getMagazineCopy>;
  locale?: string;
}) {
  const philosophy = copy ?? PORTAL_PHILOSOPHY;
  const chrome = getPortalChrome(locale);
  const desks = newsDesksForLocale(locale);
  const surface = getSurfaceCopy(locale);
  const todayNote = isCzechSurface(locale) ? getPortalNewsNote() : surface.todayFallback;
  const brief = getNewsletterCopy(locale);
  const publicApps = APP_PRODUCTS.filter((app) => isCzechSurface(locale) || app.id !== "mediprep");
  const publicServices = PORTAL_SERVICES.filter((svc) => isCzechSurface(locale) || svc.id !== "mediprep");
  return (
    <div className="border-b border-slate-200 bg-[#e8eef3]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#050b1d] px-4 py-5 sm:px-8 sm:py-7">
            <ViaLongeVitaMark variant="hero" locale={locale} priority />
          </div>
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <h1 className="font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
              {philosophy.claim}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">{philosophy.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={localizePublicHref("/newsletter", locale)}
                className="inline-flex items-center justify-center rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
              >
                {brief.cta}
              </Link>
              <Link
                href={localizePublicHref("/articles", locale)}
                className="inline-flex items-center justify-center rounded-full border border-[#005B96]/35 px-5 py-2.5 text-sm font-semibold text-[#005B96] hover:bg-[#e8f3fb]"
              >
                {chrome.readMagazine}
              </Link>
            </div>
            <div className="mt-3 max-w-xl">
              <NewsletterCapture locale={locale} source="home-hero" variant="compact" />
            </div>
            <div className="mt-4">
              <PortalSearch copy={surface} />
            </div>
          </div>
        </div>

        <nav aria-label={chrome.servicesNav} className="mt-3 rounded-lg border border-slate-200 bg-white px-2 py-3 shadow-sm sm:px-3">
          <ul className="grid grid-cols-5 gap-1 sm:grid-cols-10">
            {publicServices.map((svc) => {
              const openApp = isStandaloneAppHref(svc.href);
              const Item = openApp ? AppOpenLink : Link;
              const localized = chrome.services.find((item) => item.id === svc.id);
              return (
              <li key={svc.id}>
                <Item
                  href={openApp ? svc.href : localizePublicHref(svc.href, locale)}
                  className="flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-center hover:bg-slate-50"
                >
                  {"image" in svc && svc.image ? (
                    <Image
                      src={svc.image}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-[22%]"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-[22%] bg-[#e8f3fb] text-[#005B96]">
                      <ServiceGlyph icon={"icon" in svc ? svc.icon : undefined} />
                    </span>
                  )}
                  <span className="text-[11px] font-semibold leading-tight text-[#021d33]">{localized?.label ?? svc.label}</span>
                  <span className="hidden text-[10px] text-slate-500 sm:block">{localized?.hint ?? svc.hint}</span>
                </Item>
              </li>
              );
            })}
          </ul>
        </nav>

        {isCzechSurface(locale) ? <WriterAgentsStrip locale={locale} /> : null}

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Box
            title={<ViaLongeVitaMark variant="compact" locale={locale} />}
            href={localizePublicHref("/articles", locale)}
            moreLabel={chrome.more}
          >
            <PortalNewsFeed
              articles={articles}
              chrome={chrome}
              desks={desks}
              locale={locale}
              todayNote={todayNote}
            />
          </Box>

          <div className="space-y-3">
            <Box title={chrome.apps} href={localizePublicHref("/aplikace", locale)} moreLabel={chrome.more}>
              <ul className="space-y-2">
                {publicApps.map((app) => (
                  <li key={app.id}>
                      <AppOpenLink
                        href={app.appPath}
                        className="flex items-center gap-3 rounded-md p-1.5 hover:bg-slate-50"
                      >
                      <span className="relative h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-md bg-slate-100">
                        <Image
                          src={APP_MARKETING_IMAGE[app.id]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#021d33]">{app.shortName}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {surface.appTaglines[app.id as AppProductId] ?? app.tagline}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-[#005B96]">{chrome.newTab}</span>
                    </AppOpenLink>
                  </li>
                ))}
              </ul>
              <Link
                href={localizePublicHref("/predplatne?trial=1", locale)}
                className="mt-3 flex w-full items-center justify-center rounded-md bg-[#005B96] px-3 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
              >
                {chrome.trialCta}
              </Link>
            </Box>

            <Box title={chrome.forWhom} moreLabel={chrome.more}>
              <ul className="space-y-2">
                {(isCzechSurface(locale)
                  ? V271_AUDIENCES
                  : V271_AUDIENCES.filter((aud) => aud.id !== "student")
                ).map((aud) => {
                  const localized = surface.audiences.find((item) => item.id === aud.id);
                  const label = localized?.label ?? aud.label;
                  const description = localized?.description ?? aud.description;
                  const ctaPrimary = localized?.ctaPrimary ?? aud.ctaPrimary.label;
                  const ctaSecondary = localized?.ctaSecondary ?? aud.ctaSecondary.label;
                  return (
                  <li key={aud.id}>
                    <Link href={localizePublicHref(aud.href, locale)} className="block rounded-md p-1.5 hover:bg-slate-50">
                      <span className="text-sm font-semibold text-[#021d33]">{label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-slate-500">{description}</span>
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1.5 px-1.5">
                      {isStandaloneAppHref(aud.ctaPrimary.href) ? (
                        <AppOpenLink
                          href={aud.ctaPrimary.href}
                          className="text-[11px] font-semibold text-[#005B96] hover:underline"
                        >
                          {ctaPrimary}
                        </AppOpenLink>
                      ) : (
                        <Link href={localizePublicHref(aud.ctaPrimary.href, locale)} className="text-[11px] font-semibold text-[#005B96] hover:underline">
                          {ctaPrimary}
                        </Link>
                      )}
                      <span className="text-slate-300">·</span>
                      <Link href={localizePublicHref(aud.ctaSecondary.href, locale)} className="text-[11px] text-slate-500 hover:underline">
                        {ctaSecondary}
                      </Link>
                    </div>
                  </li>
                  );
                })}
              </ul>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
