import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { withApiGuard } from "@/lib/security/api-guard";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import { dokumentaceLocaleFromRequest } from "@/lib/lekari/dokumentace/request-locale";
import { getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "media";
const PREFIX = "mediktor-temp";

/** Store one binary chunk of a phone recording in Supabase Storage. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_file_chunk",
  });
  if (!guard.ok) return guard.response;
  const locale = dokumentaceLocaleFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { error: getOrdiZapisApiCopy(locale).errLoginRequired },
      { status: 401 }
    );
  }

  const eligibility = await getDokumentaceEligibility(user.id, locale);
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.message }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neplatný upload chunk." }, { status: 400 });
  }

  const sessionId = String(form.get("sessionId") ?? "").trim();
  const index = Number(form.get("index") ?? -1);
  const total = Number(form.get("total") ?? -1);
  const chunk = form.get("chunk");

  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return NextResponse.json({ error: "Neplatná session." }, { status: 400 });
  }
  if (!Number.isInteger(index) || index < 0 || index > 40) {
    return NextResponse.json({ error: "Neplatný index chunku." }, { status: 400 });
  }
  if (!Number.isInteger(total) || total < 1 || total > 40) {
    return NextResponse.json({ error: "Neplatný počet chunků." }, { status: 400 });
  }
  if (!chunk || typeof chunk === "string") {
    return NextResponse.json({ error: "Chybí data chunku." }, { status: 400 });
  }

  const buffer = Buffer.from(await chunk.arrayBuffer());
  if (buffer.byteLength === 0 || buffer.byteLength > 3_500_000) {
    return NextResponse.json({ error: "Chunk má neplatnou velikost." }, { status: 400 });
  }

  const path = `${PREFIX}/${user.id}/${sessionId}/${String(index).padStart(3, "0")}.part`;
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: "application/octet-stream",
      upsert: true,
    });
    if (error) {
      return NextResponse.json(
        { error: `Uložení chunku selhalo: ${error.message}` },
        { status: 502 }
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Storage není dostupný.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, index, total, path });
}
