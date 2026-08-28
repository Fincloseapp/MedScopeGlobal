#!/usr/bin/env node
/**
 * Persist polishCzechFields to Supabase articles (title, excerpt, content).
 * Usage: npx tsx scripts/apply-czech-fields-batch.ts [--limit=300] [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { polishCzechFields } from "@/lib/v22/translate";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 300);

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: articles, error } = await admin
    .from("articles")
    .select("id, slug, title, excerpt, content, locale")
    .eq("published", true)
    .or("locale.eq.cs,locale.is.null")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let updated = 0;
  const examples: { slug: string; before: string; after: string }[] = [];

  const TEASER_MARKER =
    "Podrobnosti a primární data jsou k dispozici u původního zdroje";

  for (const article of articles ?? []) {
    // Never run EN-ingest teaser replacement on native Czech public magazine rows.
    if (article.slug?.startsWith("verejnost-")) continue;
    const plain = (article.content ?? "").replace(/<[^>]+>/g, " ");
    const hasCz = /[áčďéěíňóřšťúůýž]/i.test(`${article.title} ${plain}`);
    if (hasCz && plain.trim().length > 600) continue;

    const polished = polishCzechFields(
      {
        title: article.title ?? "",
        excerpt: article.excerpt,
        content: article.content,
      },
      "cs"
    );

    const next = {
      title: polished.title,
      excerpt: polished.excerpt ?? article.excerpt,
      content: polished.content ?? article.content,
    };

    // Safety: never persist a body that collapsed a long article into the EN-ingest stub.
    const beforeLen = (article.content ?? "").length;
    const afterLen = (next.content ?? "").length;
    const introducedStub =
      !(article.content ?? "").includes(TEASER_MARKER) &&
      (next.content ?? "").includes(TEASER_MARKER);
    if (beforeLen > 800 && (afterLen < beforeLen * 0.4 || introducedStub)) {
      next.content = article.content ?? next.content;
      console.warn(`Kept original body (teaser guard): ${article.slug}`);
    }

    const changed =
      next.title !== article.title ||
      next.excerpt !== article.excerpt ||
      next.content !== article.content;

    if (!changed) continue;

    if (examples.length < 8) {
      examples.push({
        slug: article.slug,
        before: (article.title ?? "").slice(0, 100),
        after: next.title.slice(0, 100),
      });
    }

    if (dryRun) {
      console.log(`[dry-run] ${article.slug}`);
      updated++;
      continue;
    }

    const { error: upErr } = await admin.from("articles").update(next).eq("id", article.id);
    if (upErr) console.error(`Failed ${article.slug}:`, upErr.message);
    else {
      console.log(`Updated: ${article.slug}`);
      updated++;
    }
  }

  console.log(JSON.stringify({ updated, dryRun, examples }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
