import { NextResponse } from "next/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { extractDocument, DocumentExtractError } from "@/lib/doc/extract";
import { getPacientSession } from "@/lib/medipacient/session";
import { savePacientDocument } from "@/lib/medipacient/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getPacientSession();
  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: session.userId,
    action: "medipacient_upload",
  });
  if (!guard.ok) return guard.response;
  if (!session.userId || !session.canUpload) {
    return NextResponse.json(
      {
        error: "Přihlaste se stejným účtem MedScopeGlobal — pak MeDipacient funguje v prohlížeči i v telefonu.",
        loginUrl: session.loginUrl,
      },
      { status: 401 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Chybí soubor zprávy." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractDocument(buffer, file.name, file.type);
    const doc = await savePacientDocument(session.userId, {
      filename: file.name,
      text: extracted.text,
    });
    return NextResponse.json({ ok: true, document: doc, method: extracted.method });
  } catch (error) {
    if (error instanceof DocumentExtractError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Zpracování selhalo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
