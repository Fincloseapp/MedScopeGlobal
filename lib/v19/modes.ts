import type { V19ArticlePayload, V19ContentMode, V19ModeLayer } from "@/lib/v19/types";

export const V19_DEFAULT_MODE: V19ContentMode = "doctor";

export function resolveV19Mode(input?: string | null): V19ContentMode {
  if (input === "patient" || input === "scientist" || input === "doctor") return input;
  return V19_DEFAULT_MODE;
}

/** Apply reader mode — doctor (default), patient, or scientist view. */
export function applyV19Mode<T extends V19ArticlePayload>(
  article: T,
  mode: V19ContentMode = V19_DEFAULT_MODE
): T & { mode: V19ContentMode } {
  const layers = article.modeLayers;
  if (!layers) {
    return { ...article, mode };
  }

  const layer: V19ModeLayer | undefined = layers[mode] ?? layers.doctor;
  if (!layer) return { ...article, mode };

  return {
    ...article,
    mode,
    summary: layer.summary || article.summary,
    keyPoints: layer.keyPoints?.length ? layer.keyPoints : article.keyPoints,
    clinicalImpact: layer.clinicalImpact ?? article.clinicalImpact,
    scientificContext:
      mode === "scientist"
        ? layer.scientificContext ?? article.scientificContext
        : article.scientificContext,
    patientEducation:
      mode === "patient"
        ? layer.patientEducation ?? article.patientEducation
        : article.patientEducation,
  };
}
