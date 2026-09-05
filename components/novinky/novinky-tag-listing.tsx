import Link from "next/link";
import { V4cContentCard } from "@/components/v4c/content-card";
import { V20ArticleCard } from "@/components/v20/article-card";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";
import { getArticlesByMetadataSection } from "@/lib/queries/articles";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { normalizeLocale } from "@/lib/i18n/config";

export async function NovinkyTagListing({
  tag,
  locale,
  hrefForItem,
}: {
  tag: string;
  locale: string;
  hrefForItem?: (slug: string) => string;
}) {
  const [university, magazine] = await Promise.all([
    getUniversityNewsList(tag),
    getArticlesByMetadataSection("aktuální-zprávy", 12, false, "public", normalizeLocale(locale)),
  ]);
  const h = (path: string) => localizePublicHref(path, locale);

  if (university.length > 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {university.map((n) => (
          <V4cContentCard
            key={n.id}
            href={h(hrefForItem ? hrefForItem(n.slug) : `/novinky/${tag}`)}
            title={n.title}
            meta={n.university ?? n.region ?? undefined}
            summary={n.summary}
            badge={n.tag}
          />
        ))}
      </div>
    );
  }

  if (magazine.length > 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {magazine.map((article) => (
          <V20ArticleCard key={article.slug} article={article} locale={locale} />
        ))}
      </div>
    );
  }

  return (
    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
      Tag se doplňuje.{" "}
      <Link href={h("/aktualni-zpravy")} className="font-semibold text-[#005B96] hover:underline">
        Otevřít všechny aktuality
      </Link>
    </p>
  );
}
