export interface OdbornaSectionSpec {
  slug: string;
  title: string;
  description: string;
  minAccessNote?: string;
}

export const ODBORNA_SECTIONS: OdbornaSectionSpec[] = [
  {
    slug: "klinicke-algoritmy",
    title: "Klinické algoritmy",
    description:
      "Postupy a rozhodovací stromy pro pracoviště — pouze pro ověřené lékaře.",
  },
  {
    slug: "farmakoterapie",
    title: "Farmakoterapie",
    description:
      "Off-label poznámky, interakce a dávkování mimo laický přístup.",
  },
  {
    slug: "guidelines",
    title: "Klinické směrnice",
    description: "Souhrny doporučení odborných společností a ČSK.",
  },
  {
    slug: "case-reports",
    title: "Kazuistiky",
    description: "Anonymizované případy pro odbornou diskusi.",
  },
  {
    slug: "legislativa-pro",
    title: "Legislativa pro praxi",
    description: "Regulace MZČR, SÚKL a zdravotní pojišťovny — odborný výklad.",
  },
];

export function getOdbornaSection(slug: string) {
  return ODBORNA_SECTIONS.find((s) => s.slug === slug);
}
