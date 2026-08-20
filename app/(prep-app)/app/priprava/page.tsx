import type { Metadata } from "next";
import { PrepAppShell } from "@/components/mediprep/prep-app-shell";
import { MEDIPREP, appSeoDescription, appSeoTitle } from "@/lib/apps/catalog";

export const metadata: Metadata = {
  title: appSeoTitle(MEDIPREP),
  description: appSeoDescription(MEDIPREP),
  manifest: MEDIPREP.manifest,
  icons: {
    icon: [
      { url: MEDIPREP.assets.icon192, sizes: "192x192", type: "image/png" },
      { url: MEDIPREP.assets.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: MEDIPREP.assets.appleTouch, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: MEDIPREP.shortName,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": MEDIPREP.shortName,
    "theme-color": MEDIPREP.themeColor,
  },
  themeColor: MEDIPREP.themeColor,
};

export default function PrepAppPage() {
  return <PrepAppShell />;
}
