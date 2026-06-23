/** Credibility signals and professional tier copy for /lekari */

export const V271_LEKARI_CREDIBILITY = [
  {
    id: "cme",
    title: "CME přehledy",
    description:
      "Kurátorované souhrny akreditovaných vzdělávacích aktivit. Příprava na akreditaci ČLK v procesu.",
    badge: "CME",
  },
  {
    id: "clk",
    title: "Partnerství s ČLK",
    description:
      "Odborná sekce vyžaduje ověření evidenčního čísla v registru České lékařské komory.",
    badge: "ČLK",
  },
  {
    id: "peer-review",
    title: "Peer review standard",
    description:
      "Studie a guidelines procházejí redakční kontrolou s odkazem na primární zdroj (DOI, PMID).",
    badge: "Peer review",
  },
] as const;

export const V271_PHYSICIAN_TIER = {
  priceMonthly: 490,
  priceAnnual: 4900,
  name: "Lékař v praxi",
  tagline: "Profesionální tier pro klinickou praxi",
  valueProps: [
    "Odborná sekce, guidelines a diagnostické algoritmy",
    "Kurátorované souhrny studií s DOI a PMID",
    "Klinický AI asistent a Research Hub",
    "CME přehledy a prioritní notifikace novinek",
  ],
  comparisonNote:
    "490 Kč/měsíc (~5 880 Kč/rok) — srovnáno s ročním přístupem k specializovaným databázím. Roční plán 4 900 Kč ušetří 2 měsíce.",
  ctaHref: "/predplatne",
  ctaLabel: "Profesionální předplatné 490 Kč/měs.",
} as const;

export const V271_SCIENTIFIC_RIGOR = {
  headline: "Evidence-based standard",
  description:
    "Každý souhrn studie obsahuje typ práce (RCT, meta-analýza), metodiku, primární endpointy a ověřitelné identifikátory DOI nebo PubMed ID (PMID).",
  identifiers: ["DOI", "PMID", "CONSORT / PRISMA"],
} as const;
