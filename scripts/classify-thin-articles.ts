#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import {
  auditArticle,
  buildSafeEditorialAppend,
  extractExistingDoi,
  isOriginalMedScopeEditorial,
  shouldQuarantineFromPublication,
  type AuditableArticle,
} from "../lib/editorial/article-quality-audit";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_SIZE = 500;
const HEART_SLUG =
  "beyond-the-pump-integrating-the-hearts-endocrine-function-into-early-medical-education";
const ARTICLE_COLUMNS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "metadata",
  "published",
  "published_at",
  "created_at",
  "updated_at",
  "source_url",
  "source_name",
  "audience",
  "min_access_level",
  "locale",
  "rubric_slug",
  "content_type",
  "ai_generated",
].join(",");

function parseArgs() {
  const reportArg = process.argv.find((arg) => arg.startsWith("--report-dir="));
  return {
    apply: process.argv.includes("--apply"),
    reportDir: reportArg
      ? path.resolve(ROOT, reportArg.slice("--report-dir=".length))
      : path.join(ROOT, "reports"),
  };
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function hasVerifiedSource(article: AuditableArticle): boolean {
  const citation = article.metadata?.source_citation;
  const citationUrl =
    citation && typeof citation === "object"
      ? (citation as Record<string, unknown>).url
      : null;
  return Boolean(
    isHttpUrl(article.source_url) ||
      isHttpUrl(citationUrl) ||
      extractExistingDoi(article)
  );
}

function bucketWords(count: number): string {
  if (count < 120) return "under_120";
  if (count < 250) return "120_249";
  if (count < 350) return "250_349";
  if (count < 500) return "350_499";
  if (count < 600) return "500_599";
  return "600_plus";
}

function increment(map: Record<string, number>, key: string, by = 1) {
  map[key] = (map[key] ?? 0) + by;
}

async function fetchAllPublishedArticles(admin: any): Promise<AuditableArticle[]> {
  const rows: AuditableArticle[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("published", true)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as AuditableArticle[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

async function main() {
  const options = parseArgs();
  const env: Record<string, string | undefined> = {
    ...loadProjectEnv(ROOT),
    ...process.env,
  };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const now = new Date();
  const articles = await fetchAllPublishedArticles(admin);
  const audited = articles.map((article) => ({
    article,
    audit: auditArticle(article, now),
  }));

  const thin = audited.filter(({ audit }) =>
    audit.issues.some((issue) => issue.code === "thin_content")
  );
  const leftoverStubs = audited.filter(
    ({ article, audit }) =>
      article.slug !== HEART_SLUG &&
      (audit.issues.some((issue) => issue.code === "stub_content") ||
        (audit.wordCount < 120 && isOriginalMedScopeEditorial(article)))
  );

  const wordBuckets: Record<string, number> = {};
  const audience: Record<string, number> = { physician: 0, public: 0 };
  const origin: Record<string, number> = {
    verified_source: 0,
    original_desk: 0,
    mixed_or_unclear: 0,
  };
  const matrix: Record<string, number> = {};
  const missingStructure = {
    physicianVerified: 0,
    publicVerified: 0,
    originalDesk: 0,
  };
  const appendCandidates: Array<Record<string, unknown>> = [];
  const unpublishCandidates: Array<Record<string, unknown>> = [];
  const nearThresholdPhysician: Array<Record<string, unknown>> = [];

  for (const { article, audit } of leftoverStubs) {
    unpublishCandidates.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      wordCount: audit.wordCount,
      original: isOriginalMedScopeEditorial(article),
      verified: hasVerifiedSource(article),
      reason: "published_under_120",
    });
  }

  for (const { article, audit } of thin) {
    const physician = audit.physicianAudience;
    const verified = hasVerifiedSource(article);
    const original = isOriginalMedScopeEditorial(article);
    increment(audience, physician ? "physician" : "public");
    increment(wordBuckets, bucketWords(audit.wordCount));
    const originKey = verified ? "verified_source" : original ? "original_desk" : "mixed_or_unclear";
    increment(origin, originKey);
    increment(
      matrix,
      `${physician ? "physician" : "public"}|${originKey}|${bucketWords(audit.wordCount)}`
    );

    const append = buildSafeEditorialAppend(article, now);
    if (append) {
      if (physician && verified) missingStructure.physicianVerified += 1;
      else if (!physician && verified) missingStructure.publicVerified += 1;
      else missingStructure.originalDesk += 1;
      if (article.slug !== HEART_SLUG) {
        appendCandidates.push({
          id: article.id,
          slug: article.slug,
          title: article.title,
          wordCount: audit.wordCount,
          physician,
          verified,
          original,
          issueCodes: audit.issues.map((issue) => issue.code),
          appendChars: append.length,
        });
      }
    }

    if (
      physician &&
      verified &&
      audit.wordCount >= 500 &&
      audit.wordCount < 600 &&
      article.slug !== HEART_SLUG
    ) {
      nearThresholdPhysician.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        wordCount: audit.wordCount,
        source_url: article.source_url,
        doi: extractExistingDoi(article),
        source_name: article.source_name,
      });
    }
  }

  const counts = {
    published: articles.length,
    thin: thin.length,
    leftoverStubs: leftoverStubs.length,
    audience,
    origin,
    wordBuckets,
    matrix,
    missingStructure,
    appendCandidates: appendCandidates.length,
    unpublishCandidates: unpublishCandidates.length,
    nearThresholdPhysician: nearThresholdPhysician.length,
    wouldQuarantine: audited.filter(
      ({ article }) =>
        article.slug !== HEART_SLUG && shouldQuarantineFromPublication(article, now)
    ).length,
  };

  const applied = { unpublish: 0, append: 0, errors: [] as string[] };
  if (options.apply) {
    for (const candidate of unpublishCandidates) {
      const { error } = await admin
        .from("articles")
        .update({ published: false, updated_at: now.toISOString() })
        .eq("id", candidate.id)
        .neq("slug", HEART_SLUG);
      if (error) applied.errors.push(`${candidate.slug}: ${error.message}`);
      else applied.unpublish += 1;
    }
    for (const candidate of appendCandidates) {
      const article = articles.find((row) => row.id === candidate.id);
      if (!article) continue;
      const section = buildSafeEditorialAppend(article, now);
      if (!section) continue;
      const { error } = await admin
        .from("articles")
        .update({
          content: `${String(article.content ?? "").trim()}\n${section}`,
          updated_at: now.toISOString(),
        })
        .eq("id", article.id)
        .neq("slug", HEART_SLUG);
      if (error) applied.errors.push(`${article.slug}: ${error.message}`);
      else applied.append += 1;
    }
  }

  await mkdir(options.reportDir, { recursive: true });
  const generatedAt = now.toISOString();
  const suffix = options.apply ? "apply" : "dry-run";
  const jsonPath = path.join(
    options.reportDir,
    `thin-article-classification-${generatedAt.slice(0, 10)}-${suffix}.json`
  );
  const markdownPath = jsonPath.replace(/\.json$/, ".md");
  const report = {
    generatedAt,
    mode: suffix,
    counts,
    unpublishCandidates,
    appendCandidates,
    nearThresholdPhysician,
    applied,
  };
  const markdown = `# Klasifikace tenkých článků

- Vygenerováno: ${generatedAt}
- Režim: ${suffix}
- Publikováno: ${counts.published}
- Tenkých (\`thin_content\`): ${counts.thin}
- Zbývající stuby <120 slov: ${counts.leftoverStubs}

## Publikum
- Lékařské/odborné: ${audience.physician}
- Veřejnost: ${audience.public}

## Původ
- Ověřený HTTP(S)/DOI: ${origin.verified_source}
- Původní desk MedScopeGlobal: ${origin.original_desk}
- Nejasné: ${origin.mixed_or_unclear}

## Délka
${Object.entries(wordBuckets)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

## Matice publikum × původ × délka
${Object.entries(matrix)
  .sort((a, b) => b[1] - a[1])
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

## Bezpečné zásahy
- Kandidáti na unpublish (<120, mimo heart): ${unpublishCandidates.length}
- Kandidáti na strukturální append: ${appendCandidates.length}
- Lékařské tenké 500–599 slov s ověřeným zdrojem: ${nearThresholdPhysician.length}

> Strukturální append nevyplní limit 600 slov. Hromadné AI přepisy a vymýšlení výsledků studií se neprovádí.
`;
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, markdown, "utf8");
  console.log(
    JSON.stringify(
      {
        mode: suffix,
        counts,
        applied,
        reports: { jsonPath, markdownPath },
        sampleAppend: appendCandidates.slice(0, 8),
        sampleNear: nearThresholdPhysician.slice(0, 8),
        sampleUnpublish: unpublishCandidates.slice(0, 8),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
