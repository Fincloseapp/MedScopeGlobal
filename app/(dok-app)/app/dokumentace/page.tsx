import type { Metadata } from "next";
import { DokAppShell } from "@/components/lekari/dok-app/dok-app-shell";

export const metadata: Metadata = {
  title: "MedScope Dokumentace App",
  description:
    "AI zápisy pro lékaře — nahrávka, diktát, šablony. Instalovatelná aplikace MedScope Dokumentace.",
  manifest: "/dokumentace-manifest.json",
  appleWebApp: {
    capable: true,
    title: "MedScope Dokumentace",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "MedScope Dokumentace",
    "theme-color": "#005B96",
  },
  themeColor: "#005B96",
};

export default function DokumentaceAppPage() {
  return <DokAppShell />;
}
