import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type KongresyHubCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  calendar: string;
  add: string;
  empty: string;
  calendarMetaTitle: string;
  calendarEyebrow: string;
  calendarTitle: string;
  calendarLead: string;
  noDate: string;
  back: string;
  addMetaTitle: string;
  addMetaDescription: string;
  addTitle: string;
  addLead: string;
  organizer: string;
  register: string;
  fallbackTitle: string;
};

const PACK: Record<ChromePack, KongresyHubCopy> = {
  cs: {
    metaTitle: "Kongresy a školení",
    metaDescription: "Kalendář odborných akcí, kongresů a školení.",
    eyebrow: "Kongresy",
    title: "Kongresy a školení",
    lead: "Přehled nadcházejících akcí z českých a evropských zdrojů — s AI extrakcí detailů při přidání.",
    calendar: "Kalendář",
    add: "Přidat akci",
    empty: "Zatím žádné publikované akce.",
    calendarMetaTitle: "Kalendář kongresů",
    calendarEyebrow: "Kalendář",
    calendarTitle: "Timeline kongresů",
    calendarLead: "Chronologický přehled publikovaných akcí.",
    noDate: "Bez data",
    back: "← Přehled kongresů",
    addMetaTitle: "Přidat kongres",
    addMetaDescription: "AI extrahuje datum, místo, cenu a registrační odkaz ze zdrojové URL.",
    addTitle: "Přidat kongres nebo školení",
    addLead:
      "Automatické vyhledávání v českých a evropských zdrojích (univerzity, společnosti, databáze) při zadání URL — AI doplní metadata.",
    organizer: "Pořadatel",
    register: "Registrace",
    fallbackTitle: "Kongres",
  },
  de: {
    metaTitle: "Kongresse und Fortbildung",
    metaDescription: "Kalender fachlicher Veranstaltungen, Kongresse und Fortbildungen.",
    eyebrow: "Kongresse",
    title: "Kongresse und Fortbildung",
    lead: "Bevorstehende Termine aus tschechischen und europäischen Quellen — mit KI-Extraktion beim Eintragen.",
    calendar: "Kalender",
    add: "Termin eintragen",
    empty: "Noch keine veröffentlichten Termine.",
    calendarMetaTitle: "Kongresskalender",
    calendarEyebrow: "Kalender",
    calendarTitle: "Kongress-Timeline",
    calendarLead: "Chronologische Übersicht veröffentlichter Termine.",
    noDate: "Ohne Datum",
    back: "← Kongressübersicht",
    addMetaTitle: "Kongress eintragen",
    addMetaDescription: "Die KI liest Datum, Ort, Preis und Anmeldelink aus der Quell-URL.",
    addTitle: "Kongress oder Fortbildung eintragen",
    addLead:
      "Bei Angabe einer URL sucht die KI in tschechischen und europäischen Quellen und ergänzt die Metadaten.",
    organizer: "Veranstalter",
    register: "Anmeldung",
    fallbackTitle: "Kongress",
  },
  fr: {
    metaTitle: "Congrès et formations",
    metaDescription: "Calendrier des événements, congrès et formations.",
    eyebrow: "Congrès",
    title: "Congrès et formations",
    lead: "Événements à venir issus de sources tchèques et européennes — extraction IA à l’ajout.",
    calendar: "Calendrier",
    add: "Ajouter un événement",
    empty: "Aucun événement publié pour le moment.",
    calendarMetaTitle: "Calendrier des congrès",
    calendarEyebrow: "Calendrier",
    calendarTitle: "Frise des congrès",
    calendarLead: "Liste chronologique des événements publiés.",
    noDate: "Sans date",
    back: "← Vue d’ensemble des congrès",
    addMetaTitle: "Ajouter un congrès",
    addMetaDescription: "L’IA extrait date, lieu, prix et lien d’inscription depuis l’URL source.",
    addTitle: "Ajouter un congrès ou une formation",
    addLead:
      "Avec une URL, l’IA interroge des sources tchèques et européennes et complète les métadonnées.",
    organizer: "Organisateur",
    register: "Inscription",
    fallbackTitle: "Congrès",
  },
  en: {
    metaTitle: "Congresses and training",
    metaDescription: "Calendar of professional events, congresses and training.",
    eyebrow: "Congresses",
    title: "Congresses and training",
    lead: "Upcoming events from Czech and European sources — with AI extraction when you add one.",
    calendar: "Calendar",
    add: "Add event",
    empty: "No published events yet.",
    calendarMetaTitle: "Congress calendar",
    calendarEyebrow: "Calendar",
    calendarTitle: "Congress timeline",
    calendarLead: "Chronological list of published events.",
    noDate: "No date",
    back: "← Congress overview",
    addMetaTitle: "Add a congress",
    addMetaDescription: "AI extracts date, place, price and registration link from the source URL.",
    addTitle: "Add a congress or training",
    addLead:
      "Give a URL and the AI looks up Czech and European sources, then fills in the metadata.",
    organizer: "Organizer",
    register: "Register",
    fallbackTitle: "Congress",
  },
  it: {
    metaTitle: "Congressi e formazione",
    metaDescription: "Calendario di eventi, congressi e corsi.",
    eyebrow: "Congressi",
    title: "Congressi e formazione",
    lead: "Eventi in arrivo da fonti ceche ed europee — estrazione IA all’inserimento.",
    calendar: "Calendario",
    add: "Aggiungi evento",
    empty: "Nessun evento pubblicato.",
    calendarMetaTitle: "Calendario congressi",
    calendarEyebrow: "Calendario",
    calendarTitle: "Timeline dei congressi",
    calendarLead: "Elenco cronologico degli eventi pubblicati.",
    noDate: "Senza data",
    back: "← Panoramica congressi",
    addMetaTitle: "Aggiungi congresso",
    addMetaDescription: "L’IA estrae data, luogo, prezzo e link di iscrizione dall’URL.",
    addTitle: "Aggiungi un congresso o un corso",
    addLead: "Con un URL l’IA consulta fonti ceche ed europee e completa i metadati.",
    organizer: "Organizzatore",
    register: "Iscrizione",
    fallbackTitle: "Congresso",
  },
  es: {
    metaTitle: "Congresos y formación",
    metaDescription: "Calendario de eventos, congresos y formación.",
    eyebrow: "Congresos",
    title: "Congresos y formación",
    lead: "Próximos actos de fuentes checas y europeas — extracción con IA al añadirlos.",
    calendar: "Calendario",
    add: "Añadir evento",
    empty: "Aún no hay eventos publicados.",
    calendarMetaTitle: "Calendario de congresos",
    calendarEyebrow: "Calendario",
    calendarTitle: "Línea temporal de congresos",
    calendarLead: "Lista cronológica de eventos publicados.",
    noDate: "Sin fecha",
    back: "← Resumen de congresos",
    addMetaTitle: "Añadir congreso",
    addMetaDescription: "La IA extrae fecha, lugar, precio y enlace de inscripción de la URL.",
    addTitle: "Añadir un congreso o formación",
    addLead: "Con una URL la IA consulta fuentes checas y europeas y completa los metadatos.",
    organizer: "Organizador",
    register: "Inscripción",
    fallbackTitle: "Congreso",
  },
  "pt-BR": {
    metaTitle: "Congressos e formação",
    metaDescription: "Calendário de eventos, congressos e formação.",
    eyebrow: "Congressos",
    title: "Congressos e formação",
    lead: "Próximos eventos de fontes checas e europeias — extração por IA ao adicionar.",
    calendar: "Calendário",
    add: "Adicionar evento",
    empty: "Ainda não há eventos publicados.",
    calendarMetaTitle: "Calendário de congressos",
    calendarEyebrow: "Calendário",
    calendarTitle: "Linha temporal de congressos",
    calendarLead: "Lista cronológica dos eventos publicados.",
    noDate: "Sem data",
    back: "← Visão geral dos congressos",
    addMetaTitle: "Adicionar congresso",
    addMetaDescription: "A IA extrai data, local, preço e ligação de inscrição do URL.",
    addTitle: "Adicionar um congresso ou formação",
    addLead: "Com um URL a IA consulta fontes checas e europeias e preenche os metadados.",
    organizer: "Organizador",
    register: "Inscrição",
    fallbackTitle: "Congresso",
  },
};

export function getKongresyHubCopy(locale?: string | null): KongresyHubCopy {
  return PACK[chromePack(locale)];
}
