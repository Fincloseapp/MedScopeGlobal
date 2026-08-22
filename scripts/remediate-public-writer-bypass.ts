#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { auditArticle, type AuditableArticle } from "../lib/editorial/article-quality-audit";
import { loadProjectEnv } from "./load-env.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BATCH_ID = "public-writer-bypass-2026-08-17-v1";
const PAGE_SIZE = 500;
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

type Candidate = {
  id: string;
  slug: string;
  title: string;
  contentHash: string;
  wordCount: number;
  issueCodes: string[];
  severe: boolean;
  sourceUrl: string | null;
  sourceName: string | null;
  sourceCitation: Record<string, unknown> | null;
  publishedAt: string | null;
  createdAt: string | null;
  metadataEvidence: {
    editorialVersion: unknown;
    internalTopic: unknown;
    writingStyle: unknown;
    authorByline: unknown;
    similarityCheck: unknown;
  };
  action: "quarantine_unverified_generated_claims";
  reason: string;
};

function parseArgs() {
  const reportArg = process.argv.find((arg) => arg.startsWith("--report-dir="));
  return {
    apply: process.argv.includes("--apply"),
    verifyApplied: process.argv.includes("--verify-applied"),
    reportDir: reportArg
      ? path.resolve(ROOT, reportArg.slice("--report-dir=".length))
      : path.join(ROOT, "reports"),
  };
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function reportPaths(reportDir: string) {
  const date = new Date().toISOString().slice(0, 10);
  return {
    dry: path.join(reportDir, `public-writer-bypass-${date}-dry-run.json`),
    apply: path.join(reportDir, `public-writer-bypass-${date}-apply.json`),
    verify: path.join(reportDir, `public-writer-bypass-${date}-idempotency.json`),
  };
}

async function fetchAllPublished(admin: any): Promise<AuditableArticle[]> {
  const rows: AuditableArticle[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as AuditableArticle[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function sourceCitation(article: AuditableArticle) {
  const value = article.metadata?.source_citation;
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function hasVerifiableExternalSource(article: AuditableArticle) {
  const citation = sourceCitation(article);
  const urls = [article.source_url, citation?.url]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim());
  return urls.some((value) => {
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      return (
        host === "pubmed.ncbi.nlm.nih.gov" ||
        host === "doi.org" ||
        host.endsWith(".gov") ||
        host.endsWith(".gov.cz") ||
        host === "who.int" ||
        host.endsWith(".who.int")
      );
    } catch {
      return false;
    }
  });
}

function candidateFrom(article: AuditableArticle): Candidate {
  const audit = auditArticle(article);
  const metadata = article.metadata ?? {};
  const verifiable = hasVerifiableExternalSource(article);
  return {
    id: article.id,
    slug: String(article.slug ?? ""),
    title: String(article.title ?? ""),
    contentHash: hash(String(article.content ?? "")),
    wordCount: audit.wordCount,
    issueCodes: audit.issues.map((issue) => issue.code),
    severe: audit.severe,
    sourceUrl: article.source_url ?? null,
    sourceName: article.source_name ?? null,
    sourceCitation: sourceCitation(article),
    publishedAt: article.published_at ?? null,
    createdAt: article.created_at ?? null,
    metadataEvidence: {
      editorialVersion: metadata.editorial_version,
      internalTopic: metadata.internal_topic,
      writingStyle: metadata.writing_style,
      authorByline: metadata.author_byline,
      similarityCheck: metadata.similarity_check,
    },
    action: "quarantine_unverified_generated_claims",
    reason: verifiable
      ? "External-looking source requires claim-level verification before metadata repair."
      : "No PubMed, DOI, Crossref, or official primary-source URL is stored; generated health claims cannot be grounded safely.",
  };
}

function rootCauseEvidence() {
  return {
    generationRoute: "app/api/cron/public-articles/route.ts",
    runner: "lib/v25/runners/public.ts -> lib/v25/writers/run-public-writers.mjs",
    writers: "lib/v25/writers/writer1.mjs through writer5.mjs",
    generationBypass: {
      file: "lib/v25/writers/writer-base.mjs",
      lines: "745-807",
      detail:
        "After all LLM attempts remain boilerplate, lastParsed is accepted; boilerplate is wrapped instead of rejected and missing sources receive fallback source prose.",
    },
    persistenceBypass: {
      file: "lib/v25/writers/writer-base.mjs",
      lines: "949-1018",
      detail:
        "persistPublicArticleToDb writes published=true and published_at=now without checking boilerplate, source_citation, grounding, future dates, or the editorial audit.",
    },
    schedule: {
      endpoint: "/api/cron/public-articles",
      defaultVolume: "writers 1-4 × PUBLIC_WRITER_LIMIT (default 2) plus writer5 (default 3)",
    },
  };
}

async function main() {
  const options = parseArgs();
  const env: Record<string, string | undefined> = {
    ...loadProjectEnv(ROOT),
    ...process.env,
  };
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service-role credentials");
  }
  const admin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  const paths = reportPaths(options.reportDir);

  if (options.verifyApplied) {
    const applied = JSON.parse(await readFile(paths.apply, "utf8")) as {
      candidates: Candidate[];
    };
    const ids = applied.candidates.map((candidate) => candidate.id);
    const { data, error } = await admin
      .from("articles")
      .select("id, slug, published, metadata")
      .in("id", ids);
    if (error) throw new Error(error.message);
    const mismatches = (data ?? [])
      .filter((row: any) => {
        const quarantine = row.metadata?.editorial_quarantine;
        return (
          row.published !== false ||
          quarantine?.batch_id !== BATCH_ID ||
          row.metadata?.clinician_reviewed !== false
        );
      })
      .map((row: any) => row.slug);
    const report = {
      generatedAt: new Date().toISOString(),
      mode: "verify-applied",
      checked: ids.length,
      mismatches,
    };
    await writeFile(paths.verify, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ...report, report: paths.verify }, null, 2));
    if (mismatches.length) process.exitCode = 1;
    return;
  }

  const published = await fetchAllPublished(admin);
  const candidates = published
    .filter((article) => {
      const audit = auditArticle(article);
      return (
        article.audience === "public" &&
        String(article.slug ?? "").startsWith("verejnost-") &&
        audit.issues.some((issue) => issue.code === "missing_source_metadata")
      );
    })
    .map(candidateFrom);

  const reportBase = {
    generatedAt: new Date().toISOString(),
    batchId: BATCH_ID,
    rootCause: rootCauseEvidence(),
    counts: {
      candidates: candidates.length,
      criticalBoilerplate: candidates.filter((candidate) => candidate.severe).length,
      missingSource: candidates.filter((candidate) =>
        candidate.issueCodes.includes("missing_source_metadata")
      ).length,
      externallyVerifiableAtStoredUrl: candidates.filter(
        (candidate) =>
          candidate.sourceUrl &&
          /pubmed\.ncbi\.nlm\.nih\.gov|doi\.org|\.gov|who\.int/i.test(
            candidate.sourceUrl
          )
      ).length,
    },
    candidates,
  };

  await mkdir(options.reportDir, { recursive: true });
  if (!options.apply) {
    const report = { ...reportBase, mode: "dry-run" };
    await writeFile(paths.dry, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ...report, report: paths.dry }, null, 2));
    return;
  }

  const dry = JSON.parse(await readFile(paths.dry, "utf8")) as {
    candidates: Candidate[];
  };
  const currentById = new Map(published.map((article) => [article.id, article]));
  const applied = {
    quarantined: 0,
    alreadyQuarantined: 0,
    skippedChanged: 0,
    errors: [] as string[],
  };
  for (const candidate of dry.candidates) {
    const current = currentById.get(candidate.id);
    if (!current) continue;
    if (hash(String(current.content ?? "")) !== candidate.contentHash) {
      applied.skippedChanged += 1;
      continue;
    }
    const metadata = {
      ...(current.metadata ?? {}),
      editorial_quarantine: {
        status: "quarantined",
        batch_id: BATCH_ID,
        evaluated_at: new Date().toISOString(),
        issue_codes: candidate.issueCodes,
        reason: candidate.reason,
        source_verification: "No stored verifiable primary source; no claim repair attempted.",
        route: "v25-public-writers",
        clinician_reviewed: false,
      },
      clinician_reviewed: false,
    };
    const { error } = await admin
      .from("articles")
      .update({
        published: false,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", candidate.id)
      .eq("published", true);
    if (error) {
      applied.errors.push(`${candidate.slug}: ${error.message}`);
    } else {
      applied.quarantined += 1;
    }
  }
  const report = {
    ...reportBase,
    generatedAt: new Date().toISOString(),
    mode: "apply",
    applied,
  };
  await writeFile(paths.apply, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ...report, report: paths.apply }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
