import { NextResponse } from "next/server";
import { getStudentMaterialById } from "@/lib/studenti/materials";

export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = ["https://lf1.cz", "http://lf1.cz"];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_ORIGINS.some((origin) => parsed.origin === origin);
  } catch {
    return false;
  }
}

/**
 * Server-side PDF proxy — Content-Disposition: inline (read-only, no download prompt).
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
  if (!sourceUrl || !isAllowedUrl(sourceUrl)) {
    return NextResponse.json({ ok: false, error: "Invalid source" }, { status: 403 });
  }

  try {
    const upstream = await fetch(sourceUrl, {
      headers: { "User-Agent": "MedScopeGlobal/1.0 (study-materials-viewer)" },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "Source unavailable" },
        { status: 502 }
      );
    }

    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") ?? "application/pdf";

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType.includes("pdf") ? "application/pdf" : contentType,
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
