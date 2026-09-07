import { NextResponse } from "next/server";
import { proxyQrPng } from "@/lib/apps/qr";
import { buildSpdString } from "@/lib/billing/spd-qr";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return new NextResponse("missing token", { status: 401 });
  const admin = createServiceRoleClient();
  const { data } = await admin.from("ads_requests").select("*").eq("id", id).maybeSingle();
  if (!data || data.approval_token !== token) return new NextResponse("not found", { status: 404 });
  const spd = buildSpdString({
    amountCzk: Number(data.price ?? 0),
    variableSymbol: String(data.variable_symbol ?? ""),
    message: `Inzerce ${data.company}`,
  });
  if (!spd) return new NextResponse("iban missing", { status: 404 });
  const png = await proxyQrPng(spd);
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300",
    },
  });
}
