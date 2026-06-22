import { V271HubPageView } from "@/components/v271/hub-page";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { V271_FIRMY_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

export async function generateMetadata() {
  return buildV271HubMetadata("firmy", V271_FIRMY_PAGES.index);
}

export default function FirmyHubPage() {
  return (
    <V271HubPageView
      page={V271_FIRMY_PAGES.index}
      sectionLabel="Firmy"
      homeHref="/firmy"
      afterLinks={<V271B2BPricingTable compact />}
    />
  );
}
