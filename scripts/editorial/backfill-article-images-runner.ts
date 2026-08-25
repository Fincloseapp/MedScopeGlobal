#!/usr/bin/env -S pnpm exec tsx
/**
 * Runner for editorial image backfill — invoked by backfill-article-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  findArticlesNeedingImages,
  suggestImageForArticle,
} from "../../lib/ecosystem/editorial/images/processor";
import { tryCreateServiceRoleClient } from "../../lib/supabase/service";
import { isMissingOrStaleHeroImage } from "../../lib/ecosystem/editorial/images/policy";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, "../..");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1] ?? "20", 10) : 20;

async function main() {
  console.log("\n=== Editorial image backfill ===");
  console.log(`mode: ${dryRun ? "dry-run (use --apply to write)" : "apply"}`);
  console.log(`limit: ${limit}\n`);

  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    console.log("Service role unavailable — listing logic only (no DB fetch).");
    console.log("Set SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(0);
  }

  const candidates = await findArticlesNeedingImages(limit);
  console.log(`Candidates missing/stale hero: ${candidates.length}\n`);

  let suggested = 0;
  let applied = 0;

  for (const article of candidates) {
    const suggestion = await suggestImageForArticle(article);
    if (!suggestion) {
      console.log(`  skip  ${article.slug} — no compliant match`);
      continue;
    }

    suggested += 1;
    console.log(`  match ${article.slug}`);
    console.log(`        topic=${suggestion.topic} source=${suggestion.sourceType}`);
    console.log(`        url=${suggestion.suggestedUrl.slice(0, 72)}…`);
    console.log(`        alt_cs=${suggestion.altTextCs.slice(0, 60)}…`);

    if (dryRun) continue;

    if (!suggestion.compliancePassed) {
      console.log(`        (compliance failed — not applying)`);
      continue;
    }

    const metadata =
      (article.metadata as Record<string, unknown> | null) ?? {};
    const nextMetadata = {
      ...metadata,
      hero_alt_text_cs: suggestion.altTextCs,
      hero_alt_text_en: suggestion.altTextEn,
      editorial_image_topic: suggestion.topic,
      editorial_image_source: suggestion.sourceType,
      editorial_image_applied_at: new Date().toISOString(),
    };

    const { error: upErr } = await admin
      .from("articles")
      .update({
        cover_image_url: suggestion.suggestedUrl,
        metadata: nextMetadata,
      })
      .eq("id", article.id);

    if (upErr) {
      console.log(`        ERROR apply: ${upErr.message}`);
      continue;
    }

    await admin.from("article_image_suggestions").upsert(
      {
        article_id: suggestion.articleId,
        article_slug: suggestion.articleSlug,
        suggested_url: suggestion.suggestedUrl,
        alt_text_cs: suggestion.altTextCs,
        alt_text_en: suggestion.altTextEn,
        topic: suggestion.topic,
        source_type: suggestion.sourceType,
        compliance_passed: true,
        compliance_notes: [],
        applied_at: new Date().toISOString(),
      },
      { onConflict: "article_id,suggested_url" }
    );

    applied += 1;
    console.log(`        applied ✓`);
  }

  console.log(`\nSummary: ${candidates.length} candidates, ${suggested} matched, ${applied} applied`);
  if (dryRun && suggested > 0) {
    console.log("\nRe-run with --apply to persist cover_image_url + alt text metadata.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Export helpers for functional-check import path validation
export { isMissingOrStaleHeroImage };
