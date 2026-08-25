import { NextResponse } from "next/server";
import { getMediFlowSession } from "@/lib/mediflow/session";
import { addMediFlowNote } from "@/lib/mediflow/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getMediFlowSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Přihlaste se pro synchronizaci" }, { status: 401 });
  }

  const body = (await request.json()) as { text?: string; title?: string };
  if (!body.text?.trim()) {
    return NextResponse.json({ error: "Prázdná poznámka" }, { status: 400 });
  }

  try {
    const note = await addMediFlowNote(session.userId, body.text.trim(), body.title);
    return NextResponse.json({ note });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chyba ukládání" },
      { status: 503 }
    );
  }
}
