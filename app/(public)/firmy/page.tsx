import { V271HubPageView } from "@/components/v271/hub-page";
import { V271_FIRMY_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

export async function generateMetadata() {
  return buildV271HubMetadata("firmy", V271_FIRMY_PAGES.index);
}

export default function FirmyPage() {
  return (
    <V271HubPageView
      page={V271_FIRMY_PAGES.index}
      sectionLabel="Firmy"
      homeHref="/firmy"
    />
  );
}
