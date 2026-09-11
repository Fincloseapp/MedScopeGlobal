import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeListingForm } from "@/components/exchange/listing-form";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.listingNewTitle,
    description: copy.listingNewLead,
    path: "/exchange/listing/new",
    locale,
  });
}

export default async function ExchangeNewListingPage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.listingNewTitle} description={copy.listingNewLead}>
      <ExchangeListingForm locale={locale} copy={copy} />
    </ModulePageShell>
  );
}
