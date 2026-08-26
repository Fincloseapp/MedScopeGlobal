import { NextResponse } from "next/server";
import { getMediFlowSession } from "@/lib/mediflow/session";
import { addMediFlowSymptom } from "@/lib/mediflow/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getMediFlowSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Přihlaste se pro synchronizaci" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string; severity?: number };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Chybí název symptomu" }, { status: 400 });
  }

  const severity = Math.min(5, Math.max(1, body.severity ?? 3)) as 1 | 2 | 3 | 4 | 5;

  try {
    const symptom = await addMediFlowSymptom(session.userId, body.name.trim(), severity);
    return NextResponse.json({ symptom });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chyba ukládání" },
      { status: 503 }
    );
  }
}
