import Image from "next/image";
import Link from "next/link";
import type { DisplayArticle } from "@/lib/queries/articles";
import { APP_PRODUCTS } from "@/lib/apps/catalog";
import { V271_AUDIENCES, V271_DOKUMENTACE_APP, V271_SOCIAL_PROOF_STATS } from "@/lib/v271/homepage";
import {
  getPortalNewsNote,
  PORTAL_NEWS_TABS,
  PORTAL_PHILOSOPHY,
  PORTAL_SERVICES,
} from "@/lib/v271/portal";
import { NEWS_DESKS, splitNewsDesks, type NewsDeskId } from "@/lib/v271/news-desks";
import { NewsArticleThumb, NewsDeskFallback, NewsHeadlineRow } from "@/components/articles/news-article-card";
import { PortalSearch } from "@/components/v271/portal-search";
import { WriterAgentsStrip } from "@/components/editorial/writer-agents-strip";
import { AppOpenLink, isStandaloneAppHref } from "@/components/apps/app-origin-bar";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { BookOpen, Gift, GraduationCap, LayoutGrid, Newspaper, Pill, Sparkles } from "lucide-react";

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
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 bg-[#f7fafc] px-3 py-2">
        <h2 className="text-sm font-bold text-[#021d33]">{title}</h2>
        {href ? (
          <Link href={href} className="text-xs font-medium text-[#005B96] hover:underline">
            více
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
}: {
  desk: NewsDeskId;
  articles: DisplayArticle[];
  featured?: boolean;
}) {
  const def = NEWS_DESKS.find((item) => item.id === desk)!;
  const lead = featured ? articles[0] : null;
  const rows = featured ? articles.slice(1, 4) : articles.slice(0, 4);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005B96]">{def.label}</h3>
        <Link href={def.href} className="text-[11px] font-medium text-[#005B96] hover:underline">
          {def.more} →
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

function PortalNewsFeed({ articles }: { articles: DisplayArticle[] }) {
  const desks = splitNewsDesks(articles);

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PORTAL_NEWS_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-[#e8f3fb] hover:text-[#005B96]"
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-slate-500">{getPortalNewsNote()}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <DeskColumn desk="novinky" articles={desks.novinky} featured />
        <DeskColumn desk="verejnost" articles={desks.verejnost} featured />
        <DeskColumn desk="dlouhovekost" articles={desks.dlouhovekost} featured />
        <DeskColumn desk="clanky" articles={desks.clanky} featured />
      </div>
    </>
  );
}

export function PortalHome({ articles }: { articles: DisplayArticle[] }) {
  return (
    <div className="border-b border-slate-200 bg-[#e8eef3]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
            {PORTAL_PHILOSOPHY.eyebrow}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
            {PORTAL_PHILOSOPHY.claim}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{PORTAL_PHILOSOPHY.subtitle}</p>
          <div className="mt-4">
            <PortalSearch />
          </div>
        </div>

        <nav aria-label="Služby MedScopeGlobal" className="mt-3 rounded-lg border border-slate-200 bg-white px-2 py-3 shadow-sm sm:px-3">
          <ul className="grid grid-cols-5 gap-1 sm:grid-cols-10">
            {PORTAL_SERVICES.map((svc) => {
              const openApp = isStandaloneAppHref(svc.href);
              const Item = openApp ? AppOpenLink : Link;
              return (
              <li key={svc.id}>
                <Item
                  href={svc.href}
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
                  <span className="text-[11px] font-semibold leading-tight text-[#021d33]">{svc.label}</span>
                  <span className="hidden text-[10px] text-slate-500 sm:block">{svc.hint}</span>
                </Item>
              </li>
              );
            })}
          </ul>
        </nav>

        <section
          aria-label="MeDiktor pro lékaře"
          className="mt-3 overflow-hidden rounded-lg border border-[#005B96]/25 bg-gradient-to-r from-[#021d33] via-[#005B96] to-[#0a7ab8] shadow-sm"
        >
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-4">
              <Image
                src="/assets/mediktor/icon-192.png"
                alt=""
                width={64}
                height={64}
                className="shrink-0 rounded-[22%] ring-2 ring-white/20"
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
                  {V271_DOKUMENTACE_APP.eyebrow}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                  {V271_DOKUMENTACE_APP.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-sky-100/95">
                  {V271_DOKUMENTACE_APP.description}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {V271_DOKUMENTACE_APP.price} · {V271_DOKUMENTACE_APP.trial}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={V271_DOKUMENTACE_APP.href}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#021d33] hover:bg-sky-50"
              >
                Více o MeDiktoru
              </Link>
              <Link
                href={V271_DOKUMENTACE_APP.pricingHref}
                className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ceník od 390 Kč
              </Link>
              <AppOpenLink
                href={V271_DOKUMENTACE_APP.appHref}
                className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-white/5"
              >
                Otevřít aplikaci
              </AppOpenLink>
            </div>
          </div>
        </section>

        <WriterAgentsStrip />

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Box title="Zpravodajství" href="/articles">
            <PortalNewsFeed articles={articles} />
          </Box>

          <div className="space-y-3">
            <Box title="Aplikace" href="/aplikace">
              <ul className="space-y-2">
                {APP_PRODUCTS.map((app) => (
                  <li key={app.id}>
                    {app.id === "mediktor" ? (
                      <div className="rounded-md p-1.5 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
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
                            <span className="block truncate text-xs text-slate-500">{app.tagline}</span>
                            <span className="mt-0.5 block text-[11px] font-semibold text-[#005B96]">{app.priceNote}</span>
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 px-1">
                          <Link href={app.marketingPath} className="text-[11px] font-semibold text-[#005B96] hover:underline">
                            Více →
                          </Link>
                          <Link href={app.pricingPath ?? "/mediktor/ceny"} className="text-[11px] font-semibold text-[#005B96] hover:underline">
                            Ceník →
                          </Link>
                          <AppOpenLink href={app.appPath} className="text-[11px] text-slate-500 hover:underline">
                            Aplikace
                          </AppOpenLink>
                        </div>
                      </div>
                    ) : (
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
                          <span className="block truncate text-xs text-slate-500">{app.tagline}</span>
                        </span>
                        <span className="text-xs font-semibold text-[#005B96]">nová karta</span>
                      </AppOpenLink>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href="/predplatne?trial=1"
                className="mt-3 flex w-full items-center justify-center rounded-md bg-[#005B96] px-3 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
              >
                14 dní zdarma
              </Link>
            </Box>

            <Box title="Pro koho">
              <ul className="space-y-2">
                {V271_AUDIENCES.map((aud) => (
                  <li key={aud.id}>
                    <Link href={aud.href} className="block rounded-md p-1.5 hover:bg-slate-50">
                      <span className="text-sm font-semibold text-[#021d33]">{aud.label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-slate-500">{aud.description}</span>
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1.5 px-1.5">
                      {isStandaloneAppHref(aud.ctaPrimary.href) ? (
                        <AppOpenLink
                          href={aud.ctaPrimary.href}
                          className="text-[11px] font-semibold text-[#005B96] hover:underline"
                        >
                          {aud.ctaPrimary.label}
                        </AppOpenLink>
                      ) : (
                        <Link href={aud.ctaPrimary.href} className="text-[11px] font-semibold text-[#005B96] hover:underline">
                          {aud.ctaPrimary.label}
                        </Link>
                      )}
                      <span className="text-slate-300">·</span>
                      <Link href={aud.ctaSecondary.href} className="text-[11px] text-slate-500 hover:underline">
                        {aud.ctaSecondary.label}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Box>

            <Box title="V číslech">
              <dl className="grid grid-cols-2 gap-2">
                {V271_SOCIAL_PROOF_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-md bg-slate-50 px-2 py-2">
                    <dt className="font-display text-lg font-bold text-[#005B96]">{stat.value}</dt>
                    <dd className="text-[10px] leading-snug text-slate-500">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
