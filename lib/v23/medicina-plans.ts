import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";

export type V23StudyPlan = {
  slug: string;
  title: string;
  duration: string;
  audience: string;
  weeks: { week: number; focus: string; tasks: string[] }[];
  resources: { label: string; href: string }[];
  imageUrl: string;
};

export const V23_STUDY_PLANS: V23StudyPlan[] = [
  {
    slug: "prijimacky-6-mesicu",
    title: "Příprava na přijímačky — 6 měsíců",
    duration: "24 týdnů",
    audience: "Uchazeči o studium na LF",
    imageUrl: V21_MEDICAL_IMAGES.university,
    weeks: [
      {
        week: 1,
        focus: "Biologie — buňka a genetika",
        tasks: ["Opakování mitózy a meiózy", "10 modelových otázek denně", "Kvíz: přijímačky biologie"],
      },
      {
        week: 2,
        focus: "Chemie — organická základna",
        tasks: ["Funkční skupiny", "Stechiometrie — 5 úloh", "Propojení s biochemií"],
      },
      {
        week: 3,
        focus: "Fyzika — mechanika a fluids",
        tasks: ["Převody jednotek", "Modelové testy", "Analýza chyb"],
      },
      {
        week: 4,
        focus: "Komplexní test + regenerace",
        tasks: ["Simulace přijímaček", "Slabá místa — opakování", "Hry: anatomie + terminologie"],
      },
    ],
    resources: [
      { label: "Kvízy a hry", href: "/medicina/hry" },
      { label: "Příprava na LF", href: "/medicina/priprava" },
      { label: "Studijní obory", href: "/medicina/studium" },
    ],
  },
  {
    slug: "rok-1-lf",
    title: "Studijní plán — 1. ročník LF",
    duration: "Semestr A+B",
    audience: "Studenti 1. ročníku",
    imageUrl: V21_MEDICAL_IMAGES.anatomy,
    weeks: [
      {
        week: 1,
        focus: "Anatomie — musculoskeletal",
        tasks: ["Atlas + preparáty", "Kvíz: lidské systémy", "Klinické koreláty"],
      },
      {
        week: 2,
        focus: "Fyziologie — nervový systém",
        tasks: ["Schémata reflexů", "Kvíz: homeostáza", "Propojení s anatomií"],
      },
      {
        week: 3,
        focus: "Biochemie — metabolismus",
        tasks: ["Dráhy energie", "Opakování enzymů", "Příprava na zápočet"],
      },
      {
        week: 4,
        focus: "Integrace + zkouškové",
        tasks: ["Souhrnné mapy", "Patologie základy", "Simulace ústní zkoušky"],
      },
    ],
    resources: [
      { label: "Anatomie kvíz", href: "/medicina/hry/anatomie-systemy" },
      { label: "Fyziologie kvíz", href: "/medicina/hry/fyziologie-homeostaza" },
      { label: "Přehled oborů", href: "/medicina" },
    ],
  },
];

export function getStudyPlanBySlug(slug: string): V23StudyPlan | null {
  return V23_STUDY_PLANS.find((p) => p.slug === slug) ?? null;
}
