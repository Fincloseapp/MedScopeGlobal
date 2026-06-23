"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { V19ArticleBriefCard, type V19BriefArticle } from "@/components/v19/article-brief-card";
import { V19ArticleBriefSkeleton } from "@/components/v19/article-brief-skeleton";
import { fetchV20Json } from "@/lib/v20/api-client";

type ApiArticle = V19BriefArticle & { id: string };

export function V19ArticleBriefFeedClient({
  title,
  initialLimit = 6,
  locale = "auto",
  mode = "doctor",
}: {
  title: string;
  initialLimit?: number;
  locale?: string;
  mode?: "doctor" | "patient" | "scientist";
}) {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const MAX_PAGES = 2;

  const fetchPage = useCallback(
    async (nextOffset: number, append: boolean) => {
      const params = new URLSearchParams({
        limit: String(initialLimit),
        offset: String(nextOffset),
        locale,
        mode,
        deepLink: "1",
      });
      const json = await fetchV20Json<{
        articles?: ApiArticle[];
        count?: number;
      }>(`/api/v19/articles?${params}`, { ttlMs: 45_000, retries: 2 });
      const batch = json.articles ?? [];
      setArticles((prev) => (append ? [...prev, ...batch] : batch));
      setPagesLoaded((p) => (append ? p + 1 : 1));
      setHasMore(batch.length >= initialLimit);
      setOffset(nextOffset + batch.length);
    },
    [initialLimit, locale, mode]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchPage(0, false).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || loadingMore || pagesLoaded >= MAX_PAGES) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setLoadingMore(true);
        void fetchPage(offset, true).finally(() => setLoadingMore(false));
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, loading, loadingMore, offset, pagesLoaded]);

  return (
    <section className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8 sm:px-6">
      <h2 className="mb-4 font-display text-2xl font-semibold text-medical-navy">{title}</h2>
      {loading ? (
        <V19ArticleBriefSkeleton count={initialLimit} />
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Zatím žádné briefy — generují se automaticky denně.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <V19ArticleBriefCard key={article.id ?? article.slug} article={article} />
          ))}
          {loadingMore ? <V19ArticleBriefSkeleton count={2} /> : null}
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
        </div>
      )}
    </section>
  );
}
