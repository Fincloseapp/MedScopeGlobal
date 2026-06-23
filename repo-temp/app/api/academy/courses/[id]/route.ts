import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { getCourseByIdOrSlug, updateCourse } from "@/lib/academy/db";
import type { UpdateCourseInput } from "@/types/academy";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const course = await getCourseByIdOrSlug(id);
    if (!course) {
      return NextResponse.json({ error: "Kurz nenalezen" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, course });
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
    const body = (await request.json()) as UpdateCourseInput;
    const course = await updateCourse(id, body);
    return NextResponse.json({ ok: true, course });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
