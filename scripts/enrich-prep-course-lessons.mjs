#!/usr/bin/env node
/**
 * Deepen prijimacky prep lesson bodies + course blurbs in Supabase.
 * Usage:
 *   node scripts/enrich-prep-course-lessons.mjs [--dry-run] [--course=fyziologie-zaklady-uchazece]
 */
import { createClient } from "@supabase/supabase-js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import {
  COURSE_META as BASE_META,
  LESSON_BODIES as BASE_BODIES,
} from "./data/prep-lesson-enrichment.mjs";
import {
  COURSE_META as EXTRA_META,
  LESSON_BODIES as EXTRA_BODIES,
} from "./data/prep-lesson-deep-extra.mjs";

const COURSE_META = { ...BASE_META, ...EXTRA_META };
const LESSON_BODIES = { ...BASE_BODIES, ...EXTRA_BODIES };
if (BASE_BODIES["fyziologie-zaklady-uchazece"]) {
  LESSON_BODIES["fyziologie-zaklady-uchazece"] = BASE_BODIES["fyziologie-zaklady-uchazece"];
}
if (BASE_META["fyziologie-zaklady-uchazece"]) {
  COURSE_META["fyziologie-zaklady-uchazece"] = BASE_META["fyziologie-zaklady-uchazece"];
}

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");

function loadEnv() {
  const merged = loadProjectEnv(ROOT);
  for (const [key, val] of Object.entries(merged)) {
    process.env[key] = val;
  }
}

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const courseArg = argv.find((a) => a.startsWith("--course="));
  const courseFilter = courseArg ? courseArg.slice("--course=".length) : null;
  return { dryRun, courseFilter };
}

async function main() {
  loadEnv();
  const { dryRun, courseFilter } = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const courseSlugs = Object.keys(LESSON_BODIES).filter(
    (slug) => !courseFilter || slug === courseFilter
  );

  let updatedLessons = 0;
  let updatedCourses = 0;

  for (const courseSlug of courseSlugs) {
    const { data: course, error: courseErr } = await admin
      .from("courses")
      .select("id, slug, title")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (courseErr || !course) {
      console.warn(`[skip] course not found: ${courseSlug}`, courseErr?.message ?? "");
      continue;
    }

    const meta = COURSE_META[courseSlug];
    if (meta) {
      if (dryRun) {
        console.log(`[dry-run] update course ${courseSlug}`, Object.keys(meta));
      } else {
        const { error } = await admin.from("courses").update(meta).eq("id", course.id);
        if (error) console.error(`[course] ${courseSlug}`, error.message);
        else {
          updatedCourses += 1;
          console.log(`[course] updated ${courseSlug}`);
        }
      }
    }

    const bodies = LESSON_BODIES[courseSlug] ?? {};
    for (const [lessonSlug, content] of Object.entries(bodies)) {
      const words = content.split(/\s+/).filter(Boolean).length;
      if (dryRun) {
        console.log(`[dry-run] lesson ${courseSlug}/${lessonSlug} (~${words} words)`);
        continue;
      }

      const durationBump =
        courseSlug === "fyziologie-zaklady-uchazece"
          ? lessonSlug === "krevni-obeh"
            ? 32
            : 30
          : words > 200
            ? 28
            : undefined;

      const patch = {
        content,
        status: "published",
        ...(durationBump ? { duration_minutes: durationBump } : {}),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await admin
        .from("lessons")
        .update(patch)
        .eq("course_id", course.id)
        .eq("slug", lessonSlug)
        .select("id, slug");

      if (error) {
        console.error(`[lesson] ${courseSlug}/${lessonSlug}`, error.message);
        continue;
      }
      if (!data?.length) {
        console.warn(`[lesson] missing ${courseSlug}/${lessonSlug}`);
        continue;
      }
      updatedLessons += 1;
      console.log(`[lesson] updated ${courseSlug}/${lessonSlug} (~${words} words)`);
    }
  }

  console.log(
    dryRun
      ? `Dry run done for ${courseSlugs.length} courses`
      : `Done. courses=${updatedCourses} lessons=${updatedLessons}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});