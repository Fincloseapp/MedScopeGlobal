import { NextResponse } from "next/server";
import { startQuizAttempt } from "@/lib/academy/b2b/quiz-engine";
import {
  physicianGateJsonError,
  requireVerifiedPhysician,
} from "@/lib/academy/b2b/verification";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const gate = await requireVerifiedPhysician();
  if (!gate.ok) return physicianGateJsonError(gate);

  const { id } = await params;

  try {
    const session = await startQuizAttempt(id, gate.userId);
    return NextResponse.json({ ok: true, session });
  } catch (e) {
    const message = (e as Error).message;
    const status = message.includes("zamčen") || message.includes("pokus") ? 403 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
