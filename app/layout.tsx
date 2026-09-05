import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import { Providers } from "@/components/providers";
import { PublicEnvScript } from "@/components/system/public-env-script";
import { AdSenseHead } from "@/components/monetization/adsense-head";
import { GoogleTagHead } from "@/components/analytics/google-tag-head";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildGlobalHreflang } from "@/lib/ecosystem/seo";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { MAGAZINE, getHomepageDescription, getOgLocale, getSiteDefaultTitle } from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { getSiteUrl } from "@/lib/config/site-url";
import { localeToPathSegment } from "@/lib/i18n/locale-path";
import { ADSENSE_PUBLISHER_ID } from "@/lib/monetization/adsense";
import { organizationJsonLd, newsletterJsonLd, publicationJsonLd } from "@/lib/seo/json-ld";
import { OG_ALTERNATE_LOCALES } from "@/lib/seo/metadata";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const display = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getServerLocale()) as GlobalLocaleCode;
  const hreflang = buildGlobalHreflang("/", locale);
  const feed = `${siteUrl}/feed-${localeToPathSegment(locale)}.xml`;
  const title = getSiteDefaultTitle(locale);
  const description = getHomepageDescription(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${MAGAZINE.name}`,
    },
    description,
    applicationName: SITE.name,
    keywords: [
      "ViaLongeVita",
      "VitaScope",
      "longevity",
      "wellness",
      "healthy lifestyle",
      "health magazine",
      "MedScopeGlobal",
      "MediFlow",
      "medicína",
      "zdravotnictví",
      "dlouhověkost",
      "evidence-based medicine",
    ],
    authors: [{ name: MAGAZINE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: MAGAZINE.name,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: "website",
      locale: getOgLocale(locale),
      alternateLocale: OG_ALTERNATE_LOCALES.filter((item) => item !== getOgLocale(locale)),
      siteName: `${MAGAZINE.name} · ${SITE.name}`,
      url: hreflang.canonical,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@MedScopeGlobal",
      site: "@MedScopeGlobal",
    },
    other: {
      "google-adsense-account": ADSENSE_PUBLISHER_ID,
    },
    alternates: {
      canonical: hreflang.canonical,
      languages: hreflang.languages,
      types: {
        "application/rss+xml": feed,
        "text/plain": `${siteUrl}/llms.txt`,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const htmlLang = locale.startsWith("en") ? "en" : locale.split("-")[0];
  const feedHref = `${siteUrl}/feed-${localeToPathSegment(locale)}.xml`;

  return (
    <html lang={htmlLang} suppressHydrationWarning data-site="medscopeglobal">
      <head>
        {/* OpenNext/esbuild may inject __name() into next-themes' inline boot script.
            Define a no-op helper before that script runs so theme boot does not throw. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'typeof __name!="function"&&(globalThis.__name=function(t,n){try{Object.defineProperty(t,"name",{value:n,configurable:!0})}catch(e){}return t});',
          }}
        />
        <link rel="alternate" type="application/rss+xml" title={MAGAZINE.name} href={feedHref} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="describedby" title="llms.txt" href={`${siteUrl}/llms.txt`} />
        <GoogleTagHead />
        <AdSenseHead />
      </head>
      <body
        className={`${inter.variable} ${display.variable} min-h-screen font-sans antialiased`}
      >
        <PublicEnvScript />
        <JsonLdScript data={organizationJsonLd(locale)} />
        <JsonLdScript data={publicationJsonLd()} />
        <JsonLdScript data={newsletterJsonLd()} />
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
