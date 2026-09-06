import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { MEDICAL_DISCLAIMER } from "@/lib/ecosystem/locales";
import { VIP_PRICING } from "@/lib/ecosystem/monetization";

export type VipProtocolsCopy = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  lead: string;
  aside: string;
  trialCta: string;
  browse: string;
  listTitle: string;
  listLead: string;
  vipBadge: string;
  freeBadge: string;
  closingLead: string;
  startTrial: string;
  back: string;
  protocolLabel: string;
  saveMediflow: string;
  exportPdf: string;
  summary: string;
  science: string;
  vipLockTitle: string;
  vipLockBody: string;
  activateVip: string;
  daily: string;
  weekly: string;
  supplements: string;
  labs: string;
  labFrequency: string;
  tools: string;
  metaTitle: string;
  metaDescription: string;
};

const PACK: Record<"cs" | "en" | "de" | "fr", Omit<VipProtocolsCopy, "trialCta" | "vipLockBody"> & {
  trialCtaBefore: string;
  vipLockBefore: string;
  vipLockAfter: string;
}> = {
  cs: {
    eyebrow: "MedScopeGlobal VIP Longevity",
    titleLine1: "Longevity",
    titleLine2: "protokoly",
    lead: "Deset vědecky podložených plánů — spánek, metabolismus, imunita. Denní rytmus, suplementy a lab testy, napojené na MediFlow.",
    aside: "Odděleně od Student LF (Academy) a tarifu Veřejnost (MeDipacient).",
    trialCtaBefore: "14 dní zdarma · pak ",
    vipLockBefore: "Plný protokol včetně denního plánu, suplementů a lab testů je dostupný s VIP předplatným (",
    vipLockAfter: ").",
    browse: "Prohlédnout seznam",
    listTitle: "Všechny protokoly",
    listLead: "Otevřete detail — denní plán, suplementy, lab testy a nástroje.",
    vipBadge: "VIP",
    freeBadge: "Zdarma",
    closingLead: "Všechny protokoly, export PDF, MediFlow sync. Ne Student LF ani MeDipacient Veřejnost.",
    startTrial: "Začít 14 dní zdarma",
    back: "Všechny protokoly",
    protocolLabel: "Protokol",
    saveMediflow: "Uložit do MediFlow",
    exportPdf: "Export PDF (VIP)",
    summary: "Shrnutí",
    science: "Vědecké vysvětlení",
    vipLockTitle: "VIP obsah",
    activateVip: "Aktivovat VIP — 14 dní zdarma",
    daily: "Denní plán",
    weekly: "Týdenní plán",
    supplements: "Doporučené suplementy",
    labs: "Doporučené laboratorní testy",
    labFrequency: "Frekvence",
    tools: "Doporučené nástroje",
    metaTitle: "VIP Longevity Protokoly | MedScopeGlobal",
    metaDescription:
      "10 vědecky podložených protokolů pro dlouhověkost: spánek, metabolismus, suplementy, biohacking a více. VIP předplatné.",
  },
  en: {
    eyebrow: "MedScopeGlobal VIP Longevity",
    titleLine1: "Longevity",
    titleLine2: "protocols",
    lead: "Ten evidence-based plans — sleep, metabolism, immunity. Daily rhythm, supplements and lab tests, linked to MediFlow.",
    aside: "Separate from the student Academy track and the public MeDipacient plan.",
    trialCtaBefore: "14 days free · then ",
    vipLockBefore: "The full protocol — daily plan, supplements and labs — is included with VIP (",
    vipLockAfter: ").",
    browse: "Browse the list",
    listTitle: "All protocols",
    listLead: "Open a protocol for the daily plan, supplements, labs and tools.",
    vipBadge: "VIP",
    freeBadge: "Free",
    closingLead: "All protocols, PDF export, MediFlow sync. Not the student Academy or public MeDipacient plan.",
    startTrial: "Start 14 days free",
    back: "All protocols",
    protocolLabel: "Protocol",
    saveMediflow: "Save to MediFlow",
    exportPdf: "PDF export (VIP)",
    summary: "Summary",
    science: "Scientific background",
    vipLockTitle: "VIP content",
    activateVip: "Activate VIP — 14 days free",
    daily: "Daily plan",
    weekly: "Weekly plan",
    supplements: "Suggested supplements",
    labs: "Suggested lab tests",
    labFrequency: "Frequency",
    tools: "Suggested tools",
    metaTitle: "VIP Longevity Protocols | MedScopeGlobal",
    metaDescription:
      "Ten evidence-based longevity protocols: sleep, metabolism, supplements and more. VIP subscription.",
  },
  de: {
    eyebrow: "MedScopeGlobal VIP Longevity",
    titleLine1: "Longevity",
    titleLine2: "Protokolle",
    lead: "Zehn evidenzbasierte Pläne — Schlaf, Stoffwechsel, Immunität. Tagesrhythmus, Supplemente und Labortests, verbunden mit MediFlow.",
    aside: "Getrennt vom Studenten-Academy-Tarif und dem öffentlichen MeDipacient-Plan.",
    trialCtaBefore: "14 Tage kostenlos · dann ",
    vipLockBefore: "Das vollständige Protokoll mit Tagesplan, Supplementen und Labortests ist im VIP-Abo enthalten (",
    vipLockAfter: ").",
    browse: "Liste ansehen",
    listTitle: "Alle Protokolle",
    listLead: "Öffnen Sie ein Protokoll für Tagesplan, Supplemente, Labortests und Tools.",
    vipBadge: "VIP",
    freeBadge: "Kostenlos",
    closingLead: "Alle Protokolle, PDF-Export, MediFlow-Sync. Nicht Academy und nicht MeDipacient Öffentlichkeit.",
    startTrial: "14 Tage kostenlos starten",
    back: "Alle Protokolle",
    protocolLabel: "Protokoll",
    saveMediflow: "In MediFlow speichern",
    exportPdf: "PDF-Export (VIP)",
    summary: "Kurzfassung",
    science: "Wissenschaftlicher Hintergrund",
    vipLockTitle: "VIP-Inhalt",
    activateVip: "VIP aktivieren — 14 Tage kostenlos",
    daily: "Tagesplan",
    weekly: "Wochenplan",
    supplements: "Empfohlene Supplemente",
    labs: "Empfohlene Labortests",
    labFrequency: "Häufigkeit",
    tools: "Empfohlene Tools",
    metaTitle: "VIP-Longevity-Protokolle | MedScopeGlobal",
    metaDescription:
      "Zehn evidenzbasierte Longevity-Protokolle: Schlaf, Stoffwechsel, Supplemente und mehr. VIP-Abo.",
  },
  fr: {
    eyebrow: "MedScopeGlobal VIP Longevity",
    titleLine1: "Longevity",
    titleLine2: "protocoles",
    lead: "Dix plans fondés sur les preuves — sommeil, métabolisme, immunité. Rythme quotidien, compléments et analyses, liés à MediFlow.",
    aside: "Distinct du parcours Academy étudiants et de l’offre publique MeDipacient.",
    trialCtaBefore: "14 jours gratuits · puis ",
    vipLockBefore: "Le protocole complet — plan quotidien, compléments et analyses — est inclus dans l’abonnement VIP (",
    vipLockAfter: ").",
    browse: "Voir la liste",
    listTitle: "Tous les protocoles",
    listLead: "Ouvrez un protocole pour le plan quotidien, les compléments, les analyses et les outils.",
    vipBadge: "VIP",
    freeBadge: "Gratuit",
    closingLead: "Tous les protocoles, export PDF, sync MediFlow. Ni Academy étudiants ni MeDipacient grand public.",
    startTrial: "Commencer 14 jours gratuits",
    back: "Tous les protocoles",
    protocolLabel: "Protocole",
    saveMediflow: "Enregistrer dans MediFlow",
    exportPdf: "Export PDF (VIP)",
    summary: "Résumé",
    science: "Fondement scientifique",
    vipLockTitle: "Contenu VIP",
    activateVip: "Activer VIP — 14 jours gratuits",
    daily: "Plan quotidien",
    weekly: "Plan hebdomadaire",
    supplements: "Compléments suggérés",
    labs: "Analyses suggérées",
    labFrequency: "Fréquence",
    tools: "Outils suggérés",
    metaTitle: "Protocoles VIP Longevity | MedScopeGlobal",
    metaDescription:
      "Dix protocoles de longévité fondés sur les preuves : sommeil, métabolisme, compléments. Abonnement VIP.",
  },
};

function pack(locale?: string | null): keyof typeof PACK {
  if (locale === "cs") return "cs";
  if (locale === "de") return "de";
  if (locale === "fr") return "fr";
  return "en";
}

export function vipPricingFor(locale?: string | null) {
  if (locale && locale in VIP_PRICING) {
    return VIP_PRICING[locale as GlobalLocaleCode];
  }
  return VIP_PRICING.en;
}

export function medicalDisclaimerFor(locale?: string | null) {
  if (locale && locale in MEDICAL_DISCLAIMER) {
    return MEDICAL_DISCLAIMER[locale as GlobalLocaleCode];
  }
  return MEDICAL_DISCLAIMER.en;
}

export function getVipProtocolsCopy(locale?: string | null): VipProtocolsCopy {
  const { trialCtaBefore, vipLockBefore, vipLockAfter, ...base } = PACK[pack(locale)];
  const pricing = vipPricingFor(locale);
  return {
    ...base,
    trialCta: `${trialCtaBefore}${pricing.label}`,
    vipLockBody: `${vipLockBefore}${pricing.label}${vipLockAfter}`,
  };
}
