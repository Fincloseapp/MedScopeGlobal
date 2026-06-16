import { NextResponse } from "next/server";
import { getLessonById } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json({ error: "Lekce nenalezena" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, lesson });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
