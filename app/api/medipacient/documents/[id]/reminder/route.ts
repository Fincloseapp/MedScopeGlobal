import { NextResponse } from "next/server";
import { getMeDipacientAccess } from "@/lib/medipacient/access";
import { resolveMeDipacientDocumentId } from "@/lib/medipacient/document-index";
import { setMeDipacientControlReminder } from "@/lib/medipacient/documents";
import { DOCUMENT_NOT_FOUND_CS } from "@/lib/medipacient/patient-summary";
import { withApiGuard } from "@/lib/security/api-guard";
import type { ControlReminderStatus } from "@/lib/medipacient/control-reminder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set<ControlReminderStatus>(["open", "done", "dismissed"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const access = await getMeDipacientAccess();
  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: access.userId ?? undefined,
    action: "medipacient_reminder",
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
  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
  const status = body.status;
  if (!status || !STATUSES.has(status as ControlReminderStatus)) {
    return NextResponse.json({ error: "Vyberte Hotovo, Skrýt, nebo obnovit." }, { status: 400 });
  }
  try {
    const document = await setMeDipacientControlReminder(access.userId, id, {
      status: status as ControlReminderStatus,
    });
    if (!document) return NextResponse.json({ error: DOCUMENT_NOT_FOUND_CS }, { status: 404 });
    return NextResponse.json({ ok: true, document, controlReminder: document.controlReminder ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Uložení připomínky selhalo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
