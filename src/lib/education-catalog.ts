import type { EducationSeries } from "./types";

export const educationSeries: EducationSeries[] = [
  {
    id: "edu-001",
    slug: "kardiologie-prevence-masterclass",
    title: "Masterclass: Kardiovaskulární prevence v praxi",
    summary: "Série webinářů s klinickými scénáři, guidelines a case-based diskusí.",
    format: "online",
    specialization: "Kardiologie",
    level: "advanced",
    duration: "4 × 90 min",
    cmeLabel: "CPD-ready architektura",
    href: "/events/cardiology-prevention-forum"
  },
  {
    id: "edu-002",
    slug: "digital-health-leadership",
    title: "Digital Health Leadership Program",
    summary: "Hybridní program pro vedoucí pracovníky nemocnic a klinických center.",
    format: "hybrid",
    specialization: "Management ve zdravotnictví",
    level: "expert",
    duration: "2 dny + online moduly",
    href: "/events/digital-health-prague-2026"
  },
  {
    id: "edu-003",
    slug: "onco-data-roundtable",
    title: "Oncology Data Roundtable",
    summary: "Workshop o klinických datech, registrích a real-world evidence.",
    format: "hybrid",
    specialization: "Onkologie",
    level: "advanced",
    duration: "1 den",
    sponsored: true,
    href: "/events/oncology-data-roundtable"
  }
];
