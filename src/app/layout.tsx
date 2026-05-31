import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: { default: "MedScopeGlobal", template: "%s | MedScopeGlobal" }, description: siteConfig.description, applicationName: "MedScopeGlobal", alternates: { canonical: "/" }, openGraph: { type: "website", locale: siteConfig.locale, url: siteConfig.url, title: "MedScopeGlobal", description: siteConfig.description, siteName: "MedScopeGlobal", emails: [siteConfig.contactEmail, siteConfig.adsEmail] }, robots: { index: true, follow: true } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#087f8c" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" data-scroll-behavior="smooth">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=['en','cs','de','pl'];var p=location.pathname.split('/').filter(Boolean)[0];var l=s.includes(p)?p:(navigator.languages||[navigator.language||'en']).map(function(x){return String(x).split('-')[0].toLowerCase()}).find(function(x){return s.includes(x)})||'en';localStorage.setItem('language',l);document.documentElement.lang=l;}catch(e){}"
          }}
        />
        <a className="skip-link" href="#main-content">
          Přeskočit na obsah
        </a>
        <JsonLd data={organizationJsonLd()} />
        <Header />
        <div id="main-content">{children}</div>
        <Footer />
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
      </body>
    </html>
  );
}
