"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { V19ArticleBriefCard, type V19BriefArticle } from "@/components/v19/article-brief-card";
import { V19ArticleBriefSkeleton } from "@/components/v19/article-brief-skeleton";
import { V19_ENGINE_VERSION, V19_UI_BUILD_STAMP } from "@/lib/v19/version";

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
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (nextOffset: number, append: boolean) => {
      const params = new URLSearchParams({
        limit: String(initialLimit),
        offset: String(nextOffset),
        locale,
        mode,
        deepLink: "1",
      });
      const res = await fetch(`/api/v19/articles?${params}`);
      const json = (await res.json()) as {
        articles?: ApiArticle[];
        count?: number;
      };
      const batch = json.articles ?? [];
      setArticles((prev) => (append ? [...prev, ...batch] : batch));
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
    if (!el || !hasMore || loading || loadingMore) return;

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
  }, [fetchPage, hasMore, loading, loadingMore, offset]);

  return (
    <section
      className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8 sm:px-6"
      data-v19-ui={V19_ENGINE_VERSION}
      data-v19-ui-build={V19_UI_BUILD_STAMP}
      data-v19-deep-link="1"
    >
      <h2 className="mb-4 font-display text-2xl font-semibold text-medical-navy">{title}</h2>
      {loading ? (
        <V19ArticleBriefSkeleton count={initialLimit} />
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Zatím žádné briefy — generují se automaticky denně nebo přes API v19.
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
