import { NextResponse } from "next/server";
import { getQuizById, submitQuizAnswers } from "@/lib/academy/db";
import type { QuizSubmitAnswer } from "@/types/academy";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const quiz = await getQuizById(id, false);
    if (!quiz) {
      return NextResponse.json({ error: "Kvíz nenalezen" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, quiz });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = (await request.json()) as { answers?: QuizSubmitAnswer[] };
    const answers = body.answers ?? [];
    const result = await submitQuizAnswers(id, answers);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
