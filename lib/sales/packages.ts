import type { SalesBillingInterval, SalesPackage, SalesPackageId } from "@/lib/sales/types";

export type { SalesPackageId, SalesBillingInterval };

/**
 * Roční předplatné = 10 zaplacených měsíců (2 měsíce zdarma).
 * Start 450 Kč / měs. → 4 500 Kč / rok → 375 Kč / měs. při roční platbě.
 */
export const SALES_YEARLY_BILLED_MONTHS = 10;

export const SALES_PACKAGES: SalesPackage[] = [
  {
    id: "start",
    name: "Start",
    tagline: "Vstupní paušál — adresář partnerů a předání poptávek.",
    priceCzkMonth: 450,
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
      "Elektronická faktura",
    ],
  },
  {
    id: "visible",
    name: "Viditelnost",
    tagline: "Profil + rotace v odborné a čtenářské sekci.",
    priceCzkMonth: 890,
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
    tagline: "Paušál s bannerem a newsletterem — nejčastější volba.",
    priceCzkMonth: 1790,
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
    priceCzkMonth: 3490,
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
    priceCzkMonth: 5990,
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

export function salesEntryMonthlyCzk(): number {
  return SALES_PACKAGES[0]?.priceCzkMonth ?? 450;
}

export function salesYearlyCzk(monthlyCzk: number): number {
  return monthlyCzk * SALES_YEARLY_BILLED_MONTHS;
}

export function salesYearlyEffectiveMonthCzk(monthlyCzk: number): number {
  return Math.round(salesYearlyCzk(monthlyCzk) / 12);
}

export function salesChargeCzk(monthlyCzk: number, interval: SalesBillingInterval): number {
  return interval === "year" ? salesYearlyCzk(monthlyCzk) : monthlyCzk;
}

export function salesFromPriceLabel(): string {
  return `od ${formatSalesCzk(salesEntryMonthlyCzk())}`;
}

export function salesPriceListPlain(): string {
  const start = salesEntryMonthlyCzk();
  const ladder = SALES_PACKAGES.map((pkg) => `${pkg.name} ${formatSalesCzk(pkg.priceCzkMonth)}`).join(", ");
  return (
    `Měsíční paušál: ${ladder}. Roční předplatné je 10 měsíců (2 měsíce zdarma) — ` +
    `Start ${formatSalesCzk(salesYearlyCzk(start))} / rok, tedy ${formatSalesCzk(salesYearlyEffectiveMonthCzk(start))} / měs. ` +
    `Nejsme plátci DPH. Provizi z obchodu nebereme — platíte jen paušál za plochy a předání poptávek.`
  );
}

export function salesStripeLine(monthlyCzk: number, interval: SalesBillingInterval): {
  unitAmount: number;
  recurring: { interval: "month" | "year" };
  description: string;
} {
  if (interval === "year") {
    const year = salesYearlyCzk(monthlyCzk);
    const effective = salesYearlyEffectiveMonthCzk(monthlyCzk);
    return {
      unitAmount: Math.round(year * 100),
      recurring: { interval: "year" },
      description: `Roční paušál ${formatSalesCzk(year)} (2 měsíce zdarma, ${formatSalesCzk(effective)} / měs.)`,
    };
  }
  return {
    unitAmount: Math.round(monthlyCzk * 100),
    recurring: { interval: "month" },
    description: `Měsíční paušál ${formatSalesCzk(monthlyCzk)}`,
  };
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
