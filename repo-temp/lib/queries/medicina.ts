import { createClient } from "@/lib/supabase/server";
import { prepareArticlesForDisplay } from "@/lib/articles/prepare-for-display";
import { mapArticleList } from "@/lib/db/map-article";
import { allowedAccessLevels, type AccessLevelId } from "@/lib/config/access-levels";
import type { LocaleCode } from "@/lib/i18n/config";
import type { ArticleWithRelations } from "@/types/database";

const articleSelect = `
  *,
  categories ( id, name, slug ),
  users!author_id ( id, full_name, avatar_url )
`;

function filterForReader(
  articles: ArticleWithRelations[],
  isVip: boolean,
  accessLevel: AccessLevelId
): ArticleWithRelations[] {
  const allowed = new Set(allowedAccessLevels(accessLevel));
  return articles.filter((article) => {
    if (!isVip && article.vip_only) return false;
    return allowed.has((article.min_access_level ?? "public") as AccessLevelId);
  });
}

export async function getMedicalArticles({
  medTrack,
  studyYear,
  limit = 12,
  isVip = false,
  accessLevel = "public" as AccessLevelId,
  locale = "cs" as LocaleCode,
}: {
  medTrack?: "priprava" | "studium" | null;
  studyYear?: number | null;
  limit?: number;
  isVip?: boolean;
  accessLevel?: AccessLevelId;
  locale?: LocaleCode;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 3);

  if (medTrack) {
    query = query.eq("med_track", medTrack);
  }
  if (studyYear) {
    query = query.eq("study_year", studyYear);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getMedicalArticles", error);
    return [];
  }

  const filtered = filterForReader(mapArticleList(data as Record<string, unknown>[] | null), isVip, accessLevel);
  const prepared = await prepareArticlesForDisplay(filtered, locale, {
    mode: "card",
    maxTranslate: limit,
  });

  return prepared.slice(0, limit);
}
