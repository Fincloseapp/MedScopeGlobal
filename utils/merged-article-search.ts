import { foldSearchText, queryMatchesHaystack } from "@/lib/search/fold";
import { isJunkPublicCopy } from "@/lib/editorial/listing-junk";
import { nativeDeskArticlesForLocale } from "@/lib/editorial/native-desk-articles";
import {
  allowedAccessLevels,
  type AccessLevelId,
} from "@/lib/config/access-levels";
import type { LocaleCode } from "@/lib/i18n/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearchInput } from "@/utils/search";

export type ArticleSearchHit = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

function uniqueHits(rows: ArticleSearchHit[]): ArticleSearchHit[] {
  const map = new Map<string, ArticleSearchHit>();
  for (const row of rows) {
    if (!row.slug || map.has(row.slug)) continue;
    if (isJunkPublicCopy(row.title, row.excerpt)) continue;
    map.set(row.slug, row);
  }
  return [...map.values()];
}

function nativeDeskHits(term: string, locale: LocaleCode): ArticleSearchHit[] {
  return nativeDeskArticlesForLocale(locale)
    .filter((row) =>
      queryMatchesHaystack(
        term,
        `${row.title} ${row.excerpt ?? ""} ${row.slug} ${(row.metadata as { keywords?: string[] } | null)?.keywords?.join(" ") ?? ""} ${String(row.content ?? "").slice(0, 4000)}`
      )
    )
    .map((row) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      published_at: row.published_at,
    }));
}

async function supabaseHits(
  supabase: SupabaseClient,
  term: string,
  isVip: boolean,
  accessLevel: AccessLevelId
): Promise<ArticleSearchHit[]> {
  const folded = foldSearchText(term);
  const patterns = Array.from(new Set([term, folded].filter((item) => item.length >= 2))).map(
    (item) => `%${item}%`
  );

  const select = "slug, title, excerpt, published_at, locale, vip_only, min_access_level";
  const queries = patterns.flatMap((pattern) => [
    supabase.from("articles").select(select).eq("published", true).ilike("title", pattern).limit(24),
    supabase.from("articles").select(select).eq("published", true).ilike("excerpt", pattern).limit(24),
    supabase.from("articles").select(select).eq("published", true).ilike("slug", pattern).limit(24),
  ]);

  const settled = await Promise.allSettled(queries);
  const allowed = new Set(allowedAccessLevels(accessLevel));
  const rows: ArticleSearchHit[] = [];

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const { data, error } = result.value;
    if (error || !data) continue;
    for (const row of data) {
      if (!isVip && row.vip_only) continue;
      const level = (row.min_access_level ?? "public") as AccessLevelId;
      if (!allowed.has(level)) continue;
      rows.push({
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        published_at: row.published_at,
      });
    }
  }

  return rows;
}

export async function mergedArticleSearch(
  supabase: SupabaseClient | null | undefined,
  term: string,
  limit = 24,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
): Promise<ArticleSearchHit[]> {
  const t = sanitizeSearchInput(term);
  if (t.length < 2) return [];

  const [fromDb, fromDesk] = await Promise.all([
    supabase ? supabaseHits(supabase, t, isVip, accessLevel) : Promise.resolve([] as ArticleSearchHit[]),
    Promise.resolve(nativeDeskHits(t, locale)),
  ]);

  return uniqueHits([...fromDesk, ...fromDb])
    .sort((a, b) => {
      const da = a.published_at ? new Date(a.published_at).getTime() : 0;
      const db = b.published_at ? new Date(b.published_at).getTime() : 0;
      return db - da;
    })
    .slice(0, limit);
}
