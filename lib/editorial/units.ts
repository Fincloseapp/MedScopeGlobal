/**
 * Unified editorial author units — replaces individual journalist bylines.
 */

export const EDITORIAL_UNITS = {
  // Global
  medscope_global_editorial_board: {
    en: "MedScopeGlobal Editorial Board",
    cs: "Odborná redakce MedScopeGlobal",
    scope: "global" as const,
  },
  medscope_international_research: {
    en: "MedScopeGlobal International Research Desk",
    cs: "MedScopeGlobal International Research Desk",
    scope: "global" as const,
  },
  medscope_clinical_insights: {
    en: "MedScopeGlobal Clinical Insights Unit",
    cs: "MedScopeGlobal Clinical Insights Unit",
    scope: "global" as const,
  },
  medscope_global_health: {
    en: "MedScopeGlobal Global Health Content Division",
    cs: "MedScopeGlobal Global Health Content Division",
    scope: "global" as const,
  },
  medscope_scientific_office: {
    en: "MedScopeGlobal Scientific Content Office",
    cs: "MedScopeGlobal Scientific Content Office",
    scope: "global" as const,
  },
  medscope_ai_editorial: {
    en: "MedScopeGlobal AI-Assisted Editorial Team",
    cs: "MedScopeGlobal AI-Assisted Editorial Team",
    scope: "global" as const,
  },
  medscope_medical_knowledge_lab: {
    en: "MedScopeGlobal Medical Knowledge Lab",
    cs: "MedScopeGlobal Medical Knowledge Lab",
    scope: "global" as const,
  },
  medscope_evidence_synthesis: {
    en: "MedScopeGlobal Evidence & Data Synthesis Group",
    cs: "MedScopeGlobal Evidence & Data Synthesis Group",
    scope: "global" as const,
  },
  // Czech
  medscope_cz_odborna: {
    en: "MedScopeGlobal CZ – Odborná zdravotnická redakce",
    cs: "MedScopeGlobal CZ – Odborná zdravotnická redakce",
    scope: "cz" as const,
  },
  medscope_cz_klinicka: {
    en: "MedScopeGlobal CZ – Klinická obsahová jednotka",
    cs: "MedScopeGlobal CZ – Klinická obsahová jednotka",
    scope: "cz" as const,
  },
  medscope_cz_analyzy: {
    en: "MedScopeGlobal CZ – Oddělení zdravotnických analýz",
    cs: "MedScopeGlobal CZ – Oddělení zdravotnických analýz",
    scope: "cz" as const,
  },
  medscope_cz_klinicky_obsah: {
    en: "MedScopeGlobal CZ – Redakce klinického obsahu",
    cs: "MedScopeGlobal CZ – Redakce klinického obsahu",
    scope: "cz" as const,
  },
  medscope_cz_research_desk: {
    en: "MedScopeGlobal CZ – Content & Research Desk",
    cs: "MedScopeGlobal CZ – Content & Research Desk",
    scope: "cz" as const,
  },
  medscope_cz_info_team: {
    en: "MedScopeGlobal CZ – Zdravotnický informační tým",
    cs: "MedScopeGlobal CZ – Zdravotnický informační tým",
    scope: "cz" as const,
  },
} as const;

export type EditorialUnitId = keyof typeof EDITORIAL_UNITS;

export type EditorialLocale = "cs" | "en";

export interface EditorialAssignment {
  primary: EditorialUnitId;
  reviewer?: EditorialUnitId;
  aiAssisted: boolean;
}

export interface ArticleForEditorialUnits {
  locale?: string | null;
  audience?: string | null;
  rubric_slug?: string | null;
  public_topic?: string | null;
  min_access_level?: string | null;
  ai_generated?: boolean | null;
  source_name?: string | null;
  metadata?: Record<string, unknown> | null;
}

export const AI_ASSISTED_SUFFIX = {
  en: "(AI-assisted content synthesis)",
  cs: "(AI-asistovaná syntéza obsahu)",
} as const;

export const EDITORIAL_FOOTER_CS =
  "Obsah byl vytvořen a odborně zpracován interním AI-editoriálním systémem MedScopeGlobal.com ve spolupráci s českou a mezinárodní redakcí.";

export const EDITORIAL_FOOTER_EN =
  "This content was created and professionally processed by MedScopeGlobal.com's internal AI editorial system in collaboration with Czech and international editorial teams.";

export const LEGACY_DEFAULT_UNIT: EditorialUnitId = "medscope_global_editorial_board";

/** Legacy journalist persona ids → CZ editorial units */
export const PERSONA_STYLE_TO_CZ_UNIT: Record<string, EditorialUnitId> = {
  analytik: "medscope_cz_analyzy",
  vypravěč: "medscope_cz_klinicky_obsah",
  reportér: "medscope_cz_odborna",
  komentátor: "medscope_cz_klinicka",
  empatik: "medscope_cz_info_team",
  investigativní: "medscope_cz_analyzy",
  popularizátor: "medscope_cz_research_desk",
};

/** Legacy personal byline fragments for migration */
export const LEGACY_PERSONAL_NAME_PATTERNS: Array<{ pattern: RegExp; unit: EditorialUnitId }> = [
  { pattern: /votrubov/i, unit: "medscope_cz_analyzy" },
  { pattern: /malina/i, unit: "medscope_cz_klinicky_obsah" },
  { pattern: /horákov/i, unit: "medscope_cz_odborna" },
  { pattern: /štěpán/i, unit: "medscope_cz_klinicka" },
  { pattern: /procházkov/i, unit: "medscope_cz_info_team" },
  { pattern: /dušek/i, unit: "medscope_cz_analyzy" },
  { pattern: /beránkov/i, unit: "medscope_cz_research_desk" },
];

const PUBLIC_TOPIC_TO_CZ_UNIT: Record<string, EditorialUnitId> = {
  "zivotni-styl": "medscope_cz_klinicky_obsah",
  nemoci: "medscope_cz_klinicka",
  prevence: "medscope_cz_info_team",
  rozhovory: "medscope_cz_odborna",
};

export function isEditorialUnitId(value: unknown): value is EditorialUnitId {
  return typeof value === "string" && value in EDITORIAL_UNITS;
}

export function editorialUnitLabel(
  unitId: EditorialUnitId,
  locale: EditorialLocale = "cs"
): string {
  const unit = EDITORIAL_UNITS[unitId];
  return locale === "en" ? unit.en : unit.cs;
}

export function formatEditorialUnitDisplay(
  unitId: EditorialUnitId,
  locale: EditorialLocale,
  aiAssisted = false
): string {
  const label = editorialUnitLabel(unitId, locale);
  if (!aiAssisted) return label;
  const suffix = locale === "en" ? AI_ASSISTED_SUFFIX.en : AI_ASSISTED_SUFFIX.cs;
  return `${label} ${suffix}`;
}

function detectAiAssisted(article: ArticleForEditorialUnits): boolean {
  const meta = article.metadata ?? {};
  if (meta.ai_assisted === true) return true;
  if (article.ai_generated === true) return true;
  if (meta.ai_assisted === false || article.ai_generated === false) return false;
  const src = String(article.source_name ?? "").toLowerCase();
  if (src.includes("ai") || src.includes("asistovan")) return true;
  if (meta.author_persona || meta.author_display_name || meta.author_byline) return true;
  return true;
}

function isMedicalScientific(article: ArticleForEditorialUnits): boolean {
  const level = article.min_access_level ?? "public";
  const rubric = article.rubric_slug ?? "";
  const audience = article.audience ?? "public";
  if (level === "physician" || level === "student") return true;
  if (rubric === "studie" || rubric === "medicina" || rubric === "odborne") return true;
  if (audience === "professional") return true;
  if (article.public_topic === "nemoci") return true;
  const section = article.metadata?.section;
  if (section === "studies" || section === "guidelines") return true;
  return false;
}

function isInternationalEn(article: ArticleForEditorialUnits): boolean {
  const locale = (article.locale ?? "cs").toLowerCase();
  if (locale === "en") return true;
  const section = article.metadata?.section;
  if (section === "foreign-news") return true;
  if (article.rubric_slug === "studies" && locale !== "cs") return true;
  return false;
}

function isGeneralPublicHealth(article: ArticleForEditorialUnits): boolean {
  const audience = article.audience ?? "public";
  const rubric = article.rubric_slug ?? "";
  return audience === "public" || rubric === "verejnost";
}

function czUnitFromPersonaOrTopic(article: ArticleForEditorialUnits): EditorialUnitId {
  const personaId = String(article.metadata?.author_persona ?? "");
  if (personaId && PERSONA_STYLE_TO_CZ_UNIT[personaId]) {
    return PERSONA_STYLE_TO_CZ_UNIT[personaId]!;
  }
  const topic = article.public_topic ?? "";
  if (topic && PUBLIC_TOPIC_TO_CZ_UNIT[topic]) {
    return PUBLIC_TOPIC_TO_CZ_UNIT[topic]!;
  }
  return "medscope_cz_odborna";
}

/** Assign primary/reviewer editorial units from article context. */
export function assignEditorialUnits(article: ArticleForEditorialUnits): EditorialAssignment {
  const meta = article.metadata ?? {};

  if (isEditorialUnitId(meta.editorial_unit_primary)) {
    return {
      primary: meta.editorial_unit_primary,
      reviewer: isEditorialUnitId(meta.editorial_unit_reviewer)
        ? meta.editorial_unit_reviewer
        : undefined,
      aiAssisted: detectAiAssisted(article),
    };
  }

  const aiAssisted = detectAiAssisted(article);

  if (isInternationalEn(article)) {
    const primary: EditorialUnitId =
      article.rubric_slug === "studies" || meta.section === "studies"
        ? "medscope_international_research"
        : "medscope_global_health";
    return { primary, aiAssisted };
  }

  if (isMedicalScientific(article) && !isGeneralPublicHealth(article)) {
    return {
      primary: "medscope_clinical_insights",
      reviewer: "medscope_cz_klinicka",
      aiAssisted,
    };
  }

  if (isGeneralPublicHealth(article)) {
    return {
      primary: czUnitFromPersonaOrTopic(article),
      aiAssisted,
    };
  }

  return {
    primary: LEGACY_DEFAULT_UNIT,
    reviewer: "medscope_cz_odborna",
    aiAssisted,
  };
}

export function resolveLegacyUnitFromText(text: string): EditorialUnitId | null {
  const hay = String(text ?? "");
  for (const { pattern, unit } of LEGACY_PERSONAL_NAME_PATTERNS) {
    if (pattern.test(hay)) return unit;
  }
  if (/redakce medscopeglobal/i.test(hay)) return LEGACY_DEFAULT_UNIT;
  return null;
}

export function buildEditorialMetadataPatch(
  assignment: EditorialAssignment
): Record<string, unknown> {
  return {
    editorial_unit_primary: assignment.primary,
    editorial_unit_reviewer: assignment.reviewer ?? null,
    ai_assisted: assignment.aiAssisted,
    author_display_name: formatEditorialUnitDisplay(
      assignment.primary,
      "cs",
      assignment.aiAssisted
    ),
    author_byline: formatEditorialUnitDisplay(assignment.primary, "cs", assignment.aiAssisted),
    author_persona: null,
  };
}

export function buildArticleJsonLdAuthor(
  assignment: EditorialAssignment,
  locale: EditorialLocale = "cs"
): { "@type": "Organization"; name: string } {
  return {
    "@type": "Organization",
    name: formatEditorialUnitDisplay(assignment.primary, locale, assignment.aiAssisted),
  };
}

export function listEditorialUnitsForAdmin(): Array<{ id: EditorialUnitId; label: string }> {
  return (Object.keys(EDITORIAL_UNITS) as EditorialUnitId[]).map((id) => ({
    id,
    label: EDITORIAL_UNITS[id].cs,
  }));
}
