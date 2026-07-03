#!/usr/bin/env node
/**
 * Batch polish Czech articles in Supabase (title, excerpt, content).
 * Usage: node scripts/polish-czech-articles.mjs [--limit=50] [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { polishCzechHtml, polishCzechText } from "../lib/i18n/czech-polish.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");

function loadEnv() {
  for (const name of [".env", ".env.local"]) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 50;
  const dryRun = process.argv.includes("--dry-run");
  return { limit: Number.isFinite(limit) ? limit : 50, dryRun };
}

async function main() {
  loadEnv();
  const { limit, dryRun } = parseArgs();
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
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  let updated = 0;
  for (const article of articles ?? []) {
    const next = {
      title: polishCzechText(article.title ?? ""),
      excerpt: article.excerpt ? polishCzechText(article.excerpt) : article.excerpt,
      content: article.content ? polishCzechHtml(article.content) : article.content,
    };
    const changed =
      next.title !== article.title ||
      next.excerpt !== article.excerpt ||
      next.content !== article.content;
    if (!changed) continue;

    if (dryRun) {
      console.log(`[dry-run] would polish: ${article.slug}`);
      updated++;
      continue;
    }

    const { error: upErr } = await admin
      .from("articles")
      .update(next)
      .eq("id", article.id);
    if (upErr) {
      console.error(`Failed ${article.slug}:`, upErr.message);
      continue;
    }
    console.log(`Polished: ${article.slug}`);
    updated++;
  }

  console.log(`Done. ${updated} article(s) ${dryRun ? "would be " : ""}updated (limit ${limit}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
