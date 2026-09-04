import { AccreditedCmeOverview } from "@/components/academy/b2b/accredited-cme-overview";
import { OrdiZapisPromoBanner } from "@/components/lekari/ordizapis-promo-banner";
import { V271HubPageView } from "@/components/v271/hub-page";
import {
  V271LekariCredibilitySection,
  V271PhysicianTierCard,
} from "@/components/v271/lekari-landing-extras";
import { V271_LEKARI_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { isCzechSurface } from "@/lib/i18n/surface-copy";

export const revalidate = 120;

export async function generateMetadata() {
  return await buildV271HubMetadata("lekari", V271_LEKARI_PAGES.index);
}

export default async function LekariHubPage() {
  const locale = await getServerLocale();
  const czech = isCzechSurface(locale);
  return (
    <V271HubPageView
      page={V271_LEKARI_PAGES.index}
      section="lekari"
      afterLinks={
        <>
          <div className="mb-8">
            <OrdiZapisPromoBanner variant="hub" />
          </div>
          {czech ? (
            <div className="mb-10">
              <AccreditedCmeOverview variant="panel" />
            </div>
          ) : null}
          <V271LekariCredibilitySection />
          <V271PhysicianTierCard />
        </>
      }
    />
  );
}
