/**
 * Courtesy page when a Czech-faculty product (MeDiprep) is opened on another edition.
 * Do not localize MeDiprep as a foreign product — send people to /cs.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type CzechFacultyOnlyCopy = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  openCs: string;
  backHome: string;
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

export function getCzechFacultyOnlyCopy(locale?: string | null): CzechFacultyOnlyCopy {
  return PACK[chromePack(locale)];
}

export function isCzechFacultyLocale(locale?: string | null): boolean {
  return chromePack(locale) === "cs";
}
