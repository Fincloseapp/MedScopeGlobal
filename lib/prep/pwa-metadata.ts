import type { Metadata, Viewport } from "next";
import { MEDIPREP } from "@/lib/prep/branding";

export const MEDIPREP_PWA_VIEWPORT: Viewport = {
  themeColor: "#0A192F",
};

export const MEDIPREP_PWA_METADATA: Metadata = {
  applicationName: MEDIPREP.pwaShortName,
  manifest: "/mediprep-manifest.json",
  icons: {
    icon: [
      { url: MEDIPREP.assets.icon192, sizes: "192x192", type: "image/png" },
      { url: MEDIPREP.assets.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: MEDIPREP.assets.appleTouch, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: MEDIPREP.pwaShortName,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": MEDIPREP.pwaShortName,
  },
};

export function withMeDiprepPwaMetadata(base: Metadata): Metadata {
  return {
    ...base,
    ...MEDIPREP_PWA_METADATA,
    other: {
      ...(base.other ?? {}),
      ...(MEDIPREP_PWA_METADATA.other ?? {}),
    },
  };
}
