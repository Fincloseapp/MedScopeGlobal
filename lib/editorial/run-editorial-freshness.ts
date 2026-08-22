import { createServiceRoleClient } from "@/lib/supabase/service";
import { setCronStatus } from "@/lib/v25/system-state";
import {
  DEFAULT_DAILY_RESURFACE_LIMIT,
  buildResurfaceMetadata,
  selectResurfaceCandidates,
  type FreshnessArticle,
} from "@/lib/editorial/freshness";

const PAGE_SIZE = 200;
const POOL_LIMIT = 800;
const ARTICLE_COLUMNS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "metadata",
  "published_at",
  "created_at",
  "updated_at",
  "source_url",
  "source_name",
  "audience",
  "min_access_level",
  "locale",
  "rubric_slug",
  "public_topic",
  "content_type",
  "ai_generated",
].join(",");

export type EditorialFreshnessResult = {
  ok: boolean;
  scanned: number;
  selected: number;
  updated: number;
  slugs: string[];
  themes: string[];
  detail?: string;
};

async function fetchOlderPublished(
  admin: ReturnType<typeof createServiceRoleClient>,
  now: Date
): Promise<FreshnessArticle[]> {
  const maxAge = new Date(now.getTime() - 10 * 86_400_000).toISOString();
  const minAge = new Date(now.getTime() - 400 * 86_400_000).toISOString();
  const rows: FreshnessArticle[] = [];
  for (let from = 0; rows.length < POOL_LIMIT; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("published", true)
      .lt("published_at", maxAge)
      .gte("published_at", minAge)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`freshness query failed: ${error.message}`);
    const page = (data ?? []) as unknown as FreshnessArticle[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows.slice(0, POOL_LIMIT);
}

export async function runEditorialFreshness(options?: {
  limit?: number;
  now?: Date;
}): Promise<EditorialFreshnessResult> {
  const t0 = Date.now();
  const now = options?.now ?? new Date();
  const limit = Math.min(12, Math.max(1, options?.limit ?? DEFAULT_DAILY_RESURFACE_LIMIT));
  const admin = createServiceRoleClient();
  const pool = await fetchOlderPublished(admin, now);
  const selected = selectResurfaceCandidates(pool, limit, now);
  const slugs: string[] = [];
  const themes: string[] = [];
  let updated = 0;

  for (const article of selected) {
    const built = buildResurfaceMetadata(article, now);
    if (!built) continue;
    const { error } = await admin
      .from("articles")
      .update({
        metadata: built.metadata,
        updated_at: now.toISOString(),
      })
      .eq("id", article.id);
    if (error) {
      console.error("editorial-freshness update", article.slug, error);
      continue;
    }
    updated += 1;
    slugs.push(String(article.slug ?? article.id));
    themes.push(built.theme.id);
  }

  const result: EditorialFreshnessResult = {
    ok: true,
    scanned: pool.length,
    selected: selected.length,
    updated,
    slugs,
    themes,
    detail: `resurface ${updated}/${selected.length}; scanned ${pool.length}`,
  };

  setCronStatus(
    "editorial-freshness",
    updated > 0 || selected.length === 0 ? "ok" : "partial",
    Date.now() - t0,
    result.detail,
    { newArticles: 0, fetched: updated }
  );

  return result;
}
