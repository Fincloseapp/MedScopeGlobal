import { V271HubPageView } from "@/components/v271/hub-page";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { V271_FIRMY_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

export async function generateMetadata() {
  return await buildV271HubMetadata("firmy", V271_FIRMY_PAGES.index);
}

export default async function FirmyHubPage() {
  const locale = await getServerLocale();
  return (
    <V271HubPageView
      page={V271_FIRMY_PAGES.index}
      section="firmy"
      afterLinks={<V271B2BPricingTable compact locale={locale} />}
    />
  );
}
