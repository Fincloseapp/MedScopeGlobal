import { NextResponse } from "next/server";
import { getMediFlowSession } from "@/lib/mediflow/session";
import { toggleMediFlowSupplement } from "@/lib/mediflow/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getMediFlowSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Přihlaste se pro synchronizaci" }, { status: 401 });
  }

  const body = (await request.json()) as { takenToday?: boolean };
  if (typeof body.takenToday !== "boolean") {
    return NextResponse.json({ error: "Chybí takenToday" }, { status: 400 });
  }

  try {
    await toggleMediFlowSupplement(session.userId, id, body.takenToday);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chyba ukládání" },
      { status: 503 }
    );
  }
}
