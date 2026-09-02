import type { Metadata } from "next";
import { HomepageAds } from "@/components/home/homepage-ads";
import { V272AcademyHomeSections } from "@/components/v271/academy-home-sections";
import {
  V271B2bBlock,
  V272WhyTrustBlock,
} from "@/components/v271/homepage-sections";
import { HomepageLongevityStrip } from "@/components/v271/homepage-longevity-strip";
import { PortalHome } from "@/components/v271/portal-home";
import { HomepageAffiliateShelf } from "@/components/monetization/affiliate-box";
import { HomepageRevenueMix } from "@/components/monetization/homepage-revenue-mix";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { medicalWebPageJsonLd, webSiteJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { APP_PRODUCTS, appSeoDescription } from "@/lib/apps/catalog";
import { buildGlobalHreflang } from "@/lib/ecosystem/seo";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { localeToPathSegment } from "@/lib/i18n/locale-path";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getHomepageCachedData } from "@/lib/v22/homepage-cache";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getPortalChrome, getPortalPhilosophy } from "@/lib/v271/portal";
import { isCzechSurface, getSurfaceCopy } from "@/lib/i18n/surface-copy";
import {
  getHomepageDescription,
  getHomepageTitle,
  getOgLocale,
  MAGAZINE,
} from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { publicationJsonLd } from "@/lib/seo/json-ld";

export const revalidate = 45;

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getServerLocale()) as GlobalLocaleCode;
  const { canonical, languages } = buildGlobalHreflang("/", locale);
  const title = getHomepageTitle(locale);
  const description = getHomepageDescription(locale);
  const feed = `${SITE.url}/feed-${localeToPathSegment(locale)}.xml`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
      types: { "application/rss+xml": feed },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: getOgLocale(locale),
      siteName: `${MAGAZINE.name} · ${MAGAZINE.platform}`,
      type: "website",
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
  const chrome = getPortalChrome(locale);
  const [{ articles, topAds, midAds, bottomAds }, { isVip }] = await Promise.all([
    getHomepageCachedData(locale),
    getReaderContext(),
  ]);

  const homeLd = medicalWebPageJsonLd({
    title: philosophy.claim,
    description: philosophy.subtitle,
    path: `/${localeToPathSegment(locale)}`,
    inLanguage: locale === "cs" ? "cs-CZ" : String(locale),
    locale,
  });

  return (
    <div className="v271-home bg-[#f3f7fb]">
      <JsonLdScript data={webSiteJsonLd(locale)} />
      <JsonLdScript data={publicationJsonLd()} />
      <JsonLdScript data={homeLd} />
      {APP_PRODUCTS.filter((app) => isCzechSurface(locale) || app.id !== "mediprep").map((app) => (
        <JsonLdScript
          key={app.id}
          data={softwareApplicationJsonLd({
            name: app.shortName,
            description: isCzechSurface(locale)
              ? appSeoDescription(app)
              : `${app.shortName}: ${getSurfaceCopy(locale).appTaglines[app.id]}`,
            url: app.marketingPath,
            installUrl: app.downloadPath,
            category: app.id === "mediprep" ? "EducationalApplication" : "HealthApplication",
          })}
        />
      ))}

      {/* Story: ViaLongeVita hero → magazín → apps/VIP → CTA (PortalHome). Pricing lives on /predplatne — not duplicated under the portal. */}
      <PortalHome articles={articles} copy={philosophy} locale={locale} />
      <HomepageLongevityStrip articles={articles} locale={locale} />
      <HomepageAffiliateShelf locale={locale} />
      <HomepageAds topAds={topAds} midAds={midAds} bottomAds={bottomAds} />
      <HomepageRevenueMix locale={locale} isVip={isVip} />
      <V272WhyTrustBlock locale={locale} />
      {isCzechSurface(locale) ? <V272AcademyHomeSections /> : null}
      <V271B2bBlock locale={locale} />

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <p className="border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
          {chrome.footerLegal}
        </p>
      </section>
    </div>
  );
}
