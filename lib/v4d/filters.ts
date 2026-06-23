import type { V4dLanguage, V4dSpecialty } from "@/lib/v4d/constants";
import { V4D_LANGUAGES, V4D_SPECIALTIES } from "@/lib/v4d/constants";

const LANG_HINTS: Record<V4dLanguage, RegExp[]> = {
  cs: [/\b(česk|čr|praha|brno|ostrava|revmatick|léčb)\b/i],
  sk: [/\b(slovens|bratislava|košice|martin)\b/i],
  en: [/\b(the|and|patients|treatment|study|clinical)\b/i],
  de: [/\b(und|der|die|patienten|behandlung|studie)\b/i],
  fr: [/\b(les|des|patients|traitement|étude|clinique)\b/i],
};

export function detectLanguage(text: string): V4dLanguage {
  const sample = text.slice(0, 2000);
  let best: V4dLanguage = "en";
  let bestScore = 0;
  for (const lang of V4D_LANGUAGES) {
    const score = LANG_HINTS[lang].reduce(
      (n, re) => n + (re.test(sample) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }
  return best;
}

export function isAllowedLanguage(lang: string | null | undefined): lang is V4dLanguage {
  return Boolean(lang && V4D_LANGUAGES.includes(lang as V4dLanguage));
}

export function isMedicalRelevant(text: string): boolean {
  const t = text.toLowerCase();
  const terms = [
    "patient",
    "clinical",
    "trial",
    "therapy",
    "diagnosis",
    "rheumat",
    "arthritis",
    "immun",
    "medication",
    "cohort",
    "meta-analysis",
    "randomized",
    "léčb",
    "pacient",
    "studie",
    "diagnóz",
  ];
  return terms.some((w) => t.includes(w));
}

export function matchesSpecialty(text: string, specialty: V4dSpecialty): boolean {
  const map: Record<V4dSpecialty, string[]> = {
    rheumatology: ["rheumat", "arthritis", "lupus", "spondyl", "revmat"],
    immunology: ["immun", "cytokine", "biologic", "imun"],
    internal: ["internal medicine", "cardio", "nephro", "interní"],
    pharmacology: ["drug", "pharma", "dose", "lék", "farmak"],
    orthopedics: ["orthop", "joint replacement", "ortop"],
    neurology: ["neuro", "neurolog", "multiple sclerosis"],
    dermatology: ["dermat", "psoriasis", "skin"],
    endocrinology: ["diabetes", "thyroid", "endocrin", "hormon"],
  };
  const t = text.toLowerCase();
  return map[specialty].some((k) => t.includes(k));
}

export function normalizeSpecialty(raw: string | undefined): V4dSpecialty {
  const s = (raw ?? "rheumatology").toLowerCase();
  if (V4D_SPECIALTIES.includes(s as V4dSpecialty)) return s as V4dSpecialty;
  return "rheumatology";
}
