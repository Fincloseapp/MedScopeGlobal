import { Suspense } from "react";
import { V19ArticleBriefFeedClient } from "@/components/v19/article-brief-feed-client";
import { V19ArticleBriefSkeleton } from "@/components/v19/article-brief-skeleton";
import { getV19Articles } from "@/lib/v19/engine";
import { resolveV19LocaleFromRequest } from "@/lib/v19/localize";
import { V19ArticleBriefCard } from "@/components/v19/article-brief-card";

/** Server-rendered feed (SSR) — use for SEO-critical embeds. */
export async function V19ArticleBriefFeed({
  locale,
  limit = 8,
  title = "Odborné medicínské briefy",
}: {
  locale?: string;
  limit?: number;
  title?: string;
}) {
  const resolved = locale ?? (await resolveV19LocaleFromRequest());
  const articles = await getV19Articles(resolved, limit);

  if (!articles.length) return null;

  return (
    <section className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8 sm:px-6">
      <h2 className="mb-4 font-display text-2xl font-semibold text-medical-navy">{title}</h2>
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <V19ArticleBriefCard key={article.id ?? article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}

/** Client lazy-loaded feed with skeleton + infinite scroll. */
export function V19ArticleBriefFeedLazy({
  title = "Odborné medicínské briefy",
  limit = 6,
  locale = "auto",
}: {
  title?: string;
  limit?: number;
  locale?: string;
}) {
  return (
    <Suspense fallback={<V19ArticleBriefSkeleton count={limit} />}>
      <V19ArticleBriefFeedClient title={title} initialLimit={limit} locale={locale} />
    </Suspense>
  );
}
