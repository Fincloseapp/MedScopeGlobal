import { NextResponse } from "next/server";
import { listStudentMaterials } from "@/lib/studenti/materials";
import { PUBLIC_LEGAL_NOTICE } from "@/lib/studenti/materials-anonymize";

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
        notice: PUBLIC_LEGAL_NOTICE,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
