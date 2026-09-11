/** Curated, citable guidelines outside rheumatology — shown on the physician desk. */

export type CuratedGuideline = {
  id: string;
  specialty: string;
  title: string;
  source: string;
  year: string;
  doi: string;
  href: string;
  use: string;
};

export const CURATED_GUIDELINES: CuratedGuideline[] = [
  {
    id: "esc-htn-2024",
    specialty: "Kardiologie / praktické lékařství",
    title: "2024 ESC Guidelines for the management of elevated blood pressure and hypertension",
    source: "European Heart Journal",
    year: "2024",
    doi: "10.1093/eurheartj/ehae178",
    href: "https://doi.org/10.1093/eurheartj/ehae178",
    use: "Prahy tlaku, kombinace léků a sledování v ambulanci — ne náhrada ČLS JEP.",
  },
  {
    id: "esc-acs-2023",
    specialty: "Akutní kardiologie",
    title: "2023 ESC Guidelines for the management of acute coronary syndromes",
    source: "European Heart Journal",
    year: "2023",
    doi: "10.1093/eurheartj/ehad191",
    href: "https://doi.org/10.1093/eurheartj/ehad191",
    use: "STEMI / NSTE-ACS: antiagregace, revaskularizace, dual pathway — s DOI na primární text.",
  },
  {
    id: "esc-af-2024",
    specialty: "Arytmie / interní medicína",
    title: "2024 ESC Guidelines for the management of atrial fibrillation",
    source: "European Heart Journal",
    year: "2024",
    doi: "10.1093/eurheartj/ehae176",
    href: "https://doi.org/10.1093/eurheartj/ehae176",
    use: "Antikoagulace, rate/rhythm control a komorbidity. Primární text s DOI, ne AI brief.",
  },
];
