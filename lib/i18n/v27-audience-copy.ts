import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import type { V27Audience } from "@/lib/v27/config";
import { V27_AUDIENCES } from "@/lib/v27/config";

type HubOverlay = {
  label: string;
  shortLabel: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  enter: string;
  topics: string[];
};

const PUBLIC: Record<ChromePack, HubOverlay> = {
  cs: {
    label: "Pro veřejnost",
    shortLabel: "Veřejnost",
    description: "Krátké články, prevence, výživa, spánek, fitness a životní styl.",
    ctaPrimary: "Najdi svůj problém",
    ctaSecondary: "Zeptej se AI",
    enter: "Vstoupit",
    topics: ["prevence", "výživa", "spánek", "fitness"],
  },
  de: {
    label: "Für die Öffentlichkeit",
    shortLabel: "Öffentlichkeit",
    description: "Kurze Texte zu Prävention, Ernährung, Schlaf, Fitness und Lebensstil.",
    ctaPrimary: "Thema finden",
    ctaSecondary: "KI fragen",
    enter: "Öffnen",
    topics: ["Prävention", "Ernährung", "Schlaf", "Fitness"],
  },
  fr: {
    label: "Grand public",
    shortLabel: "Public",
    description: "Textes courts sur la prévention, l’alimentation, le sommeil et le mode de vie.",
    ctaPrimary: "Trouver un thème",
    ctaSecondary: "Demander à l’IA",
    enter: "Entrer",
    topics: ["prévention", "alimentation", "sommeil", "fitness"],
  },
  it: {
    label: "Per il pubblico",
    shortLabel: "Pubblico",
    description: "Testi brevi su prevenzione, alimentazione, sonno e stile di vita.",
    ctaPrimary: "Trova un tema",
    ctaSecondary: "Chiedi all’IA",
    enter: "Entra",
    topics: ["prevenzione", "alimentazione", "sonno", "fitness"],
  },
  es: {
    label: "Para el público",
    shortLabel: "Público",
    description: "Textos cortos de prevención, alimentación, sueño y estilo de vida.",
    ctaPrimary: "Encontrar un tema",
    ctaSecondary: "Preguntar a la IA",
    enter: "Entrar",
    topics: ["prevención", "alimentación", "sueño", "fitness"],
  },
  "pt-BR": {
    label: "Para o público",
    shortLabel: "Público",
    description: "Textos curtos de prevenção, alimentação, sono e estilo de vida.",
    ctaPrimary: "Encontrar um tema",
    ctaSecondary: "Perguntar à IA",
    enter: "Entrar",
    topics: ["prevenção", "alimentação", "sono", "fitness"],
  },
  en: {
    label: "For everyone",
    shortLabel: "Public",
    description: "Short pieces on prevention, food, sleep, fitness and lifestyle.",
    ctaPrimary: "Find a topic",
    ctaSecondary: "Ask AI",
    enter: "Enter",
    topics: ["prevention", "nutrition", "sleep", "fitness"],
  },
};

const PHYSICIAN: Record<ChromePack, HubOverlay> = {
  cs: {
    label: "Pro lékaře",
    shortLabel: "Lékaři",
    description: "Guidelines, souhrny studií, diagnostické algoritmy, CME a Research Hub.",
    ctaPrimary: "Odborná sekce",
    ctaSecondary: "Dokumentace",
    enter: "Vstoupit",
    topics: ["guidelines", "CME", "Research Hub", "diagnostika"],
  },
  de: {
    label: "Für Ärztinnen und Ärzte",
    shortLabel: "Ärzteschaft",
    description: "Leitlinien, Studienkurzberichte, CME und Research Hub.",
    ctaPrimary: "Fachbereich",
    ctaSecondary: "Dokumentation",
    enter: "Öffnen",
    topics: ["Leitlinien", "CME", "Research Hub", "Diagnostik"],
  },
  fr: {
    label: "Pour les médecins",
    shortLabel: "Médecins",
    description: "Guidelines, synthèses d’études, FMC et Research Hub.",
    ctaPrimary: "Espace pro",
    ctaSecondary: "Documentation",
    enter: "Entrer",
    topics: ["guidelines", "FMC", "Research Hub", "diagnostic"],
  },
  it: {
    label: "Per i medici",
    shortLabel: "Medici",
    description: "Guidelines, sintesi di studi, ECM e Research Hub.",
    ctaPrimary: "Area professionale",
    ctaSecondary: "Documentazione",
    enter: "Entra",
    topics: ["linee guida", "ECM", "Research Hub", "diagnostica"],
  },
  es: {
    label: "Para médicos",
    shortLabel: "Médicos",
    description: "Guidelines, síntesis de estudios, FMC y Research Hub.",
    ctaPrimary: "Área profesional",
    ctaSecondary: "Documentación",
    enter: "Entrar",
    topics: ["guías", "FMC", "Research Hub", "diagnóstico"],
  },
  "pt-BR": {
    label: "Para médicos",
    shortLabel: "Médicos",
    description: "Guidelines, sínteses de estudos, educação continuada e Research Hub.",
    ctaPrimary: "Área profissional",
    ctaSecondary: "Documentação",
    enter: "Entrar",
    topics: ["guidelines", "educação continuada", "Research Hub", "diagnóstico"],
  },
  en: {
    label: "For physicians",
    shortLabel: "Physicians",
    description: "Guidelines, study briefs, CME and Research Hub.",
    ctaPrimary: "Professional desk",
    ctaSecondary: "Documentation",
    enter: "Enter",
    topics: ["guidelines", "CME", "Research Hub", "diagnostics"],
  },
};

const B2B: Record<ChromePack, HubOverlay> = {
  cs: {
    label: "Pro firmy",
    shortLabel: "B2B",
    description: "Reklama, sponzorství, pharma balíčky a univerzitní partnerství.",
    ctaPrimary: "Ceník inzerce",
    ctaSecondary: "Kontakt",
    enter: "Vstoupit",
    topics: ["pharma", "kliniky", "laboratoře", "univerzity"],
  },
  de: {
    label: "Für Unternehmen",
    shortLabel: "B2B",
    description: "Werbung, Sponsoring, Pharma-Pakete und Universitätspartnerschaften.",
    ctaPrimary: "Werbe-Preisliste",
    ctaSecondary: "Kontakt",
    enter: "Öffnen",
    topics: ["Pharma", "Kliniken", "Labore", "Universitäten"],
  },
  fr: {
    label: "Pour les entreprises",
    shortLabel: "B2B",
    description: "Publicité, sponsoring, offres pharma et partenariats universitaires.",
    ctaPrimary: "Tarifs publicitaires",
    ctaSecondary: "Contact",
    enter: "Entrer",
    topics: ["pharma", "cliniques", "laboratoires", "universités"],
  },
  it: {
    label: "Per le aziende",
    shortLabel: "B2B",
    description: "Pubblicità, sponsorizzazioni, pacchetti pharma e partnership universitarie.",
    ctaPrimary: "Listino pubblicitario",
    ctaSecondary: "Contatti",
    enter: "Entra",
    topics: ["pharma", "cliniche", "laboratori", "università"],
  },
  es: {
    label: "Para empresas",
    shortLabel: "B2B",
    description: "Publicidad, patrocinio, paquetes pharma y alianzas universitarias.",
    ctaPrimary: "Tarifas publicitarias",
    ctaSecondary: "Contacto",
    enter: "Entrar",
    topics: ["pharma", "clínicas", "laboratorios", "universidades"],
  },
  "pt-BR": {
    label: "Para empresas",
    shortLabel: "B2B",
    description: "Publicidade, patrocínio, pacotes pharma e parcerias universitárias.",
    ctaPrimary: "Tabela de anúncios",
    ctaSecondary: "Contato",
    enter: "Entrar",
    topics: ["pharma", "clínicas", "laboratórios", "universidades"],
  },
  en: {
    label: "For companies",
    shortLabel: "B2B",
    description: "Advertising, sponsorship, pharma packages and university partnerships.",
    ctaPrimary: "Advertising rates",
    ctaSecondary: "Contact",
    enter: "Enter",
    topics: ["pharma", "clinics", "labs", "universities"],
  },
};

export function getV27AudienceGridCopy(locale?: string | null): { eyebrow: string; title: string } {
  const pack = chromePack(locale);
  if (pack === "cs") return { eyebrow: "MedScope v27", title: "Tři cílové skupiny, jedna platforma" };
  if (pack === "de") return { eyebrow: "MedScope v27", title: "Drei Zielgruppen, eine Plattform" };
  if (pack === "fr") return { eyebrow: "MedScope v27", title: "Trois publics, une plateforme" };
  if (pack === "it") return { eyebrow: "MedScope v27", title: "Tre pubblici, una piattaforma" };
  if (pack === "es") return { eyebrow: "MedScope v27", title: "Tres públicos, una plataforma" };
  if (pack === "pt-BR") return { eyebrow: "MedScope v27", title: "Três públicos, uma plataforma" };
  return { eyebrow: "MedScope v27", title: "Three audiences, one platform" };
}

export function getV27AudienceHubCopy(audience: V27Audience, locale?: string | null) {
  const cfg = V27_AUDIENCES[audience];
  const pack = chromePack(locale);
  const overlay =
    audience === "b2b" ? B2B[pack] : audience === "public" ? PUBLIC[pack] : audience === "physician" ? PHYSICIAN[pack] : null;
  return {
    label: overlay?.label ?? cfg.label,
    shortLabel: overlay?.shortLabel ?? cfg.shortLabel,
    description: overlay?.description ?? cfg.description,
    primaryHref: cfg.ctaPrimary.href,
    secondaryHref: cfg.ctaSecondary.href,
    primaryLabel: overlay?.ctaPrimary ?? cfg.ctaPrimary.label,
    secondaryLabel: overlay?.ctaSecondary ?? cfg.ctaSecondary.label,
    hubHref: cfg.href,
    enter: overlay?.enter ?? (pack === "cs" ? "Vstoupit" : "Enter"),
    topics: overlay?.topics ?? [...cfg.topics],
  };
}
