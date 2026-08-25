import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import { Providers } from "@/components/providers";
import { PublicEnvScript } from "@/components/system/public-env-script";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildGlobalHreflang } from "@/lib/ecosystem/seo";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SITE } from "@/lib/config/site";
import { getSiteUrl } from "@/lib/config/site-url";
import { organizationJsonLd, newsletterJsonLd } from "@/lib/seo/json-ld";
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
    default: "MedScopeGlobal | Odborný medicínský magazín",
    template: "%s | MedScopeGlobal",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "medicína",
    "zdravotnictví",
    "studium medicíny",
    "klinická praxe",
    "výzkum",
    "evidence-based medicine",
    "MedScopeGlobal",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    alternateLocale: ["en_US"],
    siteName: SITE.name,
    url: siteUrl,
    title: "MedScopeGlobal | Odborný medicínský magazín",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@MedScopeGlobal",
    site: "@MedScopeGlobal",
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
      <body
        className={`${inter.variable} ${display.variable} min-h-screen font-sans antialiased`}
      >
        <PublicEnvScript />
        <JsonLdScript data={organizationJsonLd()} />
        <JsonLdScript data={newsletterJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
