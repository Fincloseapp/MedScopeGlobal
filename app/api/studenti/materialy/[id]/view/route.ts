import { NextResponse } from "next/server";
import { getStudentMaterialById } from "@/lib/studenti/materials";
import { fetchMaterialBytes, isAllowedMaterialUrl } from "@/lib/studenti/material-source";

export const dynamic = "force-dynamic";

/** * Server-side PDF proxy — Content-Disposition: inline (read-only, no download prompt).
 * external_url is never exposed to the client.
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

  const fileType = (material.file_type ?? "").toLowerCase();
  if (fileType !== "pdf") {
    return NextResponse.json(
      { ok: false, error: "Preview available for PDF only" },
      { status: 415 }
    );
  }

  const sourceUrl = material.external_url;
  if (!sourceUrl || !isAllowedMaterialUrl(sourceUrl)) {
    return NextResponse.json({ ok: false, error: "Invalid source" }, { status: 403 });
  }

  try {
    const body = await fetchMaterialBytes(material);
    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="studijni-material.pdf"',
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 502 }
    );
  }
}
