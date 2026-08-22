import type { Metadata, Viewport } from "next";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

/** Next.js 15+: themeColor belongs on `viewport`, not `metadata`. */
export const MEDIKTOR_PWA_VIEWPORT: Viewport = {
  themeColor: "#005B96",
};

/** Shared Web App Manifest + install icons for MeDiktor PWA pages. */
export const MEDIKTOR_PWA_METADATA: Metadata = {
  applicationName: MEDIKTOR.pwaShortName,
  manifest: "/dokumentace-manifest.json",
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
  },
};

export function withMediktorPwaMetadata(base: Metadata): Metadata {
  return {
    ...base,
    ...MEDIKTOR_PWA_METADATA,
    other: {
      ...(base.other ?? {}),
      ...(MEDIKTOR_PWA_METADATA.other ?? {}),
    },
  };
}
