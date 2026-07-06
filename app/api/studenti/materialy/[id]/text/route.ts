import { NextResponse } from "next/server";
import { getCachedMaterialText } from "@/lib/studenti/material-text";
import { getStudentMaterialById } from "@/lib/studenti/materials";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Returns extracted plain text / HTML for study material reading mode.
 * Source URLs are never exposed to the client.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const material = await getStudentMaterialById(id);

  if (!material) {
    return NextResponse.json({ ok: false, error: "Material not found" }, { status: 404 });
  }

  const content = await getCachedMaterialText(id);

  return NextResponse.json(
    { ok: true, content },
    {
      headers: {
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
