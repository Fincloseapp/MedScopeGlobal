/**
 * AI Engine v18 — GROQ model chain and routing thresholds.
 */

/** Spec model IDs (logical names for routing / audit). */
export const AI_MODELS = {
  primary: "llama3-70b-8192",
  mixtral: "mixtral-8x7b",
  gemma2: "gemma2-27b",
} as const;

export type AiModelId = (typeof AI_MODELS)[keyof typeof AI_MODELS];

/** Map spec IDs → live Groq API model IDs (env overrides supported). */
export const GROQ_API_MODEL_MAP: Record<AiModelId, string> = {
  "llama3-70b-8192":
    process.env.GROQ_MODEL_PRIMARY?.trim() || "llama-3.3-70b-versatile",
  "mixtral-8x7b":
    process.env.GROQ_MODEL_FALLBACK?.trim() || "llama-3.1-8b-instant",
  "gemma2-27b":
    process.env.GROQ_MODEL_FALLBACK_2?.trim() || "openai/gpt-oss-20b",
};

/** Full outage fallback chain: 70B → mixtral → gemma2 */
export const AI_MODEL_FALLBACK_CHAIN: AiModelId[] = [
  AI_MODELS.primary,
  AI_MODELS.mixtral,
  AI_MODELS.gemma2,
];

export const ROUTING = {
  shortQueryMaxChars: 500,
  longDocumentMinChars: 8_000,
  maxPromptChars: 28_000,
  segmentSize: 4_000,
} as const;

const PROFESSIONAL_KEYWORDS =
  /\b(diagn[oó]z|léčb|klinick|terapie|medik|dávkov|kontraindik|guideline|doporučení|rizik|pacient|symptom|laborator|prognóz|ICD|SNOMED|FHIR)\b/i;

export function isProfessionalQuery(query: string): boolean {
  return PROFESSIONAL_KEYWORDS.test(query);
}

export function isLongDocument(text: string): boolean {
  return text.trim().length >= ROUTING.longDocumentMinChars;
}

export function isShortQuery(query: string): boolean {
  return query.trim().length > 0 && query.trim().length <= ROUTING.shortQueryMaxChars;
}

/**
 * Routing per spec:
 * - short queries → 70B
 * - professional / long documents → 70B → gemma2
 * - outage handled separately via AI_MODEL_FALLBACK_CHAIN
 */
export function selectModelChain(query: string, documentText = ""): AiModelId[] {
  const combined = `${query}\n${documentText}`.trim();

  if (isShortQuery(query) && !isLongDocument(documentText)) {
    return [AI_MODELS.primary];
  }

  if (isProfessionalQuery(query) || isLongDocument(combined)) {
    return [AI_MODELS.primary, AI_MODELS.gemma2];
  }

  return [AI_MODELS.primary, AI_MODELS.gemma2];
}

export function resolveGroqApiModel(modelId: AiModelId | string): string {
  if (modelId in GROQ_API_MODEL_MAP) {
    return GROQ_API_MODEL_MAP[modelId as AiModelId];
  }
  return modelId;
}
