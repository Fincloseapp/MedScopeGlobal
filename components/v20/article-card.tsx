import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { V20ArticleCover } from "@/components/v20/article-cover";
import { enrichArticleMeta } from "@/lib/v20/content-rules";
import { publicEditorialByline } from "@/lib/editorial/units";
import type { ArticleWithRelations } from "@/types/database";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function V20ArticleCard({
  article,
  locale,
}: {
  article: DisplayArticle | ArticleWithRelations;
  locale?: string;
}) {
  const cat = article.categories;
  const uiLocale =
    locale ??
    ("displayLocale" in article && article.displayLocale ? article.displayLocale : "cs");
  const authorLabel = publicEditorialByline(uiLocale);
  const meta = enrichArticleMeta({
    title: article.title,
    excerpt: article.excerpt,
    categories: cat,
  });
  const date = formatPublicDate(article.published_at, uiLocale);

  return (
    <article className="v20-article-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <Link href={localizePublicHref(`/article/${article.slug}`, uiLocale)} className="flex flex-1 flex-col">
        <V20ArticleCover
          title={article.title}
          category={cat?.name}
          coverUrl={article.cover_image_url}
          slug={article.slug}
          excerpt={article.excerpt}
          publicTopic={article.public_topic}
        />
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {cat && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {cat.name}
            </p>
          )}
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-[#021d33] sm:text-xl">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
            {meta.professionalSummary}
          </p>
        </div>
      </Link>
      <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5">
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-medium text-slate-700">
          <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {authorLabel}
        </span>
        {date && (
          <time className="inline-flex shrink-0 items-center gap-1" dateTime={article.published_at!}>
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {date}
          </time>
        )}
      </footer>
    </article>
  );
}
