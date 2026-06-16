import { NextResponse } from "next/server";
import {
  ACADEMY_VERSION,
  checkAcademyTables,
  listPublishedCourses,
} from "@/lib/academy/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [tables, courses] = await Promise.all([checkAcademyTables(), listPublishedCourses(1)]);
    const allTablesOk = Object.values(tables).every(Boolean);

    return NextResponse.json({
      version: ACADEMY_VERSION,
      ok: allTablesOk,
      tables,
      courseCount: courses.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        version: ACADEMY_VERSION,
        ok: false,
        error: (e as Error).message,
        generatedAt: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
