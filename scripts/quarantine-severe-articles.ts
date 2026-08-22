#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import {
  auditArticle,
  buildSafeEditorialAppend,
  clampFuturePublishedAt,
  extractExistingDoi,
  shouldQuarantineFromPublication,
  type AuditableArticle,
} from "../lib/editorial/article-quality-audit";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_SIZE = 500;
const PROTECTED_SLUGS = new Set([
  "beyond-the-pump-integrating-the-hearts-endocrine-function-into-early-medical-education",
]);
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

type PlannedAction = {
  id: string;
  slug: string;
  title: string;
  wordCount: number;
  actions: string[];
  issueCodes: string[];
};

function parseArgs() {
  const reportArg = process.argv.find((arg) => arg.startsWith("--report-dir="));
  return {
    apply: process.argv.includes("--apply"),
    reportDir: reportArg
      ? path.resolve(ROOT, reportArg.slice("--report-dir=".length))
      : path.join(ROOT, "reports"),
  };
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
    if (error) throw new Error(`Supabase article query failed: ${error.message}`);
    const page = (data ?? []) as AuditableArticle[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function planActions(article: AuditableArticle, now: Date): PlannedAction | null {
  if (PROTECTED_SLUGS.has(String(article.slug ?? ""))) return null;
  const audit = auditArticle(article, now);
  const actions: string[] = [];
  if (shouldQuarantineFromPublication(article, now)) actions.push("unpublish");
  if (clampFuturePublishedAt(article, now)) actions.push("clamp_published_at");
  if (!actions.includes("unpublish") && (audit.safeMetadataPatch || extractExistingDoi(article))) {
    actions.push("repair_source_metadata");
  }
  if (!actions.includes("unpublish") && buildSafeEditorialAppend(article, now)) {
    actions.push("append_editorial_sections");
  }
  if (!actions.length) return null;
  return {
    id: article.id,
    slug: String(article.slug ?? ""),
    title: String(article.title ?? ""),
    wordCount: audit.wordCount,
    actions,
    issueCodes: audit.issues.map((issue) => issue.code),
  };
}

async function applyPlan(admin: any, article: AuditableArticle, plan: PlannedAction, now: Date) {
  const metadata: Record<string, unknown> = {
    ...(article.metadata ?? {}),
    ...(plan.actions.includes("repair_source_metadata")
      ? auditArticle(article, now).safeMetadataPatch ?? {}
      : {}),
  };
  if (plan.actions.includes("repair_source_metadata")) {
    const doi = extractExistingDoi(article);
    if (doi) {
      const citation =
        metadata.source_citation && typeof metadata.source_citation === "object"
          ? { ...(metadata.source_citation as Record<string, unknown>) }
          : {};
      citation.doi = citation.doi ?? doi;
      metadata.source_citation = citation;
      metadata.primary_doi = metadata.primary_doi ?? doi;
    }
  }
  metadata.editorial_quarantine = {
    evaluated_at: now.toISOString(),
    method: "deterministic-v1",
    actions: plan.actions,
    issue_codes: plan.issueCodes,
  };
  const patch: Record<string, unknown> = {
    metadata,
    updated_at: now.toISOString(),
  };
  if (plan.actions.includes("unpublish")) {
    patch.published = false;
  }
  if (plan.actions.includes("clamp_published_at")) {
    patch.published_at = clampFuturePublishedAt(article, now);
  }
  if (plan.actions.includes("append_editorial_sections")) {
    const section = buildSafeEditorialAppend(article, now);
    if (section) {
      patch.content = `${String(article.content ?? "").trim()}\n${section}`;
    }
  }
  const { error } = await admin.from("articles").update(patch).eq("id", article.id);
  if (error) throw new Error(`${plan.slug}: ${error.message}`);
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
  const plans = articles
    .map((article) => planActions(article, now))
    .filter((plan): plan is PlannedAction => Boolean(plan));

  const counts = {
    audited: articles.length,
    planned: plans.length,
    unpublish: plans.filter((plan) => plan.actions.includes("unpublish")).length,
    clampPublishedAt: plans.filter((plan) => plan.actions.includes("clamp_published_at")).length,
    repairSourceMetadata: plans.filter((plan) =>
      plan.actions.includes("repair_source_metadata")
    ).length,
    appendEditorialSections: plans.filter((plan) =>
      plan.actions.includes("append_editorial_sections")
    ).length,
    applied: 0,
    errors: [] as string[],
  };

  if (options.apply) {
    for (const plan of plans) {
      const article = articles.find((row) => row.id === plan.id);
      if (!article) continue;
      try {
        await applyPlan(admin, article, plan, now);
        counts.applied += 1;
      } catch (error) {
        counts.errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  await mkdir(options.reportDir, { recursive: true });
  const generatedAt = now.toISOString();
  const suffix = options.apply ? "apply" : "dry-run";
  const jsonPath = path.join(
    options.reportDir,
    `editorial-article-quarantine-${generatedAt.slice(0, 10)}-${suffix}.json`
  );
  const report = { generatedAt, mode: suffix, counts, plans };
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ...counts, report: jsonPath }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
