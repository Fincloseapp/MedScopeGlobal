import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { runSystemTest } from "@/lib/academy/db";
import { runAcademyAutorepair } from "@/lib/academy/ai/autorepair";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { autorepair?: boolean };
    const test = await runSystemTest("academy-v35-manual");
    const repair = body.autorepair ? await runAcademyAutorepair() : null;

    return NextResponse.json({
      ok: (test as { status?: string }).status === "passed",
      test,
      autorepair: repair,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const test = await runSystemTest("academy-v35-health-check");
    return NextResponse.json({ ok: true, test });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
