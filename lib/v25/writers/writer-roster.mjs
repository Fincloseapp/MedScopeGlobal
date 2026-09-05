/**
 * 20 senior public writers — 4 specialists × 5 categories.
 * No personal names or portraits; labels are editorial desks.
 */

export const WRITER_SPECIALTY_IDS = ["practice", "research", "trends", "field"];

export const SPECIALTY_ANGLES = {
  practice:
    "seniorní klinická a terénní praxe — co se osvědčilo v ordinaci, v domácnosti i ve směnném provozu",
  research:
    "výzkum i praxe zároveň — studie, biomarkery a přenos do českého dne bez slibů zázraku",
  trends:
    "aktivní hledání zajímavých a aktuálních trendů v kategorii — sezóna, nové studie, témata, která čtenáře chytí",
  field:
    "široký přehled z terénu — užitečnost po dočtení, chuť se vrátit, konkrétní český týden",
};

export const SPECIALTY_LABELS_CS = {
  practice: "Klinická praxe",
  research: "Výzkum",
  trends: "Trendy",
  field: "Přehled z terénu",
};

export function specialtyWriterName(deskName, specialty) {
  const spec = SPECIALTY_LABELS_CS[specialty] ?? SPECIALTY_LABELS_CS.practice;
  return `${deskName} · ${spec}`;
}

export const CATEGORY_DESKS = [
  { deskId: "writer1", topic: "zivotni-styl" },
  { deskId: "writer2", topic: "nemoci" },
  { deskId: "writer3", topic: "prevence" },
  { deskId: "writer4", topic: "rozhovory" },
  { deskId: "writer5", topic: "dlouhovekost" },
];

export const PUBLIC_WRITER_COUNT = CATEGORY_DESKS.length * WRITER_SPECIALTY_IDS.length;
