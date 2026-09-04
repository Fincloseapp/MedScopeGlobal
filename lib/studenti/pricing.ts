import {
  convertCzkToCharge,
  formatChargeAmount,
  paymentTiersForUser,
  type ChargeAmount,
} from "@/lib/i18n/payment-currency";

/** One free MeDiprep / club test — not a 14-day trial. */
export const STUDENT_FREE_TESTS = 1;
export const STUDENT_INTRO_CZK = 89;
export const STUDENT_MONTHLY_CZK = 149;
export const STUDENT_ANNUAL_CZK = 1490;

/** Round list prices on euro editions — marketing, not live FX. */
export const STUDENT_EUR_INTRO_MAJOR = 6;
export const STUDENT_EUR_MONTHLY_MAJOR = 10;

export const STUDENT_PLAN_HREF = "/predplatne#student";
export const STUDENT_GIFT_HREF = "/studenti/darkove";
export const STUDENT_DASHBOARD_HREF = "/studenti";

export const MEDIPREP_FREE_TEST_COOKIE = "ms_mediprep_free_used";

function chargeFromMajor(
  major: number,
  currency: string,
  symbol: string,
  locale?: string | null
): ChargeAmount {
  const ccy = currency.toLowerCase();
  const unitAmount = ccy === "jpy" || ccy === "krw" || ccy === "vnd" || ccy === "huf" || ccy === "idr"
    ? Math.max(1, Math.round(major))
    : Math.max(1, Math.round(major * 100));
  return {
    currency: ccy,
    symbol,
    unitAmount,
    major: ccy === "jpy" || ccy === "krw" || ccy === "vnd" || ccy === "huf" || ccy === "idr" ? unitAmount : unitAmount / 100,
    formatted: formatChargeAmount(unitAmount, ccy, locale, symbol),
  };
}

/** Ongoing Student LF month — 149 Kč on /cs, €10 on euro editions. */
export function studentMonthlyCharge(
  locale?: string | null,
  region?: string | null
): ChargeAmount {
  const tiers = paymentTiersForUser(locale, region);
  const ccy = tiers.currency.toLowerCase();
  if (ccy === "czk") return convertCzkToCharge(STUDENT_MONTHLY_CZK, locale, region);
  if (ccy === "eur") return chargeFromMajor(STUDENT_EUR_MONTHLY_MAJOR, "eur", "€", locale);
  if (ccy === "gbp") return chargeFromMajor(9, "gbp", "£", locale);
  if (ccy === "usd") return chargeFromMajor(11, "usd", "$", locale);
  return convertCzkToCharge(250, locale, region);
}

/** First paid month — 89 Kč on /cs, €6 on euro editions. */
export function studentIntroCharge(
  locale?: string | null,
  region?: string | null
): ChargeAmount {
  const tiers = paymentTiersForUser(locale, region);
  const ccy = tiers.currency.toLowerCase();
  if (ccy === "czk") return convertCzkToCharge(STUDENT_INTRO_CZK, locale, region);
  if (ccy === "eur") return chargeFromMajor(STUDENT_EUR_INTRO_MAJOR, "eur", "€", locale);
  if (ccy === "gbp") return chargeFromMajor(5, "gbp", "£", locale);
  if (ccy === "usd") return chargeFromMajor(7, "usd", "$", locale);
  return convertCzkToCharge(STUDENT_INTRO_CZK, locale, region);
}

export function studentPriceLine(locale?: string | null, region?: string | null): string {
  const intro = studentIntroCharge(locale, region).formatted;
  const monthly = studentMonthlyCharge(locale, region).formatted;
  const cs = (locale ?? "cs").toLowerCase().startsWith("cs");
  if (cs) {
    return `1 test zdarma · dnes ${intro} · další měsíc ${monthly} · zrušíte kdykoli`;
  }
  return `1 free test · today ${intro} · then ${monthly}/month · cancel anytime`;
}
