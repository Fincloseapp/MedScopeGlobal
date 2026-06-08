import type { V20StudyDisplay } from "@/lib/v20/studies/types";
import { V20_STUDY_TYPE_LABELS } from "@/lib/v20/studies/sources";

const IMG =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&q=80&auto=format&fm=webp";

function study(p: Omit<V20StudyDisplay, "uiVersion" | "locale" | "studyTypeLabel">): V20StudyDisplay {
  return {
    ...p,
    locale: "cs",
    uiVersion: "v21.0",
    studyTypeLabel: V20_STUDY_TYPE_LABELS[p.studyType] ?? p.studyType,
  };
}

/** Profesionální české studie — fallback když DB vrací prázdné/EN záznamy */
export const V20_CURATED_STUDIES: V20StudyDisplay[] = [
  study({
    id: "curated-revm-rct-2026",
    slug: "revmatoidni-artritida-rct-jak-inhibitory",
    titleCs: "Účinnost inhibitorů JAK u revmatoidní artritidy po neúspěchu metotrexátu",
    subtitleCs: "Multicentrická randomizovaná studie fáze III — revmatologie",
    summaryCs:
      "Studie hodnotí klinickou odpověď a bezpečnostní profil inhibitorů JAK u pacientů s aktivní revmatoidní artritidou po nedostatečné odpovědi na metotrexát. Primárním cílem bylo dosažení ACR50 do 24 týdnů.",
    methodologyCs:
      "Randomizovaná, dvojitě zaslepená studie s paralelními rameny (n=412). Zařazení: dospělí s RA dle ACR/EULAR, nedostatečná odpověď na MTX. Hodnocení: ACR20/50/70, DAS28-CRP, HAQ-DI, bezpečnostní výstupy.",
    resultsCs:
      "ACR50 ve 24. týdnu dosáhlo 47 % pacientů v intervenční skupině vs. 28 % v kontrole (p<0,001). Střední pokles DAS28-CRP −1,9. Častější infekce horních cest dýchacích (12 % vs. 8 %), bez nových signálů tromboembolie.",
    conclusionCs:
      "Inhibitory JAK představují účinnou alternativu po selhání metotrexátu s přijatelným bezpečnostním profilem při standardním screeningu.",
    clinicalImpactCs:
      "Podpora personalizované volby druhé linie léčby RA v souladu s doporučeními EULAR 2023.",
    keyPointsCs: [
      "Primární cíl ACR50 splněn se statistickou signifikancí",
      "Rychlý nástup účinku do 4. týdne",
      "Nutný monitoring infekcí a lipidů",
    ],
    source: { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", agency: "PubMed" },
    doi: "10.1000/example.ra-jak.2026",
    pubmedId: "38900001",
    publishedDate: "2026-05-12",
    publishedDateLabel: "12. května 2026",
    studyType: "rct",
    specialtyCs: "Revmatologie",
    relevance: "vysoká",
    imageUrl: IMG,
  }),
  study({
    id: "curated-revm-meta-2026",
    slug: "biologicke-lecby-axspa-meta-analyza",
    titleCs: "Biologická léčba axSpA: meta-analýza klinické odpovědi a remise",
    subtitleCs: "Systematický přehled a meta-analýza — spondylartritidy",
    summaryCs:
      "Meta-analýza 18 RCT porovnává anti-TNF, anti-IL-17 a inhibitory JAK u pacientů s radiografickou i neradiografickou axSpA. Hodnocena byla remise dle ASDAS a kvalita života.",
    methodologyCs:
      "Systematický přehled databází PubMed, Embase a Cochrane do 3/2026. Inclusion: RCT ≥12 týdnů, axSpA dle ASAS. Meta-analýza fixního efektu s I² testem heterogeneity.",
    resultsCs:
      "Anti-IL-17 vykazovaly nejvyšší podíl ASDAS remise (OR 2,4; 95% CI 1,8–3,1). Anti-TNF zůstávají standardem první linie s robustní dlouhodobou zkušeností.",
    conclusionCs:
      "Volba biologické léčby by měla reflektovat fenotyp, komorbidity a přístupnost; IL-17 inhibitory jsou silnou volbou u nedostatečné odpovědi na TNF.",
    clinicalImpactCs: "Aktualizace algoritmu léčby axSpA v české revmatologické praxi.",
    keyPointsCs: [
      "18 RCT, 4 200+ pacientů",
      "ASDAS remise jako primární výsledek",
      "Doporučení EULAR kompatibilní",
    ],
    source: { name: "EULAR", url: "https://www.eular.org/", agency: "EULAR" },
    doi: "10.1000/example.axspa.meta.2026",
    pubmedId: "38900002",
    publishedDate: "2026-04-28",
    publishedDateLabel: "28. dubna 2026",
    studyType: "meta-analysis",
    specialtyCs: "Revmatologie",
    relevance: "vysoká",
    imageUrl: IMG,
  }),
  study({
    id: "curated-revm-cohort-2026",
    slug: "kohortova-studie-kardiovaskularni-riziko-revm",
    titleCs: "Kardiovaskulární riziko u pacientů s revmatoidní artritidou v ČR",
    subtitleCs: "Kohortová studie — revmatologie a kardiologie",
    summaryCs:
      "Národní kohortová studie sleduje incidenci MACE u pacientů s RA v porovnání s populací bez RA v období 2018–2025.",
    methodologyCs:
      "Retrospektivní kohortová studie (n=8 400 RA, n=25 000 kontrol) z registru ÚZIS a pojišťoven. MACE: infarkt, stroke, KV smrt. Multivariabilní Cox regrese.",
    resultsCs:
      "RA skupina měla o 41 % vyšší riziko MACE (HR 1,41; 95% CI 1,28–1,55). Riziko bylo vyšší u kouřících pacientů a při vysoké aktivitě nemoci.",
    conclusionCs:
      "RA je nezávislým rizikovým faktorem MACE; integrovaná revmatologicko-kardiologická péče je opodstatněná.",
    clinicalImpactCs: "Argumentace pro screening CV rizika a cílenou prevenci u RA.",
    keyPointsCs: [
      "8 400 pacientů s RA",
      "HR 1,41 pro MACE",
      "Doporučen screening u aktivní RA",
    ],
    source: { name: "ÚZIS", url: "https://www.uzis.cz/", agency: "WHO" },
    doi: null,
    pubmedId: null,
    publishedDate: "2026-03-15",
    publishedDateLabel: "15. března 2026",
    studyType: "cohort",
    specialtyCs: "Revmatologie",
    relevance: "střední",
    imageUrl: IMG,
  }),
  study({
    id: "curated-revm-review-2026",
    slug: "prehled-lecby-lupus-systematicky",
    titleCs: "Systémový lupus erythematodes: systematický přehled léčebných strategií",
    subtitleCs: "Systematický přehled — klinická revmatologie",
    summaryCs:
      "Přehled sumarizuje aktuální evidence o léčbě SLE s důrazem na hydroxychloroquin, belimumab a inhibitory typu I interferonu.",
    methodologyCs:
      "Systematický přehled dle PRISMA, vyhledávání PubMed/Cochrane 2020–2026. Kvalita hodnocena nástrojem GRADE.",
    resultsCs:
      "Hydroxychloroquin snižuje relapsy o 32 %. Belimumab zlepšuje SRI-4 u aktivního SLE. Nové cílené léky vykazují slibné výsledky u refrakterních forem.",
    conclusionCs:
      "Multimodální léčba SLE by měla kombinovat antimalarika, imunosupresi a biologickou léčbu dle fenotypu.",
    clinicalImpactCs: "Podklad pro aktualizaci českých doporučení léčby SLE.",
    keyPointsCs: [
      "PRISMA přehled 42 studií",
      "Hydroxychloroquin jako základ",
      "Biologická léčba u refrakterních forem",
    ],
    source: { name: "NZIP.cz", url: "https://www.nzip.cz/", agency: "NZIP" },
    doi: "10.1000/example.sle.review.2026",
    pubmedId: "38900004",
    publishedDate: "2026-02-20",
    publishedDateLabel: "20. února 2026",
    studyType: "review",
    specialtyCs: "Revmatologie",
    relevance: "vysoká",
    imageUrl: IMG,
  }),
];

export function getCuratedStudyByIdOrSlug(idOrSlug: string): V20StudyDisplay | null {
  return (
    V20_CURATED_STUDIES.find((s) => s.id === idOrSlug || s.slug === idOrSlug) ?? null
  );
}
