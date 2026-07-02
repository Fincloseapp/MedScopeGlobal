#!/usr/bin/env node
/**
 * MedScope v35 course platform + content validation smoke.
 * Usage: node scripts/v35-course-smoke.mjs [baseUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
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
const DELAY_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\n=== v35 course smoke @ ${base} ===\n`);
const results = [];

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v37/health`, { signal: AbortSignal.timeout(45000) });
  let ok = false;
  if (res.ok) {
    const json = await res.json();
    ok = json.subsystems?.v35?.contentValidation === true;
    console.log(`health v35: ${ok ? "OK" : "FAIL"} courses=${json.subsystems?.v35?.courseCount}`);
  }
  results.push({ name: "health-v35", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/academy`, { signal: AbortSignal.timeout(45000) });
  const html = await res.text();
  const ok = res.ok && /academy|kurz/i.test(html);
  console.log(`academy grid: ${ok ? "OK" : "FAIL"}`);
  results.push({ name: "academy-grid", ok });
}

await sleep(DELAY_MS);
{
  const coursesRes = await fetch(`${base}/api/academy/courses?limit=10`, { signal: AbortSignal.timeout(45000) });
  let validationOk = false;
  if (coursesRes.ok) {
    const courses = (await coursesRes.json())?.courses ?? [];
    for (const c of courses.slice(0, 2)) {
      const dRes = await fetch(`${base}/api/academy/courses/${c.slug}`, { signal: AbortSignal.timeout(45000) });
      if (!dRes.ok) continue;
      const lessons = (await dRes.json())?.course?.lessons ?? [];
      const lesson = lessons[0];
      if (!lesson?.id) continue;
      const vRes = await fetch(
        `${base}/api/academy/lessons/${lesson.id}/validation?course=${encodeURIComponent(c.slug)}`,
        { signal: AbortSignal.timeout(45000) }
      );
      if (vRes.ok) {
        const vJson = await vRes.json();
        validationOk = vJson.version === "v35.0" && typeof vJson.validation?.content_mismatch === "boolean";
        console.log(`validation ${lesson.title?.slice(0, 30)}: ${validationOk ? "OK" : "FAIL"}`);
        break;
      }
    }
  }
  results.push({ name: "lesson-validation", ok: validationOk });
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ v35 smoke passed");
process.exit(failed.length ? 1 : 0);
