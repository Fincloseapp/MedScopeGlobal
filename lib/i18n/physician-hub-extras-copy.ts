/**
 * /lekari credibility + tier extras. Hub titles already overlay via hub-copy;
 * these blocks were still hardcoded Czech (ČLK, Kč, Pro lékaře).
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { localMedicalBoard } from "@/lib/i18n/local-regulator";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export type PhysicianHubExtraCard = {
  id: string;
  title: string;
  description: string;
  badge: string;
};

export type PhysicianHubExtrasCopy = {
  credibilityTitle: string;
  credibilityLead: string;
  cards: PhysicianHubExtraCard[];
  clkNote: string;
  clkLinkLabel: string;
  clkHref: string;
  cmeLinkLabel: string;
  cmeHref: string;
  rigorHeadline: string;
  rigorDescription: string;
  studiesLabel: string;
  studiesHref: string;
  identifiers: string[];
  tierTagline: string;
  tierName: string;
  monthlyLine: string;
  annualLine: string;
  valueProps: string[];
  comparisonNote: string;
  ctaLabel: string;
  ctaHref: string;
  trialLine: string;
  trialHref: string;
};

type Pack = {
  credibilityTitle: string;
  credibilityLead: string;
  cards: PhysicianHubExtraCard[];
  clkNote: string;
  clkLinkLabel: string;
  cmeLinkLabel: string;
  rigorHeadline: string;
  rigorDescription: string;
  studiesLabel: string;
  tierTagline: string;
  tierName: string;
  valueProps: string[];
  comparisonNote: (monthly: string, annual: string) => string;
  ctaLabel: (monthly: string) => string;
  trialLine: string;
};

const PACK: Record<ChromePack, Pack> = {
  cs: {
    credibilityTitle: "Důvěryhodnost pro klinickou praxi",
    credibilityLead:
      "MedScopeGlobal staví odborný obsah na ověřitelných zdrojích a transparentních standardech — ne na generických shrnutích.",
    cards: [
      {
        id: "cme",
        title: "CME přehledy",
        description:
          "Kurátorované souhrny akreditovaných vzdělávacích aktivit. Příprava na akreditaci ČLK v procesu.",
        badge: "CME",
      },
      {
        id: "dokumentace",
        title: "OrdiZapis od MedScopeGlobal",
        description:
          "AI zapisovatel: nahrávání v mobilu — diktát nebo konzultace → český přepis → strukturovaný zápis.",
        badge: "AI scribe",
      },
      {
        id: "clk",
        title: "Partnerství s ČLK",
        description:
          "Odborná sekce vyžaduje ověření evidenčního čísla v registru České lékařské komory.",
        badge: "ČLK",
      },
      {
        id: "peer-review",
        title: "Peer review standard",
        description:
          "Studie a guidelines procházejí redakční kontrolou s odkazem na primární zdroj (DOI, PMID).",
        badge: "Peer review",
      },
    ],
    clkNote: "Partnerství s ČLK: ověření evidenčního čísla pro přístup do",
    clkLinkLabel: "odborné sekce",
    cmeLinkLabel: "Akreditované CME testy jsou k dispozici v Lékařské zóně Academy",
    rigorHeadline: "Evidence-based standard",
    rigorDescription:
      "Každý souhrn studie obsahuje typ práce (RCT, meta-analýza), metodiku, primární endpointy a ověřitelné identifikátory DOI nebo PubMed ID (PMID).",
    studiesLabel: "Prohlédnout kurátorované studie",
    tierTagline: "Profesionální tier pro klinickou praxi",
    tierName: "Lékař v praxi",
    valueProps: [
      "Odborná sekce, guidelines a diagnostické algoritmy",
      "Kurátorované souhrny studií s DOI a PMID",
      "Klinický AI asistent a Research Hub",
      "OrdiZapis — nahrávání v mobilu → zápis",
      "CME přehledy a prioritní notifikace novinek",
    ],
    comparisonNote: (monthly, annual) =>
      `${monthly}/měsíc — srovnáno s ročním přístupem k specializovaným databázím. Roční plán ${annual} ušetří 2 měsíce.`,
    ctaLabel: (monthly) => `Profesionální předplatné ${monthly}/měs.`,
    trialLine: "14 dní zdarma — bez reklam v lékařské zóně.",
  },
  en: {
    credibilityTitle: "Trust for clinical practice",
    credibilityLead:
      "MedScopeGlobal builds professional copy on cited sources and transparent standards — not generic summaries.",
    cards: [
      {
        id: "cme",
        title: "CME briefs",
        description: "Curated summaries of accredited education. Local-board accreditation is a process, not a claim we invent.",
        badge: "CME",
      },
      {
        id: "dokumentace",
        title: "OrdiZapis from MedScopeGlobal",
        description: "AI scribe: record a dictation or consult on the phone → structured clinical note.",
        badge: "AI scribe",
      },
      {
        id: "clk",
        title: "Professional access",
        description: "The professional desk is for licensed clinicians. It does not replace a medical board.",
        badge: "Access",
      },
      {
        id: "peer-review",
        title: "Peer-review standard",
        description: "Studies and guidelines go through editorial review with a primary-source link (DOI, PMID).",
        badge: "Peer review",
      },
    ],
    clkNote: "Licensed-clinician access to the",
    clkLinkLabel: "professional desk",
    cmeLinkLabel: "Accredited CME tests sit in the physician Academy zone",
    rigorHeadline: "Evidence-based standard",
    rigorDescription:
      "Each study brief names the design (RCT, meta-analysis), methods, primary endpoints and a DOI or PubMed ID.",
    studiesLabel: "Browse curated studies",
    tierTagline: "Professional tier for clinic work",
    tierName: "Physician in practice",
    valueProps: [
      "Professional desk, guidelines and diagnostic pathways",
      "Curated study briefs with DOI and PMID",
      "Clinical AI assistant and Research Hub",
      "OrdiZapis — record on mobile → note",
      "CME briefs and priority alerts",
    ],
    comparisonNote: (monthly, annual) =>
      `${monthly}/month versus a yearly specialist-database fee. The annual plan ${annual} saves two months.`,
    ctaLabel: (monthly) => `Physician plan ${monthly}/month`,
    trialLine: "14 days free — no ads in the physician zone.",
  },
  de: {
    credibilityTitle: "Vertrauen für die Praxis",
    credibilityLead:
      "MedScopeGlobal stützt Fachinhalte auf zitierte Quellen und transparente Standards — nicht auf generische Kurztexte.",
    cards: [
      {
        id: "cme",
        title: "CME-Überblicke",
        description: "Kuratierte Kurzberichte zur Fortbildung. Eine Ärztekammer-Akkreditierung behaupten wir nicht.",
        badge: "CME",
      },
      {
        id: "dokumentace",
        title: "OrdiZapis von MedScopeGlobal",
        description: "KI-Schreiber: Diktat oder Gespräch am Handy aufnehmen → strukturierte Notiz.",
        badge: "AI scribe",
      },
      {
        id: "clk",
        title: "Beruflicher Zugang",
        description: "Der Fachbereich ist für approbierte Ärztinnen und Ärzte. Er ersetzt keine Ärztekammer.",
        badge: "Zugang",
      },
      {
        id: "peer-review",
        title: "Peer-Review-Standard",
        description: "Studien und Leitlinien durchlaufen eine redaktionelle Prüfung mit Primärquelle (DOI, PMID).",
        badge: "Peer review",
      },
    ],
    clkNote: "Zugang für approbierte Ärztinnen und Ärzte zum",
    clkLinkLabel: "Fachbereich",
    cmeLinkLabel: "Akkreditierte CME-Tests liegen in der Arzt-Academy",
    rigorHeadline: "Evidence-based Standard",
    rigorDescription:
      "Jeder Studienkurzbericht nennt Design (RCT, Metaanalyse), Methodik, primäre Endpunkte und DOI oder PubMed-ID.",
    studiesLabel: "Kuratierte Studien ansehen",
    tierTagline: "Professionelle Stufe für die Praxis",
    tierName: "Arzt in der Praxis",
    valueProps: [
      "Fachbereich, Leitlinien und Diagnosewege",
      "Kuratierte Studienkurzberichte mit DOI und PMID",
      "Klinische KI und Research Hub",
      "OrdiZapis — am Handy aufnehmen → Notiz",
      "CME-Überblicke und Prioritätsalarme",
    ],
    comparisonNote: (monthly, annual) =>
      `${monthly}/Monat gegenüber einer Jahresgebühr für Fachdatenbanken. Der Jahresplan ${annual} spart zwei Monate.`,
    ctaLabel: (monthly) => `Arzt-Abo ${monthly}/Monat`,
    trialLine: "14 Tage kostenlos — keine Werbung in der Arztzone.",
  },
  fr: {
    credibilityTitle: "Confiance pour la pratique",
    credibilityLead:
      "MedScopeGlobal appuie le contenu professionnel sur des sources citées — pas sur des résumés génériques.",
    cards: [
      {
        id: "cme",
        title: "Briefs FMC",
        description: "Synthèses d’éducation continue. Nous n’inventons pas une accréditation d’ordre.",
        badge: "FMC",
      },
      {
        id: "dokumentace",
        title: "OrdiZapis par MedScopeGlobal",
        description: "Scribe IA : dictez ou enregistrez une consult sur mobile → note structurée.",
        badge: "AI scribe",
      },
      {
        id: "clk",
        title: "Accès professionnel",
        description: "L’espace pro s’adresse aux médecins diplômés. Il ne remplace pas l’ordre des médecins.",
        badge: "Accès",
      },
      {
        id: "peer-review",
        title: "Standard peer review",
        description: "Études et guidelines passent une relecture éditoriale avec source primaire (DOI, PMID).",
        badge: "Peer review",
      },
    ],
    clkNote: "Accès pour médecins diplômés à l’",
    clkLinkLabel: "espace professionnel",
    cmeLinkLabel: "Les tests FMC agréés sont dans la zone Academy médecins",
    rigorHeadline: "Standard evidence-based",
    rigorDescription:
      "Chaque brief d’étude nomme le design (ECR, méta-analyse), la méthode, les critères principaux et un DOI ou PMID.",
    studiesLabel: "Voir les études curatées",
    tierTagline: "Offre professionnelle pour le cabinet",
    tierName: "Médecin en exercice",
    valueProps: [
      "Espace pro, guidelines et chemins diagnostiques",
      "Briefs d’études avec DOI et PMID",
      "IA clinique et Research Hub",
      "OrdiZapis — enregistrer sur mobile → note",
      "Briefs FMC et alertes prioritaires",
    ],
    comparisonNote: (monthly, annual) =>
      `${monthly}/mois face à un abonnement annuel à une base spécialisée. L’offre annuelle ${annual} économise deux mois.`,
    ctaLabel: (monthly) => `Formule médecin ${monthly}/mois`,
    trialLine: "14 jours gratuits — pas de publicité dans l’espace médecins.",
  },
  it: {
    credibilityTitle: "Fiducia per la pratica",
    credibilityLead:
      "MedScopeGlobal basa i testi professionali su fonti citate e standard trasparenti — non su riassunti generici.",
    cards: [
      {
        id: "cme",
        title: "Brief ECM",
        description: "Sintesi di formazione continua. Non inventiamo un’accreditamento dell’ordine.",
        badge: "ECM",
      },
      {
        id: "dokumentace",
        title: "OrdiZapis di MedScopeGlobal",
        description: "Scribe IA: registra un dettato o una visita sul telefono → nota strutturata.",
        badge: "AI scribe",
      },
      {
        id: "clk",
        title: "Accesso professionale",
        description: "L’area professionale è per i medici abilitati. Non sostituisce l’ordine dei medici.",
        badge: "Accesso",
      },
      {
        id: "peer-review",
        title: "Standard peer review",
        description: "Studi e linee guida passano una revisione editoriale con fonte primaria (DOI, PMID).",
        badge: "Peer review",
      },
    ],
    clkNote: "Accesso per medici abilitati all’",
    clkLinkLabel: "area professionale",
    cmeLinkLabel: "I test ECM accreditati sono nella zona Academy medici",
    rigorHeadline: "Standard evidence-based",
    rigorDescription:
      "Ogni brief di studio indica il disegno (RCT, meta-analisi), i metodi, gli endpoint e un DOI o PMID.",
    studiesLabel: "Sfoglia gli studi curati",
    tierTagline: "Piano professionale per lo studio",
    tierName: "Medico in pratica",
    valueProps: [
      "Area professionale, linee guida e percorsi diagnostici",
      "Brief di studi con DOI e PMID",
      "IA clinica e Research Hub",
      "OrdiZapis — registra sul telefono → nota",
      "Brief ECM e avvisi prioritari",
    ],
    comparisonNote: (monthly, annual) =>
      `${monthly}/mese rispetto a un abbonamento annuale a una banca dati. Il piano annuale ${annual} risparmia due mesi.`,
    ctaLabel: (monthly) => `Abbonamento medico ${monthly}/mese`,
    trialLine: "14 giorni gratis — nessuna pubblicità nella zona medici.",
  },
  es: {
    credibilityTitle: "Confianza para la consulta",
    credibilityLead:
      "MedScopeGlobal apoya el contenido profesional en fuentes citadas — no en resúmenes genéricos.",
    cards: [
      {
        id: "cme",
        title: "Briefs de FMC",
        description: "Síntesis de formación continua. No inventamos una acreditación del colegio.",
        badge: "FMC",
      },
      {
        id: "dokumentace",
        title: "OrdiZapis de MedScopeGlobal",
        description: "Escriba IA: grabe un dictado o una consulta en el móvil → nota estructurada.",
        badge: "AI scribe",
      },
      {
        id: "clk",
        title: "Acceso profesional",
        description: "El área profesional es para médicos colegiados. No sustituye al colegio médico.",
        badge: "Acceso",
      },
      {
        id: "peer-review",
        title: "Estándar peer review",
        description: "Estudios y guías pasan revisión editorial con fuente primaria (DOI, PMID).",
        badge: "Peer review",
      },
    ],
    clkNote: "Acceso para médicos colegiados al",
    clkLinkLabel: "área profesional",
    cmeLinkLabel: "Las pruebas FMC acreditadas están en la zona Academy médica",
    rigorHeadline: "Estándar basado en evidencia",
    rigorDescription:
      "Cada brief de estudio nombra el diseño (ECA, metaanálisis), el método, los criterios y un DOI o PMID.",
    studiesLabel: "Ver estudios curados",
    tierTagline: "Nivel profesional para la consulta",
    tierName: "Médico en ejercicio",
    valueProps: [
      "Área profesional, guías y vías diagnósticas",
      "Briefs de estudios con DOI y PMID",
      "IA clínica y Research Hub",
      "OrdiZapis — grabar en el móvil → nota",
      "Briefs FMC y avisos prioritarios",
    ],
    comparisonNote: (monthly, annual) =>
      `${monthly}/mes frente a una cuota anual de base especializada. El plan anual ${annual} ahorra dos meses.`,
    ctaLabel: (monthly) => `Plan médico ${monthly}/mes`,
    trialLine: "14 días gratis — sin anuncios en la zona médica.",
  },
  "pt-BR": {
    credibilityTitle: "Confiança para a prática",
    credibilityLead:
      "A MedScopeGlobal apoia o conteúdo profissional em fontes citadas — não em resumos genéricos.",
    cards: [
      {
        id: "cme",
        title: "Briefs de educação continuada",
        description: "Sínteses de educação continuada. Não inventamos credenciamento de conselho.",
        badge: "CME",
      },
      {
        id: "dokumentace",
        title: "OrdiZapis da MedScopeGlobal",
        description: "Scribe de IA: grave um ditado ou consulta no celular → nota estruturada.",
        badge: "AI scribe",
      },
      {
        id: "clk",
        title: "Acesso profissional",
        description: "A área profissional é para médicos habilitados. Não substitui o conselho médico.",
        badge: "Acesso",
      },
      {
        id: "peer-review",
        title: "Padrão peer review",
        description: "Estudos e guidelines passam revisão editorial com fonte primária (DOI, PMID).",
        badge: "Peer review",
      },
    ],
    clkNote: "Acesso para médicos habilitados à",
    clkLinkLabel: "área profissional",
    cmeLinkLabel: "Testes de educação continuada ficam na zona Academy médica",
    rigorHeadline: "Padrão baseado em evidência",
    rigorDescription:
      "Cada brief de estudo nomeia o desenho (ECR, metanálise), o método, os desfechos e um DOI ou PMID.",
    studiesLabel: "Ver estudos curados",
    tierTagline: "Plano profissional para o consultório",
    tierName: "Médico em exercício",
    valueProps: [
      "Área profissional, guidelines e caminhos diagnósticos",
      "Briefs de estudos com DOI e PMID",
      "IA clínica e Research Hub",
      "OrdiZapis — gravar no celular → nota",
      "Briefs e alertas prioritários",
    ],
    comparisonNote: (monthly, annual) =>
      `${monthly}/mês frente a uma assinatura anual de base especializada. O plano anual ${annual} economiza dois meses.`,
    ctaLabel: (monthly) => `Plano médico ${monthly}/mês`,
    trialLine: "14 dias grátis — sem anúncios na zona médica.",
  },
};

export function getPhysicianHubExtrasCopy(locale?: string | null): PhysicianHubExtrasCopy {
  const pack = chromePack(locale);
  const raw = PACK[pack];
  const monthly = formatCzkListPrice(490, locale);
  const annual = formatCzkListPrice(4900, locale);
  const board = localMedicalBoard(locale);
  const cards =
    pack === "cs"
      ? raw.cards
      : raw.cards.map((card) => ({
          ...card,
          title: card.title.replace(/ČLK/g, board),
          description: card.description.replace(/ČLK/g, board),
          badge: card.badge.replace(/ČLK/g, board),
        }));
  return {
    credibilityTitle: raw.credibilityTitle,
    credibilityLead: raw.credibilityLead,
    cards,
    clkNote: pack === "cs" ? raw.clkNote : raw.clkNote.replace(/ČLK/g, board),
    clkLinkLabel: raw.clkLinkLabel,
    clkHref: localizePublicHref("/odborna", locale ?? "cs"),
    cmeLinkLabel: raw.cmeLinkLabel,
    cmeHref: localizePublicHref("/academy/lekari", locale ?? "cs"),
    rigorHeadline: raw.rigorHeadline,
    rigorDescription: raw.rigorDescription,
    studiesLabel: raw.studiesLabel,
    studiesHref: localizePublicHref("/studie", locale ?? "cs"),
    identifiers: ["DOI", "PMID", "CONSORT / PRISMA"],
    tierTagline: raw.tierTagline,
    tierName: raw.tierName,
    monthlyLine: `${monthly}`,
    annualLine: `${annual}`,
    valueProps: raw.valueProps,
    comparisonNote: raw.comparisonNote(monthly, annual),
    ctaLabel: raw.ctaLabel(monthly),
    ctaHref: localizePublicHref("/predplatne?trial=1", locale ?? "cs"),
    trialLine: raw.trialLine,
    trialHref: localizePublicHref("/predplatne?trial=1", locale ?? "cs"),
  };
}
