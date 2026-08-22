#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import {
  auditArticle,
  summarizeArticleAudits,
  type AuditableArticle,
  type ArticleAuditResult,
} from "../lib/editorial/article-quality-audit";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_SIZE = 500;
const ARTICLE_COLUMNS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "metadata",
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

type CliOptions = {
  applyFlags: boolean;
  applySafeMetadata: boolean;
  reportDir: string;
};

function parseArgs(): CliOptions {
  const reportArg = process.argv.find((arg) => arg.startsWith("--report-dir="));
  return {
    applyFlags: process.argv.includes("--apply-flags"),
    applySafeMetadata: process.argv.includes("--apply-safe-metadata"),
    reportDir: reportArg
      ? path.resolve(ROOT, reportArg.slice("--report-dir=".length))
      : path.join(ROOT, "reports"),
  };
}

function protectedByConcurrentWork(article: AuditableArticle): boolean {
  const text = `${article.title ?? ""}\n${article.content ?? ""}`.toLowerCase();
  return (
    text.includes("srdce není jen pumpa") ||
    (text.includes("endokrinní funkc") && text.includes("medical education online"))
  );
}

async function fetchAllPublishedArticles(
  admin: any
): Promise<AuditableArticle[]> {
  const rows: AuditableArticle[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("published", true)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Supabase article query failed: ${error.message}`);
    const page = (data ?? []) as unknown as AuditableArticle[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function reviewPayload(result: ArticleAuditResult) {
  return {
    entity_type: "article",
    entity_id: result.id,
    score: result.score,
    issues: result.issues.map((issue) => `${issue.severity}:${issue.code}:${issue.detail}`),
    suggestions: [
      "Proveďte redakční kontrolu proti uvedenému primárnímu zdroji.",
      ...(result.physicianAudience
        ? [
            "Oddělte výsledky zdroje, limity evidence a redakční interpretaci.",
            "Doplňte konkrétní klinickou relevanci bez nových neověřených tvrzení.",
          ]
        : []),
    ],
    status: "reviewed",
    updated_at: new Date().toISOString(),
  };
}

async function applyFlags(
  admin: any,
  articles: AuditableArticle[],
  results: ArticleAuditResult[]
) {
  const protectedIds = new Set(
    articles.filter(protectedByConcurrentWork).map((article) => article.id)
  );
  const flagged = results.filter(
    (result) => result.issues.length > 0 && !protectedIds.has(result.id)
  );
  let applied = 0;
  const errors: string[] = [];
  for (let index = 0; index < flagged.length; index += 100) {
    const chunk = flagged.slice(index, index + 100).map(reviewPayload);
    const { error } = await admin
      .from("content_quality_reviews")
      .upsert(chunk, { onConflict: "entity_type,entity_id" });
    if (error) errors.push(error.message);
    else applied += chunk.length;
  }
  return { applied, skippedProtected: protectedIds.size, errors };
}

async function applySafeMetadata(
  admin: any,
  articles: AuditableArticle[],
  results: ArticleAuditResult[]
) {
  const byId = new Map(articles.map((article) => [article.id, article]));
  let applied = 0;
  let skippedProtected = 0;
  const errors: string[] = [];
  for (const result of results) {
    if (!result.safeMetadataPatch) continue;
    const article = byId.get(result.id);
    if (!article) continue;
    if (protectedByConcurrentWork(article)) {
      skippedProtected++;
      continue;
    }
    const metadata = {
      ...(article.metadata ?? {}),
      ...result.safeMetadataPatch,
      editorial_audit: {
        audited_at: new Date().toISOString(),
        method: "deterministic-v1",
        issue_codes: result.issues.map((issue) => issue.code),
      },
    };
    const { error } = await admin
      .from("articles")
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq("id", result.id);
    if (error) errors.push(`${result.slug}: ${error.message}`);
    else {
      article.metadata = metadata;
      applied++;
    }
  }
  return { applied, skippedProtected, errors };
}

function renderMarkdown(report: {
  mode: string;
  generatedAt: string;
  before: ReturnType<typeof summarizeArticleAudits>;
  after: ReturnType<typeof summarizeArticleAudits>;
  mutations: Record<string, unknown>;
  results: ArticleAuditResult[];
}) {
  const issueLines = Object.entries(report.after.issueCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => `- ${code}: ${count}`)
    .join("\n");
  const severeLines = report.results
    .filter((result) => result.severe)
    .map(
      (result) =>
        `- \`${result.slug || result.id}\` — ${result.title} (${result.wordCount} slov; ${result.issues
          .filter((issue) => issue.severity === "critical")
          .map((issue) => issue.code)
          .join(", ")})`
    )
    .join("\n");
  return `# Audit publikovaných článků

- Vygenerováno: ${report.generatedAt}
- Režim: ${report.mode}
- Auditováno: ${report.after.audited}
- Bez příznaků: ${report.after.passing}
- Označeno k redakční kontrole: ${report.after.flagged}
- Závažné příznaky: ${report.after.severe}
- Odborné/lékařské publikum: ${report.after.physician}
- Bezpečné opravy zdrojových metadat, před/po: ${report.before.safeMetadataRepairs}/${report.after.safeMetadataRepairs}

## Počty podle příznaku
${issueLines || "- Žádné"}

## Databázové operace
\`\`\`json
${JSON.stringify(report.mutations, null, 2)}
\`\`\`

## Závažné případy
${severeLines || "- Žádné"}

> Jde o deterministický redakční audit, nikoli klinickou ani lékařskou revizi.
`;
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
  const articles = await fetchAllPublishedArticles(admin);
  const initialResults = articles.map((article) => auditArticle(article));
  const before = summarizeArticleAudits(initialResults);
  const mutations: Record<string, unknown> = {
    dryRun: !options.applyFlags && !options.applySafeMetadata,
    flags: { applied: 0, skippedProtected: 0, errors: [] },
    safeMetadata: { applied: 0, skippedProtected: 0, errors: [] },
  };

  if (options.applyFlags) {
    mutations.flags = await applyFlags(admin, articles, initialResults);
  }
  if (options.applySafeMetadata) {
    mutations.safeMetadata = await applySafeMetadata(admin, articles, initialResults);
  }

  const finalResults = articles.map((article) => auditArticle(article));
  const after = summarizeArticleAudits(finalResults);
  const generatedAt = new Date().toISOString();
  const mode = [
    options.applyFlags ? "apply-flags" : null,
    options.applySafeMetadata ? "apply-safe-metadata" : null,
  ]
    .filter(Boolean)
    .join("+") || "dry-run";
  const report = { mode, generatedAt, before, after, mutations, results: finalResults };

  await mkdir(options.reportDir, { recursive: true });
  const date = generatedAt.slice(0, 10);
  const suffix = mode.replaceAll("+", "-");
  const jsonPath = path.join(options.reportDir, `editorial-article-audit-${date}-${suffix}.json`);
  const markdownPath = path.join(options.reportDir, `editorial-article-audit-${date}-${suffix}.md`);
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, renderMarkdown(report), "utf8");

  console.log(
    JSON.stringify(
      {
        mode,
        before,
        after,
        mutations,
        reports: { jsonPath, markdownPath },
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
