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
    cs: "Mezinárodní výzkumná redakce MedScopeGlobal",
    scope: "global" as const,
  },
  medscope_clinical_insights: {
    en: "MedScopeGlobal Clinical Insights Unit",
    cs: "Klinická redakce MedScopeGlobal",
    scope: "global" as const,
  },
  medscope_global_health: {
    en: "MedScopeGlobal Global Health Content Division",
    cs: "Redakce globálního zdraví MedScopeGlobal",
    scope: "global" as const,
  },
  medscope_scientific_office: {
    en: "MedScopeGlobal Scientific Content Office",
    cs: "Vědecká obsahová redakce MedScopeGlobal",
    scope: "global" as const,
  },
  medscope_ai_editorial: {
    en: "MedScopeGlobal AI-Assisted Editorial Team",
    cs: "Editoriální tým MedScopeGlobal",
    scope: "global" as const,
  },
  medscope_medical_knowledge_lab: {
    en: "MedScopeGlobal Medical Knowledge Lab",
    cs: "Odborná redakce lékařských znalostí MedScopeGlobal",
    scope: "global" as const,
  },
  medscope_evidence_synthesis: {
    en: "MedScopeGlobal Evidence & Data Synthesis Group",
    cs: "Redakce evidence a dat MedScopeGlobal",
    scope: "global" as const,
  },
  // Czech
  medscope_cz_odborna: {
    en: "MedScopeGlobal CZ – Odborná zdravotnická redakce",
    cs: "Odborná zdravotnická redakce MedScopeGlobal",
    scope: "cz" as const,
  },
  medscope_cz_klinicka: {
    en: "MedScopeGlobal CZ – Klinická obsahová jednotka",
    cs: "Klinická obsahová redakce MedScopeGlobal",
    scope: "cz" as const,
  },
  medscope_cz_analyzy: {
    en: "MedScopeGlobal CZ – Oddělení zdravotnických analýz",
    cs: "Oddělení zdravotnických analýz MedScopeGlobal",
    scope: "cz" as const,
  },
  medscope_cz_klinicky_obsah: {
    en: "MedScopeGlobal CZ – Redakce klinického obsahu",
    cs: "Redakce klinického obsahu MedScopeGlobal",
    scope: "cz" as const,
  },
  medscope_cz_research_desk: {
    en: "MedScopeGlobal CZ – Content & Research Desk",
    cs: "Výzkumná a obsahová redakce MedScopeGlobal",
    scope: "cz" as const,
  },
  medscope_cz_info_team: {
    en: "MedScopeGlobal CZ – Zdravotnický informační tým",
    cs: "Zdravotnický informační tým MedScopeGlobal",
    scope: "cz" as const,
  },
} as const;

export type EditorialUnitId = keyof typeof EDITORIAL_UNITS;

export type EditorialLocale = string;

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

/** Single reader-facing byline — no desk roulette, no AI-suffix. */
export const PUBLIC_EDITORIAL_BYLINE = {
  cs: "Redakce MedScopeGlobal",
  sk: "Redakcia MedScopeGlobal",
  de: "Redaktion MedScopeGlobal",
  fr: "Rédaction MedScopeGlobal",
  es: "Redacción MedScopeGlobal",
  it: "Redazione MedScopeGlobal",
  pl: "Redakcja MedScopeGlobal",
  en: "MedScopeGlobal Editorial",
} as const;

export function publicEditorialByline(locale: EditorialLocale = "cs"): string {
  const tag = String(locale).toLowerCase();
  if (tag === "cs" || tag.startsWith("cs-")) return PUBLIC_EDITORIAL_BYLINE.cs;
  if (tag === "sk" || tag.startsWith("sk-")) return PUBLIC_EDITORIAL_BYLINE.sk;
  if (tag === "de" || tag.startsWith("de-")) return PUBLIC_EDITORIAL_BYLINE.de;
  if (tag === "fr" || tag.startsWith("fr-")) return PUBLIC_EDITORIAL_BYLINE.fr;
  if (tag === "es" || tag.startsWith("es-")) return PUBLIC_EDITORIAL_BYLINE.es;
  if (tag === "it" || tag.startsWith("it-")) return PUBLIC_EDITORIAL_BYLINE.it;
  if (tag === "pl" || tag.startsWith("pl-")) return PUBLIC_EDITORIAL_BYLINE.pl;
  return PUBLIC_EDITORIAL_BYLINE.en;
}

const DESK_NAME: Record<string, Record<string, string>> = {
  en: {
    cs: "Czech desk",
    sk: "Slovak desk",
    pl: "Polish desk",
    de: "German desk",
    fr: "French desk",
    it: "Italian desk",
    es: "Spanish desk",
    pt: "Portuguese desk",
    "pt-BR": "Brazilian desk",
    "en-US": "US desk",
    "en-UK": "UK desk",
    en: "English desk",
  },
  cs: {
    "en-US": "americká redakce",
    "en-UK": "britská redakce",
    en: "anglická redakce",
    de: "německá redakce",
    fr: "francouzská redakce",
    it: "italská redakce",
    es: "španělská redakce",
    "pt-BR": "brazilská redakce",
  },
  de: {
    cs: "tschechische Redaktion",
    "en-US": "US-Redaktion",
    "en-UK": "britische Redaktion",
    en: "englische Redaktion",
    fr: "französische Redaktion",
    it: "italienische Redaktion",
  },
  fr: {
    cs: "rédaction tchèque",
    "en-US": "rédaction américaine",
    "en-UK": "rédaction britannique",
    en: "rédaction anglaise",
    de: "rédaction allemande",
    it: "rédaction italienne",
  },
  it: {
    cs: "redazione ceca",
    "en-US": "redazione USA",
    "en-UK": "redazione britannica",
    en: "redazione inglese",
    de: "redazione tedesca",
    fr: "redazione francese",
  },
  es: {
    cs: "redacción checa",
    "en-US": "redacción de EE. UU.",
    en: "redacción inglesa",
    de: "redacción alemana",
    fr: "redacción francesa",
  },
};

function deskNamePack(locale: EditorialLocale): string {
  const tag = String(locale).toLowerCase();
  if (tag === "cs" || tag.startsWith("cs-")) return "cs";
  if (tag === "de" || tag.startsWith("de-")) return "de";
  if (tag === "fr" || tag.startsWith("fr-")) return "fr";
  if (tag === "it" || tag.startsWith("it-")) return "it";
  if (tag === "es" || tag.startsWith("es-")) return "es";
  return "en";
}

function sourceDeskKey(sourceLocale?: string | null): string {
  const tag = String(sourceLocale ?? "").trim();
  if (!tag) return "en";
  if (tag === "en-US" || tag === "en-UK" || tag === "pt-BR") return tag;
  return tag.split("-")[0] ?? tag;
}

function foreignDeskName(uiLocale: EditorialLocale, sourceLocale?: string | null): string {
  const pack = deskNamePack(uiLocale);
  const key = sourceDeskKey(sourceLocale);
  return DESK_NAME[pack]?.[key] ?? DESK_NAME.en?.[key] ?? DESK_NAME.en!.en!;
}

/** Diplomatic credit when a piece is shared from another language desk. */
export function formatSyndicatedByline(
  uiLocale: EditorialLocale,
  sourceLocale?: string | null
): string {
  if (!sourceLocale) return publicEditorialByline(uiLocale);
  const sourceKey = sourceDeskKey(sourceLocale);
  const uiKey = deskNamePack(uiLocale);
  if (sourceKey === uiKey || (uiKey === "en" && sourceKey.startsWith("en"))) {
    return publicEditorialByline(uiLocale);
  }
  const desk = foreignDeskName(uiLocale, sourceLocale);
  const pack = deskNamePack(uiLocale);
  if (pack === "cs") return `Ze zahraniční redakce MedScopeGlobal (${desk})`;
  if (pack === "de") return `Von der ${desk} von MedScopeGlobal`;
  if (pack === "fr") return `Depuis la ${desk} de MedScopeGlobal`;
  if (pack === "it") return `Dalla ${desk} di MedScopeGlobal`;
  if (pack === "es") return `Desde la ${desk} de MedScopeGlobal`;
  return `From the ${desk} of MedScopeGlobal`;
}

export function formatDeskShareNotice(
  uiLocale: EditorialLocale,
  sourceLocale?: string | null
): string {
  const byline = formatSyndicatedByline(uiLocale, sourceLocale);
  const pack = deskNamePack(uiLocale);
  if (pack === "cs") {
    return `${byline}. Převzato se souhlasem — místní redakce doplnila kontext pro české čtenáře.`;
  }
  if (pack === "de") {
    return `${byline}. Übernommen mit Kennzeichnung — die lokale Redaktion hat den Text für diese Ausgabe eingeordnet.`;
  }
  if (pack === "fr") {
    return `${byline}. Repris avec attribution — la rédaction locale a ajouté le contexte de cette édition.`;
  }
  if (pack === "it") {
    return `${byline}. Ripreso con attribuzione — la redazione locale ha aggiunto il contesto di questa edizione.`;
  }
  if (pack === "es") {
    return `${byline}. Reproducido con atribución — la redacción local añadió el contexto de esta edición.`;
  }
  return `${byline}. Shared with attribution — the local desk added context for this edition.`;
}

export function listingByline(
  article: { locale?: string | null; translatedFrom?: string | null; editorialPrimaryLabel?: string | null },
  uiLocale: EditorialLocale
): string {
  if (article.editorialPrimaryLabel) return article.editorialPrimaryLabel;
  const source = article.translatedFrom ?? article.locale;
  return formatSyndicatedByline(uiLocale, source);
}

export const EDITORIAL_FOOTER_CS =
  "Obsah připravila redakce MedScopeGlobal.com — odborně zpracovaný zdravotní materiál pro veřejnost. Při zdravotních rozhodnutích se vždy obraťte na lékaře.";

export const EDITORIAL_FOOTER_EN =
  "Prepared by the MedScopeGlobal.com editorial team — educational health content for the public. Always consult a physician for personal medical decisions.";

const EDITORIAL_FOOTER: Record<string, string> = {
  cs: EDITORIAL_FOOTER_CS,
  sk: "Obsah pripravila redakcia MedScopeGlobal.com — odborný zdravotný materiál pre verejnosť. Pri zdravotných rozhodnutiach sa vždy obráťte na lekára.",
  de: "Erstellt von der Redaktion MedScopeGlobal.com — fachlich aufbereitete Gesundheitsinhalte für die Öffentlichkeit. Bei medizinischen Entscheidungen wenden Sie sich immer an einen Arzt.",
  fr: "Préparé par la rédaction MedScopeGlobal.com — contenus de santé destinés au public. Consultez toujours un médecin pour toute décision médicale personnelle.",
  es: "Preparado por la redacción de MedScopeGlobal.com — contenidos de salud para el público. Consulte siempre a un médico para decisiones médicas personales.",
  it: "A cura della redazione MedScopeGlobal.com — contenuti sanitari per il pubblico. Consultare sempre un medico per decisioni mediche personali.",
  pl: "Przygotowane przez redakcję MedScopeGlobal.com — materiały zdrowotne dla czytelników. W decyzjach medycznych zawsze skonsultuj się z lekarzem.",
  en: EDITORIAL_FOOTER_EN,
};

export function editorialFooterText(locale: EditorialLocale = "cs"): string {
  const tag = String(locale).toLowerCase().split("-")[0];
  if (tag === "cs") return EDITORIAL_FOOTER.cs;
  return EDITORIAL_FOOTER[tag] ?? EDITORIAL_FOOTER.en;
}

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
  dlouhovekost: "medscope_cz_research_desk",
};

export function isEditorialUnitId(value: unknown): value is EditorialUnitId {
  return typeof value === "string" && value in EDITORIAL_UNITS;
}

function normalizeArticleMetadata(
  metadata: ArticleForEditorialUnits["metadata"]
): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata;
  }
  return {};
}

export function editorialUnitLabel(
  unitId: EditorialUnitId | null | undefined,
  locale: EditorialLocale = "cs"
): string {
  const resolved = isEditorialUnitId(unitId) ? unitId : LEGACY_DEFAULT_UNIT;
  const unit = EDITORIAL_UNITS[resolved];
  return locale === "en" ? unit.en : unit.cs;
}

export function formatEditorialUnitDisplay(
  _unitId: EditorialUnitId | null | undefined,
  locale: EditorialLocale,
  _aiAssisted = false
): string {
  return publicEditorialByline(locale);
}

function detectAiAssisted(article: ArticleForEditorialUnits): boolean {
  const meta = normalizeArticleMetadata(article.metadata);
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
  const meta = normalizeArticleMetadata(article.metadata);
  const personaId = String(meta.author_persona ?? "");
  if (personaId && PERSONA_STYLE_TO_CZ_UNIT[personaId]) {
    return PERSONA_STYLE_TO_CZ_UNIT[personaId]!;
  }
  const pillar = String(meta.content_pillar ?? meta.internal_topic ?? "")
    .toLowerCase()
    .trim();
  if (pillar === "dlouhovekost") return "medscope_cz_research_desk";
  const topic = article.public_topic ?? "";
  if (topic && PUBLIC_TOPIC_TO_CZ_UNIT[topic]) {
    return PUBLIC_TOPIC_TO_CZ_UNIT[topic]!;
  }
  return "medscope_cz_odborna";
}

/** Assign primary/reviewer editorial units from article context. */
export function assignEditorialUnits(
  article?: ArticleForEditorialUnits | null
): EditorialAssignment {
  const safe = article ?? {};
  const meta = normalizeArticleMetadata(safe.metadata);

  if (isEditorialUnitId(meta.editorial_unit_primary)) {
    return {
      primary: meta.editorial_unit_primary,
      reviewer: isEditorialUnitId(meta.editorial_unit_reviewer)
        ? meta.editorial_unit_reviewer
        : undefined,
      aiAssisted: detectAiAssisted(safe),
    };
  }

  const aiAssisted = detectAiAssisted(safe);

  if (isInternationalEn(safe)) {
    const primary: EditorialUnitId =
      safe.rubric_slug === "studies" || meta.section === "studies"
        ? "medscope_international_research"
        : "medscope_global_health";
    return { primary, aiAssisted };
  }

  if (isMedicalScientific(safe) && !isGeneralPublicHealth(safe)) {
    return {
      primary: "medscope_clinical_insights",
      reviewer: "medscope_cz_klinicka",
      aiAssisted,
    };
  }

  if (isGeneralPublicHealth(safe)) {
    const primary = czUnitFromPersonaOrTopic(safe);
    const reviewer: EditorialUnitId =
      primary === "medscope_cz_klinicka" ? "medscope_cz_odborna" : "medscope_cz_klinicka";
    return {
      primary,
      reviewer,
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
