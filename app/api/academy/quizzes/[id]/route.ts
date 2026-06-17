import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { getQuizById, submitQuizAnswers, updateQuiz } from "@/lib/academy/db";
import type { QuizSubmitAnswer, UpdateQuizInput } from "@/types/academy";

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

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = (await request.json()) as UpdateQuizInput;
    const quiz = await updateQuiz(id, body);
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
