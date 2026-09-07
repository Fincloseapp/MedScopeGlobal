import { editorialAnnualCharge, editorialMonthlyCharge } from "@/lib/editorial/pricing";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

export function editorialPayLabels(locale?: string | null): { year: string; month: string } {
  const monthly = editorialMonthlyCharge(locale);
  const annual = editorialAnnualCharge(locale);
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "de") {
    return { year: `Jahresabo ${annual.formatted}`, month: `Monatlich ${monthly.formatted}` };
  }
  if (primary === "fr") {
    return { year: `Annuel ${annual.formatted}`, month: `Mensuel ${monthly.formatted}` };
  }
  if (primary !== "cs") {
    return { year: `Yearly ${annual.formatted}`, month: `Monthly ${monthly.formatted}` };
  }
  return { year: `Ročně ${annual.formatted}`, month: `Měsíčně ${monthly.formatted}` };
}

/** Copy when Stripe checkout is abandoned — no fake discount. */
export function editorialCanceledCopy(locale?: string | null): { title: string; body: string } {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "de") {
    return {
      title: "Zahlung nicht abgeschlossen",
      body: "Die Redaktion öffnet sich erst nach der Zahlung. Jahresabo zuerst — jederzeit kündbar.",
    };
  }
  if (primary === "fr") {
    return {
      title: "Paiement non terminé",
      body: "La rédaction s’ouvre seulement après le paiement. L’abonnement annuel d’abord — résiliable à tout moment.",
    };
  }
  if (primary !== "cs") {
    return {
      title: "Payment not completed",
      body: "Editorial opens after you pay. Yearly first — cancel anytime.",
    };
  }
  return {
    title: "Platba se nedokončila",
    body: "Redakce se otevře až po zaplacení. Nejdřív roční přístup — zrušíte kdykoli.",
  };
}
