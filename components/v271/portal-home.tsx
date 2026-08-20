import { CoverImage } from "@/components/media/cover-image";
import Image from "next/image";
import Link from "next/link";
import type { DisplayArticle } from "@/lib/queries/articles";
import { APP_PRODUCTS } from "@/lib/apps/catalog";
import { V271_AUDIENCES, V271_SOCIAL_PROOF_STATS } from "@/lib/v271/homepage";
import {
  PORTAL_NEWS_NOTE,
  PORTAL_NEWS_TABS,
  PORTAL_PHILOSOPHY,
  PORTAL_SERVICES,
} from "@/lib/v271/portal";
import { PortalSearch } from "@/components/v271/portal-search";
import { WriterAgentMark } from "@/components/editorial/writer-agent-mark";
import { WriterAgentsStrip } from "@/components/editorial/writer-agents-strip";
import { AppOpenLink, isStandaloneAppHref } from "@/components/apps/app-origin-bar";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { resolveWriterAgent, resolveWritingStyle } from "@/lib/editorial/writer-agents";
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

function ArticleThumb({
  article,
  className,
  sizes,
}: {
  article: DisplayArticle;
  className: string;
  sizes: string;
}) {
  const agent = resolveWriterAgent(article);
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-100 ${className}`}>
      {article.cover_image_url ? (
        <CoverImage src={article.cover_image_url} alt="" className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#021d33] to-[#005B96]" />
      )}
      {agent ? (
        <span className="absolute bottom-1 left-1">
          <WriterAgentMark agent={agent} size={22} />
        </span>
      ) : null}
    </div>
  );
}

function PortalNewsFeed({ articles }: { articles: DisplayArticle[] }) {
  const featured = articles[0];
  const spotlight = articles.slice(1, 5);
  const rest = articles.slice(5);
  const featuredAgent = featured ? resolveWriterAgent(featured) : null;
  const featuredStyle = featured ? resolveWritingStyle(featured) : null;

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
      <p className="mb-3 text-[11px] text-slate-500">{PORTAL_NEWS_NOTE}</p>
      {featured ? (
        <article className="border-b border-slate-100 pb-3">
          <Link href={`/article/${featured.slug}`} className="group grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
            <ArticleThumb article={featured} className="h-36 sm:h-full min-h-[9rem]" sizes="220px" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#005B96]">
                {featuredAgent?.topicLabel ?? featured.categories?.name ?? "Magazín"}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96]">
                {featured.title}
              </h3>
              {featured.excerpt ? (
                <p className="mt-1 line-clamp-3 text-sm text-slate-600">{featured.excerpt}</p>
              ) : null}
              {featuredStyle ? (
                <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">styl {featuredStyle.label}</p>
              ) : null}
            </div>
          </Link>
        </article>
      ) : (
        <p className="text-sm text-slate-500">Redakční články se načtou, jakmile je databáze k dispozici.</p>
      )}
      {spotlight.length > 0 ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {spotlight.map((article) => (
            <li key={article.id}>
              <Link href={`/article/${article.slug}`} className="group flex gap-2.5">
                <ArticleThumb article={article} className="h-[4.5rem] w-[5.5rem] shrink-0" sizes="88px" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#005B96]">
                    {resolveWriterAgent(article)?.label ?? article.categories?.name ?? ""}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium leading-snug text-[#021d33] group-hover:text-[#005B96]">
                    {article.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {rest.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
          {rest.map((article) => (
            <li key={article.id}>
              <Link href={`/article/${article.slug}`} className="flex items-center gap-2.5 py-2 hover:bg-slate-50">
                <ArticleThumb article={article} className="h-12 w-16 shrink-0" sizes="64px" />
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-[#021d33] hover:text-[#005B96]">
                  {article.title}
                </span>
                <span className="hidden shrink-0 text-[10px] uppercase tracking-wide text-slate-400 sm:inline">
                  {resolveWriterAgent(article)?.label ?? article.categories?.name ?? ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
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
                      <Link href={aud.ctaPrimary.href} className="text-[11px] font-semibold text-[#005B96] hover:underline">
                        {aud.ctaPrimary.label}
                      </Link>
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
