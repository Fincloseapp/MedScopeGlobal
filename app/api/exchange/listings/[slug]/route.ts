import { NextResponse } from "next/server";
import { getExchangeListing } from "@/lib/exchange/catalog";
import { withApiGuard } from "@/lib/security/api-guard";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const guard = await withApiGuard(request, { action: "exchange_listing" });
  if (!guard.ok) return guard.response;
  const { slug } = await context.params;
  const { listing, source } = await getExchangeListing(slug);
  if (!listing || (listing.status !== "approved" && source === "db")) {
    const demoOk = listing && source === "demo";
    if (!demoOk && !listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing, source });
}
