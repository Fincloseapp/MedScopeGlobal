import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createQuizWithQuestions, listPublishedQuizzes } from "@/lib/academy/db";
import type { CreateQuizInput } from "@/types/academy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quizzes = await listPublishedQuizzes();
    return NextResponse.json({ ok: true, quizzes });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateQuizInput;
    if (!body.course_id || !body.title?.trim()) {
      return NextResponse.json({ error: "course_id a title jsou povinné" }, { status: 400 });
    }
    const quiz = await createQuizWithQuestions(body);
    return NextResponse.json({ ok: true, quiz }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
