/**
 * Courtesy page when a Czech-faculty product is opened on another edition.
 * Do not localize MeDiprep / Academy / student hubs as foreign products — send people to /cs.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type CzechFacultyProduct = "mediprep" | "academy" | "students";

export type CzechFacultyOnlyCopy = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  openCs: string;
  backHome: string;
};

export const CZECH_FACULTY_CS_HREF: Record<CzechFacultyProduct, string> = {
  mediprep: "/cs/mediprep",
  academy: "/cs/academy",
  students: "/cs/studenti",
};

const PACK: Record<ChromePack, CzechFacultyOnlyCopy> = {
  cs: {
    metaTitle: "MeDiprep — příprava na české LF | MedScopeGlobal",
    metaDescription: "Příprava na přijímačky 8 českých lékařských fakult.",
    kicker: "MeDiprep",
    title: "Příprava na české lékařské fakulty",
    lead: "MeDiprep je pro přijímačky osmi českých LF. Otevřete českou edici.",
    openCs: "Otevřít českou edici",
    backHome: "Zpět na úvod",
  },
  de: {
    metaTitle: "MeDiprep — tschechische Medizinfakultäten | MedScopeGlobal",
    metaDescription:
      "MeDiprep bereitet auf die Aufnahme an 8 tschechischen medizinischen Fakultäten vor. Kein Angebot dieser Ausgabe.",
    kicker: "MeDiprep",
    title: "Ein Produkt für tschechische Medizinfakultäten",
    lead: "MeDiprep bereitet auf die Aufnahmeprüfungen von acht tschechischen medizinischen Fakultäten vor. Es ist kein Produkt dieser Ausgabe — öffnen Sie die tschechische Edition.",
    openCs: "Tschechische Edition öffnen",
    backHome: "Zur Startseite",
  },
  fr: {
    metaTitle: "MeDiprep — facultés de médecine tchèques | MedScopeGlobal",
    metaDescription:
      "MeDiprep prépare aux concours de 8 facultés de médecine tchèques. Pas une offre de cette édition.",
    kicker: "MeDiprep",
    title: "Un produit pour les facultés de médecine tchèques",
    lead: "MeDiprep prépare aux concours de huit facultés de médecine tchèques. Ce n’est pas un produit de cette édition — ouvrez l’édition tchèque.",
    openCs: "Ouvrir l’édition tchèque",
    backHome: "Retour à l’accueil",
  },
  it: {
    metaTitle: "MeDiprep — facoltà di medicina ceche | MedScopeGlobal",
    metaDescription:
      "MeDiprep prepara ai test di 8 facoltà di medicina ceche. Non è un’offerta di questa edizione.",
    kicker: "MeDiprep",
    title: "Un prodotto per le facoltà di medicina ceche",
    lead: "MeDiprep prepara ai test di ammissione di otto facoltà di medicina ceche. Non è un prodotto di questa edizione — apri l’edizione ceca.",
    openCs: "Apri l’edizione ceca",
    backHome: "Torna alla home",
  },
  es: {
    metaTitle: "MeDiprep — facultades de medicina checas | MedScopeGlobal",
    metaDescription:
      "MeDiprep prepara para las pruebas de 8 facultades de medicina checas. No es una oferta de esta edición.",
    kicker: "MeDiprep",
    title: "Un producto para las facultades de medicina checas",
    lead: "MeDiprep prepara para las pruebas de acceso de ocho facultades de medicina checas. No es un producto de esta edición — abre la edición checa.",
    openCs: "Abrir la edición checa",
    backHome: "Volver al inicio",
  },
  "pt-BR": {
    metaTitle: "MeDiprep — faculdades de medicina tchecas | MedScopeGlobal",
    metaDescription:
      "O MeDiprep prepara para os exames de 8 faculdades de medicina tchecas. Não é uma oferta desta edição.",
    kicker: "MeDiprep",
    title: "Um produto para as faculdades de medicina tchecas",
    lead: "O MeDiprep prepara para os exames de oito faculdades de medicina tchecas. Não é um produto desta edição — abra a edição tcheca.",
    openCs: "Abrir a edição tcheca",
    backHome: "Voltar ao início",
  },
  en: {
    metaTitle: "MeDiprep — Czech medical faculties | MedScopeGlobal",
    metaDescription:
      "MeDiprep prepares for admissions at 8 Czech medical faculties. It is not a product of this edition.",
    kicker: "MeDiprep",
    title: "A product for Czech medical faculties",
    lead: "MeDiprep prepares for admissions at eight Czech medical faculties. It is not offered as a local product on this edition — open the Czech edition.",
    openCs: "Open the Czech edition",
    backHome: "Back to the homepage",
  },
};

const PRODUCT: Record<Exclude<CzechFacultyProduct, "mediprep">, Record<ChromePack, Pick<CzechFacultyOnlyCopy, "metaTitle" | "metaDescription" | "kicker" | "title" | "lead">>> = {
  academy: {
    cs: {
      metaTitle: "MedScope Academy — vzdělávání v medicíně | MedScopeGlobal",
      metaDescription: "Kurzy, CME a příprava na české lékařské fakulty.",
      kicker: "Academy",
      title: "Academy pro českou edici",
      lead: "MedScope Academy (CME, ČLK, příprava na české LF) zůstává v české edici. Otevřete /cs.",
    },
    de: {
      metaTitle: "MedScope Academy — tschechische Edition | MedScopeGlobal",
      metaDescription:
        "Academy (CME, ČLK, Aufnahme tschechischer Fakultäten) ist ein Angebot der tschechischen Edition.",
      kicker: "Academy",
      title: "Academy bleibt in der tschechischen Edition",
      lead: "MedScope Academy — CME, Ärztekammer ČLK und Vorbereitung auf tschechische Medizinfakultäten — ist kein Produkt dieser Ausgabe. Öffnen Sie die tschechische Edition.",
    },
    fr: {
      metaTitle: "MedScope Academy — édition tchèque | MedScopeGlobal",
      metaDescription:
        "Academy (FMC, ČLK, concours des facultés tchèques) reste dans l’édition tchèque.",
      kicker: "Academy",
      title: "Academy reste dans l’édition tchèque",
      lead: "MedScope Academy — FMC, vérification ČLK et préparation aux facultés de médecine tchèques — n’est pas un produit de cette édition. Ouvrez l’édition tchèque.",
    },
    it: {
      metaTitle: "MedScope Academy — edizione ceca | MedScopeGlobal",
      metaDescription:
        "Academy (ECM, ČLK, test delle facoltà ceche) resta nell’edizione ceca.",
      kicker: "Academy",
      title: "Academy resta nell’edizione ceca",
      lead: "MedScope Academy — ECM, verifica ČLK e preparazione alle facoltà di medicina ceche — non è un prodotto di questa edizione. Apri l’edizione ceca.",
    },
    es: {
      metaTitle: "MedScope Academy — edición checa | MedScopeGlobal",
      metaDescription:
        "Academy (FMC, ČLK, pruebas de facultades checas) se queda en la edición checa.",
      kicker: "Academy",
      title: "Academy se queda en la edición checa",
      lead: "MedScope Academy — FMC, verificación ČLK y preparación para facultades de medicina checas — no es un producto de esta edición. Abre la edición checa.",
    },
    "pt-BR": {
      metaTitle: "MedScope Academy — edição tcheca | MedScopeGlobal",
      metaDescription:
        "A Academy (CME, ČLK, exames das faculdades tchecas) fica na edição tcheca.",
      kicker: "Academy",
      title: "A Academy fica na edição tcheca",
      lead: "A MedScope Academy — CME, verificação ČLK e preparação para faculdades de medicina tchecas — não é um produto desta edição. Abra a edição tcheca.",
    },
    en: {
      metaTitle: "MedScope Academy — Czech edition | MedScopeGlobal",
      metaDescription:
        "Academy (CME, ČLK, Czech faculty admissions) stays on the Czech edition.",
      kicker: "Academy",
      title: "Academy stays on the Czech edition",
      lead: "MedScope Academy — CME, ČLK verification and Czech medical-faculty prep — is not a product of this edition. Open the Czech edition.",
    },
  },
  students: {
    cs: {
      metaTitle: "Studenti — české LF | MedScopeGlobal",
      metaDescription: "Příprava a studium na českých lékařských fakultách.",
      kicker: "Studenti",
      title: "Studentské stránky české edice",
      lead: "Hub pro uchazeče a studenty českých LF zůstává v české edici.",
    },
    de: {
      metaTitle: "Studierende — tschechische Fakultäten | MedScopeGlobal",
      metaDescription:
        "Vorbereitung und Studium an tschechischen Medizinfakultäten. Angebot der tschechischen Edition.",
      kicker: "Studierende",
      title: "Ein Angebot der tschechischen Edition",
      lead: "Die Studierenden-Seiten (Aufnahmeprüfungen, Materialien, MeDiprep) gehören zur tschechischen Edition. Öffnen Sie /cs.",
    },
    fr: {
      metaTitle: "Étudiants — facultés tchèques | MedScopeGlobal",
      metaDescription:
        "Préparation et études dans les facultés de médecine tchèques. Offre de l’édition tchèque.",
      kicker: "Étudiants",
      title: "Un espace de l’édition tchèque",
      lead: "Les pages étudiants (concours, supports, MeDiprep) restent dans l’édition tchèque. Ouvrez /cs.",
    },
    it: {
      metaTitle: "Studenti — facoltà ceche | MedScopeGlobal",
      metaDescription:
        "Preparazione e studio nelle facoltà di medicina ceche. Offerta dell’edizione ceca.",
      kicker: "Studenti",
      title: "Uno spazio dell’edizione ceca",
      lead: "Le pagine studenti (test di ammissione, materiali, MeDiprep) restano nell’edizione ceca. Apri /cs.",
    },
    es: {
      metaTitle: "Estudiantes — facultades checas | MedScopeGlobal",
      metaDescription:
        "Preparación y estudios en facultades de medicina checas. Oferta de la edición checa.",
      kicker: "Estudiantes",
      title: "Un espacio de la edición checa",
      lead: "Las páginas de estudiantes (pruebas de acceso, materiales, MeDiprep) se quedan en la edición checa. Abre /cs.",
    },
    "pt-BR": {
      metaTitle: "Estudantes — faculdades tchecas | MedScopeGlobal",
      metaDescription:
        "Preparação e estudo nas faculdades de medicina tchecas. Oferta da edição tcheca.",
      kicker: "Estudantes",
      title: "Um espaço da edição tcheca",
      lead: "As páginas de estudantes (exames, materiais, MeDiprep) ficam na edição tcheca. Abra /cs.",
    },
    en: {
      metaTitle: "Students — Czech faculties | MedScopeGlobal",
      metaDescription:
        "Prep and study at Czech medical faculties. A Czech-edition offer.",
      kicker: "Students",
      title: "A Czech-edition space",
      lead: "The student pages (admissions, materials, MeDiprep) stay on the Czech edition. Open /cs.",
    },
  },
};

export function getCzechFacultyOnlyCopy(
  locale?: string | null,
  product: CzechFacultyProduct = "mediprep"
): CzechFacultyOnlyCopy {
  const base = PACK[chromePack(locale)];
  if (product === "mediprep") return base;
  return { ...base, ...PRODUCT[product][chromePack(locale)] };
}

export function isCzechFacultyLocale(locale?: string | null): boolean {
  return chromePack(locale) === "cs";
}

/** Paths that must not run Czech student/Academy trees on other editions. */
export function czechFacultyProductForPath(pathname: string): CzechFacultyProduct | null {
  const p = pathname.split("?")[0] || "/";
  if (p === "/academy" || p.startsWith("/academy/")) return "academy";
  if (p === "/mediprep" || p.startsWith("/mediprep/")) return "mediprep";
  if (p === "/studenti" || p === "/studenti/darkove" || p.startsWith("/studenti/darkove/")) {
    return null;
  }
  if (p.startsWith("/studenti/")) return "students";
  if (p === "/medicina" || p.startsWith("/medicina/")) return "students";
  if (p === "/studium" || p.startsWith("/studium/")) return "students";
  return null;
}
