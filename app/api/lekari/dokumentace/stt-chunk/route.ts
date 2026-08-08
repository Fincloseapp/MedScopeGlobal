import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import { DOKUMENTACE_MAX_UPLOAD_BYTES } from "@/lib/lekari/dokumentace/templates";
import { transcribeAudio } from "@/lib/lekari/dokumentace/stt";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Single audio segment STT for MeDiktor.
 * Does not consume the daily Dokumentace quota (final structure/process does).
 * Kept small so uploads stay under Vercel body limits (~4.5 MB).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_stt_chunk",
  });
  if (!guard.ok) return guard.response;

  if (!user) {
    return NextResponse.json({ error: "Přihlášení vyžadováno." }, { status: 401 });
  }

  const eligibility = await getDokumentaceEligibility(user.id);
  if (!eligibility.eligible) {
    return NextResponse.json(
      { error: eligibility.message, code: "DOCTOR_VERIFICATION_REQUIRED" },
      { status: eligibility.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Neplatný audio formulář (soubor se nepodařilo načíst)." },
      { status: 400 }
    );
  }

  const file = form.get("audio") ?? form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Chybí audio segment." }, { status: 400 });
  }

  const mimeType = file.type || "audio/webm";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Prázdný audio segment." }, { status: 400 });
  }

  // Soft platform limit — keep well under Vercel ~4.5 MB request cap
  const softLimit = Math.min(DOKUMENTACE_MAX_UPLOAD_BYTES, 4 * 1024 * 1024);
  if (buffer.byteLength > softLimit) {
    return NextResponse.json(
      {
        error: `Segment je příliš velký (${Math.round(buffer.byteLength / (1024 * 1024))} MB). Nahrajte kratší úsek.`,
        code: "SEGMENT_TOO_LARGE",
      },
      { status: 413 }
    );
  }

  try {
    const { text, provider } = await transcribeAudio(buffer, mimeType);
    return NextResponse.json({
      transcript: text,
      provider,
      bytes: buffer.byteLength,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Přepis segmentu selhal.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
