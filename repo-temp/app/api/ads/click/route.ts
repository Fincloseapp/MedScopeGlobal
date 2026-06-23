import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** CLK stub — lightweight click tracking endpoint for ad QA (v25.4). */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const stub = url.searchParams.get("stub") === "1" || url.searchParams.get("stub") === "true";

  let campaignId: string | null = url.searchParams.get("campaignId");
  if (!campaignId) {
    try {
      const body = (await request.json()) as { campaignId?: string; stub?: boolean };
      campaignId = body.campaignId ?? null;
      if (body.stub) {
        return NextResponse.json({ ok: true, stub: true, campaignId, tracked: false });
      }
    } catch {
      /* empty body ok for stub */
    }
  }

  if (stub || !campaignId || campaignId === "test-stub") {
    return NextResponse.json({ ok: true, stub: true, campaignId: campaignId ?? "test-stub", tracked: false });
  }

  return NextResponse.json({ ok: true, stub: false, campaignId, tracked: true });
}
