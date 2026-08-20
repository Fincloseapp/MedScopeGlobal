import { NextResponse } from "next/server";
import { getPacientSession } from "@/lib/medipacient/session";
import { getPacientDocument } from "@/lib/medipacient/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getPacientSession();
  const doc = await getPacientDocument(session.userId, id);
  if (!doc) return NextResponse.json({ error: "Zpráva nenalezena." }, { status: 404 });
  return NextResponse.json({ document: doc });
}
