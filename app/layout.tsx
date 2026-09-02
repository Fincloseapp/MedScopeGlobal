import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import { Providers } from "@/components/providers";
import { PublicEnvScript } from "@/components/system/public-env-script";
import { AdSenseHead } from "@/components/monetization/adsense-head";
import { GoogleTagHead } from "@/components/analytics/google-tag-head";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildGlobalHreflang } from "@/lib/ecosystem/seo";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { MAGAZINE, getSiteDefaultTitle } from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { getSiteUrl } from "@/lib/config/site-url";
import { ADSENSE_PUBLISHER_ID } from "@/lib/monetization/adsense";
import { organizationJsonLd, newsletterJsonLd, publicationJsonLd } from "@/lib/seo/json-ld";
import { OG_ALTERNATE_LOCALES } from "@/lib/seo/metadata";
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
const rootHreflang = buildGlobalHreflang("/", "cs");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: getSiteDefaultTitle("en-US"),
    template: `%s | ${MAGAZINE.name}`,
  },
  description: SITE.description,
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
    locale: "en_US",
    alternateLocale: OG_ALTERNATE_LOCALES.filter((l) => l !== "en_US"),
    siteName: `${MAGAZINE.name} · ${SITE.name}`,
    url: siteUrl,
    title: getSiteDefaultTitle("en-US"),
    description: SITE.description,
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
    canonical: rootHreflang.canonical,
    languages: rootHreflang.languages,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const htmlLang = locale.startsWith("en") ? "en" : locale.split("-")[0];

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
