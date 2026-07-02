import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Search } from "lucide-react";
import { getReaderContext } from "@/lib/auth/reader-context";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";
import { mergedArticleSearch } from "@/utils/merged-article-search";
import { sanitizeSearchInput } from "@/utils/search";

export const metadata: Metadata = buildPageMetadata({
  title: "Vyhledávání",
  description:
    "Vyhledávejte články, studie a odborný obsah v archivu MedScopeGlobal.",
  path: "/hledat",
});

export default async function HledatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const query = sanitizeSearchInput(sp.q ?? "");
  const { isVip, accessLevel } = await getReaderContext();
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  const results =
    query.length >= 2
      ? await mergedArticleSearch(
          await createClient(),
          query,
          48,
          isVip,
          accessLevel,
          locale
        )
      : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        Vyhledávání
      </p>
      <h1 className="font-display text-4xl font-bold text-[#021d33]">
        Hledat v archivu
      </h1>
      <p className="mt-2 text-muted-foreground">
        Prohledávejte nadpisy, perexy a texty článků (minimálně 2 znaky).
      </p>

      <form
        method="get"
        action="/hledat"
        className="mt-8"
        role="search"
        aria-label="Vyhledávání článků"
      >
        <label htmlFor="search-q" className="sr-only">
          Hledaný výraz
        </label>
        <div className="flex gap-2">
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Např. diabetes, hypertenze, očkování…"
            className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Hledaný výraz"
            autoComplete="off"
          />
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            aria-label="Spustit vyhledávání"
          >
            <Search className="h-4 w-4" aria-hidden />
            Hledat
          </button>
        </div>
      </form>

      <div className="mt-10 space-y-4" aria-live="polite">
        {query.length >= 2 && results.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Pro dotaz „{query}“ nebyly nalezeny žádné články.
          </p>
        )}

        {results.map((article) => (
          <Link
            key={article.slug}
            href={`/article/${article.slug}`}
            className="block rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40"
          >
            <p className="font-display text-lg font-semibold text-[#021d33]">
              {article.title}
            </p>
            {article.excerpt && (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {article.excerpt}
              </p>
            )}
            {article.published_at && (
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(article.published_at).toLocaleDateString("cs-CZ")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
