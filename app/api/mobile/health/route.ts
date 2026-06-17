import { NextResponse } from "next/server";
import { ACADEMY_VERSION, checkAcademyTables } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

/** Lightweight health probe for MedScope Academy mobile clients and smokes. */
export async function GET() {
  const tables = await checkAcademyTables();
  const ok = Object.values(tables).every(Boolean);

  return NextResponse.json({
    ok,
    service: "medscope-academy-mobile",
    academyVersion: ACADEMY_VERSION,
    syncEndpoint: "/api/mobile/sync",
    tablesOk: Object.values(tables).filter(Boolean).length,
    tablesTotal: Object.keys(tables).length,
    generatedAt: new Date().toISOString(),
  });
}
