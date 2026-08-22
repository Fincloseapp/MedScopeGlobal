import { NextResponse } from "next/server";
import { getMeDipacientAccess } from "@/lib/medipacient/access";
import { resolveMeDipacientDocumentId } from "@/lib/medipacient/document-index";
import { reprocessMeDipacientDocument } from "@/lib/medipacient/documents";
import { DOCUMENT_NOT_FOUND_CS } from "@/lib/medipacient/patient-summary";
import { withApiGuard } from "@/lib/security/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await getMeDipacientAccess();
  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: access.userId ?? undefined,
    action: "medipacient_reprocess",
  });
  if (!guard.ok) return guard.response;
  if (!access.authenticated || !access.userId) {
    return NextResponse.json({ error: access.message }, { status: 401 });
  }
  if (!access.entitled) {
    return NextResponse.json({ error: access.message }, { status: 403 });
  }
  const id = await resolveMeDipacientDocumentId(request, context.params);
  if (!id) return NextResponse.json({ error: DOCUMENT_NOT_FOUND_CS }, { status: 404 });
  try {
    const document = await reprocessMeDipacientDocument(access.userId, id);
    if (!document) return NextResponse.json({ error: DOCUMENT_NOT_FOUND_CS }, { status: 404 });
    return NextResponse.json({ ok: true, document, patientSummary: document.patientSummary ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Zpracování selhalo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
