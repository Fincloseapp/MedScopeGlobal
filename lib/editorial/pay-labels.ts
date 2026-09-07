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
