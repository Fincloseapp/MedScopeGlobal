import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { validateCourse } from "@/lib/v40/validation/course-validator";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { course_id?: string; applySafeFixes?: boolean };
    if (!body.course_id) {
      return NextResponse.json({ error: "course_id je povinný" }, { status: 400 });
    }

    const result = await validateCourse(body.course_id, body.applySafeFixes ?? false);
    return NextResponse.json({ ok: true, version: "v40.0", validation: result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
