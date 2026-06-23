"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { AccessLevelId } from "@/lib/config/access-levels";
import type { LocaleCode } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/client";
import { mergedArticleSearch } from "@/utils/merged-article-search";
import { sanitizeSearchInput } from "@/utils/search";

export function SearchClient({
  initialQ,
  isVip = false,
  accessLevel = "public",
  locale = "cs",
}: {
  initialQ: string;
  isVip?: boolean;
  accessLevel?: AccessLevelId;
  locale?: LocaleCode;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState<
    {
      slug: string;
      title: string;
      excerpt: string | null;
      published_at: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        const t = sanitizeSearchInput(q);
        router.replace(`/search${t ? `?q=${encodeURIComponent(t)}` : ""}`, {
          scroll: false,
        });
        if (t.length < 2) {
          setResults([]);
          return;
        }
        setLoading(true);
        const supabase = createClient();
        const rows = await mergedArticleSearch(
          supabase,
          t,
          48,
          isVip,
          accessLevel,
          locale
        );
        setLoading(false);
        setResults(rows);
      })();
    }, 220);
    return () => clearTimeout(id);
  }, [q, router, isVip, accessLevel, locale]);

  return (
    <>
      <Input
        className="mt-8 h-12 text-lg"
        placeholder="Search headlines, excerpts, and story body"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-10 space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Updating results…</p>
        )}
        {!loading &&
          results.map((r) => (
            <Link
              key={r.slug}
              href={`/article/${r.slug}`}
              className="block rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40"
            >
              <p className="font-display text-lg font-semibold text-medical-navy">
                {r.title}
              </p>
              {r.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {r.excerpt}
                </p>
              )}
              {r.published_at && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(r.published_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        {!loading &&
          sanitizeSearchInput(q).length >= 2 &&
          results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No articles matched that query.
            </p>
          )}
      </div>
    </>
  );
}
