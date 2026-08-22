/**
 * Academy v35 Phase 1 skeleton — required files for deploy gate.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "supabase/migrations/20260619120000_academy_v35_core.sql",
  "types/academy.ts",
  "lib/academy/db.ts",
  "lib/academy/ai/controller.ts",
  "lib/academy/ai/experts.ts",
  "lib/academy/ai/workers/course-creator.ts",
  "lib/academy/ai/workers/lesson-generator.ts",
  "app/api/academy/courses/route.ts",
  "app/api/academy/courses/[id]/route.ts",
  "app/api/academy/lessons/[id]/route.ts",
  "app/api/academy/quizzes/[id]/route.ts",
  "app/api/academy/ai/generate-course/route.ts",
  "app/api/academy/leaderboard/route.ts",
  "app/api/academy/progress/update/route.ts",
  "app/api/academy/health/route.ts",
  "app/api/cron/academy-daily/route.ts",
  "app/(public)/academy/page.tsx",
  "app/(public)/academy/courses/page.tsx",
  "app/(public)/academy/courses/[slug]/page.tsx",
  "components/academy/course-card.tsx",
  "components/academy/page-header.tsx",
  "app/(admin)/admin/academy/page.tsx",
  "app/(admin)/admin/academy/courses/page.tsx",
  "scripts/academy-v35-smoke.mjs",
  "docs/medscope-academy-v35-MASTER.md",
  "docs/academy-v35-ROADMAP.md",
];

let failed = 0;
for (const rel of required) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error(`✗ missing ${rel}`);
    failed += 1;
  }
}

const cronSources = [".github/workflows/cloudflare-cron.yml"];
const hasCron = cronSources.some((rel) => {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return false;
  const text = fs.readFileSync(abs, "utf8");
  return text.includes("/api/cron/academy-daily");
});
if (!hasCron) {
  console.error("✗ academy-daily cron missing (.github/workflows/cloudflare-cron.yml)");
  failed += 1;
}

const nav = fs.readFileSync(path.join(root, "lib/config/main-navigation.ts"), "utf8");
if (!nav.includes("/academy")) {
  console.error("✗ main-navigation.ts missing Academy link");
  failed += 1;
}

const home = fs.readFileSync(path.join(root, "components/v271/homepage-sections.tsx"), "utf8");
if (!home.includes("V272AcademyCtaBlock")) {
  console.error("✗ homepage missing Academy CTA block");
  failed += 1;
}

if (failed) {
  console.error(`\nAcademy v35 skeleton FAILED (${failed} issues)\n`);
  process.exit(1);
}

console.log("✓ Academy v35 skeleton verified");
