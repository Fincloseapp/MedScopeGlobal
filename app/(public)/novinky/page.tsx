import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { V20ArticleCard } from "@/components/v20/article-card";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";
import { resolveManyImages } from "@/lib/v25/images/resolve-many";
import { getArticlesByMetadataSection } from "@/lib/queries/articles";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { newsDesksForLocale } from "@/lib/v271/news-desks";

export const revalidate = 120;

const TAGS = [
  { href: "/novinky/revmatologie", tag: "revmatologie", label: "Revmatologie" },
  { href: "/novinky/univerzity", tag: "univerzity", label: "Univerzity" },
  { href: "/novinky/vyzkum", tag: "vyzkum", label: "Výzkum" },
  { href: "/novinky/kalendar", tag: "kalendar", label: "Kalendář" },
];

function hrefForItem(tag: string, slug: string) {
  if (tag === "univerzity") return `/novinky/univerzity/${slug}`;
  const section = TAGS.find((x) => x.tag === tag)?.href;
  return section ?? `/novinky/univerzity/${slug}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const news = newsDesksForLocale(locale).find((desk) => desk.id === "novinky");
  return {
    title: news?.label ?? "News",
    description: news?.blurb ?? "University and research news.",
  };
}

export default async function NovinkyPage() {
  const locale = await getServerLocale();
  const desks = newsDesksForLocale(locale);
  const newsDesk = desks.find((desk) => desk.id === "novinky")!;
  const [university, magazineNews] = await Promise.all([
    resolveManyImages(await getUniversityNewsList(), "university_news"),
    getArticlesByMetadataSection("aktuální-zprávy", 24, false, "public", locale),
  ]);
  const h = (path: string) => localizePublicHref(path, locale);

  return (
    <ModulePageShell
      eyebrow={newsDesk.kicker}
      title={newsDesk.label}
      description={newsDesk.blurb}
      ctaHref={h("/aktualni-zpravy")}
      ctaLabel={newsDesk.more}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <Link
            key={t.href}
            href={h(t.href)}
            prefetch
            className="rounded-full border border-[#8dc4ea] px-3 py-1 text-sm text-[#005B96]"
          >
            {t.label}
          </Link>
        ))}
        <Link
          href={h("/aktualni-zpravy")}
          className="rounded-full border border-[#8dc4ea] px-3 py-1 text-sm text-[#005B96]"
        >
          {newsDesk.more}
        </Link>
      </div>
      {university.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {university.map((n) => (
            <V4cContentCard
              key={n.id}
              href={h(hrefForItem(n.tag, n.slug))}
              title={n.title}
              meta={n.university ?? n.region ?? undefined}
              summary={n.summary}
              badge={n.tag}
              imageUrl={n.resolvedImageUrl}
              imageAlt={n.university ?? n.title}
            />
          ))}
        </div>
      ) : magazineNews.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {magazineNews.map((article) => (
            <V20ArticleCard key={article.slug} article={article} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          {newsDesk.blurb}{" "}
          <Link href={h("/aktualni-zpravy")} className="font-semibold text-[#005B96] hover:underline">
            {newsDesk.more}
          </Link>
        </p>
      )}
    </ModulePageShell>
  );
}
