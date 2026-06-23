import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import type { V4dSpecialty } from "@/lib/v4d/constants";

export type MedicalAiCategories = {
  diagnosis?: string[];
  study_type?: string;
  evidence_level?: string;
  clinical_impact?: string;
  practice_recommendation?: string;
  specialty?: V4dSpecialty;
  language?: string;
};

const FALLBACK: MedicalAiCategories = {
  diagnosis: ["ra"],
  study_type: "cohort",
  evidence_level: "level-3",
  clinical_impact: "moderate-impact",
  practice_recommendation: "monitoring",
  specialty: "rheumatology",
  language: "lang-en",
};

export async function categorizeMedicalText(input: {
  title: string;
  raw: string;
  specialty: V4dSpecialty;
  originalLanguage: string;
}): Promise<MedicalAiCategories> {
  if (!isLlmConfigured()) {
    return { ...FALLBACK, specialty: input.specialty, language: `lang-${input.originalLanguage}` };
  }

  const system = `Jsi odborný medicínský katalogizátor MedScopeGlobal. Vrať pouze JSON.
Diagnózy: ra, psa, as, oa (pole slugů).
Typ studie: rct, meta-analysis, cohort, case-series.
Úroveň důkazů: level-1, level-2, level-3.
Klinický dopad: high-impact, moderate-impact.
Praxe: practice-change, monitoring.
Specialty slug: rheumatology, immunology, internal, pharmacology, orthopedics, neurology, dermatology, endocrinology.
Jazyk: lang-cs, lang-sk, lang-en, lang-de, lang-fr.`;

  const user = `Název: ${input.title}
Obor: ${input.specialty}
Jazyk originálu: ${input.originalLanguage}
Text: ${input.raw.slice(0, 3500)}

JSON:
{
  "diagnosis": ["ra"],
  "study_type": "rct",
  "evidence_level": "level-1",
  "clinical_impact": "high-impact",
  "practice_recommendation": "practice-change",
  "specialty": "${input.specialty}",
  "language": "lang-en"
}`;

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 600 });
    if (!raw) return { ...FALLBACK, specialty: input.specialty };
    const parsed = JSON.parse(raw) as MedicalAiCategories;
    return { ...FALLBACK, ...parsed, specialty: input.specialty };
  } catch {
    return { ...FALLBACK, specialty: input.specialty };
  }
}
