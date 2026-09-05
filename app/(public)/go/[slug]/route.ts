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
  HEUREKA_HOP_CSP,
  heurekaMarketFromUrl,
  heurekaUrlHasHaff,
  publicMarketplaceUrl,
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

function isAmazonStoreUrl(url: string): boolean {
  try {
    return /(?:^|\.)amazon\.(?:com|de|fr|es|it|pl|co\.uk|co\.jp)$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function leavePathFromRequest(url: URL): string {
  const next = new URL(url.href);
  next.searchParams.set("leave", "1");
  next.searchParams.delete("direct");
  next.searchParams.delete("stay");
  return `${next.pathname}${next.search}`;
}

/** In-site hop first; tracking query stays off the public card URL and hop HTML. */
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

  const publicUrl = publicMarketplaceUrl(destination);
  const onHeureka = Boolean(heurekaMarket && haff && heurekaUrlHasHaff(destination));
  const onAmazon = isAmazonStoreUrl(destination);
  const leaving = url.searchParams.get("leave") === "1";

  await logMonetizationEvent("affiliate_click", {
    slug: slug.trim().toLowerCase(),
    destination,
    publicUrl,
    locale,
    region,
    referer,
    heureka: onHeureka,
    haff: haff ?? null,
    checkout: onHeureka ? "heureka-trixam" : onAmazon ? "amazon" : "other",
  });

  const noStore = "private, no-cache, no-store, must-revalidate";

  if (leaving) {
    const redirect = NextResponse.redirect(onHeureka ? publicUrl : destination, 302);
    redirect.headers.set("Cache-Control", noStore);
    return redirect;
  }

  if (isDirectAffiliateHop(url) && onAmazon) {
    const redirect = NextResponse.redirect(destination, 302);
    redirect.headers.set("Cache-Control", noStore);
    return redirect;
  }

  const productId = productIdFromGoSlug(slug) ?? slug;
  const stay = url.searchParams.get("stay") === "1";
  const html = renderAffiliateHopHtml({
    destination: publicUrl,
    leavePath: onAmazon ? leavePathFromRequest(url) : null,
    heurekaTrixamId: onHeureka ? haff : null,
    locale,
    productName: productDisplayName(productId, locale),
    imageUrl: productImageForHop(productId),
    autoLeaveMs: stay ? 0 : onHeureka ? 2200 : 1800,
  });
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": noStore,
  };
  if (onHeureka) headers["Content-Security-Policy"] = HEUREKA_HOP_CSP;
  return new NextResponse(html, { status: 200, headers });
}
