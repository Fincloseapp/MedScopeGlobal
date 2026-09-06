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
  filters: {
    specialty: string;
    region: string;
    contract: string;
    all: string;
    specialties: Record<string, string>;
    regions: Record<string, string>;
    contracts: Record<string, string>;
  };
  form: {
    title: string;
    company: string;
    specialty: string;
    region: string;
    contract: string;
    description: string;
    requirements: string;
    salary: string;
    email: string;
    applyUrl: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
};

export const JOB_FILTER_VALUES = {
  specialties: ["interní", "chirurgie", "pediatrie", "výzkum", "sestra"] as const,
  regions: ["Praha", "Brno", "Ostrava", "ČR", "SK"] as const,
  contracts: ["HPP", "DPP", "DPČ", "externí"] as const,
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
    filters: {
      specialty: "Specializace",
      region: "Region",
      contract: "Úvazek",
      all: "Vše",
      specialties: {
        interní: "interní",
        chirurgie: "chirurgie",
        pediatrie: "pediatrie",
        výzkum: "výzkum",
        sestra: "sestra",
      },
      regions: { Praha: "Praha", Brno: "Brno", Ostrava: "Ostrava", ČR: "ČR", SK: "SK" },
      contracts: { HPP: "HPP", DPP: "DPP", DPČ: "DPČ", externí: "externí" },
    },
    form: {
      title: "Název pozice",
      company: "Zaměstnavatel",
      specialty: "Specializace",
      region: "Region",
      contract: "Úvazek",
      description: "Popis",
      requirements: "Požadavky",
      salary: "Plat / benefity (nepovinné)",
      email: "Kontaktní e-mail",
      applyUrl: "URL odpovědi",
      submit: "Odeslat ke schválení",
      sending: "Odesílám…",
      success: "Nabídka byla přijata ke schválení. Po publikaci se zobrazí v Kariéře.",
      error: "Odeslání selhalo.",
    },
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
    filters: {
      specialty: "Fachgebiet",
      region: "Region",
      contract: "Anstellung",
      all: "Alle",
      specialties: {
        interní: "Innere Medizin",
        chirurgie: "Chirurgie",
        pediatrie: "Pädiatrie",
        výzkum: "Forschung",
        sestra: "Pflege",
      },
      regions: { Praha: "Prag", Brno: "Brünn", Ostrava: "Ostrava", ČR: "Tschechien", SK: "Slowakei" },
      contracts: { HPP: "Vollzeit (HPP)", DPP: "DPP (kurz)", DPČ: "DPČ (Teilzeit)", externí: "Extern" },
    },
    form: {
      title: "Stellenbezeichnung",
      company: "Arbeitgeber",
      specialty: "Fachgebiet",
      region: "Region",
      contract: "Anstellung",
      description: "Beschreibung",
      requirements: "Anforderungen",
      salary: "Gehalt / Benefits (optional)",
      email: "Kontakt-E-Mail",
      applyUrl: "Bewerbungs-URL",
      submit: "Zur Prüfung senden",
      sending: "Senden…",
      success: "Die Anzeige wurde zur Prüfung angenommen. Nach der Freigabe erscheint sie unter Karriere.",
      error: "Senden fehlgeschlagen.",
    },
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
    filters: {
      specialty: "Spécialité",
      region: "Région",
      contract: "Contrat",
      all: "Tous",
      specialties: {
        interní: "Médecine interne",
        chirurgie: "Chirurgie",
        pediatrie: "Pédiatrie",
        výzkum: "Recherche",
        sestra: "Soins infirmiers",
      },
      regions: { Praha: "Prague", Brno: "Brno", Ostrava: "Ostrava", ČR: "Tchéquie", SK: "Slovaquie" },
      contracts: { HPP: "Temps plein (HPP)", DPP: "DPP (court)", DPČ: "DPČ (temps partiel)", externí: "Externe" },
    },
    form: {
      title: "Intitulé du poste",
      company: "Employeur",
      specialty: "Spécialité",
      region: "Région",
      contract: "Contrat",
      description: "Description",
      requirements: "Exigences",
      salary: "Salaire / avantages (facultatif)",
      email: "E-mail de contact",
      applyUrl: "URL de candidature",
      submit: "Envoyer pour validation",
      sending: "Envoi…",
      success: "L’offre a été reçue pour validation. Elle apparaîtra dans Carrières après publication.",
      error: "L’envoi a échoué.",
    },
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
    filters: {
      specialty: "Specialty",
      region: "Region",
      contract: "Contract",
      all: "All",
      specialties: {
        interní: "Internal medicine",
        chirurgie: "Surgery",
        pediatrie: "Paediatrics",
        výzkum: "Research",
        sestra: "Nursing",
      },
      regions: { Praha: "Prague", Brno: "Brno", Ostrava: "Ostrava", ČR: "Czechia", SK: "Slovakia" },
      contracts: { HPP: "Full-time (HPP)", DPP: "DPP (short-term)", DPČ: "DPČ (part-time)", externí: "External" },
    },
    form: {
      title: "Job title",
      company: "Employer",
      specialty: "Specialty",
      region: "Region",
      contract: "Contract",
      description: "Description",
      requirements: "Requirements",
      salary: "Pay / benefits (optional)",
      email: "Contact email",
      applyUrl: "Application URL",
      submit: "Submit for review",
      sending: "Sending…",
      success: "The listing was received for review. It will appear in Careers after publication.",
      error: "Sending failed.",
    },
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
    filters: {
      specialty: "Specialità",
      region: "Regione",
      contract: "Contratto",
      all: "Tutti",
      specialties: {
        interní: "Medicina interna",
        chirurgie: "Chirurgia",
        pediatrie: "Pediatria",
        výzkum: "Ricerca",
        sestra: "Infermieristica",
      },
      regions: { Praha: "Praga", Brno: "Brno", Ostrava: "Ostrava", ČR: "Cechia", SK: "Slovacchia" },
      contracts: { HPP: "Tempo pieno (HPP)", DPP: "DPP (breve)", DPČ: "DPČ (part-time)", externí: "Esterno" },
    },
    form: {
      title: "Titolo della posizione",
      company: "Datore di lavoro",
      specialty: "Specialità",
      region: "Regione",
      contract: "Contratto",
      description: "Descrizione",
      requirements: "Requisiti",
      salary: "Retribuzione / benefit (facoltativo)",
      email: "E-mail di contatto",
      applyUrl: "URL di candidatura",
      submit: "Invia per approvazione",
      sending: "Invio…",
      success: "L’offerta è stata ricevuta per approvazione. Comparirà in Carriere dopo la pubblicazione.",
      error: "Invio non riuscito.",
    },
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
    filters: {
      specialty: "Especialidad",
      region: "Región",
      contract: "Contrato",
      all: "Todos",
      specialties: {
        interní: "Medicina interna",
        chirurgie: "Cirugía",
        pediatrie: "Pediatría",
        výzkum: "Investigación",
        sestra: "Enfermería",
      },
      regions: { Praha: "Praga", Brno: "Brno", Ostrava: "Ostrava", ČR: "Chequia", SK: "Eslovaquia" },
      contracts: { HPP: "Jornada completa (HPP)", DPP: "DPP (corto)", DPČ: "DPČ (parcial)", externí: "Externo" },
    },
    form: {
      title: "Puesto",
      company: "Empleador",
      specialty: "Especialidad",
      region: "Región",
      contract: "Contrato",
      description: "Descripción",
      requirements: "Requisitos",
      salary: "Salario / beneficios (opcional)",
      email: "Correo de contacto",
      applyUrl: "URL de candidatura",
      submit: "Enviar para revisión",
      sending: "Enviando…",
      success: "La oferta se recibió para revisión. Aparecerá en Carreras tras la publicación.",
      error: "El envío falló.",
    },
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
    filters: {
      specialty: "Especialidade",
      region: "Região",
      contract: "Contrato",
      all: "Todos",
      specialties: {
        interní: "Medicina interna",
        chirurgie: "Cirurgia",
        pediatrie: "Pediatria",
        výzkum: "Investigação",
        sestra: "Enfermagem",
      },
      regions: { Praha: "Praga", Brno: "Brno", Ostrava: "Ostrava", ČR: "Chéquia", SK: "Eslováquia" },
      contracts: { HPP: "Tempo integral (HPP)", DPP: "DPP (curto)", DPČ: "DPČ (parcial)", externí: "Externo" },
    },
    form: {
      title: "Título da vaga",
      company: "Empregador",
      specialty: "Especialidade",
      region: "Região",
      contract: "Contrato",
      description: "Descrição",
      requirements: "Requisitos",
      salary: "Salário / benefícios (opcional)",
      email: "E-mail de contacto",
      applyUrl: "URL de candidatura",
      submit: "Enviar para revisão",
      sending: "A enviar…",
      success: "A oferta foi recebida para revisão. Aparecerá em Carreiras após a publicação.",
      error: "O envio falhou.",
    },
  },
};

export function getKarieraHubCopy(locale?: string | null): KarieraHubCopy {
  return PACK[chromePack(locale)];
}
