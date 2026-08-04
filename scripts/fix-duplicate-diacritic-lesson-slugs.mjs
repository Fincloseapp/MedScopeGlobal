#!/usr/bin/env node
/**
 * Unpublish diacritic duplicate lessons when an ASCII twin exists;
 * otherwise rename slug to ASCII-folded form.
 */
import { createClient } from "@supabase/supabase-js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = loadProjectEnv(ROOT);
for (const [k, v] of Object.entries(env)) process.env[k] = v;

function foldSlug(slug) {
  return slug.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

const dryRun = process.argv.includes("--dry-run");
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: lessons, error } = await admin
  .from("lessons")
  .select("id, slug, status, course_id, sort_order, title")
  .eq("status", "published");

if (error) {
  console.error(error.message);
  process.exit(1);
}

const byCourse = new Map();
for (const lesson of lessons ?? []) {
  const list = byCourse.get(lesson.course_id) ?? [];
  list.push(lesson);
  byCourse.set(lesson.course_id, list);
}

let unpublished = 0;
let renamed = 0;

for (const [, list] of byCourse) {
  const byFolded = new Map();
  for (const lesson of list) {
    const key = foldSlug(lesson.slug);
    const arr = byFolded.get(key) ?? [];
    arr.push(lesson);
    byFolded.set(key, arr);
  }

  for (const [folded, group] of byFolded) {
    if (group.length === 1) {
      const only = group[0];
      if (only.slug !== folded) {
        console.log(`[rename] ${only.slug} -> ${folded}`);
        if (!dryRun) {
          const { error: updErr } = await admin
            .from("lessons")
            .update({ slug: folded, updated_at: new Date().toISOString() })
            .eq("id", only.id);
          if (updErr) console.error(updErr.message);
          else renamed += 1;
        }
      }
      continue;
    }

    const ascii = group.find((l) => /^[\x00-\x7F]+$/.test(l.slug)) ?? group.find((l) => l.slug === folded);
    const keep = ascii ?? group.sort((a, b) => a.sort_order - b.sort_order)[0];
    for (const lesson of group) {
      if (lesson.id === keep.id) {
        if (keep.slug !== folded) {
          console.log(`[rename-keep] ${keep.slug} -> ${folded}`);
          if (!dryRun) {
            const { error: updErr } = await admin
              .from("lessons")
              .update({ slug: folded, updated_at: new Date().toISOString() })
              .eq("id", keep.id);
            if (updErr) console.error(updErr.message);
            else renamed += 1;
          }
        }
        continue;
      }
      console.log(`[unpublish-dup] ${lesson.slug} (keep ${keep.slug})`);
      if (!dryRun) {
        const { error: updErr } = await admin
          .from("lessons")
          .update({ status: "draft", updated_at: new Date().toISOString() })
          .eq("id", lesson.id);
        if (updErr) console.error(updErr.message);
        else unpublished += 1;
      }
    }
  }
}

console.log(dryRun ? "dry-run done" : `done unpublished=${unpublished} renamed=${renamed}`);