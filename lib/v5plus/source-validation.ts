import { isValidDoi, normalizeDoi } from "@/lib/ai/doi";

export type SourceValidation = {
  valid: boolean;
  reasons: string[];
  normalizedDoi: string | null;
};

export function validateMedicalSource(input: {
  url?: string | null;
  doi?: string | null;
  title?: string | null;
  abstract?: string | null;
  sourceType?: string | null;
}): SourceValidation {
  const reasons: string[] = [];
  let normalizedDoi: string | null = null;

  if (!input.title?.trim()) {
    reasons.push("missing_title");
  } else if (input.title.length < 8) {
    reasons.push("title_too_short");
  }

  if (input.doi?.trim()) {
    normalizedDoi = normalizeDoi(input.doi);
    if (!normalizedDoi) reasons.push("invalid_doi");
  }

  if (input.url?.trim()) {
    try {
      const u = new URL(input.url);
      if (!["http:", "https:"].includes(u.protocol)) reasons.push("invalid_url_protocol");
    } catch {
      reasons.push("invalid_url");
    }
  } else if (!normalizedDoi) {
    reasons.push("missing_url_or_doi");
  }

  const validTypes = ["pubmed", "pmc", "sukl", "ema", "fda", "university"];
  if (input.sourceType && !validTypes.includes(input.sourceType)) {
    reasons.push("invalid_source_type");
  }

  return {
    valid: reasons.length === 0,
    reasons,
    normalizedDoi,
  };
}
