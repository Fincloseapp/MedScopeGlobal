import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type EvidenceLevel = "A" | "B" | "C" | "D";

export type EvidenceScore = {
  evidence_level: EvidenceLevel;
  study_type: string;
  sample_size: number | null;
  clinical_relevance: string;
  recommendation_strength: string;
  data_quality: string;
  clinical_conclusions: string;
  metadata: Record<string, unknown>;
};

const FALLBACK: EvidenceScore = {
  evidence_level: "C",
  study_type: "cohort",
  sample_size: null,
  clinical_relevance: "moderate",
  recommendation_strength: "conditional",
  data_quality: "moderate",
  clinical_conclusions:
    "Klinické závěry vyžadují ověření vůči primární studii a guidelines.",
  metadata: { fallback: true },
};

export async function scoreEvidenceWithAi(input: {
  title: string;
  abstract: string;
  categories?: Record<string, unknown>;
}): Promise<EvidenceScore> {
  if (!isLlmConfigured()) return { ...FALLBACK, metadata: { ...FALLBACK.metadata } };

  const system = `Jsi evidence-based medicine hodnotitel. Urči typ studie, úroveň důkazů A/B/C/D (A=RCT/meta, B=kohortní, C=case-control, D=expert/opinion), klinický dopad, sílu doporučení, kvalitu dat a klinické závěry. JSON only.`;

  const user = `Title: ${input.title}
Abstract: ${input.abstract.slice(0, 3500)}
Categories: ${JSON.stringify(input.categories ?? {})}

JSON:
{
  "evidence_level": "A|B|C|D",
  "study_type": "rct|meta-analysis|cohort|case-series|review",
  "sample_size": 0,
  "clinical_relevance": "high|moderate|low",
  "recommendation_strength": "strong|conditional|weak",
  "data_quality": "high|moderate|low",
  "clinical_conclusions": "2-4 věty česky"
}`;

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 800 });
    if (!raw) return FALLBACK;
    const p = JSON.parse(raw) as EvidenceScore & { evidence_level?: string };
    const level = ["A", "B", "C", "D"].includes(p.evidence_level ?? "")
      ? (p.evidence_level as EvidenceLevel)
      : "C";
    return {
      evidence_level: level,
      study_type: p.study_type ?? FALLBACK.study_type,
      sample_size:
        typeof p.sample_size === "number" ? p.sample_size : null,
      clinical_relevance: p.clinical_relevance ?? FALLBACK.clinical_relevance,
      recommendation_strength:
        p.recommendation_strength ?? FALLBACK.recommendation_strength,
      data_quality: p.data_quality ?? FALLBACK.data_quality,
      clinical_conclusions:
        p.clinical_conclusions ?? FALLBACK.clinical_conclusions,
      metadata: { ai_scored: true },
    };
  } catch {
    return FALLBACK;
  }
}

export async function persistEvidenceForArticle(
  articleId: string,
  score: EvidenceScore
): Promise<void> {
  const admin = createServiceRoleClient();
  await admin.from("medical_evidence").upsert(
    {
      article_id: articleId,
      evidence_level: score.evidence_level,
      study_type: score.study_type,
      sample_size: score.sample_size,
      clinical_relevance: score.clinical_relevance,
      recommendation_strength: score.recommendation_strength,
      data_quality: score.data_quality,
      clinical_conclusions: score.clinical_conclusions,
      metadata: score.metadata,
    },
    { onConflict: "article_id" }
  );
}
