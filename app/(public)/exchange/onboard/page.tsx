import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeOnboardForm } from "@/components/exchange/onboard-form";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.onboardTitle,
    description: copy.onboardLead,
    path: "/exchange/onboard",
    locale,
  });
}

export default async function ExchangeOnboardPage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.onboardTitle} description={copy.onboardLead}>
      <ExchangeOnboardForm locale={locale} copy={copy} />
    </ModulePageShell>
  );
}
