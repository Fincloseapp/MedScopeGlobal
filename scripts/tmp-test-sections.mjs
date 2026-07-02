import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
const supabase = createClient(url, key);

const rubrics = [
  "ai-case-study",
  "v19-medical-brief",
  "v24-ultra",
];
const { data, error } = await supabase
  .from("articles")
  .select("slug,rubric_slug,audience,min_access_level,quiz_json")
  .eq("published", true)
  .in("rubric_slug", rubrics)
  .limit(20);
console.log("error", error?.message);
console.log("count", data?.length);
for (const row of data ?? []) {
  const meta = row.quiz_json ?? {};
  console.log(row.slug, row.rubric_slug, meta.articleType ?? "-", meta.nzipCategory ?? "-");
}
