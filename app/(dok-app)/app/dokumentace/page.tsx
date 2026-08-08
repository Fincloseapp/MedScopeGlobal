import type { Metadata } from "next";
import { DokAppShell } from "@/components/lekari/dok-app/dok-app-shell";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

export const metadata: Metadata = {
  title: MEDIKTOR.pwaName,
  description: MEDIKTOR.seoDescription,
  manifest: "/dokumentace-manifest.json",
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

export default function DokumentaceAppPage() {
  return <DokAppShell />;
}
