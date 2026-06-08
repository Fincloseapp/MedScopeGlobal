import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { NzipCategory, V19SourceTier } from "@/lib/v19/types";

export const V19_RUBRIC_SLUG = "v19-medical-brief";

export function buildV19DedupHash(
  title: string,
  topic: string,
  sourceUrl: string,
  dateIso: string,
  keywords?: string[],
  publicationRef?: string
): string {
  const kw = (keywords ?? []).slice(0, 5).sort().join(",");
  const pub = publicationRef ?? "";
  const normalized = `${title}|${topic}|${sourceUrl}|${dateIso.slice(0, 10)}|${kw}|${pub}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 80);
}

export function normalizeKeywordKey(keyword: string): string {
  return keyword
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
}

export function keywordOverlap(a: string[], b: string[]): number {
  const setA = new Set(a.map(normalizeKeywordKey).filter(Boolean));
  const setB = new Set(b.map(normalizeKeywordKey).filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let overlap = 0;
  for (const k of setA) {
    if (setB.has(k)) overlap += 1;
  }
  return overlap / Math.min(setA.size, setB.size);
}

export function scientificTermOverlap(a: string[], b: string[]): boolean {
  const na = a.map(normalizeKeywordKey).filter(Boolean);
  const nb = b.map(normalizeKeywordKey).filter(Boolean);
  return na.some((term) => nb.includes(term));
}

export function isSimilarTitle(a: string, b: string): boolean {
  const ka = normalizeTitleKey(a);
  const kb = normalizeTitleKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (ka.includes(kb) || kb.includes(ka)) return true;
  return levenshteinRatio(ka, kb) > 0.85;
}

function levenshteinRatio(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

type V19QuizMeta = {
  topic?: string;
  v19?: boolean;
  specialty?: string;
  keywords?: string[];
  scientificTerms?: string[];
  nzipCategory?: NzipCategory;
  nzipRegistryId?: string;
  nzipGlossaryTerms?: string[];
  nzipRegistryRefs?: string[];
  publicationRef?: string;
  sourceTier?: V19SourceTier;
  source_name?: string;
};

export async function findExistingV19Duplicates(params: {
  hashDedup: string;
  title: string;
  topic: string;
  sourceUrl: string;
  sourceName?: string;
  keywords?: string[];
  scientificTerms?: string[];
  specialty?: string;
  nzipCategory?: NzipCategory;
  nzipRegistryId?: string;
  nzipGlossaryTerms?: string[];
  nzipRegistryRefs?: string[];
  publicationRef?: string;
  sourceTier?: V19SourceTier;
  maxAgeDays?: number;
}): Promise<{ duplicate: boolean; reason?: string; existingTitle?: string }> {
  const admin = createServiceRoleClient();
  const maxAgeDays = params.maxAgeDays ?? 30;
  const since = new Date();
  since.setDate(since.getDate() - maxAgeDays);

  const { data: byHash } = await admin
    .from("articles")
    .select("id, title")
    .eq("hash_dedup", params.hashDedup)
    .maybeSingle();

  if (byHash?.id) {
    return { duplicate: true, reason: "hash", existingTitle: byHash.title };
  }

  const { data: recent } = await admin
    .from("articles")
    .select("id, title, source_url, source_name, quiz_json")
    .eq("rubric_slug", V19_RUBRIC_SLUG)
    .gte("published_at", since.toISOString())
    .limit(200);

  const incomingKw = params.keywords ?? [];

  for (const row of recent ?? []) {
    const meta = (row.quiz_json ?? {}) as V19QuizMeta;

    if (params.publicationRef && meta.publicationRef === params.publicationRef) {
      return { duplicate: true, reason: "publication-ref", existingTitle: row.title };
    }

    const metaRegistry = (meta as V19QuizMeta).nzipRegistryId;
    if (params.nzipRegistryId && metaRegistry === params.nzipRegistryId) {
      return { duplicate: true, reason: "nzip-registry", existingTitle: row.title };
    }

    const metaRefs = (meta as V19QuizMeta).nzipRegistryRefs ?? [];
    const incomingRefs = params.nzipRegistryRefs ?? [];
    if (
      incomingRefs.length &&
      incomingRefs.some((r) => metaRefs.includes(r))
    ) {
      return { duplicate: true, reason: "nzip-registry-refs", existingTitle: row.title };
    }

    const metaGlossary = (meta as V19QuizMeta).nzipGlossaryTerms ?? [];
    const incomingGlossary = params.nzipGlossaryTerms ?? [];
    if (
      incomingGlossary.length &&
      keywordOverlap(incomingGlossary, metaGlossary) >= 0.7
    ) {
      return { duplicate: true, reason: "nzip-glossary", existingTitle: row.title };
    }

    if (meta?.topic === params.topic && row.source_url === params.sourceUrl) {
      return { duplicate: true, reason: "topic+source", existingTitle: row.title };
    }

    if (
      params.nzipCategory &&
      meta.nzipCategory === params.nzipCategory &&
      meta.topic === params.topic
    ) {
      return { duplicate: true, reason: "nzip-category+topic", existingTitle: row.title };
    }

    if (isSimilarTitle(row.title, params.title)) {
      return { duplicate: true, reason: "similar-title", existingTitle: row.title };
    }

    const existingKw = meta.keywords ?? [];
    if (incomingKw.length && keywordOverlap(incomingKw, existingKw) >= 0.6) {
      return { duplicate: true, reason: "keywords", existingTitle: row.title };
    }

    const existingTerms = meta.scientificTerms ?? [];
    const incomingTerms = params.scientificTerms ?? [];
    if (
      incomingTerms.length &&
      scientificTermOverlap(incomingTerms, existingTerms) &&
      meta.specialty === params.specialty
    ) {
      return { duplicate: true, reason: "scientific-term+specialty", existingTitle: row.title };
    }

    if (
      params.sourceTier === "science" &&
      meta.sourceTier === "science" &&
      row.source_name === params.sourceName &&
      meta.specialty === params.specialty
    ) {
      return { duplicate: true, reason: "science-source+specialty", existingTitle: row.title };
    }

    if (
      meta.specialty &&
      params.specialty &&
      meta.specialty === params.specialty &&
      meta.topic === params.topic
    ) {
      return { duplicate: true, reason: "specialty+topic", existingTitle: row.title };
    }
  }

  return { duplicate: false };
}

export async function listRecentV19Titles(maxAgeDays = 30): Promise<string[]> {
  const admin = createServiceRoleClient();
  const since = new Date();
  since.setDate(since.getDate() - maxAgeDays);
  const { data } = await admin
    .from("articles")
    .select("title")
    .eq("rubric_slug", V19_RUBRIC_SLUG)
    .gte("published_at", since.toISOString())
    .limit(100);
  return (data ?? []).map((r) => r.title as string);
}
