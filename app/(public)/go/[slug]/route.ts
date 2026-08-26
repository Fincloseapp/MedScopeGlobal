import { NextResponse } from "next/server";
import { getAffiliateRedirectDestination } from "@/lib/ecosystem/monetization";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/** Tracked affiliate outbound redirect — /go/[slug] → partner URL (302). */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const destination = getAffiliateRedirectDestination(slug);

  if (!destination) {
    return NextResponse.json({ error: "Unknown affiliate link" }, { status: 404 });
  }

  return NextResponse.redirect(destination, 302);
}
