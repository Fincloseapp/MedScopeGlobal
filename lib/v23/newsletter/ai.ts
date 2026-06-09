import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import type { V23NewsletterSources } from "@/lib/v23/newsletter/sources";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import { attachSectionImages, heroNewsletterImage } from "@/lib/v23/newsletter/images";

type AiNewsletterResponse = {
  headline?: string;
  intro?: string;
  sections?: { id: string; title: string; intro: string; items: { title: string; summary: string; href?: string }[] }[];
  recommended?: { title: string; summary: string; href?: string }[];
};

function fallbackLayout(sources: V23NewsletterSources, issueDate: string): V23NewsletterLayout {
  const sections = attachSectionImages([
    { id: "studie", title: "Nejnovější studie", intro: "Klinický výzkum v češtině.", items: sources.studies },
    { id: "clanky", title: "Nejnovější články", intro: "Odborné články z redakce MedScope.", items: sources.articles },
    { id: "legislativa", title: "Legislativa", intro: "Regulace a metodiky pro praxi.", items: sources.legislation },
    { id: "digital-health", title: "Digitální zdravotnictví", intro: "eHealth, AI a telemedicína.", items: sources.digitalHealth },
    { id: "leky", title: "Léky", intro: "Novinky z EMA, FDA a SÚKL.", items: sources.drugs },
    { id: "univerzity", title: "Novinky z univerzit", intro: "Výzkum a vzdělávání.", items: sources.universities },
    {
      id: "doporucujeme",
      title: "Doporučujeme",
      intro: "Kurátorský výběr týdne.",
      items: [...sources.studies.slice(0, 1), ...sources.articles.slice(0, 1)],
    },
  ]);

  if (sources.pendingTopics.length) {
    sections.push(
      attachSectionImages([
        {
          id: "doporucujeme",
          title: "Témata od redakce",
          intro: "Ručně zadaná témata zapracovaná do přehledu.",
          items: sources.pendingTopics.map((t) => ({ title: t, summary: "Odborný komentář a souvislosti v plném vydání." })),
        },
      ])[0]!
    );
  }

  return {
    version: "v23.1",
    heroImageUrl: heroNewsletterImage(issueDate),
    heroImageAlt: "MedScopeGlobal odborný medicínský newsletter",
    headline: `MedScope Odborný přehled — ${issueDate}`,
    intro:
      "Týdenní souhrn evidence-based medicíny pro českou klinickou praxi, výzkum a studium. Obsah vychází z ověřených zdrojů PubMed, SÚKL, MZČR a partnerských portálů.",
    sections,
    recommended: sources.studies.slice(0, 2),
    manualTopics: sources.pendingTopics,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateNewsletterLayoutWithAi(
  sources: V23NewsletterSources,
  issueDate: string
): Promise<V23NewsletterLayout> {
  if (!isLlmConfigured()) return fallbackLayout(sources, issueDate);

  const system = `Jsi editor českého odborného medicínského newsletteru MedScopeGlobal.
Vrať JSON: headline, intro (2-3 věty), sections[{id, title, intro, items[{title, summary, href}]}], recommended[{title, summary, href}].
Sekce id musí být: studie, clanky, legislativa, digital-health, leky, univerzity, doporucujeme.
Profesionální styl magazínu, čeština, bez anglicismů. Zachovej href z vstupních dat.`;

  const user = JSON.stringify({ issueDate, manualTopics: sources.pendingTopics, sources }).slice(0, 12000);

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 2000 });
    if (!raw) return fallbackLayout(sources, issueDate);
    const ai = JSON.parse(raw) as AiNewsletterResponse;

    const merged = (ai.sections ?? []).map((s) => {
      const sourceMap: Record<string, V23NewsletterSources[keyof V23NewsletterSources]> = {
        studie: sources.studies,
        clanky: sources.articles,
        legislativa: sources.legislation,
        "digital-health": sources.digitalHealth,
        leky: sources.drugs,
        univerzity: sources.universities,
      };
      const fallbackItems = Array.isArray(sourceMap[s.id]) ? (sourceMap[s.id] as { title: string; summary: string; href?: string }[]) : [];
      return {
        id: s.id,
        title: s.title,
        intro: s.intro,
        items: (s.items?.length ? s.items : fallbackItems).slice(0, 4),
      };
    });

    if (!merged.length) return fallbackLayout(sources, issueDate);

    return {
      version: "v23.1",
      heroImageUrl: heroNewsletterImage(issueDate),
      heroImageAlt: "MedScopeGlobal odborný medicínský newsletter",
      headline: ai.headline ?? `MedScope Odborný přehled — ${issueDate}`,
      intro: ai.intro ?? fallbackLayout(sources, issueDate).intro,
      sections: attachSectionImages(merged),
      recommended: ai.recommended?.length ? ai.recommended : sources.studies.slice(0, 2),
      manualTopics: sources.pendingTopics,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return fallbackLayout(sources, issueDate);
  }
}
