import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key =
  env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() ??
  env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const { MEDICAL_SECTIONS } = await import(
  pathToFileURL(join(root, "lib/config/medical-sections.ts")).href
);
const {
  articleMatchesSection,
  rubricSlugsForSectionFetch,
  isLayAudienceArticle,
  sectionShowsLayContent,
  V19_RUBRIC_SLUG,
  V24_RUBRIC_SLUG,
} = await import(pathToFileURL(join(root, "lib/config/section-article-map.ts")).href);
const { mapArticleList } = await import(
  pathToFileURL(join(root, "lib/db/map-article.ts")).href
);
const { filterActiveArticles, filterCzechContent } = await import(
  pathToFileURL(join(root, "lib/v20/content-rules.ts")).href
);

const supabase = createClient(url, key);
const limit = 24;

function allowedLevelsForSection(accessLevel) {
  const levels = new Set(["public", "student", "physician"]);
  return levels;
}

function filterForSectionReader(articles, accessLevel, locale = "cs") {
  const allowed = allowedLevelsForSection(accessLevel);
  const active = filterActiveArticles(articles);
  const localized = filterCzechContent(active, locale);
  return localized.filter((a) => {
    const level = a.min_access_level ?? "public";
    return allowed.has(level);
  });
}

async function getArticlesBySection(sectionSlug) {
  const rubricSlugs = rubricSlugsForSectionFetch(sectionSlug);
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .in("rubric_slug", rubricSlugs)
    .order("published_at", { ascending: false })
    .limit(limit * 8);

  const rows = mapArticleList(data ?? []);
  const allowLay = sectionShowsLayContent(sectionSlug);

  const sectionMatched = rows.filter((article) => {
    if (!allowLay && isLayAudienceArticle(article)) return false;
    return articleMatchesSection(article, sectionSlug);
  });

  let candidates = sectionMatched;
  if (candidates.length < limit) {
    const seen = new Set(candidates.map((a) => a.id));
    const professionalPool = rows.filter((article) => {
      if (seen.has(article.id)) return false;
      if (!allowLay && isLayAudienceArticle(article)) return false;
      return (
        article.rubric_slug === V19_RUBRIC_SLUG || article.rubric_slug === V24_RUBRIC_SLUG
      );
    });
    candidates = [...candidates, ...professionalPool];
  }

  return filterForSectionReader(candidates, "physician").slice(0, limit);
}

for (const s of MEDICAL_SECTIONS) {
  const articles = await getArticlesBySection(s.slug);
  console.log(`${s.slug}: ${articles.length} (getArticlesBySection)`);
}
