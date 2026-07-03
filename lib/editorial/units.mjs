/**
 * MJS mirror of lib/editorial/units.ts for writer scripts.
 */

export const EDITORIAL_UNITS = {
  medscope_global_editorial_board: {
    en: "MedScopeGlobal Editorial Board",
    cs: "Odborná redakce MedScopeGlobal",
    scope: "global",
  },
  medscope_international_research: {
    en: "MedScopeGlobal International Research Desk",
    cs: "MedScopeGlobal International Research Desk",
    scope: "global",
  },
  medscope_clinical_insights: {
    en: "MedScopeGlobal Clinical Insights Unit",
    cs: "MedScopeGlobal Clinical Insights Unit",
    scope: "global",
  },
  medscope_global_health: {
    en: "MedScopeGlobal Global Health Content Division",
    cs: "MedScopeGlobal Global Health Content Division",
    scope: "global",
  },
  medscope_scientific_office: {
    en: "MedScopeGlobal Scientific Content Office",
    cs: "MedScopeGlobal Scientific Content Office",
    scope: "global",
  },
  medscope_ai_editorial: {
    en: "MedScopeGlobal AI-Assisted Editorial Team",
    cs: "MedScopeGlobal AI-Assisted Editorial Team",
    scope: "global",
  },
  medscope_medical_knowledge_lab: {
    en: "MedScopeGlobal Medical Knowledge Lab",
    cs: "MedScopeGlobal Medical Knowledge Lab",
    scope: "global",
  },
  medscope_evidence_synthesis: {
    en: "MedScopeGlobal Evidence & Data Synthesis Group",
    cs: "MedScopeGlobal Evidence & Data Synthesis Group",
    scope: "global",
  },
  medscope_cz_odborna: {
    en: "MedScopeGlobal CZ – Odborná zdravotnická redakce",
    cs: "MedScopeGlobal CZ – Odborná zdravotnická redakce",
    scope: "cz",
  },
  medscope_cz_klinicka: {
    en: "MedScopeGlobal CZ – Klinická obsahová jednotka",
    cs: "MedScopeGlobal CZ – Klinická obsahová jednotka",
    scope: "cz",
  },
  medscope_cz_analyzy: {
    en: "MedScopeGlobal CZ – Oddělení zdravotnických analýz",
    cs: "MedScopeGlobal CZ – Oddělení zdravotnických analýz",
    scope: "cz",
  },
  medscope_cz_klinicky_obsah: {
    en: "MedScopeGlobal CZ – Redakce klinického obsahu",
    cs: "MedScopeGlobal CZ – Redakce klinického obsahu",
    scope: "cz",
  },
  medscope_cz_research_desk: {
    en: "MedScopeGlobal CZ – Content & Research Desk",
    cs: "MedScopeGlobal CZ – Content & Research Desk",
    scope: "cz",
  },
  medscope_cz_info_team: {
    en: "MedScopeGlobal CZ – Zdravotnický informační tým",
    cs: "MedScopeGlobal CZ – Zdravotnický informační tým",
    scope: "cz",
  },
};

export const AI_ASSISTED_SUFFIX = {
  en: "(AI-assisted content synthesis)",
  cs: "(AI-asistovaná syntéza obsahu)",
};

export const EDITORIAL_FOOTER_CS =
  "Obsah byl vytvořen a odborně zpracován interním AI-editoriálním systémem MedScopeGlobal.com ve spolupráci s českou a mezinárodní redakcí.";

export const LEGACY_DEFAULT_UNIT = "medscope_global_editorial_board";

export const LEGACY_PERSONAL_NAME_PATTERNS = [
  { pattern: /votrubov/i, unit: "medscope_cz_analyzy" },
  { pattern: /malina/i, unit: "medscope_cz_klinicky_obsah" },
  { pattern: /horákov/i, unit: "medscope_cz_odborna" },
  { pattern: /štěpán/i, unit: "medscope_cz_klinicka" },
  { pattern: /procházkov/i, unit: "medscope_cz_info_team" },
  { pattern: /dušek/i, unit: "medscope_cz_analyzy" },
  { pattern: /beránkov/i, unit: "medscope_cz_research_desk" },
];

export function resolveLegacyUnitFromText(text) {
  const hay = String(text ?? "");
  for (const { pattern, unit } of LEGACY_PERSONAL_NAME_PATTERNS) {
    if (pattern.test(hay)) return unit;
  }
  if (/redakce medscopeglobal/i.test(hay)) return LEGACY_DEFAULT_UNIT;
  return null;
}

export const PERSONA_STYLE_TO_CZ_UNIT = {
  analytik: "medscope_cz_analyzy",
  vypravěč: "medscope_cz_klinicky_obsah",
  reportér: "medscope_cz_odborna",
  komentátor: "medscope_cz_klinicka",
  empatik: "medscope_cz_info_team",
  investigativní: "medscope_cz_analyzy",
  popularizátor: "medscope_cz_research_desk",
};

const PUBLIC_TOPIC_TO_CZ_UNIT = {
  "zivotni-styl": "medscope_cz_klinicky_obsah",
  nemoci: "medscope_cz_klinicka",
  prevence: "medscope_cz_info_team",
  rozhovory: "medscope_cz_odborna",
};

export function editorialUnitLabel(unitId, locale = "cs") {
  const unit = EDITORIAL_UNITS[unitId];
  if (!unit) return EDITORIAL_UNITS.medscope_global_editorial_board.cs;
  return locale === "en" ? unit.en : unit.cs;
}

export function formatEditorialUnitDisplay(unitId, locale = "cs", aiAssisted = false) {
  const label = editorialUnitLabel(unitId, locale);
  if (!aiAssisted) return label;
  const suffix = locale === "en" ? AI_ASSISTED_SUFFIX.en : AI_ASSISTED_SUFFIX.cs;
  return `${label} ${suffix}`;
}

function detectAiAssisted(article) {
  const meta = article.metadata ?? {};
  if (meta.ai_assisted === true) return true;
  if (article.ai_generated === true) return true;
  if (meta.author_persona || meta.author_display_name) return true;
  return true;
}

export function assignEditorialUnits(article) {
  const meta = article.metadata ?? {};
  if (meta.editorial_unit_primary && EDITORIAL_UNITS[meta.editorial_unit_primary]) {
    return {
      primary: meta.editorial_unit_primary,
      reviewer: meta.editorial_unit_reviewer ?? undefined,
      aiAssisted: detectAiAssisted(article),
    };
  }

  const aiAssisted = detectAiAssisted(article);
  const locale = (article.locale ?? "cs").toLowerCase();
  const audience = article.audience ?? "public";
  const rubric = article.rubric_slug ?? "";
  const level = article.min_access_level ?? "public";

  if (locale === "en" || meta.section === "foreign-news") {
    const primary =
      rubric === "studies" || meta.section === "studies"
        ? "medscope_international_research"
        : "medscope_global_health";
    return { primary, aiAssisted };
  }

  const isMedical =
    level === "physician" ||
    level === "student" ||
    rubric === "studie" ||
    rubric === "medicina" ||
    rubric === "odborne" ||
    audience === "professional" ||
    article.public_topic === "nemoci";

  const isPublic = audience === "public" || rubric === "verejnost";

  if (isMedical && !isPublic) {
    return {
      primary: "medscope_clinical_insights",
      reviewer: "medscope_cz_klinicka",
      aiAssisted,
    };
  }

  if (isPublic) {
    const personaId = meta.author_persona ?? "";
    const topic = article.public_topic ?? "";
    const primary =
      PERSONA_STYLE_TO_CZ_UNIT[personaId] ??
      PUBLIC_TOPIC_TO_CZ_UNIT[topic] ??
      "medscope_cz_odborna";
    return { primary, aiAssisted };
  }

  return {
    primary: "medscope_global_editorial_board",
    reviewer: "medscope_cz_odborna",
    aiAssisted,
  };
}

export function buildEditorialMetadataPatch(assignment) {
  return {
    editorial_unit_primary: assignment.primary,
    editorial_unit_reviewer: assignment.reviewer ?? null,
    ai_assisted: assignment.aiAssisted,
    author_display_name: formatEditorialUnitDisplay(assignment.primary, "cs", assignment.aiAssisted),
    author_byline: formatEditorialUnitDisplay(assignment.primary, "cs", assignment.aiAssisted),
    author_persona: null,
  };
}

/** Map internal writing-style persona id to editorial unit for bylines. */
export function editorialUnitForPersonaStyle(personaId, topic = null) {
  if (personaId && PERSONA_STYLE_TO_CZ_UNIT[personaId]) {
    return PERSONA_STYLE_TO_CZ_UNIT[personaId];
  }
  if (topic && PUBLIC_TOPIC_TO_CZ_UNIT[topic]) {
    return PUBLIC_TOPIC_TO_CZ_UNIT[topic];
  }
  return "medscope_cz_odborna";
}
