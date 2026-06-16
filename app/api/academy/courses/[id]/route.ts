import { NextResponse } from "next/server";
import { getCourseByIdOrSlug } from "@/lib/academy/db";

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
