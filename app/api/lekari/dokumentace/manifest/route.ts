import { NextResponse } from "next/server";
import { ORDIZAPIS } from "@/lib/lekari/dokumentace/branding";
import { getDokumentaceCopy } from "@/lib/i18n/dokumentace-copy";
import { getOrdiZapisAppCopy, ordizapisAppHref } from "@/lib/i18n/ordizapis-app-copy";
import { chromePack } from "@/lib/i18n/chrome-pack";
import { dokumentaceLocaleFromUrl } from "@/lib/lekari/dokumentace/request-locale";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const locale = dokumentaceLocaleFromUrl(request);
  const pack = chromePack(locale);
  const marketing = getDokumentaceCopy(locale);
  const app = getOrdiZapisAppCopy(locale);

  return NextResponse.json(
    {
      id: "/app/dokumentace",
      name: ORDIZAPIS.pwaName,
      short_name: ORDIZAPIS.pwaShortName,
      description: marketing.metaDescription,
      start_url: ordizapisAppHref(locale, { source: "pwa" }),
      scope: "/",
      display: "standalone",
      orientation: "any",
      background_color: "#021d33",
      theme_color: "#005B96",
      lang: pack === "pt-BR" ? "pt-BR" : pack,
      categories: ["medical", "productivity"],
      icons: [
        {
          src: ORDIZAPIS.assets.icon192,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: ORDIZAPIS.assets.icon512,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: ORDIZAPIS.assets.icon512,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: ORDIZAPIS.assets.appleTouch,
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ],
      shortcuts: [
        {
          name: app.tabNote,
          short_name: app.tabNote,
          url: ordizapisAppHref(locale, { tab: "zapis" }),
          description: app.dictate,
        },
        {
          name: app.historyTitle,
          short_name: app.history,
          url: ordizapisAppHref(locale, { tab: "historie" }),
          description: app.myNotes,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
