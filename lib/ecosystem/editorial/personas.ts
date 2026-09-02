/** Autonomous editor/journalist personas with pipeline roles */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import type { EditorialTopic } from "./desks";

export type EditorialRole =
  | "journalist"
  | "editor"
  | "language_reviewer"
  | "compliance_reviewer"
  | "image_curator";

export type EditorialPersona = {
  id: string;
  displayName: Record<string, string>;
  role: EditorialRole;
  locales: GlobalLocaleCode[];
  topics: EditorialTopic[];
  editorialUnitId?: string;
  active: boolean;
};

export const EDITORIAL_PERSONAS: EditorialPersona[] = [
  // Journalists — content creation
  {
    id: "journalist-longevity-cz",
    displayName: { cs: "Redaktor dlouhověkosti", en: "Longevity Journalist" },
    role: "journalist",
    locales: ["cs", "sk"],
    topics: ["longevity"],
    editorialUnitId: "medscope_cz_research_desk",
    active: true,
  },
  {
    id: "journalist-lifestyle-cz",
    displayName: { cs: "Redaktor životního stylu", en: "Lifestyle Journalist" },
    role: "journalist",
    locales: ["cs"],
    topics: ["lifestyle"],
    editorialUnitId: "medscope_cz_odborna",
    active: true,
  },
  {
    id: "journalist-seniors-cz",
    displayName: { cs: "Redaktor pro seniory", en: "Seniors Health Journalist" },
    role: "journalist",
    locales: ["cs", "sk"],
    topics: ["seniors"],
    editorialUnitId: "medscope_cz_klinicka",
    active: true,
  },
  {
    id: "journalist-trending-cz",
    displayName: { cs: "Zpravodajský redaktor", en: "Health News Journalist" },
    role: "journalist",
    locales: ["cs"],
    topics: ["trending"],
    editorialUnitId: "medscope_cz_info_team",
    active: true,
  },
  {
    id: "journalist-longevity-en",
    displayName: { en: "Longevity Desk Writer", "en-US": "Longevity Desk Writer" },
    role: "journalist",
    locales: ["en", "en-US"],
    topics: ["longevity"],
    editorialUnitId: "medscope_global_health",
    active: true,
  },
  {
    id: "journalist-lifestyle-de",
    displayName: { de: "Lifestyle-Redakteur", en: "German Lifestyle Journalist" },
    role: "journalist",
    locales: ["de"],
    topics: ["lifestyle", "longevity"],
    editorialUnitId: "medscope_international_research",
    active: true,
  },
  {
    id: "journalist-eu-romance",
    displayName: {
      fr: "Rédacteur longévité EU",
      es: "Redactor de longevidad UE",
      it: "Redattore longevità UE",
      en: "EU Romance Longevity Journalist",
    },
    role: "journalist",
    locales: ["fr", "es", "it", "ro", "hu", "pl"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_international_research",
    active: true,
  },
  {
    id: "journalist-east-asia",
    displayName: {
      "zh-CN": "长寿专题记者",
      ja: "ロンジェビティ記者",
      ko: "롱제비티 기자",
      en: "East Asia Longevity Journalist",
    },
    role: "journalist",
    locales: ["zh-CN", "ja", "ko", "vi", "id"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_global_health",
    active: true,
  },
  {
    id: "journalist-slavic",
    displayName: {
      ru: "Журналист по долголетию",
      uk: "Журналіст з довголіття",
      be: "Журналіст даўгалецця",
      en: "Slavic Longevity Journalist",
    },
    role: "journalist",
    locales: ["ru", "uk", "be"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_global_health",
    active: true,
  },
  // Editors — review & approve
  {
    id: "editor-chief-cz",
    displayName: { cs: "Šéfredaktor", en: "Chief Editor" },
    role: "editor",
    locales: ["cs", "sk"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_global_editorial_board",
    active: true,
  },
  {
    id: "editor-chief-en",
    displayName: { en: "International Chief Editor" },
    role: "editor",
    locales: ["en", "en-US", "fr", "es", "it", "pl", "de", "ru", "uk", "zh-CN", "ja"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_global_editorial_board",
    active: true,
  },
  {
    id: "editor-longevity",
    displayName: { cs: "Odborný editor dlouhověkosti", en: "Longevity Section Editor" },
    role: "editor",
    locales: ["cs", "en", "en-US", "de", "fr", "es", "pl", "ru"],
    topics: ["longevity"],
    editorialUnitId: "medscope_evidence_synthesis",
    active: true,
  },
  {
    id: "editor-lifestyle",
    displayName: { cs: "Odborný editor životního stylu", en: "Lifestyle Section Editor" },
    role: "editor",
    locales: ["cs", "sk", "en", "en-US"],
    topics: ["lifestyle"],
    editorialUnitId: "medscope_cz_odborna",
    active: true,
  },
  {
    id: "editor-clinical",
    displayName: { cs: "Odborný editor klinických témat", en: "Clinical Section Editor" },
    role: "editor",
    locales: ["cs", "sk", "en"],
    topics: ["seniors", "lifestyle"],
    editorialUnitId: "medscope_cz_klinicka",
    active: true,
  },
  {
    id: "editor-prevention",
    displayName: { cs: "Odborný editor prevence", en: "Prevention Section Editor" },
    role: "editor",
    locales: ["cs", "sk", "en", "en-US"],
    topics: ["lifestyle", "seniors", "longevity"],
    editorialUnitId: "medscope_clinical_insights",
    active: true,
  },
  {
    id: "editor-interviews",
    displayName: { cs: "Editor rozhovorů", en: "Interviews Editor" },
    role: "editor",
    locales: ["cs", "sk", "en"],
    topics: ["trending", "lifestyle"],
    editorialUnitId: "medscope_cz_info_team",
    active: true,
  },
  {
    id: "editor-diplomacy-cz",
    displayName: { cs: "Diplomatický editor", en: "Diplomatic Editor" },
    role: "editor",
    locales: ["cs", "sk"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_global_editorial_board",
    active: true,
  },
  // Language reviewers — locale QA
  {
    id: "lang-reviewer-cz",
    displayName: { cs: "Jazykový korektor (CS)", en: "Czech Language Reviewer" },
    role: "language_reviewer",
    locales: ["cs"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    active: true,
  },
  {
    id: "lang-reviewer-sk",
    displayName: { sk: "Jazykový korektor (SK)", cs: "Jazykový korektor (SK)" },
    role: "language_reviewer",
    locales: ["sk"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    active: true,
  },
  {
    id: "lang-reviewer-en",
    displayName: { en: "English Language Reviewer" },
    role: "language_reviewer",
    locales: ["en", "en-US"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    active: true,
  },
  {
    id: "lang-reviewer-de",
    displayName: { de: "Sprachkorrektor (DE)", en: "German Language Reviewer" },
    role: "language_reviewer",
    locales: ["de"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    active: true,
  },
  {
    id: "lang-reviewer-eu",
    displayName: { fr: "Relecteur EU", es: "Corrector UE", en: "EU Language Reviewer" },
    role: "language_reviewer",
    locales: ["fr", "es", "it", "pl", "ro", "hu"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    active: true,
  },
  {
    id: "lang-reviewer-intl",
    displayName: { en: "International Language Reviewer", ru: "Международный корректор" },
    role: "language_reviewer",
    locales: ["ru", "uk", "be", "zh-CN", "ja", "ko", "vi", "id"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    active: true,
  },
  // Compliance reviewers — medical disclaimers, health claims
  {
    id: "compliance-medical-cz",
    displayName: { cs: "Lékařský compliance reviewer", en: "Medical Compliance Reviewer" },
    role: "compliance_reviewer",
    locales: ["cs", "sk"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_clinical_insights",
    active: true,
  },
  {
    id: "compliance-medical-en",
    displayName: { en: "Medical Compliance Reviewer (EN)" },
    role: "compliance_reviewer",
    locales: ["en", "en-US", "fr", "es", "it", "de", "pl", "ru", "uk", "zh-CN", "ja"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_clinical_insights",
    active: true,
  },
  {
    id: "compliance-legal-global",
    displayName: { cs: "Právní/compliance reviewer", en: "Legal & Compliance Reviewer" },
    role: "compliance_reviewer",
    locales: [
      "cs", "sk", "en", "en-US", "de", "pl", "fr", "es", "it", "ro", "hu",
      "ru", "uk", "be", "zh-CN", "ja", "ko", "vi", "id",
    ],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_scientific_office",
    active: true,
  },
  // Visual editorial — inclusive hero/inline imagery
  {
    id: "image-curator-global",
    displayName: { cs: "Vizuální kurátor", en: "Visual Image Curator" },
    role: "image_curator",
    locales: [
      "cs", "sk", "en", "en-US", "de", "pl", "fr", "es", "it", "ro", "hu",
      "ru", "uk", "be", "zh-CN", "ja", "ko", "vi", "id",
    ],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_global_editorial_board",
    active: true,
  },
  {
    id: "image-curator-cz",
    displayName: { cs: "Kurátor ilustrací (CS)", en: "Czech Image Curator" },
    role: "image_curator",
    locales: ["cs", "sk"],
    topics: ["longevity", "lifestyle", "seniors"],
    editorialUnitId: "medscope_cz_odborna",
    active: true,
  },
];

export function getPersonasForLocale(locale: GlobalLocaleCode): EditorialPersona[] {
  return EDITORIAL_PERSONAS.filter((p) => p.active && p.locales.includes(locale));
}

export function getPersonasByRole(
  locale: GlobalLocaleCode,
  role: EditorialRole
): EditorialPersona[] {
  return getPersonasForLocale(locale).filter((p) => p.role === role);
}

export function getJournalistForTopic(
  locale: GlobalLocaleCode,
  topic: EditorialTopic
): EditorialPersona | undefined {
  const journalists = getPersonasByRole(locale, "journalist").filter((p) =>
    p.topics.includes(topic)
  );
  if (journalists.length === 0) return getPersonasByRole(locale, "journalist")[0];
  return journalists[Math.floor(Math.random() * journalists.length)];
}

export function getReviewPipeline(
  locale: GlobalLocaleCode,
  topic?: EditorialTopic
): EditorialPersona[] {
  const editors = getPersonasByRole(locale, "editor");
  const topicEditors = topic ? editors.filter((persona) => persona.topics.includes(topic)) : editors;
  const seen = new Set<string>();
  const pipeline: EditorialPersona[] = [];
  for (const persona of [
    ...topicEditors,
    ...editors,
    ...getPersonasByRole(locale, "language_reviewer"),
    ...getPersonasByRole(locale, "compliance_reviewer"),
  ]) {
    if (seen.has(persona.id)) continue;
    seen.add(persona.id);
    pipeline.push(persona);
  }
  return pipeline;
}

export function getImageCuratorForLocale(
  locale: GlobalLocaleCode
): EditorialPersona | undefined {
  const curators = getPersonasByRole(locale, "image_curator");
  return curators[0] ?? getPersonasByRole("en", "image_curator")[0];
}
