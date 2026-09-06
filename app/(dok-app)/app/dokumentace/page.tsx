import type { Metadata } from "next";
import { DokAppShell } from "@/components/lekari/dok-app/dok-app-shell";
import { ORDIZAPIS } from "@/lib/lekari/dokumentace/branding";
import { getDokumentaceCopy } from "@/lib/i18n/dokumentace-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { normalizeLocale } from "@/lib/i18n/config";

async function resolveAppLocale(searchParams: Promise<{ locale?: string }>): Promise<string> {
  const params = await searchParams;
  return params.locale?.trim()
    ? normalizeLocale(params.locale)
    : await getServerLocale();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = await resolveAppLocale(searchParams);
  const copy = getDokumentaceCopy(locale);
  return {
    title: ORDIZAPIS.pwaName,
    description: copy.metaDescription,
    manifest: `/api/lekari/dokumentace/manifest?locale=${encodeURIComponent(locale)}`,
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
}

export default async function DokumentaceAppPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale = await resolveAppLocale(searchParams);
  return <DokAppShell locale={locale} />;
}
