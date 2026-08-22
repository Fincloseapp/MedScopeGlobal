import { FACULTIES_ADMISSIONS_2026 } from "@/lib/prijimacky/faculties-admissions";
import type { PrepFacultyProfile } from "@/lib/prep/types";

/** Tréninkové formáty MeDiprep — nejsou oficiální testy fakult. */
export const PREP_FACULTIES: PrepFacultyProfile[] = [
  {
    slug: "lf-uk-1",
    shortName: "1. LF UK",
    name: "1. lékařská fakulta UK",
    city: "Praha",
    accent: "#0F4C81",
    examStyle: "Písemné testy z biologie, chemie a fyziky — typicky jedna správná ze čtyř.",
    emphasis: ["Buňka a genetika", "Obecná + organická chemie", "Mechanika a elektřina"],
    simulation: {
      label: "Simulace 1. LF · 3 bloky",
      scoring: "plus1",
      passingPct: 70,
      blocks: [
        { subject: "biologie", count: 20, minutes: 18 },
        { subject: "chemie", count: 20, minutes: 18 },
        { subject: "fyzika", count: 20, minutes: 18 },
      ],
      officialHint:
        "Oficiální test 1. LF mívá více položek v každém předmětu. Tato simulace trénuje stejný rytmus tří bloků a poměr B/C/F, ne oficiální zadání.",
    },
  },
  {
    slug: "lf-uk-2",
    shortName: "2. LF UK",
    name: "2. lékařská fakulta UK",
    city: "Praha",
    accent: "#1F6A4D",
    examStyle: "Písemná část B/C/F a ústní kolo — písemka rozhoduje, kdo postoupí.",
    emphasis: ["Fyziologie člověka", "Výpočty a jednotky", "Přesné definice"],
    simulation: {
      label: "Simulace 2. LF · písemka",
      scoring: "plus1",
      passingPct: 72,
      blocks: [
        { subject: "biologie", count: 18, minutes: 16 },
        { subject: "chemie", count: 18, minutes: 16 },
        { subject: "fyzika", count: 18, minutes: 16 },
      ],
      officialHint:
        "2. LF má i ústní část. Simulace pokrývá písemný formát; ústní nácvik najdete v Academy kurzu strategie.",
    },
  },
  {
    slug: "lf-uk-3",
    shortName: "3. LF UK",
    name: "3. lékařská fakulta UK",
    city: "Praha",
    accent: "#7A3E2E",
    examStyle: "Písemný test B/C/F v jednom sezení — tempo a přesnost.",
    emphasis: ["Mikrobiologie a imunita", "Biochemické vazby", "Optika a vlny"],
    simulation: {
      label: "Simulace 3. LF · mixed tempo",
      scoring: "plus1",
      passingPct: 68,
      blocks: [{ subject: "biologie", count: 18, minutes: 16 }],
      officialHint:
        "Na 3. LF bývá důraz na tempo v jednom sezení. Mixed režim níže skládá B/C/F do jednoho odpočtu.",
    },
  },
  {
    slug: "lf-hk",
    shortName: "LFHK",
    name: "Lékařská fakulta v Hradci Králové UK",
    city: "Hradec Králové",
    accent: "#8A4B12",
    examStyle: "Písemné testy B/C/F v duchu UK — jedna správná odpověď.",
    emphasis: ["Anatomie oběhu", "Stechiometrie", "Termika a tlak"],
    simulation: {
      label: "Simulace LFHK",
      scoring: "plus1",
      passingPct: 70,
      blocks: [
        { subject: "biologie", count: 20, minutes: 18 },
        { subject: "chemie", count: 20, minutes: 18 },
        { subject: "fyzika", count: 20, minutes: 18 },
      ],
      officialHint: "Tréninkový model UK typu. Oficiální počet položek ověřte na lfhk.cuni.cz.",
    },
  },
  {
    slug: "lf-plzen",
    shortName: "LFP",
    name: "Lékařská fakulta v Plzni UK",
    city: "Plzeň",
    accent: "#3D5A80",
    examStyle: "Písemné testy z B/C/F podle sylabu fakulty.",
    emphasis: ["Genetika", "Redox a pH", "Elektřina"],
    simulation: {
      label: "Simulace LFP",
      scoring: "plus1",
      passingPct: 70,
      blocks: [
        { subject: "biologie", count: 18, minutes: 16 },
        { subject: "chemie", count: 18, minutes: 16 },
        { subject: "fyzika", count: 18, minutes: 16 },
      ],
      officialHint: "Sylabus a vzorové položky vždy ověřte na lfp.cuni.cz.",
    },
  },
  {
    slug: "lf-mu",
    shortName: "MUNI",
    name: "Lékařská fakulta MU",
    city: "Brno",
    accent: "#5C2D91",
    examStyle: "Testové položky s důrazem na více tvrzení — trénujeme i vícesprávné otázky.",
    emphasis: ["Buněčná biologie", "Obecná chemie", "Přesné fyzikální vztahy"],
    simulation: {
      label: "Simulace MUNI",
      scoring: "plus1",
      passingPct: 66,
      blocks: [
        { subject: "biologie", count: 16, minutes: 16 },
        { subject: "chemie", count: 16, minutes: 16 },
        { subject: "fyzika", count: 16, minutes: 16 },
      ],
      officialHint:
        "Oficiální test MUNI často pracuje s více tvrzeními u jedné položky. Část banky je proto vícesprávná; zbytek trénuje stejná témata v přehledném formátu.",
    },
  },
  {
    slug: "lf-up",
    shortName: "UPOL",
    name: "Lékařská fakulta UP",
    city: "Olomouc",
    accent: "#0B6E4F",
    examStyle: "Písemné testy B/C/F, často s vyšším podílem výpočtů.",
    emphasis: ["Biochemie", "Stechiometrie", "Mechanika výpočty"],
    simulation: {
      label: "Simulace UPOL",
      scoring: "plusMinus",
      passingPct: 65,
      blocks: [
        { subject: "biologie", count: 20, minutes: 18 },
        { subject: "chemie", count: 20, minutes: 18 },
        { subject: "fyzika", count: 20, minutes: 18 },
      ],
      officialHint:
        "Trénink používá mírnou penalizaci za chybu (−0,25), aby trestal hádání. Oficiální bodování ověřte na lf.upol.cz.",
    },
  },
  {
    slug: "lf-os",
    shortName: "LF OU",
    name: "Lékařská fakulta Ostravské univerzity",
    city: "Ostrava",
    accent: "#B42318",
    examStyle: "Písemné testy B/C/F v rozsahu gymnázia s lékařským důrazem.",
    emphasis: ["Fyziologie", "Roztoky a pH", "Jednotky a převody"],
    simulation: {
      label: "Simulace LF OU",
      scoring: "plus1",
      passingPct: 68,
      blocks: [
        { subject: "biologie", count: 16, minutes: 15 },
        { subject: "chemie", count: 16, minutes: 15 },
        { subject: "fyzika", count: 16, minutes: 15 },
      ],
      officialHint: "Rozsah a termíny ověřte na lf.osu.cz. Simulace trénuje poměr předmětů, ne oficiální položené otázky.",
    },
  },
];

export function getPrepFaculty(slug: string): PrepFacultyProfile | undefined {
  return PREP_FACULTIES.find((f) => f.slug === slug);
}

export function facultyAdmissions(slug: string) {
  return FACULTIES_ADMISSIONS_2026.find((f) => f.slug === slug);
}

export function simulationTotals(profile: PrepFacultyProfile) {
  const mixed = profile.slug === "lf-uk-3";
  const questions = mixed ? 54 : profile.simulation.blocks.reduce((n, b) => n + b.count, 0);
  const minutes = mixed ? 48 : profile.simulation.blocks.reduce((n, b) => n + b.minutes, 0);
  return { questions, minutes, mixed };
}
