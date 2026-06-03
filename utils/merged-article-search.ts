import {
  allowedAccessLevels,
  type AccessLevelId,
} from "@/lib/config/access-levels";
import type { LocaleCode } from "@/lib/i18n/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearchInput } from "@/utils/search";

export async function mergedArticleSearch(
  supabase: SupabaseClient,
  term: string,
  limit = 24,
  isVip = false,
  accessLevel: AccessLevelId = "public",
  locale: LocaleCode = "cs"
) {
  const t = sanitizeSearchInput(term);
  if (t.length < 2) {
    return [] as {
      slug: string;
      title: string;
      excerpt: string | null;
      published_at: string | null;
    }[];
  }

  const pattern = `%${t}%`;

  const select =
    "slug, title, excerpt, published_at, locale, vip_only, min_access_level";

  const base = () =>
    supabase.from("articles").select(select).eq("published", true);

  const [r1, r2, r3] = await Promise.all([
    base()
      .ilike("title", pattern)
      .order("published_at", { ascending: false })
      .limit(12),
    base()
      .ilike("excerpt", pattern)
      .order("published_at", { ascending: false })
      .limit(12),
    base()
      .ilike("content", pattern)
      .order("published_at", { ascending: false })
      .limit(12),
  ]);

  if (r1.error || r2.error || r3.error) {
    console.error(r1.error ?? r2.error ?? r3.error);
    return [];
  }

  const map = new Map<
    string,
    {
      slug: string;
      title: string;
      excerpt: string | null;
      published_at: string | null;
    }
  >();

  for (const res of [r1, r2, r3]) {
    (res.data ?? []).forEach((row) => {
      map.set(row.slug, row);
    });
  }

  const allowed = new Set(allowedAccessLevels(accessLevel));

  return [...map.values()]
    .filter((row) => {
      const full = row as {
        vip_only?: boolean;
        min_access_level?: string;
      };
      if (!isVip && full.vip_only) return false;
      const level = full.min_access_level ?? "public";
      return allowed.has(level as AccessLevelId);
    })
    .sort((a, b) => {
      const da = a.published_at ? new Date(a.published_at).getTime() : 0;
      const db = b.published_at ? new Date(b.published_at).getTime() : 0;
      return db - da;
    })
    .slice(0, limit);
}
