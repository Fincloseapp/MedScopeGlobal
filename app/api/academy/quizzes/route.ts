import { NextResponse } from "next/server";
import { listPublishedQuizzes } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quizzes = await listPublishedQuizzes();
    return NextResponse.json({ ok: true, quizzes });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
