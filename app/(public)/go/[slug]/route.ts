import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAffiliateRedirectDestination } from "@/lib/ecosystem/monetization";
import { fallbackUntrackedHeurekaToAmazonDe } from "@/lib/monetization/affiliate-geo";
import {
  isDirectAffiliateHop,
  productDisplayName,
  productIdFromGoSlug,
  productImageForHop,
  renderAffiliateHopHtml,
} from "@/lib/monetization/affiliate-hop";
import { logMonetizationEvent } from "@/lib/monetization/log-event";
import { LOCALE_COOKIE, REGION_COOKIE } from "@/lib/i18n/config";
import { resolveLocalePath } from "@/lib/i18n/locale-path";
import {
  applyHeurekaHaff,
  getHeurekaPositionId,
  heurekaMarketFromUrl,
  heurekaUrlHasHaff,
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

/** In-site hop first; tracking query stays off the public card URL. */
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

  const intended = getAffiliateRedirectDestination(slug, { locale, region });

  if (!intended) {
    return NextResponse.json({ error: "Unknown affiliate link" }, { status: 404 });
  }

  const heurekaMarket = heurekaMarketFromUrl(intended);
  const haff = heurekaMarket ? await getHeurekaPositionId(heurekaMarket) : null;
  const destination = heurekaMarket
    ? haff
      ? applyHeurekaHaff(intended, haff)
      : fallbackUntrackedHeurekaToAmazonDe(intended, locale)
    : intended;

  await logMonetizationEvent("affiliate_click", {
    slug: slug.trim().toLowerCase(),
    destination,
    locale,
    region,
    referer,
    heureka: heurekaUrlHasHaff(destination),
    haff: haff ?? null,
    checkout: heurekaUrlHasHaff(destination)
      ? "heureka-haff"
      : heurekaMarket
        ? "amazon-de"
        : "amazon",
  });

  const noStore = "private, no-cache, no-store, must-revalidate";

  if (isDirectAffiliateHop(url)) {
    const redirect = NextResponse.redirect(destination, 302);
    redirect.headers.set("Cache-Control", noStore);
    return redirect;
  }

  const productId = productIdFromGoSlug(slug) ?? slug;
  const html = renderAffiliateHopHtml({
    destination,
    locale,
    productName: productDisplayName(productId, locale),
    imageUrl: productImageForHop(productId),
  });
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": noStore,
    },
  });
}
