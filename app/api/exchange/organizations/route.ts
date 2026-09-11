import { NextResponse } from "next/server";
import { getExchangeOrganization, listDemoOrganizations } from "@/lib/exchange/catalog";
import { withApiGuard } from "@/lib/security/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_orgs" });
  if (!guard.ok) return guard.response;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (slug) {
    const result = await getExchangeOrganization(slug);
    if (!result.organization) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  }
  return NextResponse.json({ items: listDemoOrganizations(), source: "demo" });
}
