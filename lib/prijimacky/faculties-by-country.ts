import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import {
  FACULTIES_ADMISSIONS_2026,
  type FacultyAdmissions,
} from "@/lib/prijimacky/faculties-admissions";

export type FacultyCountry = "cz" | "sk" | "de" | "at" | "fr" | "pl" | "it" | "es" | "uk" | "us";

const SEE = "See the official faculty website";
const SEE_CS = "Ověřte na oficiálním webu fakulty";

function linkOnly(
  partial: Pick<FacultyAdmissions, "slug" | "shortName" | "name" | "city" | "url" | "applicationUrl" | "subjects" | "examNote"> & {
    feeCzk?: number;
  }
): FacultyAdmissions {
  return {
    applicationOpen: SEE,
    applicationDeadline: SEE,
    examWindow: SEE,
    ...partial,
  };
}

/** Official faculty / admissions portals — no invented deadlines. */
export const FACULTIES_SK: FacultyAdmissions[] = [
  linkOnly({
    slug: "sk-lf-uk-ba",
    shortName: "LF UK BA",
    name: "Lekárska fakulta UK",
    city: "Bratislava",
    url: "https://www.fmed.uniba.sk",
    applicationUrl: "https://www.fmed.uniba.sk/uchadzac/",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Oficiální přihláška a termíny jen na fmed.uniba.sk.",
  }),
  linkOnly({
    slug: "sk-jlf-uk",
    shortName: "JLF UK",
    name: "Jesseniova lekárska fakulta UK",
    city: "Martin",
    url: "https://www.jfmed.uniba.sk",
    applicationUrl: "https://www.jfmed.uniba.sk",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Podmínky přijetí ověřte na jfmed.uniba.sk.",
  }),
  linkOnly({
    slug: "sk-lf-upjs",
    shortName: "LF UPJŠ",
    name: "Lekárska fakulta UPJŠ",
    city: "Košice",
    url: "https://www.upjs.sk/lekarska-fakulta/",
    applicationUrl: "https://www.upjs.sk/lekarska-fakulta/",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Harmonogram na webu UPJŠ.",
  }),
  linkOnly({
    slug: "sk-szu",
    shortName: "LF SZU",
    name: "Lekárska fakulta SZU",
    city: "Bratislava",
    url: "https://www.szu.sk",
    applicationUrl: "https://www.szu.sk",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "SZU — ověřte aktuální výzvu na szu.sk.",
  }),
];

export const FACULTIES_DE: FacultyAdmissions[] = [
  linkOnly({
    slug: "de-charite",
    shortName: "Charité",
    name: "Charité — Universitätsmedizin Berlin",
    city: "Berlin",
    url: "https://www.charite.de",
    applicationUrl: "https://www.hochschulstart.de",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Bewerbung über Hochschulstart / TMS — nur offizielle Portale.",
  }),
  linkOnly({
    slug: "de-lmu",
    shortName: "LMU",
    name: "Medizinische Fakultät der LMU München",
    city: "München",
    url: "https://www.med.lmu.de",
    applicationUrl: "https://www.hochschulstart.de",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Zulassung über Hochschulstart. Termine auf med.lmu.de.",
  }),
  linkOnly({
    slug: "de-heidelberg",
    shortName: "Heidelberg",
    name: "Medizinische Fakultät Heidelberg",
    city: "Heidelberg",
    url: "https://www.medizinische-fakultaet-hd.uni-heidelberg.de",
    applicationUrl: "https://www.hochschulstart.de",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Offizielle Fristen auf der Fakultätsseite und Hochschulstart.",
  }),
  linkOnly({
    slug: "de-freiburg",
    shortName: "Freiburg",
    name: "Medizinische Fakultät Freiburg",
    city: "Freiburg",
    url: "https://www.med.uni-freiburg.de",
    applicationUrl: "https://www.hochschulstart.de",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Keine erfundenen Deadlines — immer die Fakultät prüfen.",
  }),
  linkOnly({
    slug: "de-hamburg",
    shortName: "UKE",
    name: "Universitätsklinikum Hamburg-Eppendorf",
    city: "Hamburg",
    url: "https://www.uke.de",
    applicationUrl: "https://www.hochschulstart.de",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Medizinstudium / Hochschulstart — uke.de.",
  }),
  linkOnly({
    slug: "at-meduni-wien",
    shortName: "MedUni Wien",
    name: "Medizinische Universität Wien",
    city: "Wien",
    url: "https://www.meduniwien.ac.at",
    applicationUrl: "https://www.meduniwien.ac.at/web/studium-weiterbildung/",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "MedAT — nur meduniwien.ac.at.",
  }),
  linkOnly({
    slug: "at-meduni-graz",
    shortName: "MedUni Graz",
    name: "Medizinische Universität Graz",
    city: "Graz",
    url: "https://www.medunigraz.at",
    applicationUrl: "https://www.medunigraz.at",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Aufnahmeverfahren auf medunigraz.at.",
  }),
  linkOnly({
    slug: "at-i-med",
    shortName: "MedUni Innsbruck",
    name: "Medizinische Universität Innsbruck",
    city: "Innsbruck",
    url: "https://www.i-med.ac.at",
    applicationUrl: "https://www.i-med.ac.at",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Offizielle Infos auf i-med.ac.at.",
  }),
];

export const FACULTIES_FR: FacultyAdmissions[] = [
  linkOnly({
    slug: "fr-parcoursup",
    shortName: "Parcoursup",
    name: "Parcoursup — accès PASS / LAS",
    city: "France",
    url: "https://www.parcoursup.gouv.fr",
    applicationUrl: "https://www.parcoursup.gouv.fr",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Candidatures médecine via Parcoursup. Dates uniquement sur le site officiel.",
  }),
  linkOnly({
    slug: "fr-sorbonne",
    shortName: "Sorbonne",
    name: "Faculté de Santé — Sorbonne Université",
    city: "Paris",
    url: "https://medecine.sorbonne-universite.fr",
    applicationUrl: "https://www.parcoursup.gouv.fr",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "PASS/LAS — vérifier la faculté et Parcoursup.",
  }),
  linkOnly({
    slug: "fr-upcite",
    shortName: "Université Paris Cité",
    name: "UFR de Médecine — Université Paris Cité",
    city: "Paris",
    url: "https://u-paris.fr",
    applicationUrl: "https://www.parcoursup.gouv.fr",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Portail faculté + Parcoursup.",
  }),
  linkOnly({
    slug: "fr-lyon",
    shortName: "Lyon Est",
    name: "Faculté de médecine Lyon Est",
    city: "Lyon",
    url: "https://lyon-est.univ-lyon1.fr",
    applicationUrl: "https://www.parcoursup.gouv.fr",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Dates officielles sur lyon-est.univ-lyon1.fr.",
  }),
];

export const FACULTIES_PL: FacultyAdmissions[] = [
  linkOnly({
    slug: "pl-wum",
    shortName: "WUM",
    name: "Warszawski Uniwersytet Medyczny",
    city: "Warszawa",
    url: "https://www.wum.edu.pl",
    applicationUrl: "https://www.wum.edu.pl",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Rekrutacja tylko na wum.edu.pl.",
  }),
  linkOnly({
    slug: "pl-uj",
    shortName: "CM UJ",
    name: "Collegium Medicum Uniwersytetu Jagiellońskiego",
    city: "Kraków",
    url: "https://www.cm-uj.krakow.pl",
    applicationUrl: "https://www.cm-uj.krakow.pl",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Oficjalne terminy na cm-uj.krakow.pl.",
  }),
  linkOnly({
    slug: "pl-gumed",
    shortName: "GUMed",
    name: "Gdański Uniwersytet Medyczny",
    city: "Gdańsk",
    url: "https://gumed.edu.pl",
    applicationUrl: "https://gumed.edu.pl",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Rekrutacja — gumed.edu.pl.",
  }),
  linkOnly({
    slug: "pl-umw",
    shortName: "UMW",
    name: "Uniwersytet Medyczny im. Piastów Śląskich",
    city: "Wrocław",
    url: "https://www.umw.edu.pl",
    applicationUrl: "https://www.umw.edu.pl",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Sprawdź aktualną rekrutację na umw.edu.pl.",
  }),
];

export const FACULTIES_IT: FacultyAdmissions[] = [
  linkOnly({
    slug: "it-cisia",
    shortName: "CISIA",
    name: "TOLC-MED / CISIA",
    city: "Italia",
    url: "https://www.cisiaonline.it",
    applicationUrl: "https://www.cisiaonline.it",
    subjects: ["biologie", "chemie", "fyzika", "matematika"],
    examNote: "Test di ammissione: solo cisiaonline.it.",
  }),
  linkOnly({
    slug: "it-sapienza",
    shortName: "Sapienza",
    name: "Sapienza Università di Roma — Medicina",
    city: "Roma",
    url: "https://www.uniroma1.it",
    applicationUrl: "https://www.uniroma1.it",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Bandi ufficiali sulla pagina di Ateneo.",
  }),
  linkOnly({
    slug: "it-unibo",
    shortName: "Unibo",
    name: "Alma Mater Studiorum — Università di Bologna",
    city: "Bologna",
    url: "https://www.unibo.it",
    applicationUrl: "https://www.unibo.it",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Medicina e Chirurgia — unibo.it.",
  }),
  linkOnly({
    slug: "it-unimi",
    shortName: "Statale",
    name: "Università degli Studi di Milano",
    city: "Milano",
    url: "https://www.unimi.it",
    applicationUrl: "https://www.unimi.it",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Date solo sul sito di Ateneo.",
  }),
];

export const FACULTIES_ES: FacultyAdmissions[] = [
  linkOnly({
    slug: "es-ucm",
    shortName: "UCM",
    name: "Universidad Complutense de Madrid — Medicina",
    city: "Madrid",
    url: "https://www.ucm.es",
    applicationUrl: "https://www.ucm.es",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Admisión: ucm.es y la convocatoria oficial.",
  }),
  linkOnly({
    slug: "es-ub",
    shortName: "UB",
    name: "Universitat de Barcelona — Medicina",
    city: "Barcelona",
    url: "https://www.ub.edu",
    applicationUrl: "https://www.ub.edu",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Preinscripción universitaria — ub.edu.",
  }),
  linkOnly({
    slug: "es-uv",
    shortName: "UV",
    name: "Universitat de València — Medicina",
    city: "València",
    url: "https://www.uv.es",
    applicationUrl: "https://www.uv.es",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Fechas oficiales en uv.es.",
  }),
  linkOnly({
    slug: "es-uam",
    shortName: "UAM",
    name: "Universidad Autónoma de Madrid — Medicina",
    city: "Madrid",
    url: "https://www.uam.es",
    applicationUrl: "https://www.uam.es",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Admisión en uam.es.",
  }),
];

export const FACULTIES_UK: FacultyAdmissions[] = [
  linkOnly({
    slug: "uk-ucas",
    shortName: "UCAS",
    name: "UCAS — UK undergraduate applications",
    city: "United Kingdom",
    url: "https://www.ucas.com",
    applicationUrl: "https://www.ucas.com",
    subjects: ["biologie", "chemie"],
    examNote: "Medicine applications go through UCAS. Deadlines only on ucas.com.",
  }),
  linkOnly({
    slug: "uk-ucl",
    shortName: "UCL",
    name: "UCL Medical School",
    city: "London",
    url: "https://www.ucl.ac.uk/medical-school",
    applicationUrl: "https://www.ucas.com",
    subjects: ["biologie", "chemie"],
    examNote: "Entry requirements on the UCL Medical School site + UCAS.",
  }),
  linkOnly({
    slug: "uk-edinburgh",
    shortName: "Edinburgh",
    name: "Edinburgh Medical School",
    city: "Edinburgh",
    url: "https://www.ed.ac.uk/medicine-vet-medicine",
    applicationUrl: "https://www.ucas.com",
    subjects: ["biologie", "chemie"],
    examNote: "Official admissions on ed.ac.uk.",
  }),
  linkOnly({
    slug: "uk-kcl",
    shortName: "King’s",
    name: "King’s College London — Faculty of Life Sciences & Medicine",
    city: "London",
    url: "https://www.kcl.ac.uk/lsm",
    applicationUrl: "https://www.ucas.com",
    subjects: ["biologie", "chemie"],
    examNote: "Check kcl.ac.uk and UCAS for the current cycle.",
  }),
];

export const FACULTIES_US: FacultyAdmissions[] = [
  linkOnly({
    slug: "us-aamc",
    shortName: "AAMC",
    name: "AAMC / AMCAS — U.S. medical school applications",
    city: "United States",
    url: "https://www.aamc.org",
    applicationUrl: "https://students-residents.aamc.org",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "U.S. MD applications run through AMCAS. Dates only on aamc.org.",
  }),
  linkOnly({
    slug: "us-hms",
    shortName: "Harvard HMS",
    name: "Harvard Medical School",
    city: "Boston",
    url: "https://hms.harvard.edu",
    applicationUrl: "https://students-residents.aamc.org",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "School page + AMCAS. Not a Czech LF exam.",
  }),
  linkOnly({
    slug: "us-jhu",
    shortName: "Johns Hopkins",
    name: "Johns Hopkins University School of Medicine",
    city: "Baltimore",
    url: "https://www.hopkinsmedicine.org/som",
    applicationUrl: "https://students-residents.aamc.org",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Official admissions on hopkinsmedicine.org.",
  }),
];

const BY_COUNTRY: Record<FacultyCountry, FacultyAdmissions[]> = {
  cz: FACULTIES_ADMISSIONS_2026,
  sk: FACULTIES_SK,
  de: FACULTIES_DE,
  at: FACULTIES_DE.filter((f) => f.slug.startsWith("at-")),
  fr: FACULTIES_FR,
  pl: FACULTIES_PL,
  it: FACULTIES_IT,
  es: FACULTIES_ES,
  uk: FACULTIES_UK,
  us: FACULTIES_US,
};

export function facultyCountryForLocale(locale?: string | null): FacultyCountry {
  const normalized = normalizeLocale(locale ?? "cs");
  if (normalized === "cs") return "cz";
  if (normalized === "sk") return "sk";
  if (normalized === "en-UK") return "uk";
  if (normalized === "en-US" || normalized === "en") return "us";
  const primary = primaryArticleLocale(normalized);
  if (primary === "de") return "de";
  if (primary === "fr") return "fr";
  if (primary === "pl") return "pl";
  if (primary === "it") return "it";
  if (primary === "es" || primary === "pt") return "es";
  return "cz";
}

export function facultiesForLocale(locale?: string | null): FacultyAdmissions[] {
  return BY_COUNTRY[facultyCountryForLocale(locale)] ?? FACULTIES_ADMISSIONS_2026;
}

export function isCzechFacultySlug(slug: string): boolean {
  return FACULTIES_ADMISSIONS_2026.some((f) => f.slug === slug);
}

export function facultyBoardSeeOfficial(locale?: string | null): string {
  return (locale ?? "cs").toLowerCase().startsWith("cs") ? SEE_CS : SEE;
}

export function facultyCountryLabel(locale?: string | null): string {
  const country = facultyCountryForLocale(locale);
  const cs = (locale ?? "cs").toLowerCase().startsWith("cs");
  const labels: Record<FacultyCountry, [string, string]> = {
    cz: ["České lékařské fakulty", "Czech medical faculties"],
    sk: ["Slovenské lekárske fakulty", "Slovak medical faculties"],
    de: ["Medizinfakultäten DACH", "DACH medical faculties"],
    at: ["Österreichische MedUnis", "Austrian medical universities"],
    fr: ["Facultés de médecine", "French medical faculties"],
    pl: ["Polskie uniwersytety medyczne", "Polish medical universities"],
    it: ["Facoltà di medicina", "Italian medical faculties"],
    es: ["Facultades de medicina", "Spanish medical faculties"],
    uk: ["UK medical schools", "UK medical schools"],
    us: ["U.S. medical schools", "U.S. medical schools"],
  };
  return cs ? labels[country][0] : labels[country][1];
}

export type { GlobalLocaleCode };
