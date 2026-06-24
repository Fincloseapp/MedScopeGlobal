import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { V20ArticleCover } from "@/components/v20/article-cover";
import { enrichArticleMeta } from "@/lib/v20/content-rules";
import type { ArticleWithRelations } from "@/types/database";

export function V20ArticleCard({ article }: { article: ArticleWithRelations }) {
  const cat = article.categories;
  const author = article.users;
  const meta = enrichArticleMeta({
    title: article.title,
    excerpt: article.excerpt,
    categories: cat,
  });
  const date =
    article.published_at &&
    new Date(article.published_at).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <article className="v20-article-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <Link href={`/article/${article.slug}`} className="flex flex-1 flex-col">
        <V20ArticleCover
          title={article.title}
          category={cat?.name}
          coverUrl={article.cover_image_url}
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
          {author?.full_name ?? "Redakce MedScope"}
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
