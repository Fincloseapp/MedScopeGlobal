import type { Metadata } from "next";
import { DokAppShell } from "@/components/lekari/dok-app/dok-app-shell";
import { ORDIZAPIS } from "@/lib/lekari/dokumentace/branding";

export const metadata: Metadata = {
  title: ORDIZAPIS.pwaName,
  description: ORDIZAPIS.seoDescription,
  manifest: "/dokumentace-manifest.json",
  icons: {
    icon: [
      { url: ORDIZAPIS.assets.icon192, sizes: "192x192", type: "image/png" },
      { url: ORDIZAPIS.assets.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: ORDIZAPIS.assets.appleTouch, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: ORDIZAPIS.pwaShortName,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": ORDIZAPIS.pwaShortName,
    "theme-color": "#005B96",
  },
  themeColor: "#005B96",
};

export default function DokumentaceAppPage() {
  return <DokAppShell />;
}
