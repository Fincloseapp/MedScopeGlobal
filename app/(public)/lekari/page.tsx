import { V271HubPageView } from "@/components/v271/hub-page";
import {
  V271LekariCredibilitySection,
  V271PhysicianTierCard,
} from "@/components/v271/lekari-landing-extras";
import { V271_LEKARI_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

export async function generateMetadata() {
  return buildV271HubMetadata("lekari", V271_LEKARI_PAGES.index);
}

export default function LekariHubPage() {
  return (
    <V271HubPageView
      page={V271_LEKARI_PAGES.index}
      sectionLabel="Lékaři"
      homeHref="/lekari"
      afterLinks={
        <>
          <V271LekariCredibilitySection />
          <V271PhysicianTierCard />
        </>
      }
    />
  );
}
