import { NextResponse } from "next/server";
import { listStudentMaterials } from "@/lib/studenti/materials";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rocnikParam = url.searchParams.get("rocnik");
  const subject = url.searchParams.get("subject") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? 500);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  let rocnik: number | null | undefined;
  if (rocnikParam === null || rocnikParam === "") {
    rocnik = undefined;
  } else if (rocnikParam === "all") {
    rocnik = undefined;
  } else {
    rocnik = Number(rocnikParam);
    if (Number.isNaN(rocnik)) {
      return NextResponse.json({ ok: false, error: "Invalid rocnik" }, { status: 400 });
    }
  }

  try {
    const { materials, total } = await listStudentMaterials({
      rocnik,
      subject,
      q,
      limit,
      offset,
    });
    return NextResponse.json({
      ok: true,
      materials,
      total,
      count: materials.length,
      legal: {
        hosting: "external_link",
        attribution: "LF1.CZ (lf1.cz) — MedScopeGlobal curator index",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
