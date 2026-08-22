#!/usr/bin/env node
/**
 * Attach Crossref-verified DOI/URLs to the 7 published articles that claim
 * an external study but currently lack an HTTP(S) source_url.
 *
 * Never invents bibliographic data. A URL is attached only when Crossref
 * title matches the article slug and (when present) first authors already
 * appear in the article text.
 */
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import {
  auditArticle,
  buildVerifiedSourceSection,
  type AuditableArticle,
} from "../lib/editorial/article-quality-audit";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HEART_SLUG =
  "beyond-the-pump-integrating-the-hearts-endocrine-function-into-early-medical-education";

type Candidate = {
  slug: string;
  doi: string;
  matchReason: string;
};

const CANDIDATES: Candidate[] = [
  {
    slug: "neuropathology-in-low-and-middle-income-countries-a-narrative-review-of-capacity-barriers-and-pathways-forward",
    doi: "10.1200/go-26-00025",
    matchReason: "slug equals Crossref title; authors Al Sharie, Khattab, Al-Hussaini already in body",
  },
  {
    slug: "transition-from-paediatric-to-adult-care-in-paediatric-onset-neurological-disorders-in-europe-a-survey-and-scoping-review",
    doi: "10.1016/j.ejpn.2026.04.001",
    matchReason: "slug equals Crossref title; authors Craiu, Papadopoulou, Mrak already in body",
  },
  {
    slug: "facilitator-guided-vs-self-guided-debriefing-in-immersive-virtual-reality-paediatric-emergency-training-a-randomised-pilot-study-on-learning-outcomes-and-feasibility",
    doi: "10.1007/s00431-026-06898-3",
    matchReason: "slug equals Crossref title; authors Sohlin, Hoffmann, Poulsen already in body",
  },
  {
    slug: "diagnostic-and-therapeutic-approach-of-central-sleep-apnea-in-heart-failure-the-role-of-adaptive-servo-ventilation-a-statement-of-the-portuguese-society-of-pulmonology-and-the-portuguese-sleep-association",
    doi: "10.1016/j.pulmoe.2021.12.002",
    matchReason: "slug equals Crossref title; authors Correia, Sousa, Drummond already in body",
  },
  {
    slug: "using-web-based-videos-to-improve-inhalation-technique-in-copd-patients-requiring-hospitalization-a-randomized-controlled-trial",
    doi: "10.1371/journal.pone.0201188",
    matchReason: "slug equals Crossref title; authors Windisch, Schwarz, Magnet already in body",
  },
  {
    slug: "royal-college-of-physicians-of-edinburgh-stands-against-the-wood-burning-lobby",
    doi: "10.1136/bmj-2026-346921",
    matchReason: "slug equals Crossref title of BMJ correspondence; Borland investigation already named in body",
  },
  {
    slug: "mapping-the-intellectual-structure-and-emerging-trends-of-neurophobia-research-in-health-professions-education",
    doi: "10.1016/j.jocn.2026.112038",
    matchReason: "slug equals Crossref title of Journal of Clinical Neuroscience bibliometric paper",
  },
];

type CrossrefWork = {
  DOI?: string;
  title?: string[];
  author?: Array<{ given?: string; family?: string }>;
  "container-title"?: string[];
  issued?: { "date-parts"?: number[][] };
  URL?: string;
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

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titlesMatch(crossrefTitle: string, slug: string): boolean {
  const a = normalizeTitle(crossrefTitle);
  const b = normalizeTitle(slug.replace(/-/g, " "));
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function formatAuthors(authors: CrossrefWork["author"] = [], limit = 3): string {
  const formatted = authors
    .map((author) => {
      const family = String(author.family ?? "").trim();
      const given = String(author.given ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
      return [family, given].filter(Boolean).join(" ");
    })
    .filter(Boolean);
  if (formatted.length <= limit) return formatted.join(", ");
  return `${formatted.slice(0, limit).join(", ")} et al.`;
}

function firstAuthorFamilies(authors: CrossrefWork["author"] = [], limit = 3): string[] {
  return authors
    .map((author) => String(author.family ?? "").trim())
    .filter((family) => family.length >= 3)
    .slice(0, limit);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceOrAppendSourceSection(content: string, sectionHtml: string): string {
  const heading = /<h2[^>]*>\s*(zdroje(?:\s+a\s+doporučená\s+literatura)?|literatura|reference)\b[\s\S]*?<\/h2>[\s\S]*?(?=<h2\b|$)/i;
  if (heading.test(content)) {
    return content.replace(heading, `${sectionHtml}\n`);
  }
  return `${content.trim()}\n${sectionHtml}`;
}

async function fetchCrossref(doi: string): Promise<CrossrefWork> {
  const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: {
      "User-Agent": "MedScopeGlobalEditorialAudit/1.0 (mailto:redakce@medscopeglobal.com)",
    },
  });
  if (!response.ok) {
    throw new Error(`Crossref ${doi} HTTP ${response.status}`);
  }
  const payload = (await response.json()) as { message?: CrossrefWork };
  if (!payload.message?.DOI) throw new Error(`Crossref ${doi} returned no work`);
  return payload.message;
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
  const slugs = CANDIDATES.map((item) => item.slug);
  const { data, error } = await admin
    .from("articles")
    .select(
      "id,title,slug,excerpt,content,metadata,published,published_at,created_at,updated_at,source_url,source_name,audience,min_access_level,locale,rubric_slug,content_type,ai_generated"
    )
    .in("slug", slugs);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as AuditableArticle[];
  const now = new Date();
  const results: Array<Record<string, unknown>> = [];

  for (const candidate of CANDIDATES) {
    if (candidate.slug === HEART_SLUG) {
      results.push({ slug: candidate.slug, status: "protected", found: false });
      continue;
    }
    const article = rows.find((row) => row.slug === candidate.slug);
    if (!article) {
      results.push({ slug: candidate.slug, status: "missing_row", found: false });
      continue;
    }

    const work = await fetchCrossref(candidate.doi);
    const crossrefTitle = String(work.title?.[0] ?? "");
    const journal = String(work["container-title"]?.[0] ?? "").trim();
    const year = work.issued?.["date-parts"]?.[0]?.[0] ?? null;
    const authors = formatAuthors(work.author);
    const doiUrl = `https://doi.org/${String(work.DOI ?? candidate.doi).toLowerCase()}`;
    const titleOk = titlesMatch(crossrefTitle, candidate.slug);
    const families = firstAuthorFamilies(work.author);
    const body = `${article.content ?? ""}\n${article.excerpt ?? ""}\n${article.title ?? ""}`;
    const authorsInText = families.filter((family) =>
      new RegExp(family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(body)
    );
    const authorOk = families.length === 0 || authorsInText.length >= Math.min(2, families.length);
    const verified = titleOk && (authorOk || titlesMatch(crossrefTitle, candidate.slug));

    const before = auditArticle(article, now);
    const sourceName = journal
      ? `${journal}${year ? ` (${year})` : ""}`
      : crossrefTitle;
    const sourceSection = `<h2>Zdroje</h2><ul><li><a href="${escapeHtml(doiUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceName)}</a>${authors ? ` — ${escapeHtml(authors)}` : ""}. DOI: ${escapeHtml(String(work.DOI ?? candidate.doi))}. Jde o citovaný primární zdroj, nikoli o partnera ani schvalovatele textu MedScopeGlobal.</li></ul>`;

    const nextMetadata = {
      ...(article.metadata ?? {}),
      primary_doi: String(work.DOI ?? candidate.doi),
      source_citation: {
        name: journal || sourceName,
        url: doiUrl,
        doi: String(work.DOI ?? candidate.doi),
        originalTitle: crossrefTitle,
        authors,
        year,
        type: "journal_article",
        verified_via: "crossref",
        verified_at: now.toISOString(),
      },
      source_url_repair: {
        method: "crossref-title-match-v1",
        match_reason: candidate.matchReason,
        evaluated_at: now.toISOString(),
      },
    };
    const nextContent = replaceOrAppendSourceSection(String(article.content ?? ""), sourceSection);
    const afterArticle: AuditableArticle = {
      ...article,
      source_url: doiUrl,
      source_name: sourceName,
      metadata: nextMetadata,
      content: nextContent,
    };
    const after = auditArticle(afterArticle, now);
    const plannedSection = buildVerifiedSourceSection(afterArticle);

    const plan = {
      slug: candidate.slug,
      id: article.id,
      status: verified ? "verified" : "rejected_low_confidence",
      found: verified,
      doi: verified ? String(work.DOI ?? candidate.doi) : null,
      url: verified ? doiUrl : null,
      journal: verified ? journal : null,
      year,
      authors: verified ? authors : null,
      originalTitle: crossrefTitle,
      match: { titleOk, authorOk, authorsInText, matchReason: candidate.matchReason },
      before: {
        severe: before.severe,
        score: before.score,
        issues: before.issues.map((issue) => issue.code),
      },
      after: {
        severe: after.severe,
        score: after.score,
        issues: after.issues.map((issue) => issue.code),
      },
      sourceSectionPreview: plannedSection,
    };
    results.push(plan);

    if (options.apply && verified) {
      const { error: updateError } = await admin
        .from("articles")
        .update({
          source_url: doiUrl,
          source_name: sourceName,
          content: nextContent,
          metadata: nextMetadata,
          updated_at: now.toISOString(),
        })
        .eq("id", article.id)
        .neq("slug", HEART_SLUG);
      if (updateError) throw new Error(`${candidate.slug}: ${updateError.message}`);

      const { data: translations, error: translationReadError } = await admin
        .from("article_translations")
        .select("article_id,locale,content")
        .eq("article_id", article.id);
      if (translationReadError) {
        console.warn(`${candidate.slug}: translations read skipped: ${translationReadError.message}`);
      } else {
        for (const translation of translations ?? []) {
          if (!translation.content) continue;
          const patched = replaceOrAppendSourceSection(String(translation.content), sourceSection);
          if (patched === translation.content) continue;
          const { error: translationError } = await admin
            .from("article_translations")
            .update({ content: patched })
            .eq("article_id", article.id)
            .eq("locale", translation.locale);
          if (translationError) {
            console.warn(`${candidate.slug} ${translation.locale}: ${translationError.message}`);
          }
        }
      }
    }
  }

  await mkdir(options.reportDir, { recursive: true });
  const generatedAt = now.toISOString();
  const suffix = options.apply ? "apply" : "dry-run";
  const jsonPath = path.join(
    options.reportDir,
    `attach-verified-source-urls-${generatedAt.slice(0, 10)}-${suffix}.json`
  );
  const report = {
    generatedAt,
    mode: suffix,
    verified: results.filter((row) => row.found).length,
    notFound: results.filter((row) => !row.found).length,
    results,
  };
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        mode: suffix,
        verified: report.verified,
        notFound: report.notFound,
        report: jsonPath,
        rows: results.map((row) => ({
          slug: row.slug,
          found: row.found,
          doi: row.doi,
          url: row.url,
          beforeSevere: (row.before as { severe?: boolean } | undefined)?.severe,
          afterSevere: (row.after as { severe?: boolean } | undefined)?.severe,
        })),
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
