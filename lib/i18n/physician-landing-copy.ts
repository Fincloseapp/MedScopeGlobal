/**
 * /pro-lekare body copy. Hero overlay lives in v27-audience-copy —
 * this pack covers the practice grid so /it /fr /de never keep Czech chrome.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { getV27AudienceHubCopy } from "@/lib/i18n/v27-audience-copy";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { localMedicalBoard, localRegulatorShort } from "@/lib/i18n/local-regulator";

export type PhysicianLandingSection = {
  href: string;
  label: string;
  desc: string;
};

export type PhysicianLandingCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  sectionsTitle: string;
  sections: PhysicianLandingSection[];
  verifyTitle: string;
  verifyBody: string;
  verifyAdminHref?: string;
  verifyAdminLabel?: string;
};

type PackCopy = {
  eyebrow: string;
  sectionsTitle: string;
  sections: PhysicianLandingSection[];
  verifyTitle: string;
  verifyBody: string;
  verifyAdminHref?: string;
  verifyAdminLabel?: string;
  subscriptionLabel: string;
  subscriptionDesc: (price: string) => string;
};

const PACK: Record<ChromePack, PackCopy> = {
  cs: {
    eyebrow: "Odborný obsah",
    sectionsTitle: "Sekce pro praxi",
    sections: [
      { href: "/odborna", label: "Odborná sekce (ČLK)", desc: "Ověřený obsah pro registrované lékaře" },
      { href: "/studie", label: "Studie a evidence", desc: "RCT, meta-analýzy s českým shrnutím" },
      { href: "/odborne/briefy", label: "Odborné briefy", desc: "Strukturované medicínské briefy" },
      { href: "/leky", label: "Léky a SÚKL", desc: "Schválené přípravky, EMA, interakce" },
      { href: "/legislativa", label: "Legislativa", desc: "Zdravotnická legislativa v ČR a EU" },
      { href: "/ai-medical/doctor", label: "Klinický AI", desc: "AI asistent pro lékaře v praxi" },
      { href: "/studie/ai", label: "Research Hub", desc: "AI analýza studií a PubMed" },
    ],
    verifyTitle: "Ověření ČLK",
    verifyBody:
      "Přístup k odborné sekci vyžaduje ověření registrace u České lékařské komory. Ověření spravuje administrátor v",
    verifyAdminHref: "/admin/clk-verifications",
    verifyAdminLabel: "admin panelu",
    subscriptionLabel: "Předplatné lékaře",
    subscriptionDesc: (price) => `${price}/měs — plný přístup`,
  },
  de: {
    eyebrow: "Fachinhalte",
    sectionsTitle: "Bereiche für die Praxis",
    sections: [
      { href: "/odborna", label: "Fachbereich", desc: "Leitlinien und Studienkurzberichte für die Praxis" },
      { href: "/studie", label: "Studien und Evidenz", desc: "RCTs und Metaanalysen mit klinischem Kontext" },
      { href: "/odborne/briefy", label: "Fach-Briefs", desc: "Strukturierte medizinische Kurzberichte" },
      { href: "/leky", label: "Arzneimittel", desc: "Zulassung, EMA und Wechselwirkungen" },
      { href: "/legislativa", label: "Rechtlicher Rahmen", desc: "Gesundheitsrecht in der EU" },
      { href: "/ai-medical/doctor", label: "Klinische KI", desc: "Assistent für Ärztinnen und Ärzte" },
      { href: "/studie/ai", label: "Research Hub", desc: "KI-Analyse von Studien und PubMed" },
    ],
    verifyTitle: "Beruflicher Zugang",
    verifyBody:
      "Der Fachbereich ist für approbierte Ärztinnen und Ärzte gedacht. Er ersetzt keine lokale Leitlinie und keine Ärztekammer.",
    subscriptionLabel: "Arzt-Abo",
    subscriptionDesc: (price) => `${price}/Monat — voller Zugang`,
  },
  fr: {
    eyebrow: "Contenu professionnel",
    sectionsTitle: "Rubriques pour la pratique",
    sections: [
      { href: "/odborna", label: "Espace professionnel", desc: "Guidelines et synthèses pour la pratique" },
      { href: "/studie", label: "Études et preuves", desc: "ECR et méta-analyses avec contexte clinique" },
      { href: "/odborne/briefy", label: "Briefs cliniques", desc: "Notes médicales structurées" },
      { href: "/leky", label: "Médicaments", desc: "Autorisation, EMA et interactions" },
      { href: "/legislativa", label: "Cadre juridique", desc: "Droit de la santé dans l’UE" },
      { href: "/ai-medical/doctor", label: "IA clinique", desc: "Assistant pour les médecins" },
      { href: "/studie/ai", label: "Research Hub", desc: "Analyse IA des études et PubMed" },
    ],
    verifyTitle: "Accès professionnel",
    verifyBody:
      "L’espace professionnel s’adresse aux médecins diplômés. Il ne remplace ni les guidelines locales ni l’ordre des médecins.",
    subscriptionLabel: "Abonnement médecin",
    subscriptionDesc: (price) => `${price}/mois — accès complet`,
  },
  it: {
    eyebrow: "Contenuto professionale",
    sectionsTitle: "Sezioni per la pratica",
    sections: [
      { href: "/odborna", label: "Area professionale", desc: "Linee guida e sintesi per la pratica" },
      { href: "/studie", label: "Studi ed evidenze", desc: "RCT e meta-analisi con contesto clinico" },
      { href: "/odborne/briefy", label: "Brief clinici", desc: "Note mediche strutturate" },
      { href: "/leky", label: "Farmaci", desc: "Autorizzazione, EMA e interazioni" },
      { href: "/legislativa", label: "Quadro normativo", desc: "Diritto sanitario in UE" },
      { href: "/ai-medical/doctor", label: "IA clinica", desc: "Assistente per i medici" },
      { href: "/studie/ai", label: "Research Hub", desc: "Analisi IA di studi e PubMed" },
    ],
    verifyTitle: "Accesso professionale",
    verifyBody:
      "L’area professionale è pensata per i medici abilitati. Non sostituisce le linee guida locali né l’ordine dei medici.",
    subscriptionLabel: "Abbonamento medico",
    subscriptionDesc: (price) => `${price}/mese — accesso completo`,
  },
  es: {
    eyebrow: "Contenido profesional",
    sectionsTitle: "Secciones para la consulta",
    sections: [
      { href: "/odborna", label: "Área profesional", desc: "Guías y síntesis para la práctica" },
      { href: "/studie", label: "Estudios y evidencia", desc: "ECA y metaanálisis con contexto clínico" },
      { href: "/odborne/briefy", label: "Briefs clínicos", desc: "Notas médicas estructuradas" },
      { href: "/leky", label: "Medicamentos", desc: "Autorización, EMA e interacciones" },
      { href: "/legislativa", label: "Marco legal", desc: "Derecho sanitario en la UE" },
      { href: "/ai-medical/doctor", label: "IA clínica", desc: "Asistente para médicos" },
      { href: "/studie/ai", label: "Research Hub", desc: "Análisis IA de estudios y PubMed" },
    ],
    verifyTitle: "Acceso profesional",
    verifyBody:
      "El área profesional está pensada para médicos colegiados. No sustituye las guías locales ni el colegio médico.",
    subscriptionLabel: "Suscripción médica",
    subscriptionDesc: (price) => `${price}/mes — acceso completo`,
  },
  "pt-BR": {
    eyebrow: "Conteúdo profissional",
    sectionsTitle: "Seções para a prática",
    sections: [
      { href: "/odborna", label: "Área profissional", desc: "Guidelines e sínteses para a prática" },
      { href: "/studie", label: "Estudos e evidência", desc: "ECR e metanálises com contexto clínico" },
      { href: "/odborne/briefy", label: "Briefs clínicos", desc: "Notas médicas estruturadas" },
      { href: "/leky", label: "Medicamentos", desc: "Autorização, ANVISA e interações" },
      { href: "/legislativa", label: "Quadro legal", desc: "Direito sanitário" },
      { href: "/ai-medical/doctor", label: "IA clínica", desc: "Assistente para médicos" },
      { href: "/studie/ai", label: "Research Hub", desc: "Análise de IA de estudos e PubMed" },
    ],
    verifyTitle: "Acesso profissional",
    verifyBody:
      "A área profissional é para médicos habilitados. Não substitui diretrizes locais nem o conselho médico.",
    subscriptionLabel: "Assinatura médica",
    subscriptionDesc: (price) => `${price}/mês — acesso completo`,
  },
  en: {
    eyebrow: "Professional desk",
    sectionsTitle: "Practice sections",
    sections: [
      { href: "/odborna", label: "Professional desk", desc: "Guidelines and study briefs for clinic work" },
      { href: "/studie", label: "Studies and evidence", desc: "RCTs and meta-analyses with clinical context" },
      { href: "/odborne/briefy", label: "Clinical briefs", desc: "Structured medical notes" },
      { href: "/leky", label: "Medicines", desc: "Authorisation, regulator notes and interactions" },
      { href: "/legislativa", label: "Legal frame", desc: "Health-law context for this edition" },
      { href: "/ai-medical/doctor", label: "Clinical AI", desc: "Assistant for practising physicians" },
      { href: "/studie/ai", label: "Research Hub", desc: "AI study analysis and PubMed" },
    ],
    verifyTitle: "Professional access",
    verifyBody:
      "The professional desk is for licensed clinicians. It does not replace local guidelines or a medical board.",
    subscriptionLabel: "Physician plan",
    subscriptionDesc: (price) => `${price}/month — full access`,
  },
};

function withLocalInstitutions(copy: PackCopy, locale?: string | null): PackCopy {
  if (chromePack(locale) === "cs") return copy;
  const regulator = localRegulatorShort(locale);
  const board = localMedicalBoard(locale);
  return {
    ...copy,
    sections: copy.sections.map((section) => ({
      ...section,
      label: section.label.replace(/SÚKL|ČLK/g, (hit) => (hit === "ČLK" ? board : regulator)),
      desc: section.desc.replace(/SÚKL|ČLK/g, (hit) => (hit === "ČLK" ? board : regulator)),
    })),
    verifyBody: copy.verifyBody.replace(/SÚKL|ČLK/g, (hit) => (hit === "ČLK" ? board : regulator)),
  };
}

export function getPhysicianLandingCopy(locale?: string | null): PhysicianLandingCopy {
  const pack = chromePack(locale);
  const hub = getV27AudienceHubCopy("physician", locale);
  const raw = withLocalInstitutions(PACK[pack], locale);
  const price = formatCzkListPrice(490, locale);
  const sections = [
    ...raw.sections,
    { href: "/predplatne", label: raw.subscriptionLabel, desc: raw.subscriptionDesc(price) },
  ];
  return {
    metaTitle: `${hub.label} | MedScopeGlobal`,
    metaDescription: hub.description,
    eyebrow: raw.eyebrow,
    sectionsTitle: raw.sectionsTitle,
    sections,
    verifyTitle: raw.verifyTitle,
    verifyBody: raw.verifyBody,
    verifyAdminHref: raw.verifyAdminHref,
    verifyAdminLabel: raw.verifyAdminLabel,
  };
}
