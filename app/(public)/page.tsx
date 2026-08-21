import type { Metadata } from "next";
import { HomepageAds } from "@/components/home/homepage-ads";
import { V272AcademyHomeSections } from "@/components/v271/academy-home-sections";
import {
  V271B2bBlock,
  V272SubscriptionPlansBlock,
  V272WhyTrustBlock,
} from "@/components/v271/homepage-sections";
import { PortalHome } from "@/components/v271/portal-home";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { medicalWebPageJsonLd, webSiteJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { APP_PRODUCTS, appSeoDescription } from "@/lib/apps/catalog";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { getHomepageCachedData } from "@/lib/v22/homepage-cache";
import { PORTAL_PHILOSOPHY } from "@/lib/v271/portal";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "MedScopeGlobal — zdravotnictví na jednom místě",
    description:
      "Hledejte, otevřete MeDipacient, MeDiprep nebo MeDiktor a čtěte redakci. Evidence-based medicína v češtině. 14 dní zdarma.",
    path: "/",
  });
}

export default async function HomePage() {
  const { articles, topAds, midAds, bottomAds } = await getHomepageCachedData();

  const homeLd = medicalWebPageJsonLd({
    title: PORTAL_PHILOSOPHY.claim,
    description: PORTAL_PHILOSOPHY.subtitle,
    path: "/",
  });

  return (
    <div className="v271-home bg-[#e8eef3]">
      <JsonLdScript data={webSiteJsonLd()} />
      <JsonLdScript data={homeLd} />
      {APP_PRODUCTS.map((app) => (
        <JsonLdScript
          key={app.id}
          data={softwareApplicationJsonLd({
            name: app.shortName,
            description: appSeoDescription(app),
            url: app.marketingPath,
            installUrl: app.downloadPath,
            category: app.id === "mediprep" ? "EducationalApplication" : "HealthApplication",
          })}
        />
      ))}

      <PortalHome articles={articles} />
      <HomepageAds topAds={topAds} midAds={midAds} bottomAds={bottomAds} />
      <V272AcademyHomeSections />
      <V272WhyTrustBlock />
      <V272SubscriptionPlansBlock />
      <V271B2bBlock />

      <section className="mx-auto max-w-7xl px-3 pb-8 sm:px-4">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          MedScopeGlobal je vzdělávací magazín — není přijímací komise ani oficiální učebnice LF. Obsah
          nenahrazuje individuální lékařskou radu.
        </p>
      </section>
    </div>
  );
}
