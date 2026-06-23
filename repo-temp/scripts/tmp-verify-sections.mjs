/**
 * Verify section article mapping + access filter against Supabase.
 * Usage: node scripts/tmp-verify-sections.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
  ?? env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
const supabase = createClient(url, key);

const V24_SECTION_TO_MEDICAL = {
  medicine: "clinical-medicine",
  drugs: "pharma-therapeutics",
  legislation: "enhanced-medical-content",
  "digital-health": "healthcare-technology",
  news: "clinical-medicine",
  study: "medical-education",
  "pre-med": "medical-education",
  specialties: "clinical-medicine",
  articles: "clinical-medicine",
  quizzes: "medical-education",
};

const V19_RUBRIC = "v19-medical-brief";
const V24_RUBRIC = "v24-ultra";
const POOL_SECTIONS = new Set(["medical-science-research", "enhanced-medical-content"]);

const SECTIONS = [
  "clinical-medicine",
  "medical-science-research",
  "diagnostics-algorithms",
  "medical-education",
  "public-health-prevention",
  "healthcare-technology",
  "pharma-therapeutics",
  "enhanced-medical-content",
];

function resolveV24Section(article) {
  const meta = article.quiz_json ?? {};
  const v24Section = meta.section;
  if (v24Section && V24_SECTION_TO_MEDICAL[v24Section]) {
    return V24_SECTION_TO_MEDICAL[v24Section];
  }
  const m = article.slug.match(/^v24-([a-z-]+)-/);
  if (m) return V24_SECTION_TO_MEDICAL[m[1]] ?? null;
  return null;
}

function isLay(article) {
  if (article.audience === "public") return true;
  const rubric = article.rubric_slug ?? "";
  return rubric === "ai-lay-summary" || rubric === "ai-patient-education" || rubric === "verejnost";
}

function matchesSection(article, sectionSlug) {
  if (sectionSlug !== "public-health-prevention" && isLay(article)) return false;
  const v24 = resolveV24Section(article);
  if (v24 === sectionSlug) return true;
  if (POOL_SECTIONS.has(sectionSlug) && [V19_RUBRIC, V24_RUBRIC].includes(article.rubric_slug) && !isLay(article)) {
    return true;
  }
  return false;
}

function allowedForPhysician(article) {
  const level = article.min_access_level ?? "public";
  return ["public", "student", "physician"].includes(level);
}

const { data, error } = await supabase
  .from("articles")
  .select("id,slug,rubric_slug,audience,min_access_level,quiz_json")
  .eq("published", true)
  .in("rubric_slug", [V19_RUBRIC, V24_RUBRIC])
  .limit(500);

if (error) {
  console.error("Supabase error:", error.message);
  process.exit(1);
}

console.log(`Loaded ${data.length} v19/v24 articles\n`);

for (const section of SECTIONS) {
  const matched = data.filter((a) => matchesSection(a, section) && allowedForPhysician(a));
  console.log(`${section}: ${matched.length} articles`);
  if (section === "medical-science-research" || section === "enhanced-medical-content") {
    console.log(`  sample: ${matched.slice(0, 2).map((a) => a.slug).join(", ") || "(none)"}`);
  }
}

const zero = SECTIONS.filter((s) => {
  const n = data.filter((a) => matchesSection(a, s) && allowedForPhysician(a)).length;
  return n === 0;
});
if (zero.length) {
  console.error("\nFAIL: sections with 0 articles:", zero.join(", "));
  process.exit(1);
}
console.log("\nOK: all 8 sections have articles");
