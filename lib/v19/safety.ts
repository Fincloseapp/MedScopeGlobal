import { containsDrugDosing } from "@/lib/ai/safety";
import type { V19ArticlePayload } from "@/lib/v19/types";

const FORBIDDEN_PATTERNS: RegExp[] = [
  /\b\d+\s*(mg|g|ml|mcg|tablety?)\b/i,
  /\b(dávka|dávkování|titruj|titrace)\b/i,
  /\b(předepište|prescribe|start with)\b/i,
  /\b(podávejte|administer)\s+\d+/i,
  /\b(léčebný\s+postup|treatment\s+protocol)\b/i,
];

export function sanitizeV19Text(text: string): string {
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

export function validateV19Article(article: V19ArticlePayload): {
  safe: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const blob = [
    article.title,
    article.summary,
    ...article.keyPoints,
    article.clinicalImpact,
  ].join("\n");

  if (article.title.length > 60) issues.push("title too long");
  if (article.keyPoints.length < 3 || article.keyPoints.length > 6) {
    issues.push("keyPoints count");
  }
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(blob)) issues.push(`forbidden: ${pattern.source}`);
  }
  if (containsDrugDosing(blob)) issues.push("drug dosing");

  return { safe: issues.length === 0, issues };
}

export function applyV19Safety(article: V19ArticlePayload): V19ArticlePayload {
  return {
    ...article,
    title: sanitizeV19Text(article.title).slice(0, 60),
    summary: sanitizeV19Text(article.summary),
    keyPoints: article.keyPoints.map((p) => sanitizeV19Text(p)).filter(Boolean),
    clinicalImpact: sanitizeV19Text(article.clinicalImpact),
  };
}
