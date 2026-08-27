import type { Metadata } from "next";
import Link from "next/link";
import { HomepageAds } from "@/components/home/homepage-ads";
import { V272AcademyHomeSections } from "@/components/v271/academy-home-sections";
import {
  V271B2bBlock,
  V272WhyTrustBlock,
} from "@/components/v271/homepage-sections";
import { PortalHome } from "@/components/v271/portal-home";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { medicalWebPageJsonLd, webSiteJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { APP_PRODUCTS, appSeoDescription } from "@/lib/apps/catalog";
import { buildGlobalHreflang } from "@/lib/ecosystem/seo";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getHomepageCachedData } from "@/lib/v22/homepage-cache";
import { getPortalPhilosophy } from "@/lib/v271/portal";
import { getHomepageDescription, getHomepageTitle, MAGAZINE } from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { publicationJsonLd } from "@/lib/seo/json-ld";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getServerLocale()) as GlobalLocaleCode;
  const { canonical, languages } = buildGlobalHreflang("/", locale);
  const title = getHomepageTitle(locale);
  const description = getHomepageDescription(locale);

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: locale.startsWith("en") ? "en_US" : "cs_CZ",
      siteName: `${MAGAZINE.name} · ${MAGAZINE.platform}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const philosophy = getPortalPhilosophy(locale);
  const { articles, topAds, midAds, bottomAds } = await getHomepageCachedData();

  const homeLd = medicalWebPageJsonLd({
    title: philosophy.claim,
    description: philosophy.subtitle,
    path: "/",
  });

  return (
    <div className="v271-home bg-[#f3f7fb]">
      <JsonLdScript data={webSiteJsonLd()} />
      <JsonLdScript data={publicationJsonLd()} />
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

      {/* Story: VitaScope hero → magazín+tips → apps → VIP → support (PortalHome) */}
      <PortalHome articles={articles} philosophy={philosophy} />
      <HomepageAds topAds={topAds} midAds={midAds} bottomAds={bottomAds} />
      <V272WhyTrustBlock />
      {/* Full multi-tier ceník on /predplatne — VIP already clear in PortalHome */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">Ceník aplikací</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#021d33]">
              Veřejnost 99 · Student 149 · OrdiZapis 390 · Lékař 490 Kč
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              VIP longevity (149 Kč) je samostatná nabídka výše. Kompletní srovnání tarifů na jedné stránce.
            </p>
          </div>
          <Link
            href="/predplatne"
            className="inline-flex shrink-0 rounded-lg bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            Otevřít ceník →
          </Link>
        </div>
      </section>
      <V272AcademyHomeSections />
      <V271B2bBlock />

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <p className="border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
          {MAGAZINE.name} na {SITE.name} je vzdělávací magazín zdraví a dlouhověkosti — není přijímací
          komise ani oficiální učebnice LF. Obsah nenahrazuje individuální lékařskou radu.
        </p>
      </section>
    </div>
  );
}
