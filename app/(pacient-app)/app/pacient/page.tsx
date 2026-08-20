import type { Metadata } from "next";
import { PacientAppShell } from "@/components/medipacient/pacient-app-shell";
import { MEDIPACIENT, appSeoDescription, appSeoTitle } from "@/lib/apps/catalog";

export const metadata: Metadata = {
  title: appSeoTitle(MEDIPACIENT),
  description: appSeoDescription(MEDIPACIENT),
  manifest: MEDIPACIENT.manifest,
  icons: {
    icon: [
      { url: MEDIPACIENT.assets.icon192, sizes: "192x192", type: "image/png" },
      { url: MEDIPACIENT.assets.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: MEDIPACIENT.assets.appleTouch, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: MEDIPACIENT.shortName,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": MEDIPACIENT.shortName,
    "theme-color": MEDIPACIENT.themeColor,
  },
  themeColor: MEDIPACIENT.themeColor,
};

export default function PacientAppPage() {
  return <PacientAppShell />;
}
