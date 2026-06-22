import { createServiceRoleClient } from "@/lib/supabase/service";
import type { V4dLanguage } from "@/lib/v4d/constants";
import { isAllowedLanguage, isMedicalRelevant } from "@/lib/v4d/filters";

export type QualityInput = {
  title: string;
  description: string;
  sourceUrl?: string | null;
  doi?: string | null;
  originalLanguage?: V4dLanguage | null;
};

export type QualityResult = {
  duplicateScore: number;
  textQualityScore: number;
  relevanceScore: number;
  languageMatch: boolean;
  expertiseLevel: string;
  passed: boolean;
  checks: Record<string, boolean | string | number>;
};

function titleFingerprint(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function checkDuplicates(input: QualityInput): Promise<{
  isDuplicate: boolean;
  duplicateScore: number;
}> {
  const admin = createServiceRoleClient();
  const fp = titleFingerprint(input.title);

  if (input.doi?.trim()) {
    const { data } = await admin
      .from("medical_ai_texts")
      .select("id")
      .ilike("doi", input.doi.trim())
      .limit(1);
    if (data?.length) return { isDuplicate: true, duplicateScore: 100 };
  }

  if (input.sourceUrl?.trim()) {
    const { data } = await admin
      .from("medical_ai_texts")
      .select("id")
      .eq("source_url", input.sourceUrl.trim())
      .limit(1);
    if (data?.length) return { isDuplicate: true, duplicateScore: 100 };
  }

  const { data: titles } = await admin
    .from("medical_ai_texts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(200);

  for (const row of titles ?? []) {
    if (titleFingerprint(row.title) === fp) {
      return { isDuplicate: true, duplicateScore: 95 };
    }
  }

  return { isDuplicate: false, duplicateScore: 0 };
}

export function scoreTextQuality(title: string, body: string): number {
  let score = 40;
  if (title.length >= 12) score += 15;
  if (body.length >= 200) score += 20;
  if (/\b(doi|pmid|pubmed|http)\b/i.test(body)) score += 10;
  if (/\b(study|trial|cohort|meta-analysis|randomized|studie)\b/i.test(body))
    score += 15;
  return Math.min(100, score);
}

export function scoreRelevance(text: string): number {
  return isMedicalRelevant(text) ? 85 : 35;
}

export async function evaluateQuality(input: QualityInput): Promise<QualityResult> {
  const dup = await checkDuplicates(input);
  const combined = `${input.title}\n${input.description}`;
  const textQualityScore = scoreTextQuality(input.title, input.description);
  const relevanceScore = scoreRelevance(combined);
  const languageMatch =
    !input.originalLanguage ||
    isAllowedLanguage(input.originalLanguage);
  const expertiseLevel =
    textQualityScore >= 70 && relevanceScore >= 70 ? "specialist" : "general";

  const passed =
    !dup.isDuplicate &&
    textQualityScore >= 55 &&
    relevanceScore >= 50 &&
    languageMatch;

  return {
    duplicateScore: dup.duplicateScore,
    textQualityScore,
    relevanceScore,
    languageMatch,
    expertiseLevel,
    passed,
    checks: {
      duplicate: dup.isDuplicate,
      scientificStyle: textQualityScore >= 55,
      hasSource: Boolean(input.sourceUrl || input.doi),
      medicalRelevance: relevanceScore >= 50,
      languageOk: languageMatch,
    },
  };
}

export async function persistQuality(
  textId: string,
  result: QualityResult
): Promise<void> {
  const admin = createServiceRoleClient();
  await admin.from("medical_ai_quality").insert({
    text_id: textId,
    duplicate_score: result.duplicateScore,
    text_quality_score: result.textQualityScore,
    relevance_score: result.relevanceScore,
    language_match: result.languageMatch,
    expertise_level: result.expertiseLevel,
    passed: result.passed,
    checks: result.checks,
  });
  await admin
    .from("medical_ai_texts")
    .update({ quality_passed: result.passed, updated_at: new Date().toISOString() })
    .eq("id", textId);
}
