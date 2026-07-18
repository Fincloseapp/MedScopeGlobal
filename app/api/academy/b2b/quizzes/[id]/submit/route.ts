import { NextResponse } from "next/server";
import { z } from "zod";
import { submitQuizAttempt } from "@/lib/academy/b2b/quiz-engine";
import {
  physicianGateJsonError,
  requireVerifiedPhysician,
} from "@/lib/academy/b2b/verification";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  attempt_id: z.string().uuid(),
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      value: z.string().min(1).max(500),
    })
  ),
});

export async function POST(request: Request, { params }: Params) {
  const gate = await requireVerifiedPhysician();
  if (!gate.ok) return physicianGateJsonError(gate);

  const { id: quizId } = await params;

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await submitQuizAttempt(
      parsed.data.attempt_id,
      gate.userId,
      parsed.data.answers
    );

    if (result.quiz_id !== quizId) {
      return NextResponse.json(
        { ok: false, error: "Pokus nepatří k tomuto kvízu" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 400 }
    );
  }
}
