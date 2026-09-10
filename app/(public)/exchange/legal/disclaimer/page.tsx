import { ExchangeLegalView } from "@/components/exchange/legal-view";
import { getExchangeLegalDoc } from "@/lib/exchange/legal-docs";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const doc = getExchangeLegalDoc("disclaimer", locale);
  return buildLocalizedPageMetadata({
    title: doc.title,
    description: doc.sections[0]?.body[0] ?? doc.title,
    path: "/exchange/legal/disclaimer",
    locale,
  });
}

export default async function ExchangeDisclaimerPage() {
  const locale = await getServerLocale();
  return <ExchangeLegalView locale={locale} doc={getExchangeLegalDoc("disclaimer", locale)} />;
}
