import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getMagazineSearchCopy } from "@/lib/brand/magazine";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";
import { mergedArticleSearch } from "@/utils/merged-article-search";
import { sanitizeSearchInput } from "@/utils/search";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMagazineSearchCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/hledat",
    locale,
  });
}

export default async function HledatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const query = sanitizeSearchInput(sp.q ?? "");
  const { isVip, accessLevel } = await getReaderContext();
  const locale = await getServerLocale();
  const copy = getMagazineSearchCopy(locale);

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
        {copy.eyebrow}
      </p>
      <h1 className="font-display text-4xl font-bold text-[#021d33]">{copy.title}</h1>
      <p className="mt-2 text-muted-foreground">{copy.lead}</p>

      <form
        method="get"
        action={localizePublicHref("/hledat", locale)}
        className="mt-8"
        role="search"
        aria-label={copy.formLabel}
      >
        <label htmlFor="search-q" className="sr-only">
          {copy.queryLabel}
        </label>
        <div className="flex gap-2">
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={copy.placeholder}
            className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={copy.queryLabel}
            autoComplete="off"
          />
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            aria-label={copy.submitAria}
          >
            <Search className="h-4 w-4" aria-hidden />
            {copy.submit}
          </button>
        </div>
      </form>

      <div className="mt-10 space-y-4" aria-live="polite">
        {query.length >= 2 && results.length === 0 && (
          <p className="text-sm text-muted-foreground">{copy.empty(query)}</p>
        )}

        {query.length >= 2 ? (
          <div className="mb-8">
            <ListingAffiliateBox locale={locale as GlobalLocaleCode} topic={query} />
          </div>
        ) : null}

        {results.map((article) => (
          <Link
            key={article.slug}
            href={localizePublicHref(`/article/${article.slug}`, locale)}
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
                {formatPublicDate(article.published_at, locale, {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
