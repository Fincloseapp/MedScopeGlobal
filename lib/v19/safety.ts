import { containsDrugDosing } from "@/lib/ai/safety";
import type { V19ArticlePayload } from "@/lib/v19/types";

const FORBIDDEN_PATTERNS: RegExp[] = [
  /\b\d+\s*(mg|g|ml|mcg|tablety?)\b/i,
  /\b(dávka|dávkování|titruj|titrace)\b/i,
  /\b(předepište|prescribe|start with)\b/i,
  /\b(podávejte|administer)\s+\d+/i,
  /\b(léčebný\s+postup|treatment\s+protocol)\b/i,
  /\b(návod\s+k\s+léčbě|how\s+to\s+treat)\b/i,
];

function sanitizeTextFields(text: string): string {
  let out = text.trim();
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(out)) {
      out = out.replace(pattern, "[obecné doporučení — konzultujte odborníka]");
    }
  }
  if (containsDrugDosing(out)) {
    out = out
      .split("\n")
      .filter((line) => !containsDrugDosing(line))
      .join("\n");
  }
  return out.trim();
}

export function sanitizeV19Text(text: string): string {
  return sanitizeTextFields(text);
}

function collectTextBlob(article: V19ArticlePayload): string {
  const modeTexts =
    article.modeLayers &&
    Object.values(article.modeLayers)
      .flatMap((l) => [l?.summary, ...(l?.keyPoints ?? []), l?.clinicalImpact, l?.patientEducation, l?.scientificContext])
      .filter(Boolean);

  return [
    article.title,
    article.summary,
    ...article.keyPoints,
    article.clinicalImpact,
    article.scientificContext,
    article.patientEducation,
    article.nzipContext ?? "",
    ...(modeTexts ?? []),
  ].join("\n");
}

export function validateV19Article(article: V19ArticlePayload): {
  safe: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const blob = collectTextBlob(article);

  if (article.title.length > 60) issues.push("title too long");
  if (article.keyPoints.length < 3 || article.keyPoints.length > 6) {
    issues.push("keyPoints count");
  }
  if (!article.scientificContext?.trim()) issues.push("missing scientificContext");
  if (!article.patientEducation?.trim()) issues.push("missing patientEducation");
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(blob)) issues.push(`forbidden: ${pattern.source}`);
  }
  if (containsDrugDosing(blob)) issues.push("drug dosing");

  return { safe: issues.length === 0, issues };
}

export function applyV19Safety(article: V19ArticlePayload): V19ArticlePayload {
  const modeLayers = article.modeLayers
    ? Object.fromEntries(
        Object.entries(article.modeLayers).map(([mode, layer]) => [
          mode,
          layer
            ? {
                ...layer,
                summary: sanitizeTextFields(layer.summary),
                keyPoints: layer.keyPoints.map((p) => sanitizeTextFields(p)).filter(Boolean),
                clinicalImpact: layer.clinicalImpact
                  ? sanitizeTextFields(layer.clinicalImpact)
                  : undefined,
                scientificContext: layer.scientificContext
                  ? sanitizeTextFields(layer.scientificContext)
                  : undefined,
                patientEducation: layer.patientEducation
                  ? sanitizeTextFields(layer.patientEducation)
                  : undefined,
              }
            : layer,
        ])
      )
    : undefined;

  return {
    ...article,
    title: sanitizeTextFields(article.title).slice(0, 60),
    summary: sanitizeTextFields(article.summary),
    keyPoints: article.keyPoints.map((p) => sanitizeTextFields(p)).filter(Boolean),
    clinicalImpact: sanitizeTextFields(article.clinicalImpact),
    scientificContext: sanitizeTextFields(article.scientificContext),
    patientEducation: sanitizeTextFields(article.patientEducation),
    nzipContext: article.nzipContext
      ? sanitizeTextFields(article.nzipContext)
      : undefined,
    modeLayers: modeLayers as V19ArticlePayload["modeLayers"],
  };
}
