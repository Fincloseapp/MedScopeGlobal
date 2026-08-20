import { NextResponse } from "next/server";
import { getPacientSession } from "@/lib/medipacient/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getPacientSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: session.message, loginUrl: session.loginUrl }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    message: session.isVip
      ? "Připomínka je naplánovaná na další kontrolu z časové osy."
      : "Základní připomínky jsou v přehledu. Premium hlídá termíny navíc.",
  });
}
