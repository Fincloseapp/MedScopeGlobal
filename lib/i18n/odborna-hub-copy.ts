import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { rewriteCzechInstitutions } from "@/lib/i18n/local-regulator";

export type OdbornaHubCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  badges: string[];
  verified: string;
  audited: string;
  manageTitle: string;
  manageLead: string;
  publicLabel: string;
  home: string;
  accessLevels: string;
};

const PACK: Record<ChromePack, OdbornaHubCopy> = {
  cs: {
    metaTitle: "Odborná sekce",
    metaDescription: "Obsah pro ověřené lékaře — klinické algoritmy, farmakoterapie a směrnice.",
    eyebrow: "Odborná sekce",
    title: "Obsah pro ověřené lékaře",
    lead: "Přístup úroveň 3 — vyžaduje ověření evidenčního čísla v registru České lékařské komory (ČLK). Obsah prochází peer review s odkazy na primární zdroje (DOI, PMID).",
    badges: ["ČLK ověření", "Peer review", "CME připravováno", "DOI / PMID"],
    verified: "Ověření ČLK aktivní",
    audited: "Přístup je auditován.",
    manageTitle: "Správa ověření",
    manageLead: "Evidenční číslo můžete aktualizovat po změně registrace.",
    publicLabel: "Veřejný obsah:",
    home: "domovská stránka",
    accessLevels: "úrovně přístupu",
  },
  de: {
    metaTitle: "Fachbereich",
    metaDescription: "Inhalte für geprüfte Ärztinnen — Algorithmen, Pharmakotherapie und Leitlinien.",
    eyebrow: "Fachbereich",
    title: "Inhalte für geprüfte Ärztinnen und Ärzte",
    lead: "Zugang Stufe 3 — Prüfung über die tschechische Ärztekammer (ČLK). Der Inhalt bleibt ein tschechisches Kammerprodukt, kein Ersatz für eine lokale Leitlinie.",
    badges: ["ČLK-Prüfung", "Peer review", "CME in Vorbereitung", "DOI / PMID"],
    verified: "ČLK-Prüfung aktiv",
    audited: "Der Zugang wird protokolliert.",
    manageTitle: "Prüfung verwalten",
    manageLead: "Die Registernummer können Sie nach einer Änderung der Zulassung aktualisieren.",
    publicLabel: "Öffentliche Inhalte:",
    home: "Startseite",
    accessLevels: "Zugangsstufen",
  },
  fr: {
    metaTitle: "Espace professionnel",
    metaDescription: "Contenus pour médecins vérifiés — algorithmes, pharmacothérapie et guidelines.",
    eyebrow: "Espace professionnel",
    title: "Contenus pour médecins vérifiés",
    lead: "Accès niveau 3 — vérification via l’ordre des médecins tchèque (ČLK). Ce n’est pas un produit d’ordre local ni un substitut aux guidelines de votre pays.",
    badges: ["Vérification ČLK", "Peer review", "FMC en préparation", "DOI / PMID"],
    verified: "Vérification ČLK active",
    audited: "L’accès est journalisé.",
    manageTitle: "Gérer la vérification",
    manageLead: "Vous pouvez mettre à jour le numéro d’enregistrement après un changement d’inscription.",
    publicLabel: "Contenus publics :",
    home: "accueil",
    accessLevels: "niveaux d’accès",
  },
  en: {
    metaTitle: "Professional desk",
    metaDescription: "Content for verified physicians — algorithms, pharmacotherapy and guidelines.",
    eyebrow: "Professional desk",
    title: "Content for verified physicians",
    lead: "Level-3 access — verification through the Czech Medical Chamber (ČLK). This is a Czech-chamber product, not a substitute for your local board or guideline.",
    badges: ["ČLK verification", "Peer review", "CME in preparation", "DOI / PMID"],
    verified: "ČLK verification active",
    audited: "Access is audited.",
    manageTitle: "Manage verification",
    manageLead: "You can update the registration number after a change of registration.",
    publicLabel: "Public content:",
    home: "homepage",
    accessLevels: "access levels",
  },
  it: {
    metaTitle: "Area professionale",
    metaDescription: "Contenuti per medici verificati — algoritmi, farmacoterapia e linee guida.",
    eyebrow: "Area professionale",
    title: "Contenuti per medici verificati",
    lead: "Accesso livello 3 — verifica tramite l’ordine dei medici ceco (ČLK). Non sostituisce un ordine locale né una linea guida del vostro paese.",
    badges: ["Verifica ČLK", "Peer review", "ECM in preparazione", "DOI / PMID"],
    verified: "Verifica ČLK attiva",
    audited: "L’accesso è registrato.",
    manageTitle: "Gestire la verifica",
    manageLead: "Potete aggiornare il numero di iscrizione dopo un cambio di registrazione.",
    publicLabel: "Contenuti pubblici:",
    home: "home",
    accessLevels: "livelli di accesso",
  },
  es: {
    metaTitle: "Área profesional",
    metaDescription: "Contenidos para médicos verificados — algoritmos, farmacoterapia y guías.",
    eyebrow: "Área profesional",
    title: "Contenidos para médicos verificados",
    lead: "Acceso nivel 3 — verificación a través del colegio médico checo (ČLK). No sustituye un colegio local ni una guía de su país.",
    badges: ["Verificación ČLK", "Peer review", "FMC en preparación", "DOI / PMID"],
    verified: "Verificación ČLK activa",
    audited: "El acceso queda registrado.",
    manageTitle: "Gestionar la verificación",
    manageLead: "Puede actualizar el número de registro tras un cambio de inscripción.",
    publicLabel: "Contenido público:",
    home: "inicio",
    accessLevels: "niveles de acceso",
  },
  "pt-BR": {
    metaTitle: "Área profissional",
    metaDescription: "Conteúdos para médicos verificados — algoritmos, farmacoterapia e guidelines.",
    eyebrow: "Área profissional",
    title: "Conteúdos para médicos verificados",
    lead: "Acesso nível 3 — verificação pela ordem médica checa (ČLK). Não substitui uma ordem local nem uma guideline do seu país.",
    badges: ["Verificação ČLK", "Peer review", "FMC em preparação", "DOI / PMID"],
    verified: "Verificação ČLK ativa",
    audited: "O acesso é registado.",
    manageTitle: "Gerir a verificação",
    manageLead: "Pode atualizar o número de registo após uma alteração de inscrição.",
    publicLabel: "Conteúdo público:",
    home: "início",
    accessLevels: "níveis de acesso",
  },
};

export function getOdbornaHubCopy(locale?: string | null): OdbornaHubCopy {
  const copy = PACK[chromePack(locale)];
  return {
    ...copy,
    metaTitle: rewriteCzechInstitutions(copy.metaTitle, locale),
    metaDescription: rewriteCzechInstitutions(copy.metaDescription, locale),
    lead: rewriteCzechInstitutions(copy.lead, locale),
    badges: copy.badges.map((badge) => rewriteCzechInstitutions(badge, locale)),
    verified: rewriteCzechInstitutions(copy.verified, locale),
  };
}
