/** Autonomous editor/journalist personas with pipeline roles */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import type { EditorialTopic } from "./desks";

export type EditorialRole =
  | "journalist"
  | "editor"
  | "language_reviewer"
  | "compliance_reviewer";

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
    locales: ["en", "en-US"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_global_editorial_board",
    active: true,
  },
  {
    id: "editor-longevity",
    displayName: { cs: "Odborný editor dlouhověkosti", en: "Longevity Section Editor" },
    role: "editor",
    locales: ["cs", "en", "en-US", "de"],
    topics: ["longevity"],
    editorialUnitId: "medscope_evidence_synthesis",
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
    locales: ["en", "en-US"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_clinical_insights",
    active: true,
  },
  {
    id: "compliance-legal-global",
    displayName: { cs: "Právní/compliance reviewer", en: "Legal & Compliance Reviewer" },
    role: "compliance_reviewer",
    locales: ["cs", "sk", "en", "en-US", "de", "pl"],
    topics: ["longevity", "lifestyle", "seniors", "trending"],
    editorialUnitId: "medscope_scientific_office",
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

export function getReviewPipeline(locale: GlobalLocaleCode): EditorialPersona[] {
  return [
    ...getPersonasByRole(locale, "editor").slice(0, 1),
    ...getPersonasByRole(locale, "language_reviewer").slice(0, 1),
    ...getPersonasByRole(locale, "compliance_reviewer").slice(0, 1),
  ];
}
