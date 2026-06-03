import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import { Providers } from "@/components/providers";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { HREFLANG_LOCALES } from "@/lib/seo/metadata";
import { JsonLdScript } from "@/components/seo/json-ld-script";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MedScopeGlobal | Odborný medicínský magazín",
    template: "%s | MedScopeGlobal",
  },
  description:
    "Český odborný magazín pro laiky, studenty medicíny, lékaře a výzkumníky — klinická praxe, výzkum a větev medicíny.",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    alternateLocale: ["en_US"],
    siteName: "MedScopeGlobal",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@MedScopeGlobal",
  },
  alternates: {
    canonical: siteUrl,
    languages: Object.fromEntries(
      HREFLANG_LOCALES.map((l) => [l.hreflang, `${siteUrl}?lang=${l.code}`])
    ),
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
    <html lang={htmlLang} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${display.variable} min-h-screen font-sans antialiased`}
      >
        <JsonLdScript data={organizationJsonLd()} />
        <JsonLdScript data={newsletterJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
