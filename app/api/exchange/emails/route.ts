import { NextResponse } from "next/server";
import { listExchangeMailTemplates } from "@/lib/exchange/emails";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") ?? "cs";
  return NextResponse.json({ items: listExchangeMailTemplates(locale) });
}
