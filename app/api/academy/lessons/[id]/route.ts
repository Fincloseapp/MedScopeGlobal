import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { getLessonById, updateLesson } from "@/lib/academy/db";
import type { UpdateLessonInput } from "@/types/academy";

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

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = (await request.json()) as UpdateLessonInput;
    const lesson = await updateLesson(id, body);
    return NextResponse.json({ ok: true, lesson });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
