import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { logAiAgentUsage } from "@/lib/security/ai-abuse";
import { assertDokumentaceAccess } from "@/lib/lekari/dokumentace/access";
import { DOKUMENTACE_MAX_UPLOAD_BYTES } from "@/lib/lekari/dokumentace/templates";
import { transcribeAudio } from "@/lib/lekari/dokumentace/stt";
import { dokumentaceLocaleFromForm, dokumentaceLocaleFromRequest } from "@/lib/lekari/dokumentace/request-locale";
import { getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_transcribe",
  });
  if (!guard.ok) return guard.response;

  const headerLocale = dokumentaceLocaleFromRequest(request);
  const access = await assertDokumentaceAccess(user?.id, headerLocale);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: getOrdiZapisApiCopy(headerLocale).errBadForm },
      { status: 400 }
    );
  }

  const copy = getOrdiZapisApiCopy(dokumentaceLocaleFromForm(request, form));
  const file = form.get("audio") ?? form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: copy.errMissingAudio },
      { status: 400 }
    );
  }

  const mimeType = file.type || "audio/webm";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Prázdný audio soubor." }, { status: 400 });
  }
  if (buffer.byteLength > DOKUMENTACE_MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Audio přesahuje limit 25 MB." },
      { status: 413 }
    );
  }

  try {
    const locale = dokumentaceLocaleFromForm(request, form);
    const { text, provider } = await transcribeAudio(buffer, mimeType, undefined, locale);

    await logAiAgentUsage({
      userId: user!.id,
      agent: "dokumentace",
      prompt: `stt:${provider}:${buffer.byteLength}b`,
      status: "ok",
    });

    return NextResponse.json({
      transcript: text,
      provider,
      remaining: Math.max(0, access.remaining - 1),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Přepis selhal.";
    await logAiAgentUsage({
      userId: user!.id,
      agent: "dokumentace",
      prompt: "stt:error",
      status: "error",
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
