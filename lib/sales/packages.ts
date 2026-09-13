import type { SalesPackage, SalesPackageId } from "@/lib/sales/types";

export type { SalesPackageId };

export const SALES_PACKAGES: SalesPackage[] = [
  {
    id: "start",
    name: "Start",
    tagline: "Vstupní paušál — adresář partnerů a předání poptávek.",
    priceCzkMonth: 4900,
    audience: "both",
    placements: [],
    newsletter: null,
    directory: true,
    dedicatedLanding: true,
    inquiryForward: true,
    slaHours: 72,
    monthlyReport: false,
    sponsoredMention: false,
    features: [
      "Veřejný profil v adresáři /partneri",
      "Vlastní landing s formulářem poptávky",
      "Předání poptávek e-mailem (SLA 72 h)",
      "Označená inzerce dle zákona o reklamě",
      "Elektronická faktura každý měsíc",
    ],
  },
  {
    id: "visible",
    name: "Viditelnost",
    tagline: "Profil + rotace v odborné a čtenářské sekci.",
    priceCzkMonth: 9900,
    audience: "both",
    placements: ["article_sidebar"],
    newsletter: null,
    directory: true,
    dedicatedLanding: true,
    inquiryForward: true,
    slaHours: 48,
    monthlyReport: false,
    sponsoredMention: false,
    features: [
      "Vše ze Start",
      "Rotace v postranním panelu článků",
      "Předání poptávek do 48 hodin",
      "Označení Partner / Inzerce",
    ],
  },
  {
    id: "magazine",
    name: "Magazín",
    tagline: "Měsíční paušál s bannerem a newsletterem.",
    priceCzkMonth: 19900,
    highlighted: true,
    audience: "public",
    placements: ["article_sidebar", "homepage_mid"],
    newsletter: "footer",
    directory: true,
    dedicatedLanding: true,
    inquiryForward: true,
    slaHours: 24,
    monthlyReport: true,
    sponsoredMention: false,
    features: [
      "Vše z Viditelnost",
      "Homepage mid banner (ViaLongeVita)",
      "Patička newsletteru",
      "Měsíční report zobrazení, kliků a poptávek",
      "SLA poptávek 24 hodin",
    ],
  },
  {
    id: "clinical",
    name: "Klinický",
    tagline: "Prioritní plochy + odborná audience.",
    priceCzkMonth: 39900,
    audience: "both",
    placements: ["homepage_top", "homepage_mid", "article_inline", "article_sidebar"],
    newsletter: "mid",
    directory: true,
    dedicatedLanding: true,
    inquiryForward: true,
    slaHours: 12,
    monthlyReport: true,
    sponsoredMention: true,
    features: [
      "Vše z Magazín",
      "Homepage top rotace",
      "Inline plocha v článcích",
      "Střed newsletteru",
      "Sponzorovaná zmínka (označená)",
      "SLA poptávek 12 hodin",
    ],
  },
  {
    id: "partner",
    name: "Partner",
    tagline: "Nejvyšší paušál — maximální splnění objednávky.",
    priceCzkMonth: 69900,
    audience: "both",
    placements: [
      "homepage_top",
      "homepage_mid",
      "article_inline",
      "article_sidebar",
      "digital_health_top",
    ],
    newsletter: "header",
    directory: true,
    dedicatedLanding: true,
    inquiryForward: true,
    slaHours: 8,
    monthlyReport: true,
    sponsoredMention: true,
    features: [
      "Vše z Klinický",
      "Hlavička newsletteru",
      "Plocha digitální zdraví",
      "Prioritní splnění poptávek (SLA 8 h)",
      "Dedikovaný účetní dohled v admin dashboardu",
    ],
  },
];

export function salesPackageById(id: string | null | undefined): SalesPackage | null {
  if (!id) return null;
  return SALES_PACKAGES.find((row) => row.id === id) ?? null;
}

export function isSalesPackageId(id: string): id is SalesPackageId {
  return SALES_PACKAGES.some((row) => row.id === id);
}

export function formatSalesCzk(amount: number): string {
  return `${Math.round(amount).toLocaleString("cs-CZ")} Kč`;
}

export function packagePlacementLabel(placement: string): string {
  const map: Record<string, string> = {
    homepage_top: "Homepage — horní banner",
    homepage_mid: "Homepage — střed",
    article_sidebar: "Články — postranní panel",
    article_inline: "Články — v textu",
    digital_health_top: "Digitální zdraví — horní plocha",
  };
  return map[placement] ?? placement;
}
