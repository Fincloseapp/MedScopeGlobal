import type { Metadata } from "next";
import { DokAppShell } from "@/components/lekari/dok-app/dok-app-shell";
import { MEDIKTOR_APP } from "@/lib/apps/catalog";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

export const metadata: Metadata = {
  title: MEDIKTOR.pwaName,
  description: MEDIKTOR.seoDescription,
  manifest: MEDIKTOR_APP.manifest,
  icons: {
    icon: [
      { url: MEDIKTOR.assets.icon192, sizes: "192x192", type: "image/png" },
      { url: MEDIKTOR.assets.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: MEDIKTOR.assets.appleTouch, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: MEDIKTOR.pwaShortName,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": MEDIKTOR.pwaShortName,
    "theme-color": "#005B96",
  },
  themeColor: "#005B96",
};

export default function MediktorAppPage() {
  return <DokAppShell />;
}
