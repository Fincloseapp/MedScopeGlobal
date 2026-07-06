#!/usr/bin/env node
/**
 * Anonymize student_materials display metadata in Supabase.
 * Keeps external_url / source_url for internal audit; updates source_name for admin consistency.
 *
 * Usage: node scripts/anonymize-student-materials.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(path.join(root, f), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      /* ignore */
    }
  }
}

const ACADEMIC_PREFIX =
  /\b(MUDr\.|Mgr\.|Bc\.|PhDr\.|RNDr\.|Ing\.|Dr\.|Doc\.|doc\.|prof\.|Prof\.)\s*/gi;
const PROF_REFERENCE =
  /\b(?:k|podle|u|od|pro|na)\s+(?:prof\.|Prof\.|doc\.|Doc\.)\s*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]*(?:ovi|em|a|e|u)?/gi;
const PREFIXED_NAME =
  /\b(?:MUDr\.|Mgr\.|Bc\.|PhDr\.|RNDr\.|Ing\.|Dr\.|Doc\.|doc\.)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+)?/g;
const HONORIFIC_NAME =
  /\b(?:pana|paní|lorda|lady|sira)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+(?:a|ovi|em|é|u)?/gi;
const LEADING_NAME =
  /^(?:MUDr\.|Mgr\.|Bc\.|PhDr\.|RNDr\.|Ing\.|Dr\.|Doc\.)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+)?\s*[-–—:,]\s*/i;

function anonymizeTitle(title) {
  let t = title.trim();
  if (!t) return title;
  t = t.replace(LEADING_NAME, "");
  t = t.replace(PROF_REFERENCE, (match) => {
    if (/^podle/i.test(match)) return "podle učitele";
    if (/^k\s/i.test(match)) return "k učiteli";
    return "";
  });
  t = t.replace(HONORIFIC_NAME, "vyučujícího");
  t = t.replace(PREFIXED_NAME, "");
  t = t.replace(ACADEMIC_PREFIX, "");
  t = t
    .replace(/\s*[-–—]\s*[-–—]\s*/g, " — ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[-–—:,]\s*/, "")
    .replace(/\s+[-–—:,]\s*$/, "")
    .trim();
  return t.length >= 3 ? t : title;
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: rows, error } = await supabase.from("student_materials").select("id, title, source_name");
if (error) {
  console.error("Fetch failed:", error.message);
  process.exit(1);
}

let updated = 0;
const samples = [];

for (const row of rows ?? []) {
  const newTitle = anonymizeTitle(row.title);
  const needsTitle = newTitle !== row.title;
  const needsSource = row.source_name !== "MedScopeGlobal";

  if (!needsTitle && !needsSource) continue;

  if (samples.length < 5 && needsTitle) {
    samples.push({ before: row.title, after: newTitle });
  }

  if (dryRun) {
    updated++;
    continue;
  }

  const patch = {};
  if (needsTitle) patch.title = newTitle;
  if (needsSource) patch.source_name = "MedScopeGlobal";

  const { error: upErr } = await supabase.from("student_materials").update(patch).eq("id", row.id);
  if (upErr) {
    console.error(`Update failed for ${row.id}:`, upErr.message);
  } else {
    updated++;
  }
}

console.log(JSON.stringify({ dryRun, total: rows?.length ?? 0, updated, samples }, null, 2));
