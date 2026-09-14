import type { Metadata } from "next";
import { MarketplaceDesk } from "@/components/marketplace/marketplace-desk";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { loadMarketplaceBoard } from "@/lib/marketplace/board";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/exchange",
    locale,
  });
}

export default async function ExchangePage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const board = await loadMarketplaceBoard(locale);
  return (
    <MarketplaceDesk
      board={board}
      locale={locale}
      title={copy.title}
      lead={copy.leadBefore}
      firmyHref={localizePublicHref("/firmy", locale)}
      firmyLinkLabel={copy.firmyLinkLabel}
    />
  );
}
