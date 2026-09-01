import { NextResponse } from "next/server";
import { getAffiliateRedirectDestination } from "@/lib/ecosystem/monetization";
import { logMonetizationEvent } from "@/lib/monetization/log-event";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/** Tracked affiliate outbound redirect — /go/[slug] → partner URL (302). */
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const destination = getAffiliateRedirectDestination(slug);

  if (!destination) {
    return NextResponse.json({ error: "Unknown affiliate link" }, { status: 404 });
  }

  const referer = request.headers.get("referer");
  await logMonetizationEvent("affiliate_click", {
    slug: slug.trim().toLowerCase(),
    destination,
    referer,
  });

  return NextResponse.redirect(destination, 302);
}
