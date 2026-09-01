import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAffiliateRedirectDestination } from "@/lib/ecosystem/monetization";
import { logMonetizationEvent } from "@/lib/monetization/log-event";
import { LOCALE_COOKIE, REGION_COOKIE } from "@/lib/i18n/config";
import { resolveLocalePath } from "@/lib/i18n/locale-path";
import {
  HEUREKA_HOP_CSP,
  getHeurekaPositionId,
  heurekaHopHtml,
  heurekaMarketFromUrl,
} from "@/lib/monetization/heureka-affiliate";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

function localeFromReferer(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return resolveLocalePath(new URL(referer).pathname).locale;
  } catch {
    return null;
  }
}

/** Tracked affiliate outbound redirect — local marketplace by locale / region. */
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const url = new URL(request.url);
  const referer = request.headers.get("referer");

  let locale = url.searchParams.get("locale");
  let region = url.searchParams.get("region");
  try {
    const jar = await cookies();
    if (!locale) locale = jar.get(LOCALE_COOKIE)?.value ?? null;
    if (!region) region = jar.get(REGION_COOKIE)?.value ?? null;
  } catch {
    /* cookies() can fail in some edge runtimes */
  }
  if (!locale) locale = localeFromReferer(referer);

  const destination = getAffiliateRedirectDestination(slug, { locale, region });

  if (!destination) {
    return NextResponse.json({ error: "Unknown affiliate link" }, { status: 404 });
  }

  const heurekaMarket = heurekaMarketFromUrl(destination);
  const positionId = heurekaMarket ? await getHeurekaPositionId(heurekaMarket) : null;

  await logMonetizationEvent("affiliate_click", {
    slug: slug.trim().toLowerCase(),
    destination,
    locale,
    region,
    referer,
    heureka: Boolean(positionId),
  });

  if (positionId && heurekaMarket) {
    return new NextResponse(heurekaHopHtml({ destination, positionId }), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Content-Security-Policy": HEUREKA_HOP_CSP,
      },
    });
  }

  const redirect = NextResponse.redirect(destination, 302);
  redirect.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  return redirect;
}
