import { NextResponse } from "next/server";
import { listExchangeAds } from "@/lib/exchange/catalog";
import { parseAvailabilityRegions } from "@/lib/exchange/regions";
import { EXCHANGE_AD_PACKAGES } from "@/lib/exchange/monetization";
import { createDataClient } from "@/lib/supabase/data";
import { withApiGuard } from "@/lib/security/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_ads" });
  if (!guard.ok) return guard.response;
  const url = new URL(request.url);
  const regions = parseAvailabilityRegions(url.searchParams.get("regions")?.split(",") ?? []);
  const items = await listExchangeAds(regions.length ? regions : undefined);
  return NextResponse.json({ items, packages: EXCHANGE_AD_PACKAGES });
}

const eventSchema = z.object({
  adId: z.string().min(1).max(80),
  event: z.enum(["impression", "click"]),
  region: z.string().max(16).optional(),
  locale: z.string().max(16).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_ad_event" });
  if (!guard.ok) return guard.response;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const supabase = await createDataClient();
  if (supabase) {
    await supabase.from("exchange_ad_events").insert({
      ad_id: parsed.data.adId,
      event: parsed.data.event,
      region: parsed.data.region ?? null,
      locale: parsed.data.locale ?? null,
    });
    const column = parsed.data.event === "click" ? "clicks" : "impressions";
    await supabase.rpc("exchange_increment_ad_metric", { ad: parsed.data.adId, metric: column }).then(
      () => undefined,
      async () => {
        const { data } = await supabase.from("exchange_ads").select(column).eq("id", parsed.data.adId).maybeSingle();
        const current = Number((data as Record<string, unknown> | null)?.[column] ?? 0);
        await supabase
          .from("exchange_ads")
          .update({ [column]: current + 1 })
          .eq("id", parsed.data.adId);
      }
    );
  }
  return NextResponse.json({ ok: true });
}
