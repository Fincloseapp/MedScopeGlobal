import { NextResponse } from "next/server";
import { seedV24Quizzes } from "@/lib/v24/quizzes";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const count = await seedV24Quizzes();
    return NextResponse.json({ ok: true, count });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
