import {
  convertCzkToCharge,
  formatChargeAmount,
  paymentTiersForUser,
  type ChargeAmount,
} from "@/lib/i18n/payment-currency";
import { intlLocaleFor } from "@/lib/i18n/format-date";

/** ViaLongeVita editorial / magazine Plus — list prices stay CZK. */
export const EDITORIAL_MONTHLY_CZK = 25;
export const EDITORIAL_ANNUAL_CZK = 250;

/** Fixed majors abroad so the desk is €1 / $1 / £1, not live FX. */
export const EDITORIAL_EUR_MONTHLY_MAJOR = 1;
export const EDITORIAL_USD_MONTHLY_MAJOR = 1;
export const EDITORIAL_GBP_MONTHLY_MAJOR = 1;
export const EDITORIAL_EUR_ANNUAL_MAJOR = 10;
export const EDITORIAL_USD_ANNUAL_MAJOR = 10;
export const EDITORIAL_GBP_ANNUAL_MAJOR = 10;

function chargeFromMajor(
  major: number,
  currency: string,
  symbol: string,
  locale?: string | null
): ChargeAmount {
  const ccy = currency.toLowerCase();
  const zeroDecimal = ccy === "jpy" || ccy === "krw" || ccy === "vnd" || ccy === "huf" || ccy === "idr";
  const unitAmount = zeroDecimal ? Math.max(1, Math.round(major)) : Math.max(1, Math.round(major * 100));
  return {
    currency: ccy,
    symbol,
    unitAmount,
    major: zeroDecimal ? unitAmount : unitAmount / 100,
    formatted: formatChargeAmount(unitAmount, ccy, locale, symbol),
  };
}

function editorialCharge(
  locale: string | null | undefined,
  region: string | null | undefined,
  czk: number,
  eur: number,
  usd: number,
  gbp: number
): ChargeAmount {
  const tiers = paymentTiersForUser(locale, region);
  const ccy = tiers.currency.toLowerCase();
  if (ccy === "czk") return convertCzkToCharge(czk, locale, region);
  if (ccy === "eur") return chargeFromMajor(eur, "eur", "€", locale);
  if (ccy === "usd") return chargeFromMajor(usd, "usd", "$", locale);
  if (ccy === "gbp") return chargeFromMajor(gbp, "gbp", "£", locale);
  return convertCzkToCharge(czk, locale, region);
}

/** Banner / headline — whole majors so “jen za 25 Kč / 1 €” stays a small figure. */
export function editorialMonthlyBannerPrice(
  locale?: string | null,
  region?: string | null
): string {
  const charge = editorialMonthlyCharge(locale, region);
  try {
    return new Intl.NumberFormat(intlLocaleFor(locale), {
      style: "currency",
      currency: charge.currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(charge.major);
  } catch {
    return charge.formatted;
  }
}

/** Editorial month — 25 Kč on /cs, €1 / $1 / £1 abroad. */
export function editorialMonthlyCharge(
  locale?: string | null,
  region?: string | null
): ChargeAmount {
  return editorialCharge(
    locale,
    region,
    EDITORIAL_MONTHLY_CZK,
    EDITORIAL_EUR_MONTHLY_MAJOR,
    EDITORIAL_USD_MONTHLY_MAJOR,
    EDITORIAL_GBP_MONTHLY_MAJOR
  );
}

/** Editorial year — 250 Kč on /cs, €10 / $10 / £10 abroad. */
export function editorialAnnualCharge(
  locale?: string | null,
  region?: string | null
): ChargeAmount {
  return editorialCharge(
    locale,
    region,
    EDITORIAL_ANNUAL_CZK,
    EDITORIAL_EUR_ANNUAL_MAJOR,
    EDITORIAL_USD_ANNUAL_MAJOR,
    EDITORIAL_GBP_ANNUAL_MAJOR
  );
}
