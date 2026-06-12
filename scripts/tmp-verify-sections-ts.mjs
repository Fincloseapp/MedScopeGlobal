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
} = await import(pathToFileURL(join(root, "lib/config/section-article-map.ts")).href);
const { mapArticleList } = await import(
  pathToFileURL(join(root, "lib/db/map-article.ts")).href
);

const supabase = createClient(url, key);
const rubrics = [
  ...new Set(MEDICAL_SECTIONS.flatMap((s) => rubricSlugsForSectionFetch(s.slug))),
];
const { data, error } = await supabase
  .from("articles")
  .select("*")
  .eq("published", true)
  .in("rubric_slug", rubrics)
  .limit(500);

if (error) throw error;
const rows = mapArticleList(data ?? []);

for (const s of MEDICAL_SECTIONS) {
  const allowLay = sectionShowsLayContent(s.slug);
  const matched = rows.filter((a) => {
    if (!allowLay && isLayAudienceArticle(a)) return false;
    return articleMatchesSection(a, s.slug);
  }).filter((a) =>
    ["public", "student", "physician"].includes(a.min_access_level ?? "public")
  );
  console.log(`${s.slug}: ${matched.length}`);
}
