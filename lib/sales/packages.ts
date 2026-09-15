import { convertCzkToCharge, formatCzkListPrice } from "@/lib/i18n/payment-currency";
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

/** Public price for the visitor's edition — CZK on /cs, EUR or USD elsewhere. */
export function formatSalesPrice(amountCzk: number, locale?: string | null): string {
  if (!locale || locale === "cs") return formatSalesCzk(amountCzk);
  return formatCzkListPrice(amountCzk, locale);
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

export function salesFromPriceLabel(locale?: string | null): string {
  const prefix = !locale || locale === "cs" ? "od" : "from";
  return `${prefix} ${formatSalesPrice(salesEntryMonthlyCzk(), locale)}`;
}

export function salesPriceListPlain(locale?: string | null): string {
  const start = salesEntryMonthlyCzk();
  const money = (amount: number) => formatSalesPrice(amount, locale);
  const ladder = SALES_PACKAGES.map((pkg) => `${pkg.name} ${money(pkg.priceCzkMonth)}`).join(", ");
  if (!locale || locale === "cs") {
    return (
      `Měsíční paušál: ${ladder}. Roční předplatné je 10 měsíců (2 měsíce zdarma) — ` +
      `Start ${money(salesYearlyCzk(start))} / rok, tedy ${money(salesYearlyEffectiveMonthCzk(start))} / měs. ` +
      `Nejsme plátci DPH. Provizi z obchodu nebereme — platíte jen paušál za plochy a předání poptávek.`
    );
  }
  return (
    `Monthly retainer: ${ladder}. Annual billing is 10 months (two months free) — ` +
    `Start ${money(salesYearlyCzk(start))} / year, ${money(salesYearlyEffectiveMonthCzk(start))} / month. ` +
    `We are not VAT-registered in Czechia. No trade commission — you pay only the retainer.`
  );
}

export function salesStripeLine(
  monthlyCzk: number,
  interval: SalesBillingInterval,
  locale?: string | null
): {
  unitAmount: number;
  currency: string;
  recurring: { interval: "month" | "year" };
  description: string;
} {
  const chargeCzk = interval === "year" ? salesYearlyCzk(monthlyCzk) : monthlyCzk;
  const charge = convertCzkToCharge(chargeCzk, locale);
  if (interval === "year") {
    const year = formatSalesPrice(salesYearlyCzk(monthlyCzk), locale);
    const effective = formatSalesPrice(salesYearlyEffectiveMonthCzk(monthlyCzk), locale);
    return {
      unitAmount: charge.unitAmount,
      currency: charge.currency,
      recurring: { interval: "year" },
      description:
        !locale || locale === "cs"
          ? `Roční paušál ${year} (2 měsíce zdarma, ${effective} / měs.)`
          : `Annual retainer ${year} (two months free, ${effective} / month)`,
    };
  }
  return {
    unitAmount: charge.unitAmount,
    currency: charge.currency,
    recurring: { interval: "month" },
    description:
      !locale || locale === "cs"
        ? `Měsíční paušál ${formatSalesPrice(monthlyCzk, locale)}`
        : `Monthly retainer ${formatSalesPrice(monthlyCzk, locale)}`,
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
