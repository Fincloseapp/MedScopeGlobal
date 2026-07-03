#!/usr/bin/env node
/**
 * Find public articles with identical boilerplate and regenerate via v26 personas.
 * Usage: node scripts/rewrite-public-boilerplate.mjs [--limit=20] [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generatePublicArticle,
  persistPublicArticleToDb,
  PUBLIC_TOPICS,
} from "../lib/v25/writers/writer-base.mjs";
import { isBoilerplateContent } from "../lib/v26/editorial-prompts.mjs";
import { getPersonaById } from "../lib/v26/personas.mjs";

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
  const dryRun = process.argv.includes("--dry-run");
  return {
    limit: limitArg ? Number(limitArg.split("=")[1]) : 24,
    dryRun,
  };
}

function extractSeedFromTitle(title) {
  const t = String(title ?? "").trim();
  const dash = t.indexOf(" — ");
  if (dash > 0) return t.slice(0, dash).trim();
  const dot = t.indexOf(" · ");
  if (dot > 0) return t.slice(0, dot).trim();
  return t.slice(0, 80);
}

loadEnv();
const { limit, dryRun } = parseArgs();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const { data: rows, error } = await admin
  .from("articles")
  .select("id, title, slug, excerpt, content, metadata, public_topic, source_name")
  .eq("audience", "public")
  .eq("published", true)
  .order("published_at", { ascending: false })
  .limit(200);

if (error) {
  console.error(error.message);
  process.exit(1);
}

const candidates = (rows ?? []).filter((row) => isBoilerplateContent(row.content));
console.log(`Found ${candidates.length} boilerplate articles (scanning ${rows?.length ?? 0})`);

let rewritten = 0;
const samples = [];

for (const row of candidates.slice(0, limit)) {
  const topic = row.public_topic ?? "zivotni-styl";
  const topicLabel = PUBLIC_TOPICS[topic] ?? "Veřejnost";
  const seed = extractSeedFromTitle(row.title);
  const personaId = row.metadata?.author_persona;
  const persona = personaId ? getPersonaById(personaId) : null;

  console.log(`Rewriting: ${row.slug} (${topic}) seed="${seed}"`);

  if (dryRun) {
    samples.push({ slug: row.slug, title: row.title, topic, dryRun: true });
    continue;
  }

  try {
    const article = await generatePublicArticle({
      topic,
      topicLabel,
      seed,
      writerName: persona?.byline ?? persona?.displayName ?? "MedScopeGlobal",
      angle: row.excerpt?.slice(0, 80) ?? "praktické informace",
      writerIndex: rewritten % 4,
    });

    const bodyHtml = article.bodyHtml;
    if (isBoilerplateContent(bodyHtml)) {
      console.warn(`  skip — still boilerplate after regen: ${row.slug}`);
      continue;
    }

    const metadata = {
      ...(row.metadata ?? {}),
      editorial_version: "26.2.1",
      author_persona: article.writerPersona,
      author_display_name: article.writerDisplayName,
      author_byline: article.writerByline,
      author_bio: getPersonaById(article.writerPersona)?.authorBio ?? null,
      rewritten_from_boilerplate: true,
      rewritten_at: new Date().toISOString(),
    };

    const { error: updErr } = await admin
      .from("articles")
      .update({
        title: article.title,
        excerpt: article.excerpt,
        content: bodyHtml,
        meta_description: article.metaDescription ?? article.excerpt?.slice(0, 160),
        source_name: `MedScopeGlobal · ${article.writerByline ?? article.writerDisplayName}`,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updErr) {
      console.error(`  DB error: ${updErr.message}`);
      continue;
    }

    rewritten += 1;
    if (samples.length < 6) {
      samples.push({
        title: article.title,
        byline: article.writerByline,
        topic,
        slug: row.slug,
      });
    }
  } catch (e) {
    console.error(`  fail: ${e.message}`);
  }
}

console.log(JSON.stringify({ rewritten, dryRun, samples }, null, 2));
process.exit(rewritten > 0 || dryRun ? 0 : 1);
