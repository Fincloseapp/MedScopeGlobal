import { attachSectionImages, heroNewsletterImage } from "@/lib/v23/newsletter/images";
import { formatIssueDateCs, sanitizeNewsletterText } from "@/lib/v23/newsletter/sanitize";
import type { V23NewsletterSources } from "@/lib/v23/newsletter/sources";
import type { V23NewsletterItem, V23NewsletterLayout, V23NewsletterSection } from "@/lib/v23/newsletter/types";
import {
  V23_FALLBACK_ARTICLES,
  V23_FALLBACK_DRUGS,
  V23_FALLBACK_LEGISLATION,
  V23_FALLBACK_UNIVERSITIES,
  V23_NEWSLETTER_FALLBACKS,
} from "@/lib/v23/newsletter/fallbacks";
import { V20_CURATED_STUDIES } from "@/lib/v20/studies/curated";
import { V22_DIGITAL_HEALTH_ARTICLES } from "@/lib/v22/digital-health/curated";

function cleanItems(items: V23NewsletterItem[], min = 1): V23NewsletterItem[] {
  const cleaned = items
    .map((item) => ({
      title: sanitizeNewsletterText(item.title),
      summary: sanitizeNewsletterText(item.summary, V23_NEWSLETTER_FALLBACKS.articleSummary),
      href: item.href,
    }))
    .filter((item) => item.title.length > 2);

  return cleaned.length >= min ? cleaned : cleaned;
}

function withFallback(items: V23NewsletterItem[], fallback: V23NewsletterItem[], limit = 4): V23NewsletterItem[] {
  const merged = cleanItems(items);
  const result = merged.length ? merged : fallback;
  return result.slice(0, limit);
}

const FALLBACK_STUDIES: V23NewsletterItem[] = V20_CURATED_STUDIES.slice(0, 3).map((s) => ({
  title: s.titleCs,
  summary: s.summaryCs.slice(0, 220),
  href: `/studie/${s.slug}`,
}));

const FALLBACK_DH: V23NewsletterItem[] = V22_DIGITAL_HEALTH_ARTICLES.slice(0, 3).map((d) => ({
  title: d.title,
  summary: d.summaryCs.slice(0, 220),
  href: `/digital-health/${d.slug}`,
}));

function buildRecommended(sources: V23NewsletterSources): V23NewsletterItem[] {
  const pool = [
    ...sources.studies.slice(0, 2),
    ...sources.articles.slice(0, 2),
    ...sources.digitalHealth.slice(0, 1),
  ];
  const cleaned = cleanItems(pool, 0);
  if (cleaned.length >= 2) return cleaned.slice(0, 3);
  return withFallback(cleaned, [
    ...sources.studies.slice(0, 1),
    ...sources.articles.slice(0, 1),
  ]).slice(0, 3);
}

function topicItems(topics: string[]): V23NewsletterItem[] {
  return topics.map((t) => ({
    title: sanitizeNewsletterText(t),
    summary:
      "Téma zadané redakcí MedScopeGlobal — odborný kontext, souvislosti s praxí a doporučené zdroje v plném vydání.",
  }));
}

export type LayoutPolish = {
  headline?: string;
  intro?: string;
  sectionIntros?: Partial<Record<string, string>>;
  topicSummaries?: Record<string, string>;
};

const DEFAULT_SECTIONS: Omit<V23NewsletterSection, "imageUrl" | "imageAlt" | "items">[] = [
  {
    id: "studie",
    title: "Nejnovější studie",
    intro: "Klinický výzkum s českým shrnutím, metodologií a dopadem na praxi.",
  },
  {
    id: "clanky",
    title: "Nejnovější články",
    intro: "Odborné články z redakce MedScopeGlobal — evidence-based přístup.",
  },
  {
    id: "legislativa",
    title: "Legislativa",
    intro: "Regulace, úhrady a metodiky MZČR, SÚKL a evropské legislativy.",
  },
  {
    id: "digital-health",
    title: "Digitální zdravotnictví",
    intro: "eHealth, telemedicína, AI ve zdravotnictví a národní eHealth strategie.",
  },
  {
    id: "leky",
    title: "Léky",
    intro: "Registrace, SPC, bezpečnostní signály a farmakovigilance.",
  },
  {
    id: "univerzity",
    title: "Novinky z univerzit",
    intro: "Výzkum, vzdělávání a klinické inovace z českých lékařských fakult.",
  },
  {
    id: "doporucujeme",
    title: "Doporučujeme",
    intro: "Kurátorský výběr nejdůležitějších témat tohoto vydání.",
  },
];

export function buildNewsletterLayout(
  sources: V23NewsletterSources,
  issueDate: string,
  polish?: LayoutPolish
): V23NewsletterLayout {
  const itemsBySection: Record<string, V23NewsletterItem[]> = {
    studie: withFallback(sources.studies, FALLBACK_STUDIES),
    clanky: withFallback(sources.articles, V23_FALLBACK_ARTICLES),
    legislativa: withFallback(sources.legislation, V23_FALLBACK_LEGISLATION),
    "digital-health": withFallback(sources.digitalHealth, FALLBACK_DH),
    leky: withFallback(sources.drugs, V23_FALLBACK_DRUGS),
    univerzity: withFallback(sources.universities, V23_FALLBACK_UNIVERSITIES),
    doporucujeme: buildRecommended(sources),
  };

  if (sources.pendingTopics.length) {
    const topics = topicItems(sources.pendingTopics).map((item) => ({
      ...item,
      summary:
        polish?.topicSummaries?.[item.title] ??
        sanitizeNewsletterText(item.summary, V23_NEWSLETTER_FALLBACKS.articleSummary),
    }));
    itemsBySection.doporucujeme = [...topics, ...itemsBySection.doporucujeme].slice(0, 4);
  }

  const sections = attachSectionImages(
    DEFAULT_SECTIONS.map((sec) => ({
      ...sec,
      intro: polish?.sectionIntros?.[sec.id] ?? sec.intro,
      items: itemsBySection[sec.id] ?? [],
    }))
  );

  const dateLabel = formatIssueDateCs(issueDate);

  return {
    version: "v23.1.1",
    heroImageUrl: heroNewsletterImage(issueDate),
    heroImageAlt: "MedScopeGlobal — odborný medicínský newsletter",
    headline: polish?.headline ?? `MedScope Odborný přehled — ${dateLabel}`,
    intro:
      polish?.intro ??
      `Týdenní souhrn evidence-based medicíny pro českou klinickou praxi, výzkum a studium medicíny. Vydání ze dne ${dateLabel} vychází z ověřených zdrojů PubMed, SÚKL, MZČR a partnerských portálů.`,
    sections,
    recommended: buildRecommended(sources),
    manualTopics: sources.pendingTopics,
    sourcesSnapshot: {
      studies: sources.studies.length,
      articles: sources.articles.length,
      legislation: sources.legislation.length,
      digitalHealth: sources.digitalHealth.length,
      drugs: sources.drugs.length,
      universities: sources.universities.length,
      pendingTopics: sources.pendingTopics.length,
    },
    generatedAt: new Date().toISOString(),
  };
}
