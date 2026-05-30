import type { KnowledgeProduct } from "./types";

export const knowledgeProducts: KnowledgeProduct[] = [
  {
    id: "kp-001",
    slug: "evidence-digest-kardiologie-q2",
    title: "Evidence Digest: Kardiologie Q2 2026",
    summary: "Kurátorovaný souhrn klíčových studií a guidelines pro praktickou kardiologii.",
    type: "digest",
    tier: "premium",
    specialization: "Kardiologie",
    href: "/premium"
  },
  {
    id: "kp-002",
    slug: "special-report-onkologie",
    title: "Special Report: Precision Oncology",
    summary: "Tematická publikace s expertními komentáři a datovými přehledy.",
    type: "report",
    tier: "premium",
    specialization: "Onkologie",
    href: "/premium",
    sponsored: true
  },
  {
    id: "kp-003",
    slug: "open-collection-interna",
    title: "Open Collection: Interní medicína",
    summary: "Veřejně dostupný výběr článků a shrnutí pro studenty a lékaře v přípravě.",
    type: "collection",
    tier: "free",
    specialization: "Interní medicína",
    href: "/articles"
  },
  {
    id: "kp-004",
    slug: "institutional-benchmark-whitepaper",
    title: "Institutional Benchmark Whitepaper",
    summary: "Metodika pro nemocnice a univerzity – připraveno pro licencovaný přístup.",
    type: "whitepaper",
    tier: "institutional",
    specialization: "Management ve zdravotnictví",
    href: "/institutions"
  }
];
