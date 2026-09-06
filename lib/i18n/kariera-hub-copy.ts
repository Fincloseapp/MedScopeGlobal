import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type KarieraHubCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  addCta: string;
  empty: string;
  emptyAdd: string;
  addMetaTitle: string;
  addMetaDescription: string;
  addTitle: string;
  addLead: string;
  back: string;
  fallbackTitle: string;
  requirements: string;
  apply: string;
};

const PACK: Record<ChromePack, KarieraHubCopy> = {
  cs: {
    metaTitle: "Kariéra",
    metaDescription: "Nabídky práce v medicíně s filtrováním podle specializace, regionu a úvazku.",
    eyebrow: "Kariéra",
    title: "Nábor a pracovní pozice",
    lead: "Odborné pozice pro lékaře, sestry, výzkumníky a studenty medicíny.",
    addCta: "Přidat nabídku (zaměstnavatel)",
    empty: "Zatím žádné publikované pozice.",
    emptyAdd: "Přidejte první nabídku",
    addMetaTitle: "Přidat pracovní pozici",
    addMetaDescription: "Formulář pro zaměstnavatele — publikace po schválení.",
    addTitle: "Přidat nabídku práce",
    addLead: "Nabídka bude po kontrole publikována v sekci Kariéra.",
    back: "← Kariéra",
    fallbackTitle: "Pracovní pozice",
    requirements: "Požadavky",
    apply: "Odpovědět na nabídku",
  },
  de: {
    metaTitle: "Karriere",
    metaDescription: "Stellenangebote in der Medizin, filterbar nach Fach, Region und Anstellung.",
    eyebrow: "Karriere",
    title: "Recruiting und Stellen",
    lead: "Fachstellen für Ärztinnen, Pflege, Forschung und Medizinstudierende.",
    addCta: "Anzeige aufgeben (Arbeitgeber)",
    empty: "Noch keine veröffentlichten Stellen.",
    emptyAdd: "Erste Anzeige aufgeben",
    addMetaTitle: "Stelle aufgeben",
    addMetaDescription: "Formular für Arbeitgeber — Veröffentlichung nach Prüfung.",
    addTitle: "Stellenanzeige aufgeben",
    addLead: "Nach Prüfung erscheint die Anzeige in der Karriere-Sektion.",
    back: "← Karriere",
    fallbackTitle: "Stelle",
    requirements: "Anforderungen",
    apply: "Auf die Anzeige antworten",
  },
  fr: {
    metaTitle: "Carrières",
    metaDescription: "Offres d’emploi en médecine, filtrables par spécialité, région et contrat.",
    eyebrow: "Carrières",
    title: "Recrutement et postes",
    lead: "Postes pour médecins, infirmiers, chercheurs et étudiants en médecine.",
    addCta: "Déposer une offre (employeur)",
    empty: "Aucune offre publiée pour le moment.",
    emptyAdd: "Déposer la première offre",
    addMetaTitle: "Déposer un poste",
    addMetaDescription: "Formulaire employeur — publication après validation.",
    addTitle: "Déposer une offre d’emploi",
    addLead: "L’offre sera publiée dans Carrières après contrôle.",
    back: "← Carrières",
    fallbackTitle: "Poste",
    requirements: "Exigences",
    apply: "Répondre à l’offre",
  },
  en: {
    metaTitle: "Careers",
    metaDescription: "Medical job listings, filterable by specialty, region and contract.",
    eyebrow: "Careers",
    title: "Hiring and open roles",
    lead: "Roles for physicians, nurses, researchers and medical students.",
    addCta: "Post a listing (employer)",
    empty: "No published roles yet.",
    emptyAdd: "Post the first listing",
    addMetaTitle: "Post a role",
    addMetaDescription: "Employer form — published after review.",
    addTitle: "Post a job listing",
    addLead: "The listing goes live in Careers after review.",
    back: "← Careers",
    fallbackTitle: "Role",
    requirements: "Requirements",
    apply: "Apply",
  },
  it: {
    metaTitle: "Carriere",
    metaDescription: "Offerte in medicina, filtrabili per specialità, regione e contratto.",
    eyebrow: "Carriere",
    title: "Selezione e posizioni",
    lead: "Posizioni per medici, infermieri, ricercatori e studenti di medicina.",
    addCta: "Pubblica un’offerta (datore)",
    empty: "Nessuna posizione pubblicata.",
    emptyAdd: "Pubblica la prima offerta",
    addMetaTitle: "Aggiungi posizione",
    addMetaDescription: "Modulo datore — pubblicazione dopo verifica.",
    addTitle: "Pubblica un’offerta di lavoro",
    addLead: "Dopo il controllo l’offerta compare in Carriere.",
    back: "← Carriere",
    fallbackTitle: "Posizione",
    requirements: "Requisiti",
    apply: "Rispondi all’offerta",
  },
  es: {
    metaTitle: "Carreras",
    metaDescription: "Ofertas en medicina, filtrables por especialidad, región y contrato.",
    eyebrow: "Carreras",
    title: "Selección y puestos",
    lead: "Puestos para médicos, enfermería, investigación y estudiantes de medicina.",
    addCta: "Publicar oferta (empleador)",
    empty: "Aún no hay puestos publicados.",
    emptyAdd: "Publicar la primera oferta",
    addMetaTitle: "Añadir puesto",
    addMetaDescription: "Formulario para empleadores — publicación tras revisión.",
    addTitle: "Publicar una oferta",
    addLead: "Tras la revisión la oferta aparece en Carreras.",
    back: "← Carreras",
    fallbackTitle: "Puesto",
    requirements: "Requisitos",
    apply: "Responder a la oferta",
  },
  "pt-BR": {
    metaTitle: "Carreiras",
    metaDescription: "Ofertas em medicina, filtráveis por especialidade, região e contrato.",
    eyebrow: "Carreiras",
    title: "Recrutamento e vagas",
    lead: "Vagas para médicos, enfermagem, investigação e estudantes de medicina.",
    addCta: "Publicar oferta (empregador)",
    empty: "Ainda não há vagas publicadas.",
    emptyAdd: "Publicar a primeira oferta",
    addMetaTitle: "Adicionar vaga",
    addMetaDescription: "Formulário do empregador — publicação após revisão.",
    addTitle: "Publicar uma oferta de emprego",
    addLead: "Após revisão a oferta aparece em Carreiras.",
    back: "← Carreiras",
    fallbackTitle: "Vaga",
    requirements: "Requisitos",
    apply: "Responder à oferta",
  },
};

export function getKarieraHubCopy(locale?: string | null): KarieraHubCopy {
  return PACK[chromePack(locale)];
}
