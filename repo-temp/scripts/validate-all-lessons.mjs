#!/usr/bin/env node
/**
 * Validate all published academy lessons — report content_mismatch flags.
 * Usage: node scripts/validate-all-lessons.mjs [baseUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { localDataPath, projectPath } from "../lib/config/paths.mjs";

const root = projectPath();
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const base = (process.argv[2] ?? env.PRODUCTION_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\n=== Validate all lessons @ ${base} ===\n`);

const coursesRes = await fetch(`${base}/api/academy/courses?limit=50`, {
  signal: AbortSignal.timeout(45000),
});
const coursesJson = await coursesRes.json();
const courses = coursesJson?.courses ?? [];

const mismatches = [];
let checked = 0;

for (const course of courses) {
  const detailRes = await fetch(`${base}/api/academy/courses/${course.slug}`, {
    signal: AbortSignal.timeout(45000),
  });
  if (!detailRes.ok) continue;
  const detail = await detailRes.json();
  const lessons = detail?.course?.lessons ?? detail?.lessons ?? [];

  for (const lesson of lessons) {
    await sleep(500);
    const vRes = await fetch(
      `${base}/api/academy/lessons/${lesson.id}/validation?course=${encodeURIComponent(course.slug)}`,
      { signal: AbortSignal.timeout(45000) }
    );
    if (!vRes.ok) continue;
    const vJson = await vRes.json();
    checked += 1;
    if (vJson?.validation?.content_mismatch) {
      mismatches.push({
        course: course.slug,
        lesson: lesson.slug ?? lesson.id,
        title: lesson.title,
        reason: vJson.validation.reason,
        flags: vJson.validation.flags,
      });
      console.log(`⚠ MISMATCH: ${course.slug} / ${lesson.title}`);
    }
  }
}

console.log(`\nChecked ${checked} lessons across ${courses.length} courses`);
console.log(`Mismatches: ${mismatches.length}`);
if (mismatches.length) {
  for (const m of mismatches) {
    console.log(`  - ${m.course}/${m.lesson}: ${m.reason}`);
  }
}

const outPath = localDataPath("lesson-validation-report.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify({ checked, mismatches, generatedAt: new Date().toISOString() }, null, 2)
);
console.log(`Report: ${outPath}`);
process.exit(0);
