/** Language + legal compliance guardrails for autonomous editorial */

import { MEDICAL_DISCLAIMER, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { CONTENT_GUARDRAILS } from "@/lib/ecosystem/autonomous";

export type ComplianceCheckType = "language" | "legal" | "medical_claims" | "vip_cta";

export type ComplianceResult = {
  passed: boolean;
  checkType: ComplianceCheckType;
  issues: string[];
  suggestions: string[];
};

export const BLOCKED_HEALTH_CLAIMS = [
  ...CONTENT_GUARDRAILS.blockedTopics,
  "guaranteed cure",
  "100% effective",
  "replace your doctor",
  "stop taking medication",
  "FDA approved miracle",
  "instant weight loss",
  "reverse aging completely",
];

export const VIP_CTA_TEMPLATES: Record<GlobalLocaleCode, string> = {
  cs: "Pro hlubší longevity protokoly a personalizované doporučení prozkoumejte VIP MedScopeGlobal.",
  sk: "Pre hlbšie longevity protokoly a personalizované odporúčania preskúmajte VIP MedScopeGlobal.",
  pl: "Aby uzyskać głębsze protokoły longevity i spersonalizowane rekomendacje, odkryj VIP MedScopeGlobal.",
  de: "Für tiefere Longevity-Protokolle und personalisierte Empfehlungen entdecken Sie VIP MedScopeGlobal.",
  fr: "Pour des protocoles longevity approfondis et des recommandations personnalisées, découvrez VIP MedScopeGlobal.",
  it: "Per protocolli longevity più approfonditi e raccomandazioni personalizzate, scopri VIP MedScopeGlobal.",
  es: "Para protocolos de longevidad más profundos y recomendaciones personalizadas, descubre VIP MedScopeGlobal.",
  ro: "Pentru protocoale longevity mai profunde și recomandări personalizate, descoperă VIP MedScopeGlobal.",
  hu: "Mélyebb longevity protokollokért és személyre szabott ajánlásokért fedezze fel a VIP MedScopeGlobal-t.",
  ru: "Для углублённых протоколов долголетия и персональных рекомендаций откройте VIP MedScopeGlobal.",
  uk: "Для глибших протоколів довголіття та персоналізованих рекомендацій відкрийте VIP MedScopeGlobal.",
  be: "Для больш глыбокіх протаколаў даўгалоддзя і персanalizаваных рэкамendацый адкрыйце VIP MedScopeGlobal.",
  "zh-CN": "如需更深入的长寿协议和个性化建议，请探索 VIP MedScopeGlobal。",
  ja: "より深いロンジェビティプロトコルとパーソナライズされた推奨事項については、VIP MedScopeGlobalをご覧ください。",
  ko: "더 깊은 longevity 프로토콜과 맞춤형 추천을 위해 VIP MedScopeGlobal을 살펴보세요.",
  vi: "Để khám phá các giao thức longevity sâu hơn và khuyến nghị cá nhân hóa, hãy khám phá VIP MedScopeGlobal.",
  id: "Untuk protokol longevity yang lebih mendalam dan rekomendasi personal, jelajahi VIP MedScopeGlobal.",
  en: "For deeper longevity protocols and personalized recommendations, explore VIP MedScopeGlobal.",
  "en-US":
    "For deeper longevity protocols and personalized recommendations, explore VIP MedScopeGlobal.",
};

export function getMedicalDisclaimer(locale: GlobalLocaleCode): string {
  return MEDICAL_DISCLAIMER[locale] ?? MEDICAL_DISCLAIMER.cs;
}

export function getVipCtaTemplate(locale: GlobalLocaleCode): string {
  return VIP_CTA_TEMPLATES[locale] ?? VIP_CTA_TEMPLATES.en;
}

export function buildLanguageReviewPrompt(locale: GlobalLocaleCode): string {
  return `Review this health article for ${locale} locale. Check grammar, medical terminology accuracy, tone consistency, and cultural appropriateness. Flag any awkward translations or non-native phrasing.`;
}

export function buildLegalReviewPrompt(locale: GlobalLocaleCode): string {
  const disclaimer = getMedicalDisclaimer(locale);
  return `Review for legal/compliance in ${locale}. Ensure:
- Medical disclaimer present: "${disclaimer}"
- No diagnostic claims or treatment prescriptions
- No miracle cure language
- Health claims are evidence-based with appropriate hedging
- VIP/subscription CTAs are clearly marked as optional upgrades, not medical advice`;
}

export function buildMedicalClaimsPrompt(): string {
  return `Scan for blocked health claims: ${BLOCKED_HEALTH_CLAIMS.join(", ")}. Flag any statement that could be interpreted as medical advice, diagnosis, or guaranteed outcome.`;
}

export function runComplianceChecks(
  content: string,
  locale: GlobalLocaleCode
): ComplianceResult[] {
  const results: ComplianceResult[] = [];
  const lower = content.toLowerCase();

  const claimIssues = BLOCKED_HEALTH_CLAIMS.filter((term) =>
    lower.includes(term.toLowerCase())
  );
  results.push({
    checkType: "medical_claims",
    passed: claimIssues.length === 0,
    issues: claimIssues.map((c) => `Blocked claim detected: ${c}`),
    suggestions: claimIssues.length
      ? ["Rephrase with evidence-based hedging and add disclaimer"]
      : [],
  });

  const disclaimer = getMedicalDisclaimer(locale);
  const hasDisclaimer =
    lower.includes("lékař") ||
    lower.includes("doctor") ||
    lower.includes("physician") ||
    lower.includes("diagnóz") ||
    lower.includes("diagnosis") ||
    lower.includes("konzultuj") ||
    lower.includes("consult");
  results.push({
    checkType: "legal",
    passed: hasDisclaimer,
    issues: hasDisclaimer ? [] : ["Medical disclaimer may be missing"],
    suggestions: hasDisclaimer ? [] : [`Add disclaimer: ${disclaimer.slice(0, 80)}…`],
  });

  return results;
}

export function allCompliancePassed(results: ComplianceResult[]): boolean {
  return results.every((r) => r.passed);
}
