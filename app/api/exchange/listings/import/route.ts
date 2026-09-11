import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { getAdvertiserContext } from "@/lib/exchange/session";
import { entitlementsFor } from "@/lib/exchange/monetization";
import { listingCreateSchema } from "@/lib/exchange/validation";
import { recordExchangeMetric } from "@/lib/exchange/observability";

export const dynamic = "force-dynamic";

const schema = z.object({
  listings: z.array(listingCreateSchema).min(1).max(50),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_import" });
  if (!guard.ok) return guard.response;

  const ctx = await getAdvertiserContext(request);
  if (!entitlementsFor(ctx.plan).canImportApi) {
    recordExchangeMetric("import_blocked", { plan: ctx.plan });
    return NextResponse.json(
      { error: "enterprise_required", plan: ctx.plan, upgrade: "/exchange/pricing" },
      { status: 402 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    accepted: parsed.data.listings.length,
    plan: ctx.plan,
    demo: true,
  });
}
