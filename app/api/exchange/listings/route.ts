import { NextResponse } from "next/server";
import { z } from "zod";
import { listExchangeAds, listExchangeListings } from "@/lib/exchange/catalog";
import { AVAILABILITY_REGIONS, parseAvailabilityRegions } from "@/lib/exchange/regions";
import { LISTING_KINDS } from "@/lib/exchange/types";
import { withApiGuard } from "@/lib/security/api-guard";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().max(120).optional(),
  kind: z.enum([...LISTING_KINDS, "any"]).optional(),
  category: z.string().max(80).optional(),
  regions: z.string().max(80).optional(),
  locale: z.string().max(16).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_listings" });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    kind: url.searchParams.get("kind") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    regions: url.searchParams.get("regions") ?? undefined,
    locale: url.searchParams.get("locale") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const regions = parseAvailabilityRegions(
    parsed.data.regions?.split(",").map((item) => item.trim()) ?? []
  );
  const { items, source } = await listExchangeListings({
    q: parsed.data.q,
    kind: parsed.data.kind,
    category: parsed.data.category,
    regions,
    locale: parsed.data.locale,
    limit: parsed.data.limit,
  });
  const ads = await listExchangeAds(regions.length ? regions : undefined);

  return NextResponse.json({
    items,
    ads,
    source,
    regions: AVAILABILITY_REGIONS,
  });
}
