#!/usr/bin/env npx tsx
/**
 * Scan published articles for template/boilerplate text and rewrite via v26 editorial prompts.
 *
 * Usage:
 *   npx tsx scripts/rewrite-boilerplate-articles.ts --scan-only
 *   npx tsx scripts/rewrite-boilerplate-articles.ts [--limit=N] [--dry-run] [--delay-ms=1500]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { rewriteToV26Standard } from "@/lib/v26/rewrite-engine";
import { mergeV26Metadata } from "@/lib/v26/editorial-standard";
import { generateTextFromLlm } from "@/lib/ai/chat-json";
import {
  detectTemplateIssue,
  isBoilerplateContent,
  isEnglishDominantTitle,
  needsTemplateRewrite,
} from "@/lib/v26/editorial-prompts.mjs";

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
const scanOnly = args.includes("--scan-only");
const dryRun = args.includes("--dry-run");
const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 500);
const delayMs = Number(args.find((a) => a.startsWith("--delay-ms="))?.split("=")[1] ?? 3000);

/** Force smaller Groq model for bulk rewrites (env from .env.local may set 70b). */
process.env.AI_MODEL = "llama-3.1-8b-instant";
process.env.GROQ_MODEL_PRIMARY = "llama-3.1-8b-instant";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  metadata: Record<string, unknown> | null;
  min_access_level: string | null;
  audience: string | null;
  locale: string | null;
  source_url: string | null;
  source_name: string | null;
  public_topic: string | null;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function rewriteWithRetry(row: ArticleRow, audience: "public" | "student" | "physician") {
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await rewriteToV26Standard({
        title: row.title,
        excerpt: row.excerpt ?? "",
        content: row.content ?? "",
        audience,
        topic: row.public_topic ?? undefined,
        sourceCitation: row.source_url
          ? {
              name: row.source_name ?? "Zdroj",
              url: row.source_url,
              originalTitle: row.title,
            }
          : undefined,
        seed: row.slug,
      });
      return result;
    } catch (e) {
      if (attempt === maxAttempts - 1) throw e;
      await sleep(5000 * (attempt + 1));
    }
  }
  throw new Error("rewrite exhausted retries");
}

/** Lightweight Czech title/excerpt translation when full rewrite leaves English metadata. */
async function patchEnglishTitleFields(
  title: string,
  excerpt: string,
  content: string
): Promise<{ title: string; excerpt: string; content: string } | null> {
  let outTitle = title;
  let outExcerpt = excerpt;

  if (isEnglishDominantTitle(title)) {
    const translated = await generateTextFromLlm({
      system:
        "Přelož medicínský titulek studie do češtiny. Vrať pouze přeložený titulek — gramaticky správnou češtinu, bez uvozovek.",
      user: title,
      maxTokens: 220,
      temperature: 0.2,
    });
    if (!translated?.trim() || isEnglishDominantTitle(translated)) return null;
    outTitle = translated.trim();
  }

  const excerptLooksTemplate =
    excerpt.includes("evidence-based přístup") ||
    excerpt.includes("Odborný přehled —") ||
    excerpt.includes("profesionální shrnutí pro českou klinickou");

  if (isEnglishDominantTitle(excerpt) || excerptLooksTemplate) {
    const translatedExcerpt = await generateTextFromLlm({
      system:
        "Napiš český perex (2–3 věty) k medicínskému článku. Konkrétní, odborný tón, bez šablonových frází redakce.",
      user: `Titulek: ${outTitle}\n\nObsah (zkráceně):\n${content.slice(0, 1500)}`,
      maxTokens: 350,
      temperature: 0.35,
    });
    if (!translatedExcerpt?.trim()) return null;
    outExcerpt = translatedExcerpt.trim();
  }

  return { title: outTitle, excerpt: outExcerpt, content };
}

function resolveAudience(row: ArticleRow): "public" | "student" | "physician" {
  const level = row.min_access_level ?? row.audience ?? "public";
  if (level === "physician" || level === "professional") return "physician";
  if (level === "student") return "student";
  return "public";
}

async function fetchAllPublished(): Promise<ArticleRow[]> {
  const admin = createServiceRoleClient();
  const pageSize = 200;
  const all: ArticleRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await admin
      .from("articles")
      .select(
        "id, title, slug, excerpt, content, metadata, min_access_level, audience, locale, source_url, source_name, public_topic"
      )
      .eq("published", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(error.message);
    if (!data?.length) break;
    all.push(...(data as ArticleRow[]));
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}

async function main() {
  const admin = createServiceRoleClient();
  console.log("Fetching published articles…");
  const rows = await fetchAllPublished();
  console.log(`Scanned ${rows.length} published articles`);

  const candidates = rows.filter((row) =>
    needsTemplateRewrite({
      title: row.title,
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      locale: row.locale ?? "cs",
      metadata: row.metadata ?? {},
    })
  );

  const reasonCounts: Record<string, number> = {};
  for (const row of candidates) {
    for (const r of detectTemplateIssue({
      title: row.title,
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      locale: row.locale ?? "cs",
      metadata: row.metadata ?? {},
    })) {
      reasonCounts[r] = (reasonCounts[r] ?? 0) + 1;
    }
  }

  const report = {
    scanned: rows.length,
    found: candidates.length,
    reasonCounts,
    samples: candidates.slice(0, 8).map((r) => ({
      slug: r.slug,
      title: r.title.slice(0, 80),
      reasons: detectTemplateIssue({
        title: r.title,
        excerpt: r.excerpt ?? "",
        content: r.content ?? "",
        locale: r.locale ?? "cs",
        metadata: r.metadata ?? {},
      }),
    })),
  };

  console.log(JSON.stringify(report, null, 2));

  if (scanOnly) {
    process.exit(0);
  }

  let rewritten = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  const batch = candidates.slice(0, limit);
  console.log(`Rewriting up to ${batch.length} articles (dryRun=${dryRun})…`);

  for (const row of batch) {
    const audience = resolveAudience(row);
    const reasons = detectTemplateIssue({
      title: row.title,
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      locale: row.locale ?? "cs",
      metadata: row.metadata ?? {},
    });

    console.log(`→ ${row.slug} [${reasons.join(", ")}]`);

    if (dryRun) {
      skipped++;
      continue;
    }

    try {
      let rewrittenArticle = await rewriteWithRetry(row, audience);

      let stillBad = needsTemplateRewrite({
        title: rewrittenArticle.title,
        excerpt: rewrittenArticle.excerpt,
        content: rewrittenArticle.content,
        locale: row.locale ?? "cs",
        metadata: row.metadata ?? {},
      });

      if (stillBad && isBoilerplateContent(rewrittenArticle.content)) {
        console.warn(`  skip — body still boilerplate: ${row.slug}`);
        skipped++;
        if (delayMs > 0) await sleep(delayMs);
        continue;
      }

      if (stillBad) {
        const patched = await patchEnglishTitleFields(
          rewrittenArticle.title,
          rewrittenArticle.excerpt,
          rewrittenArticle.content
        );
        if (patched) {
          rewrittenArticle = { ...rewrittenArticle, ...patched };
          stillBad = needsTemplateRewrite({
            title: rewrittenArticle.title,
            excerpt: rewrittenArticle.excerpt,
            content: rewrittenArticle.content,
            locale: row.locale ?? "cs",
            metadata: row.metadata ?? {},
          });
        }
      }

      if (stillBad) {
        console.warn(`  skip — still template after rewrite: ${row.slug}`);
        skipped++;
        if (delayMs > 0) await sleep(delayMs);
        continue;
      }

      const metadata = mergeV26Metadata(row.metadata ?? {}, {
        ...rewrittenArticle.metadata,
        rewritten_from_boilerplate: true,
        rewrite_reasons: reasons,
      });

      const { error: updErr } = await admin
        .from("articles")
        .update({
          title: rewrittenArticle.title,
          excerpt: rewrittenArticle.excerpt,
          content: rewrittenArticle.content,
          meta_description: rewrittenArticle.excerpt.slice(0, 160),
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updErr) {
        failed++;
        errors.push(`${row.slug}: ${updErr.message}`);
        console.error(`  DB error: ${updErr.message}`);
      } else {
        rewritten++;
        console.log(`  ✓ ${rewrittenArticle.title.slice(0, 60)}…`);
      }
    } catch (e) {
      failed++;
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${row.slug}: ${msg}`);
      console.error(`  fail: ${msg}`);
    }

    if (delayMs > 0) await sleep(delayMs);
  }

  const summary = {
    scanned: rows.length,
    found: candidates.length,
    processed: batch.length,
    rewritten,
    skipped,
    failed,
    dryRun,
    errors: errors.slice(0, 10),
  };

  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
  process.exit(failed > 0 && rewritten === 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
