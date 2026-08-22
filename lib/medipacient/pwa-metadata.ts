import type { Metadata, Viewport } from "next";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

export const MEDIPACIENT_PWA_VIEWPORT: Viewport = {
  themeColor: "#2D7FF9",
};

export const MEDIPACIENT_PWA_METADATA: Metadata = {
  applicationName: MEDIPACIENT.pwaShortName,
  manifest: "/medipacient-manifest.json",
  icons: {
    icon: [
      { url: MEDIPACIENT.assets.icon192, sizes: "192x192", type: "image/png" },
      { url: MEDIPACIENT.assets.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: MEDIPACIENT.assets.appleTouch, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: MEDIPACIENT.pwaShortName,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": MEDIPACIENT.pwaShortName,
    "medipacient-version": MEDIPACIENT.buildStamp,
  },
};

export function withMeDipacientPwaMetadata(base: Metadata): Metadata {
  return {
    ...base,
    ...MEDIPACIENT_PWA_METADATA,
    other: {
      ...(base.other ?? {}),
      ...(MEDIPACIENT_PWA_METADATA.other ?? {}),
    },
  };
}
