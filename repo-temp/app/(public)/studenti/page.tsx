import { V271HubPageView } from "@/components/v271/hub-page";
import { V271_STUDENTI_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

export async function generateMetadata() {
  return buildV271HubMetadata("studenti", V271_STUDENTI_PAGES.index);
}

export default function StudentiHubPage() {
  return (
    <V271HubPageView
      page={V271_STUDENTI_PAGES.index}
      sectionLabel="Studenti"
      homeHref="/studenti"
    />
  );
}
