export interface OdbornaSectionSpec {
  slug: string;
  title: string;
  description: string;
  minAccessNote?: string;
  highlights: string[];
}

export const ODBORNA_SECTIONS: OdbornaSectionSpec[] = [
  {
    slug: "klinicke-algoritmy",
    title: "Klinické algoritmy",
    description:
      "Postupy a rozhodovací stromy pro pracoviště — pouze pro ověřené lékaře.",
    highlights: [
      "Rozhodovací stromy pro akutní i chronickou péči",
      "Checklisty pro ambulantní a lůžková pracoviště",
      "Odkazy na primární zdroje a verze algoritmu",
    ],
  },
  {
    slug: "farmakoterapie",
    title: "Farmakoterapie",
    description:
      "Off-label poznámky, interakce a dávkování mimo laický přístup.",
    highlights: [
      "Interakce a úpravy dávkování u specifických skupin",
      "Off-label poznámky s odkazem na SPC a literaturu",
      "Přehled nových registrací relevantních pro praxi",
    ],
  },
  {
    slug: "guidelines",
    title: "Klinické směrnice",
    description: "Souhrny doporučení odborných společností a ČSK.",
    highlights: [
      "Strukturované souhrny doporučení ČSK a mezinárodních společností",
      "Datum revize a změny oproti předchozí verzi",
      "Propojení na plné znění směrnic",
    ],
  },
  {
    slug: "case-reports",
    title: "Kazuistiky",
    description: "Anonymizované případy pro odbornou diskusi.",
    highlights: [
      "Anonymizované případy s klinickým kontextem",
      "Diferenciální diagnostika a zdůvodnění postupu",
      "Diskusní body pro týmové konzilia",
    ],
  },
  {
    slug: "legislativa-pro",
    title: "Legislativa pro praxi",
    description: "Regulace MZČR, SÚKL a zdravotní pojišťovny — odborný výklad.",
    highlights: [
      "Výklad regulace MZČR a SÚKL pro praxi",
      "Změny v úhradách a indikačních omezeních",
      "Souvislost s veřejnou sekcí legislativy",
    ],
  },
];

export function getOdbornaSection(slug: string) {
  return ODBORNA_SECTIONS.find((s) => s.slug === slug);
}
