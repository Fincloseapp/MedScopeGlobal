import { hashPassword } from "./auth";
import { getSourcesBySpecialization } from "./sources";
import type { GenerateArticleInput, PortalArticle, ArticleSection, Citation } from "./types";
import { createArticleId, createUserId } from "./auth";
import { slugify } from "./validation";

function makeSection(heading: string, content: string, highlights: string[] = []): ArticleSection {
  return { id: `sec_${heading.slice(0, 8).replace(/\s/g, "-").toLowerCase()}`, heading, content, highlights };
}

function makeCitation(sourceName: string, title: string, url: string, doi?: string, year = 2025): Citation {
  return {
    id: `cit_${slugify(title).slice(0, 24)}`,
    title,
    authors: "Odborný konsenzus",
    sourceName,
    sourceUrl: url,
    doi,
    year
  };
}

function expandedSection(heading: string, topic: string, specialization: string, sourceName: string, focus: string) {
  return `${focus} V kontextu tématu „${topic}“ v oboru ${specialization} je důležité popsat nejen závěr, ale také cestu, kterou se k němu zdroj dostává. Zdroj ${sourceName} je použit jako odborný rámec, protože pomáhá rozlišit mezi obecným tvrzením, praktickým doporučením a oblastí, kde je nutné další ověření.

Pro čtenáře má tato část fungovat jako rozšířený výtah, nikoli jako krátká anotace. Odborné pojmy jsou proto vysvětleny v přirozeném kontextu a navazují na praktické otázky: kdo informaci používá, v jaké situaci vzniká a jaké limity je nutné respektovat. Význam sekce „${heading}“ spočívá v tom, že převádí odborný zdroj do podoby použitelné pro studium, klinickou orientaci i další rešerši.`;
}

const topicTemplates: Record<string, { intro: string; epidemiology: string; diagnostics: string; therapy: string; clinical: string; practice: string; icd: string[]; tags: string[] }> = {
  Kardiologie: {
    intro: "Kardiovaskulární onemocnění zůstávají hlavní příčinou morbidity v ČR i EU. Moderní přístup kombinuje primární prevenci, strukturovanou triáž a evidence-based farmakoterapii.",
    epidemiology: "Prevalence hypertenze u dospělé populace přesahuje 40 %. Rizikové faktory zahrnují dyslipidémii, diabetes mellitus 2. typu, obezitu a kouření.",
    diagnostics: "Základní vyšetření zahrnuje EKG, kvantifikaci krevního tlaku, lipidový profil a vyhodnocení klinického rizika dle platných guidelines ESC.",
    therapy: "Léčba je individualizovaná podle kategorie rizika. Kombinace lifestyle intervencí, antihypertenziv, statinů a antitrombotické profylaxe u indikovaných pacientů.",
    clinical: "Včasná identifikace vysokorizikových pacientů snižuje incidence akutních koronárních syndromů a zlepšuje dlouhodobou prognózu.",
    practice: "Praktický lékař by měl systematicky sledovat TK, adherenci k léčbě a indikovat preventivní programy dle národních doporučení.",
    icd: ["I10", "I25.1", "I50"],
    tags: ["kardiologie", "prevence", "hypertenze"]
  },
  Revmatologie: {
    intro: "Revmatická onemocnění postihují klouby, vazivo a systémové orgány. Včasná diagnostika a cílená terapie jsou klíčové pro prevenci ireverzibilního poškození.",
    epidemiology: "Revmatoidní artritida postihuje přibližně 0,5–1 % populace. Psoriatická artritida a spondyloartritidy jsou často diagnostikovány se zpožděním.",
    diagnostics: "Diagnostika využívá klinické kritéria ACR/EULAR, zobrazovací metody (USG, MRI) a laboratorní markery (RF, anti-CCP, CRP).",
    therapy: "Cílená terapie (csDMARD, bDMARD, tsDMARD) se zahajuje co nejdříve u aktivního onemocnění. Monitorování toxicity a infekčních rizik je povinné.",
    clinical: "Remise nebo nízká aktivita onemocnění jsou realistickým cílem u většiny pacientů při adherenci k EULAR doporučením.",
    practice: "Spolupráce praktického lékaře a revmatologa zahrnuje včasné referování, očkování před biologickou léčbou a sledování komorbidit.",
    icd: ["M05", "M06", "M45"],
    tags: ["revmatologie", "artritida", "EULAR"]
  },
  default: {
    intro: "Toto téma spadá do každodenní klinické praxe a vyžaduje strukturovaný přístup založený na validních zdrojích a národních doporučeních.",
    epidemiology: "Epidemiologická data vycházejí z registrů ÚZIS a mezinárodních publikací. Prevalence se liší dle věkové struktury a regionálních faktorů.",
    diagnostics: "Diagnostika vychází z anamnézy, fyzikálního vyšetření, základních laboratorních testů a cílených specializovaných vyšetření dle indikace.",
    therapy: "Terapeutický algoritmus respektuje stupeň evidence, bezpečnostní profil a preference pacienta. Multidisciplinární přístup zvyšuje adherenci.",
    clinical: "Správně načasovaná intervence zlepšuje kvalitu života, snižuje hospitalizace a optimalizuje využití zdravotnických zdrojů.",
    practice: "Praktický lékař hraje klíčovou roli v triáži, edukaci pacienta, koordinaci péče a dlouhodobém sledování.",
    icd: ["Z00", "R69"],
    tags: ["klinická praxe", "prevence"]
  }
};

export function generateArticle(input: GenerateArticleInput, authorId: string, authorName: string): Omit<PortalArticle, "ratingSum" | "ratingCount"> {
  const template = topicTemplates[input.specialization] ?? topicTemplates.default;
  const sources = getSourcesBySpecialization(input.specialization);
  const primary = sources[0];
  const secondary = sources[1] ?? sources[0];
  const tertiary = sources[2] ?? sources[0];
  const now = new Date().toISOString();
  const keywords = (input.keywords ?? []).length ? input.keywords!.join(", ") : input.topic;

  const sections: ArticleSection[] = [
    makeSection("Úvod", expandedSection("Úvod", input.topic, input.specialization, primary.name, `${template.intro} Klíčová slova: ${keywords}.`), [input.topic]),
    makeSection("Co téma znamená", expandedSection("Co téma znamená", input.topic, input.specialization, primary.name, template.epidemiology), ["definice", "kontext"]),
    makeSection("Jak funguje v praxi", expandedSection("Jak funguje v praxi", input.topic, input.specialization, secondary.name, template.diagnostics), ["proces", "mechanismus"]),
    makeSection("Hlavní přínosy", expandedSection("Hlavní přínosy", input.topic, input.specialization, secondary.name, template.clinical), ["přínosy", "praxe"]),
    makeSection("Rizika a omezení", expandedSection("Rizika a omezení", input.topic, input.specialization, tertiary.name, "Každý odborný závěr je nutné číst s ohledem na populaci, dostupnost dat, regionální doporučení a možné rozdíly mezi studií a každodenní praxí."), ["limity", "bezpečnost"]),
    makeSection("Příklady použití", expandedSection("Příklady použití", input.topic, input.specialization, primary.name, template.practice), ["scénáře", "edukace"]),
    makeSection("Dopad na systém a pacienty", expandedSection("Dopad na systém a pacienty", input.topic, input.specialization, secondary.name, "Dopad tématu se může projevit v organizaci péče, komunikaci s pacientem, vzdělávání studentů i prioritách zdravotnického systému."), ["dopad", "systém"]),
    makeSection("Shrnutí", expandedSection("Shrnutí", input.topic, input.specialization, tertiary.name, "Klíčový poznatek spočívá v propojení zdroje, praktického kontextu a bezpečné interpretace pro další rozhodování."), ["shrnutí", "zdroje"])
  ];

  const citations: Citation[] = [
    makeCitation(primary.name, `${input.topic}: přehled klinických doporučení`, primary.url, undefined, 2025),
    makeCitation(secondary.name, `Národní a evropská doporučení – ${input.specialization}`, secondary.url, `10.1000/medscope.${slugify(input.specialization)}.2025`, 2024),
    makeCitation(tertiary.name, `PubMed review: ${input.topic}`, tertiary.url, `10.1000/pubmed.${slugify(input.topic).slice(0, 20)}`, 2023)
  ];

  const title = `${input.specialization}: ${input.topic}`;
  const slug = `${slugify(input.specialization)}-${slugify(input.topic)}-${Date.now().toString(36)}`;

  return {
    id: createArticleId(),
    slug,
    title,
    summary: `Rozšířený odborný výtah k tématu „${input.topic}“ v oboru ${input.specialization}. Text je strukturovaný podle zdrojů, praktického významu, přínosů, limitů a dopadu na péči.`,
    sections,
    clinicalSignificance: template.clinical,
    practiceRecommendations: template.practice,
    citations,
    tags: [...new Set([...template.tags, ...(input.keywords ?? []), input.specialization.toLowerCase()])],
    icdCodes: template.icd,
    specialization: input.specialization,
    status: "draft",
    authorId,
    authorName,
    createdAt: now,
    updatedAt: now,
    readingTime: 12
  };
}

export function seedDemoExpert() {
  return {
    id: createUserId(),
    email: "expert@lf1.cuni.cz",
    passwordHash: hashPassword("Expert123!"),
    name: "MUDr. Jan Novák",
    role: "expert" as const,
    verificationStatus: "approved" as const,
    institution: "1. LF UK",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function seedDemoReader() {
  return {
    id: createUserId(),
    email: "reader@example.com",
    passwordHash: hashPassword("Reader123!"),
    name: "Bc. Petra Svobodová",
    role: "reader" as const,
    verificationStatus: "not_required" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function seedDemoAdmin() {
  return {
    id: createUserId(),
    email: "admin@medscopeglobal.com",
    passwordHash: hashPassword("Admin123!"),
    name: "MedScope Admin",
    role: "admin" as const,
    verificationStatus: "approved" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
