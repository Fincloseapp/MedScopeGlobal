/** Academic year 2026/2027 — Czech medical faculty admissions (orientational). Always verify on official faculty sites. */

export type PrepSubject = "biologie" | "chemie" | "fyzika" | "matematika";

export type FacultyAdmissions = {
  slug: string;
  shortName: string;
  name: string;
  city: string;
  url: string;
  applicationUrl: string;
  applicationOpen: string;
  applicationDeadline: string;
  examWindow: string;
  subjects: PrepSubject[];
  examNote: string;
  feeCzk?: number;
};

export const PRIJIMACKY_CYCLE_LABEL = "Akademický rok 2027/2028";

export const FACULTIES_ADMISSIONS_2026: FacultyAdmissions[] = [
  {
    slug: "lf-uk-1",
    shortName: "1. LF UK",
    name: "1. lékařská fakulta UK",
    city: "Praha",
    url: "https://www.lf1.cuni.cz",
    applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
    applicationOpen: "1. 12. 2026",
    applicationDeadline: "28. 2. 2027",
    examWindow: "12.–16. 6. 2027 (náhradní 22.–26. 6. 2027)",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Písemný test z B/C/F; detail na webu fakulty.",
    feeCzk: 930,
  },
  {
    slug: "lf-uk-2",
    shortName: "2. LF UK",
    name: "2. lékařská fakulta UK",
    city: "Praha",
    url: "https://www.lf2.cuni.cz",
    applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
    applicationOpen: "1. 12. 2026",
    applicationDeadline: "28. 2. 2027",
    examWindow: "červen 2027 (náhradní termín v červnu)",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Písemná + ústní část; ověřte aktuální podmínky.",
    feeCzk: 930,
  },
  {
    slug: "lf-uk-3",
    shortName: "3. LF UK",
    name: "3. lékařská fakulta UK",
    city: "Praha",
    url: "https://www.lf3.cuni.cz",
    applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
    applicationOpen: "1. 12. 2026",
    applicationDeadline: "28. 2. 2027",
    examWindow: "13.–17. 6. 2027 (náhradní 25. 6. 2027)",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "E-přihláška musí být uzavřena a zaplacena do deadline.",
    feeCzk: 930,
  },
  {
    slug: "lf-plzen",
    shortName: "LF Plzeň",
    name: "Lékařská fakulta v Plzni UK",
    city: "Plzeň",
    url: "https://www.lfp.cuni.cz",
    applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
    applicationOpen: "1. 12. 2026",
    applicationDeadline: "28. 2. 2027",
    examWindow: "15. 6. 2027 (náhradní 29. 6. 2027)",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Testové předměty dle sylabu; sledujte termíny na lfp.cuni.cz.",
    feeCzk: 930,
  },
  {
    slug: "lf-hk",
    shortName: "LF HK",
    name: "Lékařská fakulta v Hradci Králové UK",
    city: "Hradec Králové",
    url: "https://www.lfhk.cuni.cz",
    applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
    applicationOpen: "1. 12. 2026",
    applicationDeadline: "28. 2. 2027",
    examWindow: "11. 6. 2027",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Přihláška přes SIS UK; termíny ověřte na lfhk.cuni.cz.",
    feeCzk: 930,
  },
  {
    slug: "lf-mu",
    shortName: "LF MU",
    name: "Lékařská fakulta MU",
    city: "Brno",
    url: "https://www.med.muni.cz",
    applicationUrl: "https://www.muni.cz/uchazeci",
    applicationOpen: "1. 11. 2026",
    applicationDeadline: "28. 2. 2027",
    examWindow: "1. a 2. 6. 2027",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "E-přihláška + poplatek; podmínky na med.muni.cz.",
    feeCzk: 900,
  },
  {
    slug: "lf-up",
    shortName: "LF UP",
    name: "Lékařská fakulta UP",
    city: "Olomouc",
    url: "https://www.lf.upol.cz",
    applicationUrl: "https://www.upol.cz/uchazeci/",
    applicationOpen: "listopad 2026",
    applicationDeadline: "15. 3. 2027",
    examWindow: "9. 6. 2027",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Pozdější deadline než u UK/MU — ověřte na upol.cz.",
  },
  {
    slug: "lf-os",
    shortName: "LF OU",
    name: "Lékařská fakulta Ostravské univerzity",
    city: "Ostrava",
    url: "https://lf.osu.cz/",
    applicationUrl: "https://lf.osu.cz/",
    applicationOpen: "listopad 2026",
    applicationDeadline: "15. 3. 2027",
    examWindow: "2.–5. 6. 2027",
    subjects: ["biologie", "chemie", "fyzika"],
    examNote: "Sledujte aktuální harmonogram na lf.osu.cz.",
  },
];

export function daysUntilDeadline(deadlineCs: string, now = new Date()): number | null {
  const m = deadlineCs.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 23, 59, 59);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function subjectLabel(s: PrepSubject): string {
  const map: Record<PrepSubject, string> = {
    biologie: "Biologie",
    chemie: "Chemie",
    fyzika: "Fyzika",
    matematika: "Matematika",
  };
  return map[s];
}

export function sortFacultiesByDeadline(
  list: FacultyAdmissions[] = FACULTIES_ADMISSIONS_2026
): FacultyAdmissions[] {
  return [...list].sort((a, b) => {
    const da = daysUntilDeadline(a.applicationDeadline) ?? 9999;
    const db = daysUntilDeadline(b.applicationDeadline) ?? 9999;
    return da - db;
  });
}
