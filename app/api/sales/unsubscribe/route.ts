import { NextResponse } from "next/server";
import { SITE } from "@/lib/config/site";
import { verifyUnsubscribeToken } from "@/lib/sales/legal";
import { insertSuppression, listProspects, salesDb, updateProspect } from "@/lib/sales/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("token") ?? "";
  if (!email || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "Neplatný odkaz pro odhlášení." }, { status: 400 });
  }
  const db = salesDb(null);
  if (db) {
    await insertSuppression(db, email, "unsubscribe");
    const prospects = await listProspects(db, 400);
    for (const prospect of prospects.filter((p) => p.email === email)) {
      await updateProspect(db, prospect.id, { suppressed_at: new Date().toISOString(), stage: "suppressed" });
    }
  }
  const origin = SITE.url.replace(/\/$/, "");
  return NextResponse.redirect(`${origin}/inzerce/podminky?unsubscribed=1`);
}
